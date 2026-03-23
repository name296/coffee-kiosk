import React, { memo, useContext } from "react";
import { Button, Main, Step, Bottom } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { AccessibilityContext, OrderContext } from "@/contexts";
import { processTts } from "@/lib/processTts";

const ProcessPayments = memo(() => {
    const order = useContext(OrderContext);
    const isLow = useContext(AccessibilityContext).isLow;

    return (
        <div className="process forth">
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.PAYMENTS]}>
                <div className="title">
                    <span>
                        <span className="primary">결제방법</span>을 선택합니다
                    </span>
                </div>
                <div className="banner body3">
                    <span>결제금액</span>
                    <span className="price">{order.totalSum.toLocaleString("ko-KR")}원</span>
                </div>
                {isLow ? (
                    <div className="content-control">
                        <div className="payment" data-tts-text="결제수단,">
                            <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.CARD_INSERT} img="images/payment-card.png" label="신용카드" />
                            <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.MOBILE_PAY} img="images/payment-mobile.png" label="모바일페이" />
                            <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.SIMPLE_PAY} img="images/payment-simple.png" label="간편결제" />
                        </div>
                        <div className="task-manager" data-tts-text="작업관리,">
                            <Button className="skel-inline skin-secondary" navigate={PROCESS_NAME.DETAILS} label="취소" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="payment" data-tts-text="결제수단,">
                            <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.CARD_INSERT} img="images/payment-card.png" label="신용카드" />
                            <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.MOBILE_PAY} img="images/payment-mobile.png" label="모바일페이" />
                            <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.SIMPLE_PAY} img="images/payment-simple.png" label="간편결제" />
                        </div>
                        <div className="task-manager" data-tts-text="작업관리,">
                            <Button className="skel-inline skin-secondary" navigate={PROCESS_NAME.DETAILS} label="취소" />
                        </div>
                    </>
                )}
            </Main>
            <Bottom />
        </div>
    );
});

ProcessPayments.displayName = "ProcessPayments";
export default ProcessPayments;
