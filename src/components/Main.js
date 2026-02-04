import React, { memo } from "react";

/**
 * UI 컴포넌트: 전역 메인 콘텐츠 영역.
 * - 모든 스크린의 중심이 되는 .main 영역을 담당함.
 * - 스크린 레이아웃(first|second|third|forth)은 body 클래스에서 적용 (Process가 지정).
 * - className 은 Main 보조 클래스만 담당.
 */
const Main = memo(({
    children,
    className = "",
    ttsText = "",
    tabIndex = -1,
    Component = "div",
    ...rest
}) => {
    return (
        <Component
            className={`main ${className}`}
            data-tts-text={ttsText}
            tabIndex={tabIndex}
            {...rest}
        >
            {children}
        </Component>
    );
});

Main.displayName = 'Main';
export default Main;
