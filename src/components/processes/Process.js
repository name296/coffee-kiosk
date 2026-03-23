import React, { memo, useContext, useEffect } from "react";
import { AccessibilityContext, ScreenRouteContext } from "@/contexts";
import { useTextHandler, useInteractiveTTSHandler, useFocusNavigationHandler, useCallHotkey } from "@/hooks";
import { PROCESS_NAME } from "@/constants";
import PROCESS_CONFIG from "@/constants/processRegistry";

/**
 * 현재 라우트에 해당하는 화면 컴포넌트만 렌더한다. 레이아웃은 각 Process* 가 직접 조립.
 */
const Process = memo(() => {
    const { currentProcess, navigateTo } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);

    const hasConfig = Boolean(PROCESS_CONFIG[currentProcess]);
    const effectiveProcess = hasConfig ? currentProcess : PROCESS_NAME.START;
    const { Component } = PROCESS_CONFIG[effectiveProcess];

    useEffect(() => {
        if (!hasConfig) {
            navigateTo(PROCESS_NAME.START);
        }
    }, [hasConfig, navigateTo]);

    useInteractiveTTSHandler(true, handleText);
    useFocusNavigationHandler(true);
    useCallHotkey(true);

    if (!Component) {
        return null;
    }

    return <Component />;
});

Process.displayName = "Process";
export default Process;
