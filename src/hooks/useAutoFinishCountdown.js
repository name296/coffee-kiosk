import { useState, useEffect, useRef } from "react";

// 자동 완료 카운트다운 관리 (단일책임: 자동 완료 카운트다운만)
export const useAutoFinishCountdown = (onTimeout) => {
    const [countdown, setCountdown] = useState(60);
    const timerRef = useRef(null);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        const resetCountdown = () => setCountdown(60);
        setCountdown(60);

        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 0) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    if (onTimeout) onTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        window.addEventListener('keydown', resetCountdown);
        window.addEventListener('click', resetCountdown);

        return () => {
            window.removeEventListener('keydown', resetCountdown);
            window.removeEventListener('click', resetCountdown);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [onTimeout]);

    return countdown;
};
