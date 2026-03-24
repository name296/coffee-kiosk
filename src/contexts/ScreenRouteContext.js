import React, { createContext, useState, useCallback, useMemo, useRef, useContext } from "react";
import { PROCESS_NAME } from "@/constants";
import { HistoryContext } from "./HistoryContext";

export const ScreenRouteContext = createContext();

export const ScreenRouteProvider = ({ children }) => {
    const history = useContext(HistoryContext);
    const [currentProcess, setCurrentProcessState] = useState(PROCESS_NAME.START);
    const [transitionCount, setTransitionCount] = useState(0);
    const currentProcessRef = useRef(PROCESS_NAME.START);

    const navigateTo = useCallback((p, options = {}) => {
        const { recordHistory = true } = options;
        const prev = currentProcessRef.current;
        if (prev === p) return;
        if (process.env.NODE_ENV === "development") {
            console.log("[화면 전환] nav 호출", { from: prev, to: p });
        }
        if (recordHistory) {
            history?.pushHistory?.({
                type: "stop",
                label: "취소할 작업이이 없습니다,",
                undo: () => navigateTo(prev, { recordHistory: false })
            });
        }
        currentProcessRef.current = p;
        setTransitionCount((c) => c + 1);
        setCurrentProcessState(p);
    }, [history]);

    const value = useMemo(
        () => ({ currentProcess, navigateTo, transitionCount }),
        [currentProcess, navigateTo, transitionCount]
    );

    return (
        <ScreenRouteContext.Provider value={value}>
            {children}
        </ScreenRouteContext.Provider>
    );
};
