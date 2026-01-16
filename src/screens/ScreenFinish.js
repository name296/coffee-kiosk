import React, { memo, useContext, useState, useRef, useEffect } from "react";
import Step from "../components/ui/Step";

import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { OrderContext } from "../contexts/OrderContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";

import { TTS } from "../constants/constants";

const ScreenFinish = memo(() => {
    const TTS_SCREEN_FINISH = `안내, 사용종료, 이용해주셔서 감사합니다,`;

    // const refsData = useContext(RefContext);
    const systemControlsRef = useRef(null);
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);
    const route = useContext(ScreenRouteContext);
    const { handleText } = useTextHandler(accessibility.volume);
    useInteractiveTTSHandler(true, handleText);

    const useFinishCountdown = () => {
        const [countdown, setCountdown] = useState(3);
        const timerRef = useRef(null);


        useEffect(() => {
            // 컴포넌트 마운트 시 타이머 시작
            // 이전 타이머 정리
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            setCountdown(3);

            const tick = () => {
                setCountdown(prev => {
                    const next = prev - 1;
                    if (next === 0) {
                        // 카운트다운 완료 후 1초 뒤 초기화
                        setTimeout(() => {
                            // appUtils의 initializeApp 사용 -> ScreenRouteContext에서 자동 처리
                            route.setCurrentPage('ScreenStart');
                        }, 1000);

                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        return 0;
                    }
                    return next;
                });
            };

            timerRef.current = setInterval(tick, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            };
        }, []); // 의존성 배열을 빈 배열로 변경하여 컴포넌트 마운트 시 한 번만 실행

        return countdown;
    };

    const countdown = useFinishCountdown();

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <Step />
            <div className="main forth" data-tts-text={TTS_SCREEN_FINISH} tabIndex={-1}>
                <div className="title">이용해 주셔서 감사합니다</div>
                <div className="end-countdown">
                    <span>
                        {countdown <= 0 ? '✓' : `${Math.floor(countdown)}`}
                    </span>
                </div>
            </div>
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenFinish.displayName = 'ScreenFinish';

export default ScreenFinish;
