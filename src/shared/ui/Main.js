import React, { memo } from "react";

/**
 * 전역 메인 컨텐츠 컴포넌트
 * - 모든 스크린의 중심이 되는 .main 영역을 담당함.
 */
const Main = memo(({
    children,
    className = "",
    ttsText = "",
    mainRef,
    Component = "div",
    ...rest
}) => {
    return (
        <Component
            className={`main ${className}`}
            data-tts-text={ttsText}
            ref={mainRef}
            tabIndex={-1}
            {...rest}
        >
            {children}
        </Component>
    );
});

Main.displayName = 'Main';
export default Main;
