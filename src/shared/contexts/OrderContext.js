import React, { createContext, useState, useCallback, useMemo, useRef } from "react";
import { useMenuData } from "../hooks/useMenuData";
import { categorizeMenu } from "../utils/menuUtils";
import {
    calculateSum,
    calculateTotal,
    createOrderItems,
    filterMenuItems
} from "../utils/orderUtils";
import { safeParseInt } from "../utils/format";
import { safeLocalStorage } from "../utils/storage";
import { convertToKoreanQuantity } from "../utils/format";

// Order Context - 주문 상태 관리 (메뉴 선택, 수량, 주문 아이템)
// 레벨: 전역 UI 상태/알림 레벨
// 의존성: 없음 (독립, 내부 Hook: useMenuData(독립), useMenuUtils(독립))
// 사용처: ScreenMenu, ScreenDetails, ScreenPayments 등 주문 관련 Screen 컴포넌트, 모달 컴포넌트
// 제공 값: tabs, totalMenuItems, categoryInfo, menuItems, selectedTab, setSelectedTab, menuLoading, quantities, setQuantities, handleIncrease, handleDecrease, handleDelete, totalCount, totalSum, filterMenuItems, createOrderItems, convertToKoreanQuantity, calculateSum, calculateTotal, sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, updateOrderNumber, handlePreviousTab, handleNextTab, handleCategoryPageNav, setHandleCategoryPageNav
// Provider 위치: AccessibilityProvider 내부, ScreenRouteProvider보다 바깥 (OrderProvider)
export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    // 메뉴 데이터 (독립 Hook - menuData import 사용)
    const { tabs, totalMenuItems, categoryInfo, isLoading: menuLoading } = useMenuData();

    // PLACEHOLDER_MENU는 ScreenMenu로 이동했으나, OrderProvider에서도 사용하므로 기본값 제공
    const PLACEHOLDER_MENU_DEFAULT = { id: 0, name: "추가예정", price: "0", img: "item-americano.png" };

    // 상태
    const [selectedTab, setSelectedTab] = useState("전체메뉴");
    const [quantities, setQuantities] = useState({});

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
        setQuantities(p => ({ ...p, [id]: p[id] > 0 ? p[id] - 1 : 0 }));
    }, []);

    // 삭제 (수량을 0으로 설정 - 빼기 버튼 qty=1일 때와 동일한 결과)
    const handleDelete = useCallback((id) => {
        setQuantities(p => ({ ...p, [id]: 0 }));
    }, []);

    // 주문번호
    const updateOrderNumber = useCallback(() => {
        const c = safeParseInt(safeLocalStorage.getItem('orderNumber'), 0);
        const n = c + 1;
        safeLocalStorage.setItem('orderNumber', n);
        return n;
    }, []);

    // WebView 통신
    const setCallWebToApp = useCallback((cmd, val) => {
        const o = { Command: cmd, arg: val };
        console.log("obj_cmd: " + JSON.stringify(o));
        if (window.chrome?.webview) window.chrome.webview.postMessage(JSON.stringify(o));
    }, []);

    const sendOrderDataToApp = useCallback((paymentType) => {
        const arr = orderItems.map(i => ({
            menuName: i.name,
            quantity: i.quantity,
            price: i.price * i.quantity
        }));
        const sp = (totalSum / 1.1).toFixed(2);
        setCallWebToApp('PAY', {
            orderData: arr,
            totalPrice: totalSum,
            supplyPrice: sp,
            tax: (totalSum - sp).toFixed(2),
            paymentType,
            orderNumber: updateOrderNumber()
        });
    }, [orderItems, totalSum, updateOrderNumber, setCallWebToApp]);

    const sendPrintReceiptToApp = useCallback(() => setCallWebToApp('PRINT', ''), [setCallWebToApp]);
    const sendCancelPayment = useCallback(() => setCallWebToApp('CANCEL', ''), [setCallWebToApp]);

    // 탭 네비게이션
    const handlePreviousTab = useCallback(() => {
        const i = (tabs.indexOf(selectedTab) - 1 + tabs.length) % tabs.length;
        setSelectedTab(tabs[i]);
    }, [tabs, selectedTab]);

    const handleNextTab = useCallback(() => {
        const i = (tabs.indexOf(selectedTab) + 1) % tabs.length;
        setSelectedTab(tabs[i]);
    }, [tabs, selectedTab]);

    // 카테고리 페이지 네비게이션 - 로컬 ref 사용 (이니셜 순서 문제 해결)
    const categoryPageNavRef = useRef(null);
    const handleCategoryPageNav = useCallback((dir) => {
        if (categoryPageNavRef.current) categoryPageNavRef.current(dir);
    }, []);
    const setHandleCategoryPageNav = useCallback((fn) => {
        categoryPageNavRef.current = fn;
    }, []);

    // Context value
    const value = useMemo(() => ({
        // 메뉴 데이터
        tabs, totalMenuItems, categoryInfo, menuItems, selectedTab, setSelectedTab, menuLoading,
        // 주문 상태
        quantities, setQuantities, handleIncrease, handleDecrease, handleDelete,
        totalCount, totalSum, orderItems, filterMenuItems, createOrderItems,
        convertToKoreanQuantity, calculateSum, calculateTotal,
        // 결제
        sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, updateOrderNumber,
        // 탭 네비게이션
        handlePreviousTab, handleNextTab,
        handleCategoryPageNav, setHandleCategoryPageNav
    }), [
        tabs, totalMenuItems, categoryInfo, menuItems, selectedTab, setSelectedTab, menuLoading,
        quantities, handleIncrease, handleDecrease, handleDelete, totalCount, totalSum, orderItems,
        sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, updateOrderNumber,
        handlePreviousTab, handleNextTab, handleCategoryPageNav, setHandleCategoryPageNav
    ]);

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
