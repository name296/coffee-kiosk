import React, { memo, useContext } from "react";
import Step from "../Step";
import Main from "../Main";
import Bottom from "../Bottom";
import { Summary } from "@features/menu";
import { AccessibilityContext, ScreenRouteContext } from "../../contexts";
import { useTextHandler, useInteractiveTTSHandler, useKeyboardNavigationHandler } from "../../hooks";
import SCREEN_REGISTRY from "./ScreenRegistry";

/**
 * 전역 스크린 컴포넌트 (Temporal Frame)
 * - 현재 페이지에 맞는 껍데기(Layout)와 알맹이(Content)를 조립함.
 */
const Screen = memo(() => {
    const { currentPage } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);

    const config = SCREEN_REGISTRY[currentPage];
    if (!config) return null;

    const { Component, showStep = true, showSummary = false, className = "", ttsText = "", ...rest } = config;

    // 공통 접근성 훅 설정
    useInteractiveTTSHandler(true, handleText);
    useKeyboardNavigationHandler(false, true);

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            {showStep && <Step />}
            <Main
                className={className}
                ttsText={ttsText}
                Component="div"
                {...rest}
            >
                <Component accessibility={accessibility} />
            </Main>
            {showSummary && <Summary />}
            <Bottom />
        </>
    );
});

Screen.displayName = 'Screen';
export default Screen;
