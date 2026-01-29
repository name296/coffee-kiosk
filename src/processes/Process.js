import React, { memo, useContext } from "react";
import { AccessibilityContext, ScreenRouteContext } from "../contexts";
import { useTextHandler, useInteractiveTTSHandler, useKeyboardNavigationHandler } from "../hooks";
import { Main, Step, Bottom, Summary } from "../components";
import PROCESS_CONFIG from "./ProcessConfig";

/**
 * Process 컴포넌트
 * - ProcessConfig(프로세스 콘피그)로 레이아웃 + 콘텐츠 결정. body 아래 div.process로 감싸고, black/top/step/main/summary/bottom은 CSS(body .process)로 제어.
 */
const Process = memo(() => {
    const { currentPage } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);

    const config = PROCESS_CONFIG[currentPage];
    if (!config) return null;
    const { layoutType, Component, className = "", ttsText = "", ...rest } = config;

    useInteractiveTTSHandler(true, handleText);
    useKeyboardNavigationHandler(false, true);

    const processClassName = ["process", layoutType].filter(Boolean).join(" ");

    return (
        <div className={processClassName}>
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
