import { useEffect, useRef, useCallback, useMemo } from "react";
import { useInitialCountdown } from "./useInitialCountdown";
import { USER_ACTIVITY_EVENT } from "./useUserActivity";
import { formatRemainingTime } from "../utils/format";

export const useTimeoutCountdown = ({
    durationMs,
    enabled = true,
    onTimeout,
    restartOnTimeout = false,
    resetOnUserActivity = false,
    onWarning,
    warningThresholdMs = 20000
} = {}) => {
    const onTimeoutRef = useRef(onTimeout);
    const onWarningRef = useRef(onWarning);
    const durationRef = useRef(durationMs);
    const lastResetTimeRef = useRef(0);
    const hasFiredForZeroRef = useRef(false);
    const hasFiredWarningRef = useRef(false);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
        onWarningRef.current = onWarning;
        durationRef.current = durationMs;
    }, [onTimeout, onWarning, durationMs]);

    const { remainingMs, remainingSeconds, resetCountdown } = useInitialCountdown({
        durationMs,
        enabled
    });

    useEffect(() => {
        if (!enabled || remainingMs > 0) {
            hasFiredForZeroRef.current = false;
            return;
        }
        if (hasFiredForZeroRef.current) return;
        hasFiredForZeroRef.current = true;

        try {
            onTimeoutRef.current?.();
        } catch (error) {
            console.error('[타이머] onTimeout 에러', error);
        }
        if (restartOnTimeout) {
            resetCountdown(durationRef.current);
        }
    }, [enabled, remainingMs, restartOnTimeout, resetCountdown]);

    useEffect(() => {
        if (!enabled || remainingMs > warningThresholdMs || remainingMs <= 0) {
            hasFiredWarningRef.current = false;
            return;
        }
        if (hasFiredWarningRef.current) return;
        hasFiredWarningRef.current = true;
        onWarningRef.current?.(remainingMs);
    }, [enabled, remainingMs, warningThresholdMs]);

    const handleReset = useCallback(() => {
        const now = Date.now();
        if (now - lastResetTimeRef.current < 100) return;
        lastResetTimeRef.current = now;
        resetCountdown(durationRef.current);
    }, [resetCountdown]);

    useEffect(() => {
        if (!enabled || !resetOnUserActivity) return;
        const handler = () => handleReset();
        window.addEventListener(USER_ACTIVITY_EVENT, handler);
        return () => window.removeEventListener(USER_ACTIVITY_EVENT, handler);
    }, [enabled, resetOnUserActivity, handleReset]);

    useEffect(() => {
        if (!enabled) return;
        resetCountdown(durationMs);
    }, [enabled, durationMs, resetCountdown]);

    const remainingTimeFormatted = useMemo(() => formatRemainingTime(remainingMs), [remainingMs]);

    return {
        remainingMs,
        remainingSeconds,
        remainingTimeFormatted,
        resetTimer: handleReset,
        resetCountdown
    };
};
