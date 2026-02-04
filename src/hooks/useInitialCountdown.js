import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";

const getRemainingSeconds = (ms) => Math.ceil(ms / 1000);

export const APP_TICK_MS = 1000;

const alignToTickMs = (ms) => Math.floor(ms / APP_TICK_MS) * APP_TICK_MS;

const TICK_CONTEXT_DEFAULT = { tickNow: 0 };
const TickContext = createContext(TICK_CONTEXT_DEFAULT);

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

export const TickProvider = ({ children }) => {
    const [tickNow, setTickNow] = useState(() => Date.now());
    useEffect(() => {
        const unsub = subscribeTicker(APP_TICK_MS, setTickNow);
        return unsub;
    }, []);
    const value = useMemo(
        () => ({ tickNow }),
        [tickNow]
    );
    return (
        <TickContext.Provider value={value}>
            {children}
        </TickContext.Provider>
    );
};

export const useInitialCountdown = ({
    durationMs = 0,
    enabled = true
} = {}) => {
    const { tickNow } = useContext(TickContext);
    const [remainingMs, setRemainingMs] = useState(durationMs);
    const [countdownStartTime, setCountdownStartTime] = useState(() => alignToTickMs(Date.now()));
    const durationRef = useRef(durationMs);

    const resetCountdown = useCallback((nextDurationMs = durationRef.current) => {
        durationRef.current = nextDurationMs;
        setCountdownStartTime(alignToTickMs(Date.now()));
        setRemainingMs(nextDurationMs);
    }, [setCountdownStartTime]);

    useEffect(() => {
        durationRef.current = durationMs;
        if (!enabled) {
            setRemainingMs(durationMs);
            return;
        }
        resetCountdown(durationMs);
    }, [durationMs, enabled, resetCountdown]);

    useEffect(() => {
        if (!enabled || !tickNow || !countdownStartTime) return;

        const elapsed = Math.max(0, tickNow - countdownStartTime);
        const remaining = Math.min(durationRef.current, Math.max(0, durationRef.current - elapsed));
        setRemainingMs(remaining);
    }, [enabled, tickNow, countdownStartTime]);

    const remainingSeconds = useMemo(() => getRemainingSeconds(remainingMs), [remainingMs]);

    return { remainingMs, remainingSeconds, resetCountdown };
};
