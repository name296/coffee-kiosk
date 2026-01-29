import { useEffect, useRef, useCallback, useMemo } from "react";
import { useAppInitializer } from "./useAppInitializer";
import { USER_ACTIVITY_EVENT } from "./useUserActivity";
import { useCountdown } from "./useCountdown";

const DEFAULT_IDLE_TIMEOUT_MS = 120000;
const DEFAULT_AUTO_FINISH_SECONDS = 60;
const DEFAULT_RESET_EVENTS = ['keydown', 'click'];

const formatRemainingTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const useIdleTimeoutInternal = (onTimeout, timeout, enabled = true) => {
    const lastActivityRef = useRef(Date.now());
    const onTimeoutRef = useRef(onTimeout);
    const timeoutRef = useRef(timeout);
    const currentTimeoutRef = useRef(timeout);
    const prevLogSecondRef = useRef(-1);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
        timeoutRef.current = timeout;
    }, [onTimeout, timeout]);

    const lastResetTimeRef = useRef(0);

    const handleTimeout = useCallback(() => {
        const resetTime = timeoutRef.current;
        const now = Date.now();

        if (onTimeoutRef.current) {
            try {
                onTimeoutRef.current();
                console.log('[타이머] onTimeout 콜백 실행 완료');
            } catch (error) {
                console.error('[타이머] onTimeout 콜백 실행 중 에러', error);
            }
        }

        lastActivityRef.current = now;
        currentTimeoutRef.current = resetTime;
        console.log('[타이머] 자동 리셋', { resetTime, resetTimeMs: now });
    }, []);

    const {
        remainingMs: remainingTime,
        resetCountdown
    } = useCountdown({
        durationMs: timeout,
        enabled,
        onTimeout: handleTimeout,
        restartOnTimeout: true
    });

    const resetTimer = useCallback(() => {
        const now = Date.now();
        if (now - lastResetTimeRef.current < 100) {
            console.log('[타이머] resetTimer 중복 호출 방지', {
                timeSinceLastReset: now - lastResetTimeRef.current
            });
            return;
        }
        lastResetTimeRef.current = now;

        const resetTime = timeoutRef.current;

        const prevLastActivity = lastActivityRef.current;
        const prevCurrentTimeout = currentTimeoutRef.current;
        lastActivityRef.current = now;
        currentTimeoutRef.current = resetTime;

        console.log('[타이머] resetTimer 호출됨', {
            now: new Date(now).toISOString(),
            resetTime,
            resetTime,
            prevLastActivity: new Date(prevLastActivity).toISOString(),
            prevCurrentTimeout,
            timeoutRef: timeoutRef.current
        });
        resetCountdown(resetTime);
    }, [resetCountdown]);

    const handleUserActivity = useCallback((eventType = 'unknown') => {
        const now = Date.now();
        if (now - lastResetTimeRef.current < 100) {
            console.log('[타이머] handleUserActivity 중복 호출 방지', {
                eventType,
                timeSinceLastReset: now - lastResetTimeRef.current
            });
            return;
        }
        lastResetTimeRef.current = now;

        const resetTime = timeoutRef.current;

        const prevLastActivity = lastActivityRef.current;
        lastActivityRef.current = now;
        currentTimeoutRef.current = resetTime;

        console.log('[타이머] handleUserActivity 호출됨', {
            eventType,
            now: new Date(now).toISOString(),
            resetTime,
            resetTime,
            prevLastActivity: new Date(prevLastActivity).toISOString(),
            timeoutRef: timeoutRef.current
        });
        resetCountdown(resetTime);
    }, [resetCountdown]);

    useEffect(() => {
        if (!enabled) {
            console.log('[타이머] 비활성화됨');
            currentTimeoutRef.current = timeout;
            return;
        }

        const initialTime = timeoutRef.current || timeout;
        const initialTimeMs = Date.now();
        lastActivityRef.current = initialTimeMs;
        currentTimeoutRef.current = initialTime;
        console.log('[타이머] 초기화', {
            initialTime,
            initialTimeMs,
            timeout: timeoutRef.current,
            enabled
        });
        resetCountdown(initialTime);
    }, [enabled, timeout, resetCountdown]);

    useEffect(() => {
        const elapsedMs = Math.max(0, (currentTimeoutRef.current || timeout) - remainingTime);
        const currentSecond = Math.floor(remainingTime / 1000);
        if (currentSecond !== prevLogSecondRef.current && currentSecond >= 0) {
            prevLogSecondRef.current = currentSecond;
            console.log('[타이머] 카운트다운', {
                remaining: currentSecond + '초',
                remainingMs: remainingTime,
                elapsed: Math.ceil(elapsedMs / 1000) + '초',
                elapsedMs,
                currentTimeout: currentTimeoutRef.current,
                lastActivity: new Date(lastActivityRef.current).toISOString(),
                now: new Date().toISOString()
            });
        }
    }, [remainingTime, timeout]);

    useEffect(() => {
        if (!enabled) return;

        const activityHandler = (e) => {
            const sourceEventType = e?.detail?.sourceEventType || 'activity';
            handleUserActivity(sourceEventType);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener(USER_ACTIVITY_EVENT, activityHandler);
        }

        console.log('[타이머] 이벤트 리스너 등록됨', { enabled, onTimeout: !!onTimeoutRef.current });

        return () => {
            console.log('[타이머] cleanup - 이벤트 리스너 제거', { enabled });
            if (typeof window !== 'undefined') {
                window.removeEventListener(USER_ACTIVITY_EVENT, activityHandler);
            }
        };
    }, [enabled, handleUserActivity]);

    const remainingTimeFormatted = useMemo(() => formatRemainingTime(remainingTime), [remainingTime]);

    return { resetTimer, remainingTime, remainingTimeFormatted, onTimeoutRef };
};

// 앱 전역 타임아웃/카운트다운을 한 곳에서 묶어 제공
export const useAppTimeouts = ({
    setCurrentPage,
    idle = {},
    autoFinish = {}
} = {}) => {
    const { resetApp } = useAppInitializer(setCurrentPage);

    const {
        timeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
        enabled: idleEnabled = true,
        onTimeout: onIdleTimeout
    } = idle;

    const idleTimeoutHandler = useCallback(() => {
        if (typeof onIdleTimeout === 'function') {
            onIdleTimeout({ resetApp });
            return;
        }
        resetApp();
    }, [onIdleTimeout, resetApp]);

    const idleTimeout = useIdleTimeoutInternal(
        idleTimeoutHandler,
        timeoutMs,
        idleEnabled
    );

    const {
        enabled: autoFinishEnabled = false,
        onTimeout: onAutoFinishTimeout,
        initialSeconds = DEFAULT_AUTO_FINISH_SECONDS,
        resetEvents = DEFAULT_RESET_EVENTS
    } = autoFinish;

    const {
        remainingSeconds: countdown,
        resetCountdown
    } = useCountdown({
        durationMs: initialSeconds * 1000,
        enabled: autoFinishEnabled,
        onTimeout: onAutoFinishTimeout,
        resetEvents
    });

    return { resetApp, idleTimeout, countdown, resetCountdown };
};