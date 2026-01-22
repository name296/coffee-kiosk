import React, { memo, useContext, useRef } from "react";
import Button from "../../../shared/ui/Button";

import { OrderContext } from "../../../shared/contexts/OrderContext";
import { ScreenRouteContext } from "../../../shared/contexts/ScreenRouteContext";
import { useFocusableSectionsManager } from "../../../shared/hooks/useFocusManagement";

const ScreenPayments = memo(() => {
    const order = useContext(OrderContext);
    const { navigateTo } = useContext(ScreenRouteContext);

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
            <div className="title"><span><span className="primary">결제방법</span>을 선택합니다</span></div>
            <div className="banner price" onClick={(e) => { e.preventDefault(); e.target.focus(); order.updateOrderNumber(); navigateTo('ScreenOrderComplete'); }}>
                <span>결제금액</span><span className="payment-amount-large">{order.totalSum.toLocaleString("ko-KR")}원</span>
            </div>
            <div className="task-manager" ref={mainContentRef} data-tts-text="결제 선택. 버튼 세 개, ">
                <Button className="w328h460" navigate="ScreenCardInsert" img="./images/payment-card.png" label="신용카드" />
                <Button className="w328h460" navigate="ScreenMobilePay" img="./images/payment-mobile.png" label="모바일 페이" />
                <Button className="w328h460" navigate="ScreenSimplePay" img="./images/payment-simple.png" label="간편결제" />
            </div>
            <div ref={actionBarRef} className="task-manager" data-tts-text="작업관리. 버튼 한 개,">
                <Button className="w500h120" navigate="ScreenDetails" label="취소" />
            </div>
        </>
    );
});

ScreenPayments.displayName = 'ScreenPayments';
export default ScreenPayments;
