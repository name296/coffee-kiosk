import React, { useEffect, useLayoutEffect, useContext, useRef, useCallback, useMemo } from "react";
import { useInitialTrigger } from "../hooks/useInitialTrigger";
import { useUserActivityBroadcast, USER_ACTIVITY_EVENT } from "../hooks/useUserActivity";
import { useInitialCountdown } from "../hooks/useInitialCountdown";
import { ModalContext, TimeoutContext, ScreenRouteContext } from "../contexts";
import { formatRemainingTime, IDLE_TIMEOUT_MS } from "../utils/format";

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
        remaining: remainingMs,
        remainingTime: remainingMs,
        remainingTimeFormatted,
        resetTimer: handleReset,
        resetCountdown
    };
};

export const InitialExecutor = () => {
    useUserActivityBroadcast(true);
    const { currentProcess, navigateTo, currentProcessRef } = useContext(ScreenRouteContext);
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);

    const { resetApp } = useInitialTrigger((p) => navigateTo(p));
    const resetAppRef = useRef(resetApp);
    const prevProcessRef = useRef(currentProcess);

    useEffect(() => {
        resetAppRef.current = resetApp;
    }, [resetApp]);

    useEffect(() => {
        if (currentProcessRef) currentProcessRef.current = currentProcess;
    }, [currentProcess]);

    useEffect(() => {
        const didTransitionToStart = prevProcessRef.current !== "ProcessStart" && currentProcess === "ProcessStart";
        prevProcessRef.current = currentProcess;
        if (didTransitionToStart) {
            resetAppRef.current();
        }
    }, [currentProcess]);

    const idleTimeout = useTimeoutCountdown({
        durationMs: IDLE_TIMEOUT_MS,
        enabled: true,
        onTimeout: resetApp,
        restartOnTimeout: true,
        resetOnUserActivity: true,
        onWarning: () => {
            if (currentProcess === 'ProcessStart') return;
            modal?.ModalTimeout?.open();
        },
        warningThresholdMs: 20000
    });

    const { remainingTimeFormatted, remainingTime, resetTimer } = idleTimeout;

    useLayoutEffect(() => {
        timeout?.setGlobalRemainingTime?.(remainingTime);
        timeout?.setGlobalRemainingTimeFormatted?.(remainingTimeFormatted);
    }, [remainingTime, remainingTimeFormatted, timeout]);

    useEffect(() => {
        timeout?.setResetIdleTimeout?.(resetTimer);
        return () => timeout?.setResetIdleTimeout?.(null);
    }, [timeout, resetTimer]);

    return null;
};
