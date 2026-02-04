import React, { createContext, useState, useCallback, useMemo, useRef } from "react";

export const ScreenRouteContext = createContext();

export const ScreenRouteProvider = ({ children }) => {
    const [currentProcess, setCurrentProcessState] = useState("ProcessStart");
    const [transitionCount, setTransitionCount] = useState(0);
    const currentProcessRef = useRef("ProcessStart");

    const navigateTo = useCallback((p) => {
        console.log('[화면 전환] nav 호출', { from: currentProcessRef.current, to: p });
        setTransitionCount((c) => c + 1);
        setCurrentProcessState(p);
    }, []);

    const value = useMemo(
        () => ({ currentProcess, navigateTo, currentProcessRef }),
        [currentProcess, navigateTo]
    );

    return (
        <ScreenRouteContext.Provider value={value}>
            {children}
        </ScreenRouteContext.Provider>
    );
};
