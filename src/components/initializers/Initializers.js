import React, { useEffect } from "react";
import { useToggleButtonClickHandler, useDisabledButtonBlocker, usePressStateHandler } from "../../hooks/useButtonEvents";
import { useUserActivityBroadcast } from "../../hooks/useUserActivity";
import { setViewportZoom, setupViewportResize } from "../../utils/viewport";

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
