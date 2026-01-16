import React, { memo, useContext, useRef, useMemo } from "react";
import Step from "../components/ui/Step";

import Button from "../components/ui/Button";
import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { OrderContext } from "../contexts/OrderContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { formatNumber } from "../utils/format";
import { TTS } from "../constants/constants";

const ScreenPayments = memo(() => {
    // 개별 Context에서 값 가져오기
    // 개별 Context에서 값 가져오기
    // const refsData = useContext(RefContext);
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const route = useContext(ScreenRouteContext);
    const { handleText } = useTextHandler(accessibility.volume);
    useInteractiveTTSHandler(true, handleText);

    // TTS는 .main의 data-tts-text에서 자동 재생됨 (동적 값 포함)
    const paymentTts = useMemo(() =>
        `안내, 결제 단계, 결제 금액, ${formatNumber(order.totalSum)}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ${TTS.replay}`,
        [order.totalSum]
    );

    useKeyboardNavigationHandler(false, true);
    const mainContentRef = useRef(null);
    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['mainContent', 'actionBar', 'systemControls'], {
        mainContent: mainContentRef,
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <Step />
            <div className="main forth" data-tts-text={paymentTts} tabIndex={-1}>
                <div className="title"><span><span className="primary">결제방법</span>을 선택합니다</span></div>
                <div className="banner price" onClick={(e) => { e.preventDefault(); e.target.focus(); order.updateOrderNumber(); route.setCurrentPage('ScreenOrderComplete'); }}>
                    <span>결제금액</span><span className="payment-amount-large">{order.totalSum.toLocaleString("ko-KR")}원</span>
                </div>
                <div className="task-manager" ref={mainContentRef} data-tts-text="결제 선택. 버튼 세 개, ">
                    <Button className="w328h460" payment="card" img="./images/payment-card.png" imgAlt="card" label="신용카드" />
                    <Button className="w328h460" payment="mobile" img="./images/payment-mobile.png" imgAlt="mobile" label="모바일 페이" />
                    <Button className="w328h460" navigate="ScreenSimplePay" img="./images/payment-simple.png" imgAlt="simple" label="간편결제" />
                </div>
                <div ref={actionBarRef} className="task-manager" data-tts-text="작업관리. 버튼 한 개,">
                    <Button className="w500h120" navigate="ScreenDetails" label="취소" />
                </div>
            </div>
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenPayments.displayName = 'ScreenPayments';

export default ScreenPayments;
