import React, { memo } from "react";

/**
 * UI 컴포넌트: 전역 메인 콘텐츠 영역.
 * - 모든 스크린의 중심이 되는 .main 영역을 담당함.
 * - 스크린 레이아웃(first|second|third|forth|fifth)은 body 클래스에서 적용 (Process가 지정).
 * - className: 보조 클래스만 (기본 "" — 비우면 생략 가능)
 * - Component: 루트 태그 (기본 "div" — 생략 가능)
 */
const Main = memo(({
    children,
    className = "",
    ttsText = "",
    tabIndex = 0,
    Component = "div",
    ...rest
}) => {
    return (
        <Component
            className={`main body2 ${className}`}
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
