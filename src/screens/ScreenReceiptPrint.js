import React, { memo, useContext, useEffect, useRef } from "react";
import Step from "../components/ui/Step";

import Button from "../components/ui/Button";
import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { OrderContext } from "../contexts/OrderContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useAutoFinishCountdown } from "../hooks/useAutoFinishCountdown";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { TTS } from "../constants/constants";

const ScreenReceiptPrint = memo(() => {
    const TTS_SCREEN_RECEIPT_PRINT = `안내, 영수증 출력, 왼쪽 아래의 프린터에서 영수증을 받습니다, 마무리하기 버튼으로 사용을 종료할 수 있습니다,${TTS.replay}`;

    // const refsData = useContext(RefContext);
    const route = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);
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
            <div data-tts-text={TTS_SCREEN_RECEIPT_PRINT} className="main forth" ref={actionBarRef} tabIndex={-1}>
                <div className="title">
                    <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">영수증</span>을</div>
                    <div>받으시고 <span className="primary">마무리</span>&nbsp;버튼을 누르세요</div>
                </div>
                <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
                <Button className="w500h120" navigate="ScreenFinish" label={`마무리${countdown}`} ttsText="마무리하기" />
            </div>
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenReceiptPrint.displayName = 'ScreenReceiptPrint';

export default ScreenReceiptPrint;
