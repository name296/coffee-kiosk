import React, { memo, useContext, useLayoutEffect, useRef } from "react";
import { AccessibilityContext, ScreenRouteContext } from "../contexts";
import { useTextHandler, useInteractiveTTSHandler, useKeyboardNavigationHandler } from "../hooks";
import { Main, Step, Bottom, Summary } from "../components";
import PROCESS_CONFIG from "./ProcessConfig";

/**
 * Process 컴포넌트
 * - ProcessConfig로 레이아웃 + 콘텐츠 결정.
 * - 스크린 레이아웃(first|second|third|forth)은 div.process에 지정 → CSS body .process.first 등으로 제어.
 * - black/top/step/main/summary/bottom은 CSS로 제어.
 */
const Process = memo(() => {
    const { currentProcess } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);
    const processRef = useRef(null);

    const config = PROCESS_CONFIG[currentProcess];
    if (!config) return null;
    const { layoutType, Component, className = "", ttsText = "", ...rest } = config;

    useInteractiveTTSHandler(true, handleText);
    useKeyboardNavigationHandler(false, true);

    useLayoutEffect(() => {
        processRef.current?.focus();
    }, [currentProcess]);

    const processClassName = ["process", layoutType].filter(Boolean).join(" ");

    return (
        <div ref={processRef} className={processClassName} tabIndex={-1}>
            <div className="black" />
            <div className="top" />
            <Step />
            <Main
                className={className}
                ttsText={ttsText}
                Component="div"
                {...rest}
            >
                <Component />
            </Main>
            <Summary />
            <Bottom />
        </div>
    );
});

Process.displayName = "Process";
export default Process;
