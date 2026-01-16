import React, { memo, useContext, useRef } from "react";
import Step from "../components/ui/Step";

import Button from "../components/ui/Button";
import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { OrderContext } from "../contexts/OrderContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useWebViewMessage } from "../hooks/useWebViewMessage";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { TTS } from "../constants/constants";

const ScreenCardInsert = memo(() => {
    // ScreenCardInsert 전용 TTS 스크립트
    const TTS_SCREEN_CARD_INSERT = `안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ${TTS.replay}`;

    // 개별 Context에서 값 가져오기
    // 개별 Context에서 값 가져오기
    // const refsData = useContext(RefContext);
    const accessibility = useContext(AccessibilityContext);
    const route = useContext(ScreenRouteContext);
    const order = useContext(OrderContext);
    const { handleText } = useTextHandler(accessibility.volume);
    useInteractiveTTSHandler(true, handleText);
    useWebViewMessage();

    useKeyboardNavigationHandler(false, true);
    useKeyboardNavigationHandler(false, true);

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <Step />
            <div data-tts-text={TTS_SCREEN_CARD_INSERT} ref={actionBarRef} className="main forth" tabIndex={-1}>
                <div className="title">
                    <div>가운데 아래에 있는 <span className="primary">카드리더기</span>{accessibility.isLow && !accessibility.isLarge ? <><br /><div className="flex center">에</div></> : "에"}</div>
                    <div><span className="primary">신용카드</span>를 끝까지 넣으세요</div>
                </div>
                <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image" onClick={() => accessibility.ModalPaymentError.open()} />
                <Button className="w500h120" navigate="ScreenPayments" label="취소" />
            </div>
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenCardInsert.displayName = 'ScreenCardInsert';

export default ScreenCardInsert;
