import React, { createContext, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useMenuData } from "../hooks";
import {
    categorizeMenu,
    calculateSum,
    calculateTotal,
    createOrderItems,
    safeParseInt,
    safeLocalStorage
} from "../utils";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const { tabs, totalMenuItems, categoryInfo } = useMenuData();

    // PLACEHOLDER_MENU는 ProcessMenu로 이동했으나, OrderProvider에서도 사용하므로 기본값 제공
    const PLACEHOLDER_MENU_DEFAULT = { id: 0, name: "추가예정", price: "0", img: "item-americano.png" };

    // 상태
    const [selectedTab, setSelectedTab] = useState("전체메뉴");
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        const firstTab = tabs?.[0] ?? "전체메뉴";
        setSelectedTab(firstTab);
    }, [tabs]);

    // 메모이즈된 값
    const menuItems = useMemo(() =>
        categorizeMenu(totalMenuItems, selectedTab, categoryInfo, PLACEHOLDER_MENU_DEFAULT),
        [totalMenuItems, selectedTab, categoryInfo]
    );
    const totalCount = useMemo(() => calculateSum(quantities), [quantities]);
    const totalSum = useMemo(() => calculateTotal(quantities, totalMenuItems), [quantities, totalMenuItems]);
    const orderItems = useMemo(() => createOrderItems(totalMenuItems, quantities), [totalMenuItems, quantities]);

    // 수량 핸들러
    const handleIncrease = useCallback((id) => {
        setQuantities(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
    }, []);

    const handleDecrease = useCallback((id) => {
        setQuantities(p => {
            const q = p[id] ?? 0;
            if (q <= 1) return p;
            return { ...p, [id]: q - 1 };
        });
    }, []);

    // 삭제 (수량을 0으로 설정 - 빼기 버튼 qty=1일 때와 동일한 결과)
    const handleDelete = useCallback((id) => {
        setQuantities(p => ({ ...p, [id]: 0 }));
    }, []);

    // 주문번호
    const [orderNumber, setOrderNumber] = useState(null);
    const updateOrderNumber = useCallback(() => {
        const c = safeParseInt(safeLocalStorage.getItem('orderNumber'), 0);
        const n = c + 1;
        safeLocalStorage.setItem('orderNumber', n);
        setOrderNumber(n);
        return n;
    }, []);

    // WebView 통신
    const setCallWebToApp = useCallback((cmd, val) => {
        const o = { Command: cmd, arg: val };
        console.log("obj_cmd: " + JSON.stringify(o));
        if (window.chrome?.webview) window.chrome.webview.postMessage(JSON.stringify(o));
    }, []);

    const sendPrintReceiptToApp = useCallback(() => setCallWebToApp('PRINT', ''), [setCallWebToApp]);

    // 카테고리 페이지 네비게이션 - 로컬 ref 사용
    const categoryPageNavRef = useRef(null);
    const setHandleCategoryPageNav = useCallback((fn) => {
        categoryPageNavRef.current = fn;
    }, []);

    // Context value
    const value = useMemo(() => ({
        categoryInfo, menuItems, selectedTab, setSelectedTab,
        quantities, setQuantities, handleIncrease, handleDecrease, handleDelete,
        totalCount, totalSum, orderItems,
        orderNumber, sendPrintReceiptToApp, updateOrderNumber,
        setHandleCategoryPageNav
    }), [
        categoryInfo, menuItems, selectedTab, setSelectedTab,
        quantities, handleIncrease, handleDecrease, handleDelete, totalCount, totalSum, orderItems,
        orderNumber, sendPrintReceiptToApp, updateOrderNumber,
        setHandleCategoryPageNav
    ]);

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
