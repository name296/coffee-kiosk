import React, { memo, useContext } from "react";
import { Button } from "../components";
import { OrderContext } from "../contexts";

const ProcessPayments = memo(() => {
    const order = useContext(OrderContext);

    return (
        <>
            <div className="title"><span><span className="primary">결제방법</span>을 선택합니다</span></div>
            <div className="banner price">
                <span>결제금액</span><span className="payment-amount-large">{order.totalSum.toLocaleString("ko-KR")}원</span>
            </div>
            <div className="payment" data-tts-text="결제 선택,">
                <Button navigate="ProcessCardInsert" img="./images/payment-card.png" label="신용카드" />
                <Button navigate="ProcessMobilePay" img="./images/payment-mobile.png" label="모바일 페이" />
                <Button navigate="ProcessSimplePay" img="./images/payment-simple.png" label="간편결제" />
            </div>
            <div className="task-manager">
                <Button navigate="ProcessDetails" label="취소" />
            </div>
        </>
    );
});

ProcessPayments.displayName = 'ProcessPayments';
export default ProcessPayments;
