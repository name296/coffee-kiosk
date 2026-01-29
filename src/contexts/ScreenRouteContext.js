import React, { createContext, useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { focusMainElement, useAppInitializer } from "../hooks";

export const ScreenRouteContext = createContext();

export const ScreenRouteProvider = ({ children }) => {
    const [currentPage, setCurrentPageState] = useState('ProcessStart');
    const [transitionCount, setTransitionCount] = useState(0);

    const { resetApp } = useAppInitializer(setCurrentPageState);
    const resetAppRef = useRef(resetApp);
    useEffect(() => { resetAppRef.current = resetApp; }, [resetApp]);

    const currentPageRef = useRef('ProcessStart');

    const navigateTo = useCallback((p) => {
        console.log('[화면 전환] nav 호출', { from: currentPageRef.current, to: p });

        currentPageRef.current = p;
        setTransitionCount(c => c + 1);

        if (p === 'ProcessStart') {
            resetAppRef.current();
        } else {
            setCurrentPageState(p);
        }
    }, []); // Absolute stability

    // 스크린 전환 시 자동으로 .main에 포커스 설정 (포커스 TTS 로직 통일)
    useLayoutEffect(() => {
        focusMainElement();
    }, [currentPage, transitionCount]);

    const value = useMemo(() => ({
        currentPage,
        navigateTo
    }), [currentPage, navigateTo]);

    return (
        <ScreenRouteContext.Provider value={value}>
            {children}
        </ScreenRouteContext.Provider>
    );
};
