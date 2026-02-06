import React, { createContext, useMemo, useRef, useCallback, useContext } from "react";
import { useTimeoutCountdown } from "../hooks/useTimeoutCountdown";
import { ModalContext } from "./ModalContext";
import { ScreenRouteContext } from "./ScreenRouteContext";
import { IDLE_TIMEOUT_MS } from "../utils/format";

export const TimeoutContext = createContext();

export const TimeoutProvider = ({ children }) => {
    const { currentProcess } = useContext(ScreenRouteContext);
    const modal = useContext(ModalContext);

    // onTimeout은 외부(InitialExecutor)에서 등록
    const onTimeoutRef = useRef(null);
    const registerOnTimeout = useCallback((fn) => { onTimeoutRef.current = fn; }, []);

    const { remainingMs, remainingTimeFormatted, resetTimer } = useTimeoutCountdown({
        durationMs: IDLE_TIMEOUT_MS,
        enabled: true,
        onTimeout: () => onTimeoutRef.current?.(),
        restartOnTimeout: true,
        resetOnUserActivity: true,
        onWarning: () => {
            if (currentProcess === 'ProcessStart') return;
            modal?.ModalTimeout?.open();
        },
        warningThresholdMs: 20000
    });

    const value = useMemo(() => ({
        globalRemainingTime: remainingMs,
        globalRemainingTimeFormatted: remainingTimeFormatted,
        resetIdleTimeout: resetTimer,
        registerOnTimeout
    }), [remainingMs, remainingTimeFormatted, resetTimer, registerOnTimeout]);

    return (
        <TimeoutContext.Provider value={value}>
            {children}
        </TimeoutContext.Provider>
    );
};
