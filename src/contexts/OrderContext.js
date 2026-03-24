import React, { createContext, useState, useCallback, useMemo, useEffect, useRef, useContext } from "react";
import { useMenuData } from "@/hooks";
import {
    categorizeMenu,
    calculateSum,
    calculateTotal,
    createOrderItems,
    safeParseInt,
    safeLocalStorage,
    safeSessionStorage
} from "@/lib";
import { HistoryContext } from "./HistoryContext";

export const OrderContext = createContext();

/** 키오스크 로컬 날짜(자정 기준). 기기/OS 타임존·시계에 따름 */
const getLocalCalendarDateKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const LS_ORDER_NUMBER = "orderNumber";
const LS_ORDER_NUMBER_DATE = "orderNumberDate";

export const OrderProvider = ({ children }) => {
    const history = useContext(HistoryContext);
    const { tabs, totalMenuItems, categoryInfo } = useMenuData();

    // PLACEHOLDER_MENU는 ProcessMenu로 이동했으나, OrderProvider에서도 사용하므로 기본값 제공
    const PLACEHOLDER_MENU_DEFAULT = { id: 0, name: "추가예정", price: "0", img: "item-americano.png" };

    // 상태
    const firstTab = tabs?.[0] ?? categoryInfo?.[0]?.cate_name ?? "전체메뉴";
    const [selectedTab, setSelectedTabState] = useState(firstTab);
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        const next = tabs?.[0] ?? categoryInfo?.[0]?.cate_name ?? "전체메뉴";
        // 데이터 변경에 따른 기본 탭 보정은 Undo 스택에 쌓지 않음
        setSelectedTabState(next);
    }, [tabs, categoryInfo]);

    const setSelectedTab = useCallback((nextTab) => {
        setSelectedTabState((prev) => {
            const resolved = typeof nextTab === "function" ? nextTab(prev) : nextTab;
            if (resolved === prev) return prev;
            history?.pushHistory?.({
                label: "실행 취소,",
                undo: () => setSelectedTabState(prev)
            });
            return resolved;
        });
    }, [history]);

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
        setQuantities(p => {
            history?.pushHistory?.({
                label: "실행 취소,",
                undo: () => setQuantities(p)
            });
            return { ...p, [id]: (p[id] || 0) + 1 };
        });
    }, [history]);

    const handleDecrease = useCallback((id) => {
        setQuantities(p => {
            const q = p[id] ?? 0;
            if (q <= 1) return p;
            history?.pushHistory?.({
                label: "실행 취소,",
                undo: () => setQuantities(p)
            });
            return { ...p, [id]: q - 1 };
        });
    }, [history]);

    // 삭제 (수량을 0으로 설정 - 빼기 버튼 qty=1일 때와 동일한 결과)
    const handleDelete = useCallback((id) => {
        setQuantities(p => {
            const q = p[id] ?? 0;
            if (q <= 0) return p;
            history?.pushHistory?.({
                label: "실행 취소,",
                undo: () => setQuantities(p)
            });
            return { ...p, [id]: 0 };
        });
    }, [history]);

    const undoLastAction = useCallback(() => {
        return Boolean(history?.undoHistory?.());
    }, [history]);

    const pushUndoAction = useCallback((action) => {
        if (!action) return false;
        if (action.kind === "custom" && typeof action.apply === "function") {
            history?.pushHistory?.({
                label: "실행 취소,",
                undo: action.apply
            });
            return true;
        }
        return false;
    }, [history]);

    // 주문번호: sessionStorage(탭 단위). 표시는 주문완료 진입 시, +1 반영은 사용 종료(START 복귀·resetApp) 시.
    const [orderNumber, setOrderNumber] = useState(null);
    /** 이번 이용에서 주문완료까지 갔을 때만 세팅, 세션 종료 시 sessionStorage에 기록 */
    const pendingOrderNumberCommitRef = useRef(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const nav = performance.getEntriesByType("navigation")[0];
            if (nav && nav.type === "reload") {
                safeSessionStorage.removeItem(LS_ORDER_NUMBER);
                safeSessionStorage.removeItem(LS_ORDER_NUMBER_DATE);
            }
        } catch {
            /* ignore */
        }
        // 예전 localStorage 키 제거(이전 버전과 혼동 방지)
        safeLocalStorage.removeItem(LS_ORDER_NUMBER);
        safeLocalStorage.removeItem(LS_ORDER_NUMBER_DATE);
    }, []);

    /** 주문완료 화면: 마지막 확정 번호+1을 표시만 (저장소 증가는 finalize에서) */
    const updateOrderNumber = useCallback(() => {
        if (pendingOrderNumberCommitRef.current != null) {
            const n = pendingOrderNumberCommitRef.current;
            setOrderNumber(n);
            return n;
        }
        const today = getLocalCalendarDateKey();
        const storedDate = safeSessionStorage.getItem(LS_ORDER_NUMBER_DATE);
        const storedNum = safeParseInt(safeSessionStorage.getItem(LS_ORDER_NUMBER), 0);
        const lastCommitted = storedDate === today ? storedNum : 0;
        const n = lastCommitted + 1;
        pendingOrderNumberCommitRef.current = n;
        setOrderNumber(n);
        return n;
    }, []);

    /** 사용 종료(resetApp → START 등) 시에만 sessionStorage에 번호 확정 */
    const finalizeOrderNumberOnSessionEnd = useCallback(() => {
        const pending = pendingOrderNumberCommitRef.current;
        if (pending == null) return;
        pendingOrderNumberCommitRef.current = null;
        const today = getLocalCalendarDateKey();
        safeSessionStorage.setItem(LS_ORDER_NUMBER, pending);
        safeSessionStorage.setItem(LS_ORDER_NUMBER_DATE, today);
        setOrderNumber(null);
    }, []);

    /** 수동 초기화(점검 등) */
    const resetOrderNumber = useCallback(() => {
        pendingOrderNumberCommitRef.current = null;
        safeSessionStorage.removeItem(LS_ORDER_NUMBER);
        safeSessionStorage.removeItem(LS_ORDER_NUMBER_DATE);
        setOrderNumber(null);
    }, []);

    // WebView 통신
    const setCallWebToApp = useCallback((cmd, val) => {
        const o = { Command: cmd, arg: val };
        if (process.env.NODE_ENV === "development") {
            console.log("obj_cmd: " + JSON.stringify(o));
        }
        if (window.chrome?.webview) window.chrome.webview.postMessage(JSON.stringify(o));
    }, []);

    const sendPrintReceiptToApp = useCallback(() => setCallWebToApp('PRINT', ''), [setCallWebToApp]);

    // Context value
    const value = useMemo(() => ({
        categoryInfo, menuItems, selectedTab, setSelectedTab,
        quantities, setQuantities, handleIncrease, handleDecrease, handleDelete, undoLastAction, pushUndoAction,
        totalCount, totalSum, orderItems,
        orderNumber, sendPrintReceiptToApp, updateOrderNumber, finalizeOrderNumberOnSessionEnd, resetOrderNumber
    }), [
        categoryInfo, menuItems, selectedTab, setSelectedTab,
        quantities, handleIncrease, handleDecrease, handleDelete, undoLastAction, pushUndoAction, totalCount, totalSum, orderItems,
        orderNumber, sendPrintReceiptToApp, updateOrderNumber, finalizeOrderNumberOnSessionEnd, resetOrderNumber
    ]);

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
