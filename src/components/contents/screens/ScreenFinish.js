import React, { memo, useContext, useState, useRef, useEffect } from "react";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

const ScreenFinish = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);
    const [countdown, setCountdown] = useState(3);
    const timerRef = useRef(null);

    useEffect(() => {
        // 타이머 설정
        if (countdown <= -1) {
            clearInterval(timerRef.current);
            navigateTo('ScreenStart');
        }

        timerRef.current = setInterval(() => {
            setCountdown(time => time - 1)
        }, 1000);

        return () => {
            clearInterval(timerRef.current);
        };
    }, [countdown]);

    return (
        <>
            <div className="title">이용해 주셔서 감사합니다</div>
            <div className="end-countdown">
                <span>
                    {countdown <= 0 ? '✓' : countdown}
                </span>
            </div>
        </>
    );
});

ScreenFinish.displayName = 'ScreenFinish';
export default ScreenFinish;
