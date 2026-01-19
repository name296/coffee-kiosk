import React, { memo, useContext, useRef } from "react";
import Page from "../components/ui/Page";
import Button from "../components/ui/Button";

import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { useWebViewMessage } from "../hooks/useWebViewMessage";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { TTS } from "../constants/constants";

const ScreenCardInsert = memo(() => {
    // ScreenCardInsert 전용 TTS 스크립트
    const TTS_SCREEN_CARD_INSERT = `안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ${TTS.replay}`;

    const accessibility = useContext(AccessibilityContext);
    useWebViewMessage();

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    return (
        <Page
            Component={Button}
            className="forth flex-flow: column nowrap"
            ttsText={TTS_SCREEN_CARD_INSERT}
            mainRef={actionBarRef}
            actionType="navigate"
            actionTarget="ScreenCardRemoval"
            systemControlsRef={systemControlsRef}
        >
            <div className="title">
                <div>가운데 아래에 있는 <span className="primary">카드리더기</span>{accessibility.isLow && !accessibility.isLarge ? <><br /><div className="flex center">에</div></> : "에"}</div>
                <div><span className="primary">신용카드</span>를 끝까지 넣으세요</div>
            </div>
            <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image" onClick={(e) => { e.stopPropagation(); accessibility.ModalPaymentError.open(); }} />
            <Button className="w500h120" navigate="ScreenPayments" label="취소" />
        </Page>
    );
});
ScreenCardInsert.displayName = 'ScreenCardInsert';

export default ScreenCardInsert;
