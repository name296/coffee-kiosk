import React, { useEffect } from "react";
import { useToggleButtonClickHandler, useDisabledButtonBlocker, usePressStateHandler } from "../../hooks/useButtonEvents";
import { SizeControlManager } from "../../utils/sizeControl";
import { setViewportZoom, setupViewportResize } from "../../utils/viewport";
// import { useFocusTrap } from "../../hooks/useFocusTrap"; // AppFocusTrapInitializer logic

// 버튼 핸들러 초기화 (전역)
export const ButtonHandlerInitializer = () => {
    useToggleButtonClickHandler(true);
    useDisabledButtonBlocker(true);
    usePressStateHandler(true);
    return null;
};

// 사이즈 컨트롤 초기화
export const SizeControlInitializer = () => {
    useEffect(() => {
        SizeControlManager.init();
        return () => SizeControlManager.cleanup();
    }, []);
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
    // 현재는 별도 Hook 호출 없이 placeholder로 유지하거나
    // 필요한 경우 useFocusTrap(true) 호출
    // useFocusTrap(true); // 만약 전역 트랩이 필요하다면
    return null;
};
