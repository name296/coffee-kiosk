import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const getRemainingSeconds = (ms) => Math.ceil(ms / 1000);

const tickerRegistry = new Map();

const getTicker = (tickMs) => {
    const safeTickMs = Math.max(16, tickMs);
    if (!tickerRegistry.has(safeTickMs)) {
        tickerRegistry.set(safeTickMs, { subscribers: new Set(), intervalId: null });
    }
    return tickerRegistry.get(safeTickMs);
};

const subscribeTicker = (tickMs, callback) => {
    const ticker = getTicker(tickMs);
    ticker.subscribers.add(callback);

    if (!ticker.intervalId) {
        ticker.intervalId = setInterval(() => {
            const now = Date.now();
            ticker.subscribers.forEach((subscriber) => subscriber(now));
        }, tickMs);
    }

    return () => {
        ticker.subscribers.delete(callback);
        if (ticker.subscribers.size === 0 && ticker.intervalId) {
            clearInterval(ticker.intervalId);
            ticker.intervalId = null;
        }
    };
};

export const useCountdown = ({
    durationMs = 0,
    enabled = true,
    tickMs = 100,
    onTimeout,
    restartOnTimeout = false,
    resetEvents = [],
    precision = "ms"
} = {}) => {
    const [remainingMs, setRemainingMs] = useState(durationMs);
    const unsubscribeRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const durationRef = useRef(durationMs);
    const onTimeoutRef = useRef(onTimeout);
    const prevSecondsRef = useRef(getRemainingSeconds(durationMs));
    const hasTimedOutRef = useRef(false);

    useEffect(() => {
        durationRef.current = durationMs;
        prevSecondsRef.current = getRemainingSeconds(durationMs);
        hasTimedOutRef.current = false;
        if (!enabled) {
            setRemainingMs(durationMs);
        }
    }, [durationMs, enabled]);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    const stopCountdown = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
    }, []);

    const emitRemaining = useCallback((remaining) => {
        if (precision === "s") {
            const nextSeconds = getRemainingSeconds(remaining);
            if (nextSeconds !== prevSecondsRef.current) {
                prevSecondsRef.current = nextSeconds;
                setRemainingMs(remaining);
            }
            return;
        }
        setRemainingMs(remaining);
    }, [precision]);

    const resetCountdown = useCallback((nextDurationMs = durationRef.current) => {
        durationRef.current = nextDurationMs;
        startTimeRef.current = Date.now();
        prevSecondsRef.current = getRemainingSeconds(nextDurationMs);
        hasTimedOutRef.current = false;
        setRemainingMs(nextDurationMs);
    }, []);

    useEffect(() => {
        if (!enabled) {
            stopCountdown();
            return;
        }

        resetCountdown(durationMs);
        stopCountdown();

        unsubscribeRef.current = subscribeTicker(tickMs, (now) => {
            if (hasTimedOutRef.current && !restartOnTimeout) return;

            const elapsed = now - startTimeRef.current;
            const remaining = Math.max(0, durationRef.current - elapsed);
            emitRemaining(remaining);

            if (remaining <= 0 && !hasTimedOutRef.current) {
                if (onTimeoutRef.current) onTimeoutRef.current();
                if (restartOnTimeout) {
                    startTimeRef.current = now;
                    emitRemaining(durationRef.current);
                } else {
                    hasTimedOutRef.current = true;
                }
            }
        });

        return stopCountdown;
    }, [enabled, durationMs, tickMs, resetCountdown, stopCountdown, emitRemaining, restartOnTimeout]);

    useEffect(() => {
        if (!enabled || resetEvents.length === 0) return;

        const handler = () => resetCountdown();
        resetEvents.forEach((eventName) => window.addEventListener(eventName, handler));

        return () => {
            resetEvents.forEach((eventName) => window.removeEventListener(eventName, handler));
        };
    }, [enabled, resetEvents, resetCountdown]);

    const remainingSeconds = useMemo(() => getRemainingSeconds(remainingMs), [remainingMs]);

    return { remainingMs, remainingSeconds, resetCountdown, stopCountdown };
};
