import React, { memo, useContext, useEffect, useRef } from "react";
import Step from "../components/ui/Step";

import Button from "../components/ui/Button";
import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { OrderContext } from "../contexts/OrderContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useAutoFinishCountdown } from "../hooks/useAutoFinishCountdown";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { TTS } from "../constants/constants";

const ScreenOrderComplete = memo(() => {
    const TTS_SCREEN_ORDER_COMPLETE = `안내, 인쇄 선택, 결제되었습니다, 주문번호, 백 번, 왼쪽 아래의 프린터에서 주문표를 받으시고, 영수증 출력을 선택합니다, 육십초 동안 조작이 없을 경우, 출력없이 사용 종료합니다,${TTS.replay}`;

    // const refsData = useContext(RefContext);
    const route = useContext(ScreenRouteContext);
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);
    useInteractiveTTSHandler(true, handleText);

    useKeyboardNavigationHandler(false, true);
    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    const countdown = useAutoFinishCountdown(() => route.setCurrentPage('ScreenFinish'));

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <Step />
            <div data-tts-text={TTS_SCREEN_ORDER_COMPLETE} className="main forth" tabIndex={-1}>
                <div className="title">
                    <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">주문표</span>를</div>
                    <div>받으시고 <span className="primary">영수증 출력</span>을 선택합니다</div>
                </div>
                <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
                <div className="order-num">
                    <p>주문번호</p>
                    <h1>100</h1>
                </div>
                <div className="task-manager" ref={actionBarRef} data-tts-text="인쇄 선택, 버튼 두 개,">
                    <Button className="w371h120" onClick={() => { if (order.sendPrintReceiptToApp) order.sendPrintReceiptToApp(); route.setCurrentPage('ScreenReceiptPrint'); }} label="영수증 출력" />
                    <Button ttsText="출력 안함," className="w371h120" onClick={() => route.setCurrentPage('ScreenFinish')} label={`출력 안함${countdown}`} />
                </div>
            </div>
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenOrderComplete.displayName = 'ScreenOrderComplete';

export default ScreenOrderComplete;
