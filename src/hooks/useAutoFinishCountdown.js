import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_COUNTDOWN_SECONDS = 60;
const DEFAULT_RESET_EVENTS = ['keydown', 'click'];

// 자동 완료 카운트다운 관리 (단일책임: 자동 완료 카운트다운만)
export const useAutoFinishCountdown = (optionsOrOnTimeout = {}) => {
    const options = typeof optionsOrOnTimeout === 'function'
        ? { onTimeout: optionsOrOnTimeout }
        : (optionsOrOnTimeout || {});

    const {
        onTimeout,
        enabled = true,
        initialSeconds = DEFAULT_COUNTDOWN_SECONDS,
        resetEvents = DEFAULT_RESET_EVENTS
    } = options;

    const [countdown, setCountdown] = useState(initialSeconds);
    const timerRef = useRef(null);
    const onTimeoutRef = useRef(onTimeout);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    const resetCountdown = useCallback(() => {
        setCountdown(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!enabled) {
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
    }, [enabled, resetCountdown, resetEvents]);

    return { countdown, resetCountdown };
};
