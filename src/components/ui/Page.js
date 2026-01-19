import React, { memo, useContext } from "react";
import Step from "./Step";
import Bottom from "./Bottom";
import { AccessibilityContext } from "../../contexts/AccessibilityContext";
import { useTextHandler } from "../../hooks/useTTS";
import { useInteractiveTTSHandler } from "../../hooks/useTTSInteraction";
import { useKeyboardNavigationHandler } from "../../hooks/useKeyboardNavigation";

/**
 * 전역 페이지 컴포넌트 
 * - 모든 스크린의 공통 구조(black, top, Step, Bottom) 및 공통 훅들을 캡슐화함.
 */
const Page = memo(({
    children,
    className = "",
    ttsText = "",
    mainRef,
    systemControlsRef,
    Component = "div",
    ...rest
}) => {
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);

    // 공통 접근성 훅 설정
    useInteractiveTTSHandler(true, handleText);
    useKeyboardNavigationHandler(false, true);

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <Step />
            <Component
                className={`main ${className}`}
                data-tts-text={ttsText}
                ref={mainRef}
                tabIndex={-1}
                {...rest}
            >
                {children}
            </Component>
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});

Page.displayName = 'Page';
export default Page;
