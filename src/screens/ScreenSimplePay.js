import React, { memo, useContext, useRef } from "react";
import Page from "../components/ui/Page";
import Button from "../components/ui/Button";

import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { useWebViewMessage } from "../hooks/useWebViewMessage";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { TTS } from "../constants/constants";

const ScreenSimplePay = memo(() => {
    // ScreenSimplePay 전용 TTS 스크립트
    const TTS_SCREEN_SIMPLE_PAY = `안내, 심플 결제, 오른쪽 아래에 있는 QR리더기에 QR코드를 인식시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ${TTS.replay}`;

    const route = useContext(ScreenRouteContext);
    useWebViewMessage();

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    return (
        <Page
            className="forth"
            ttsText={TTS_SCREEN_SIMPLE_PAY}
            mainRef={actionBarRef}
            systemControlsRef={systemControlsRef}
        >
            <div className="title">
                <div>오른쪽 아래에 있는 <span className="primary">QR리더기</span>에</div>
                <div><span className="primary">QR코드</span>를 인식시킵니다</div>
            </div>
            {/* 임시 이미지 클릭 시 완료 화면 이동 유지 */}
            <img src="./images/device-codeReader-simple.png" alt="" className="credit-pay-image" onClick={() => route.setCurrentPage('ScreenOrderComplete')} />
            <Button className="w500h120" navigate="ScreenPayments" label="취소" />
        </Page>
    );
});
ScreenSimplePay.displayName = 'ScreenSimplePay';

export default ScreenSimplePay;
