import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";

const getRemainingSeconds = (ms) => Math.ceil(ms / 1000);

/**
 * 같은 시계 = 틱 간격 + 틱 순간 + 시작 시각 공유.
 * - 틱 간격: setInterval 한 개(APP_TICK_MS)만 사용.
 * - 틱 순간: TickProvider가 같은 tickNow를 내려주므로 모든 useCountdown이 동시에 갱신됨.
 * - 시작 시각 공유: countdownStartTime을 context로 두고, resetCountdown 시마다 갱신. 전역·지역이 같은 시작 시각을 쓰므로 카운트 순간의 표현이 일치함.
 */
export const APP_TICK_MS = 100;
export const APP_PRECISION = "ms";

const alignToTickMs = (ms) => Math.floor(ms / APP_TICK_MS) * APP_TICK_MS;

const TICK_CONTEXT_DEFAULT = { tickNow: 0, countdownStartTime: 0, setCountdownStartTime: () => {} };
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
    const [countdownStartTime, setCountdownStartTime] = useState(() => alignToTickMs(Date.now()));
    useEffect(() => {
        const unsub = subscribeTicker(APP_TICK_MS, setTickNow);
        return unsub;
    }, []);
    const value = useMemo(
        () => ({ tickNow, countdownStartTime, setCountdownStartTime }),
        [tickNow, countdownStartTime]
    );
    return (
        <TickContext.Provider value={value}>
            {children}
        </TickContext.Provider>
    );
};

export const useCountdown = ({
    durationMs = 0,
    enabled = true,
    onTimeout,
    restartOnTimeout = false,
    resetEvents = [],
    precision = APP_PRECISION
} = {}) => {
    const { tickNow, countdownStartTime, setCountdownStartTime } = useContext(TickContext);
    const [remainingMs, setRemainingMs] = useState(durationMs);
    const durationRef = useRef(durationMs);
    const onTimeoutRef = useRef(onTimeout);
    const prevSecondsRef = useRef(getRemainingSeconds(durationMs));
    const hasTimedOutRef = useRef(false);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

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
        setCountdownStartTime(alignToTickMs(Date.now()));
        prevSecondsRef.current = getRemainingSeconds(nextDurationMs);
        hasTimedOutRef.current = false;
        setRemainingMs(nextDurationMs);
    }, [setCountdownStartTime]);

    const stopCountdown = useCallback(() => {}, []);

    useEffect(() => {
        durationRef.current = durationMs;
        prevSecondsRef.current = getRemainingSeconds(durationMs);
        hasTimedOutRef.current = false;
        if (!enabled) {
            setRemainingMs(durationMs);
            return;
        }
        resetCountdown(durationMs);
    }, [durationMs, enabled, resetCountdown]);

    useEffect(() => {
        if (!enabled || !tickNow || !countdownStartTime) return;
        if (hasTimedOutRef.current && !restartOnTimeout) return;

        const elapsed = tickNow - countdownStartTime;
        const remaining = Math.max(0, durationRef.current - elapsed);
        emitRemaining(remaining);

        if (remaining > 0) return;
        if (hasTimedOutRef.current) return;

        onTimeoutRef.current?.();
        if (restartOnTimeout) {
            setCountdownStartTime(alignToTickMs(tickNow));
            emitRemaining(durationRef.current);
        } else {
            hasTimedOutRef.current = true;
        }
    }, [enabled, tickNow, countdownStartTime, setCountdownStartTime, emitRemaining, restartOnTimeout]);

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