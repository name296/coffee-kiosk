import React, { useEffect, useContext, useRef } from "react";
import {
    useToggleButtonClickHandler,
    useDisabledButtonBlocker,
    usePressStateHandler,
    useUserActivityBroadcast,
    useAppTimeouts
} from "../hooks";
import { ModalContext, TimeoutContext, ScreenRouteContext } from "../contexts";
import { setViewportZoom, setupViewportResize } from "../utils";

// 버튼 핸들러 초기화 (전역)
export const ButtonHandlerInitializer = () => {
    useToggleButtonClickHandler(true);
    useDisabledButtonBlocker(true);
    usePressStateHandler(true);
    useUserActivityBroadcast(true);
    return null;
};

// 뷰포트 초기화
export const ViewportInitializer = () => {
    useEffect(() => {
        setViewportZoom();
        // 리사이즈 이벤트 설정
        const cleanup = setupViewportResize();
        return cleanup;
    }, []);
    return null;
};

// 앱 포커스 트랩 초기화 (전역 포커스 관리)
export const AppFocusTrapInitializer = () => {
    // 전역적으로 포커스를 관리하거나 특정 상황에서 포커스를 가두는 로직
    return null;
};

// 전역 타임아웃/카운트다운 초기화 (단일 흐름)
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

    useEffect(() => {
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

            if (currentPage === 'ScreenStart') {
                console.log('[타이머] ScreenStart 20초 경고 - TTS 재생하지 않음');
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
