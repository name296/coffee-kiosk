import React, { useEffect, useLayoutEffect, useContext, useRef } from "react";
import { useAppTimeouts } from "../hooks";
import { ModalContext, TimeoutContext, ScreenRouteContext } from "../contexts";

/** 전역 타임아웃/카운트다운 초기화 (단일 흐름) */
export const GlobalTimeoutInitializer = () => {
    const { currentPage, navigateTo } = useContext(ScreenRouteContext);
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);
    const hasShownWarningRef = useRef(false);

    const { idleTimeout } = useAppTimeouts({
        setCurrentPage: (p) => navigateTo(p),
        idle: {
            timeoutMs: 120000, // 2분 (120초)
            enabled: true,
            onTimeout: ({ resetApp }) => {
                console.log('[타이머] onTimeout 호출됨', { currentPage });
                console.log('[타이머] resetApp 실행 시작', { currentPage });
                resetApp();
                console.log('[타이머] resetApp 실행 완료');
            }
        }
    });

    const { remainingTimeFormatted, remainingTime, resetTimer } = idleTimeout;

    // 전역 표시를 useCountdown 틱과 동기화: 매 틱마다 context 반영 (0.1초 차이 방지)
    useLayoutEffect(() => {
        if (timeout?.setGlobalRemainingTime) {
            timeout.setGlobalRemainingTime(remainingTime);
        }
        if (timeout?.setGlobalRemainingTimeFormatted) {
            timeout.setGlobalRemainingTimeFormatted(remainingTimeFormatted);
        }
    }, [remainingTime, remainingTimeFormatted, timeout]);

    useEffect(() => {
        if (!timeout?.setResetIdleTimeout) return;
        timeout.setResetIdleTimeout(resetTimer);
        return () => timeout.setResetIdleTimeout(null);
    }, [timeout, resetTimer]);

    useEffect(() => {
        if (remainingTime > 0 && remainingTime <= 20000 && !hasShownWarningRef.current && !modal?.ModalTimeout?.isOpen) {
            hasShownWarningRef.current = true;

            if (currentPage === 'ProcessStart') {
                console.log('[타이머] ProcessStart 20초 경고 - TTS 재생하지 않음');
            } else if (modal?.ModalTimeout) {
                modal.ModalTimeout.open();
            }
        }

        if (remainingTime > 20000) {
            hasShownWarningRef.current = false;
        }
    }, [remainingTime, modal, currentPage]);

    return null;
};
