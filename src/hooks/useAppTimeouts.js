import { useState, useEffect, useRef, useCallback } from "react";
import { useAppInitializer } from "./useAppInitializer";
import { useIdleTimeout } from "./useIdleTimeout";

const DEFAULT_IDLE_TIMEOUT_MS = 120000;
const DEFAULT_AUTO_FINISH_SECONDS = 60;
const DEFAULT_RESET_EVENTS = ['keydown', 'click'];

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
        checkTimeoutModal = null,
        onTimeout: onIdleTimeout
    } = idle;

    const idleTimeoutHandler = useCallback(() => {
        if (typeof onIdleTimeout === 'function') {
            onIdleTimeout({ resetApp });
            return;
        }
        resetApp();
    }, [onIdleTimeout, resetApp]);

    const idleTimeout = useIdleTimeout(
        idleTimeoutHandler,
        timeoutMs,
        idleEnabled,
        checkTimeoutModal
    );

    const {
        enabled: autoFinishEnabled = false,
        onTimeout: onAutoFinishTimeout,
        initialSeconds = DEFAULT_AUTO_FINISH_SECONDS,
        resetEvents = DEFAULT_RESET_EVENTS
    } = autoFinish;

    const [countdown, setCountdown] = useState(initialSeconds);
    const timerRef = useRef(null);
    const onTimeoutRef = useRef(onAutoFinishTimeout);

    useEffect(() => {
        onTimeoutRef.current = onAutoFinishTimeout;
    }, [onAutoFinishTimeout]);

    const resetCountdown = useCallback(() => {
        setCountdown(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!autoFinishEnabled) {
            resetCountdown();
            return;
        }

        resetCountdown();
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 0) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    if (onTimeoutRef.current) onTimeoutRef.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        resetEvents.forEach((eventName) => {
            window.addEventListener(eventName, resetCountdown);
        });

        return () => {
            resetEvents.forEach((eventName) => {
                window.removeEventListener(eventName, resetCountdown);
            });
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [autoFinishEnabled, resetCountdown, resetEvents]);

    return { resetApp, idleTimeout, countdown, resetCountdown };
};
