import React, { memo, useContext, useRef } from "react";
import Step from "../components/ui/Step";

import Button from "../components/ui/Button";
import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { OrderContext } from "../contexts/OrderContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useWebViewMessage } from "../hooks/useWebViewMessage";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { TTS } from "../constants/constants";

const ScreenMobilePay = memo(() => {
    // ScreenMobilePay 전용 TTS 스크립트
    const TTS_SCREEN_MOBILE_PAY = `안내, 모바일페이, 가운데 아래에 있는 카드리더기에 휴대전화의 모바일페이를 켜고 접근시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ${TTS.replay}`;

    // 개별 Context에서 값 가져오기
    // 개별 Context에서 값 가져오기
    // const refsData = useContext(RefContext);
    const route = useContext(ScreenRouteContext);
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
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
            <div data-tts-text={TTS_SCREEN_MOBILE_PAY} ref={actionBarRef} className="main forth" tabIndex={-1}>
                <div className="title">
                    <div>가운데 아래에 있는 <span className="primary">카드리더기</span>에</div>
                    <div><span className="primary">모바일페이</span>를 켜고 접근시키세요</div>
                </div>
                <img src="./images/device-cardReader-mobile.png" alt="" className="credit-pay-image" onClick={() => route.setCurrentPage('ScreenOrderComplete')} />
                <Button className="w500h120" navigate="ScreenPayments" label="취소" />
            </div>
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenMobilePay.displayName = 'ScreenMobilePay';

export default ScreenMobilePay;
