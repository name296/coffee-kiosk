import React, { createContext, useMemo, useRef, useCallback } from "react";
import { useTimeoutCountdown } from "@/hooks/useTimeoutCountdown";
import { IDLE_TIMEOUT_MS } from "@/lib/format";

export const TimeoutContext = createContext();

export const TimeoutProvider = ({ children }) => {
    // onTimeout은 외부(InitialExecutor)에서 등록
    const onTimeoutRef = useRef(null);
    // onWarning은 외부(UI Layer)에서 등록
    const onWarningRef = useRef(null);
    const registerOnTimeout = useCallback((fn) => { onTimeoutRef.current = fn; }, []);
    const registerOnWarning = useCallback((fn) => { onWarningRef.current = fn; }, []);

    const { remainingMs, remainingTimeFormatted, resetTimer } = useTimeoutCountdown({
        durationMs: IDLE_TIMEOUT_MS,
        enabled: true,
        onTimeout: () => onTimeoutRef.current?.(),
        restartOnTimeout: true,
        resetOnUserActivity: true,
        onWarning: (warningRemainingMs) => onWarningRef.current?.(warningRemainingMs),
        warningThresholdMs: 20000
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
