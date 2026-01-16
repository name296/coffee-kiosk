import React, { memo, useContext, useRef } from "react";
import Step from "../components/ui/Step";

import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { TTS } from "../constants/constants";

const ScreenCardRemoval = memo(() => {
    // ScreenCardRemoval 전용 TTS 스크립트
    const TTS_SCREEN_CARD_REMOVAL = `안내, 신용카드 제거, 신용카드를 뽑습니다, 정상적으로 결제되고 나서 카드가 제거되면, 자동으로 다음 작업, 인쇄 선택으로 이동합니다, ${TTS.replay}`;

    // 개별 Context에서 값 가져오기
    // const refsData = useContext(RefContext);
    const route = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);
    useInteractiveTTSHandler(true, handleText);

    useKeyboardNavigationHandler(false, true);
    const systemControlsRef = useRef(null);
    useFocusableSectionsManager([], { systemControls: systemControlsRef });

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <Step />
            <div data-tts-text={TTS_SCREEN_CARD_REMOVAL} className="main forth card-remove" tabIndex={-1}>
                <div className="title"><span><span className="primary">카드</span>를 뽑으세요.</span></div>
                <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" onClick={() => accessibility.ModalPaymentError.open()} />
            </div>
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenCardRemoval.displayName = 'ScreenCardRemoval';

export default ScreenCardRemoval;
