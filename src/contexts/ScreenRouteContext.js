import React, { createContext, useState, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { focusMainElement } from "../utils/dom";
import { initializeApp } from "../utils/appUtils";
import { AccessibilityContext } from "./AccessibilityContext";
import { OrderContext } from "./OrderContext";

export const ScreenRouteContext = createContext();

export const ScreenRouteProvider = ({ children }) => {
    const [currentPage, setCurrentPageState] = useState('ScreenStart');

    const accessibility = React.useContext(AccessibilityContext); // using React.useContext to avoid adding import if not there
    const order = React.useContext(OrderContext);

    const setCurrentPage = useCallback((p) => {
        console.log('[화면 전환] setCurrentPage 호출', {
            from: currentPage,
            to: p,
            timestamp: new Date().toISOString()
        });

        // 'ScreenStart'로 이동 시 앱 초기화 로직 실행 (사용자 요구사항: 모든 스타트 이동은 초기화와 동등)
        if (p === 'ScreenStart') {
            console.log('[화면 전환] ScreenStart 이동 감지 → 앱 초기화 실행');
            initializeApp({
                // Modals
                ModalRestart: accessibility?.ModalRestart,
                ModalAccessibility: accessibility?.ModalAccessibility,
                ModalReset: accessibility?.ModalReset,
                ModalDelete: accessibility?.ModalDelete,
                ModalDeleteCheck: accessibility?.ModalDeleteCheck,
                ModalCall: accessibility?.ModalCall,
                ModalTimeout: accessibility?.ModalTimeout,
                ModalPaymentError: accessibility?.ModalPaymentError,
                // State Setters
                setQuantities: order?.setQuantities,
                setIsDark: accessibility?.setIsDark,
                setVolume: accessibility?.setVolume,
                setIsLarge: accessibility?.setIsLarge,
                setIsLow: accessibility?.setIsLow,
                // Page Setter (Avoid infinite loop by passing raw setter)
                setCurrentPage: setCurrentPageState
            });
        } else {
            setCurrentPageState(p);
        }

        console.log('[화면 전환] setCurrentPage 완료', { newPage: p });
    }, [currentPage, accessibility, order]);

    // 스크린 전환 시 자동으로 .main에 포커스 설정 및 TTS 재생 (원천적 통일)
    const lastPageRef = useRef(null);
    useLayoutEffect(() => {
        // 페이지가 실제로 변경되었을 때만 포커스 설정 (중복 방지)
        if (lastPageRef.current === currentPage) {
            console.log('[포커스] ScreenRouteProvider 스킵 (페이지 변경 없음)', { currentPage });
            return;
        }

        const prevPage = lastPageRef.current;
        lastPageRef.current = currentPage;

        console.log('[포커스] ScreenRouteProvider 페이지 변경 감지', {
            from: prevPage,
            to: currentPage,
            timestamp: new Date().toISOString()
        });

        // 모든 화면에서 .main에 자동 포커스 설정 (포커스 TTS 로직 통일)
        console.log('[포커스] ScreenRouteProvider → focusMainElement 실행 (동기 처리)');
        focusMainElement();
    }, [currentPage]);

    const value = useMemo(() => ({
        currentPage,
        setCurrentPage
    }), [currentPage, setCurrentPage]);

    return (
        <ScreenRouteContext.Provider value={value}>
            {children}
        </ScreenRouteContext.Provider>
    );
};
