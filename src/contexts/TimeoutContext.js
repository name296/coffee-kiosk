import React, { createContext, useMemo, useRef, useCallback, useContext } from "react";
import { useTimeoutCountdown } from "@/hooks/useTimeoutCountdown";
import { IDLE_TIMEOUT_MS, IDLE_WARNING_THRESHOLD_MS } from "@/lib/format";
import { ScreenRouteContext } from "./ScreenRouteContext";
import { PROCESS_NAME } from "@/constants";

export const TimeoutContext = createContext();

export const TimeoutProvider = ({ children }) => {
    const { currentProcess } = useContext(ScreenRouteContext);
    const isPostOrderCompleteProcess =
        currentProcess === PROCESS_NAME.ORDER_COMPLETE ||
        currentProcess === PROCESS_NAME.RECEIPT_PRINT ||
        currentProcess === PROCESS_NAME.FINISH;
    const timeoutDurationMs = isPostOrderCompleteProcess ? 60000 : IDLE_TIMEOUT_MS;

    // onTimeout은 외부(InitialExecutor)에서 등록
    const onTimeoutRef = useRef(null);
    // onWarning은 외부(UI Layer)에서 등록
    const onWarningRef = useRef(null);
    const registerOnTimeout = useCallback((fn) => { onTimeoutRef.current = fn; }, []);
    const registerOnWarning = useCallback((fn) => { onWarningRef.current = fn; }, []);

    const { remainingMs, remainingTimeFormatted, resetTimer } = useTimeoutCountdown({
        durationMs: timeoutDurationMs,
        enabled: true,
        onTimeout: () => onTimeoutRef.current?.(),
        restartOnTimeout: true,
        resetOnUserActivity: true,
        onWarning: (warningRemainingMs) => onWarningRef.current?.(warningRemainingMs),
        warningThresholdMs: IDLE_WARNING_THRESHOLD_MS
    });

    const value = useMemo(() => ({
        globalRemainingTime: remainingMs,
        globalRemainingTimeFormatted: remainingTimeFormatted,
        resetIdleTimeout: resetTimer,
        registerOnTimeout,
        registerOnWarning
    }), [remainingMs, remainingTimeFormatted, resetTimer, registerOnTimeout, registerOnWarning]);

    return (
        <TimeoutContext.Provider value={value}>
            {children}
        </TimeoutContext.Provider>
    );
};
