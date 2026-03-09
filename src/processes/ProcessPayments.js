import React, { memo, useContext } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext, OrderContext } from "../contexts";

const ProcessPayments = memo(() => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const isLow = accessibility.isLow;

    const paymentAndTask = (
        <>
            <div className="payment" data-tts-text="결제 선택,">
                <Button navigate={PROCESS_NAME.CARD_INSERT} img="./images/payment-card.png" label="신용카드" />
                <Button navigate={PROCESS_NAME.MOBILE_PAY} img="./images/payment-mobile.png" label="모바일페이" />
                <Button navigate={PROCESS_NAME.SIMPLE_PAY} img="./images/payment-simple.png" label="간편결제" />
            </div>
            <div className="task-manager">
                <Button navigate={PROCESS_NAME.DETAILS} label="취소" />
            </div>
        </>
    );

    return (
        <>
            <div className="title"><span><span className="primary">결제방법</span>을 선택합니다</span></div>
            <div className="banner price">
                <span>결제금액</span><span className="payment-amount-large">{order.totalSum.toLocaleString("ko-KR")}원</span>
            </div>
            {isLow ? <div className="content">{paymentAndTask}</div> : paymentAndTask}
        </>
    );
});

ProcessPayments.displayName = 'ProcessPayments';
export default ProcessPayments;
