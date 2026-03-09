import React, { memo, useContext } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext, OrderContext, ScreenRouteContext } from "../contexts";
import { useTimeoutCountdown } from "../hooks";

const ProcessOrderComplete = memo(() => {
    const order = useContext(OrderContext);
    const { navigateTo } = useContext(ScreenRouteContext);
    const { isLow } = useContext(AccessibilityContext);

    const { remainingSeconds: countdown } = useTimeoutCountdown({
        durationMs: 60000,
        enabled: true,
        onTimeout: () => navigateTo(PROCESS_NAME.FINISH),
        resetOnUserActivity: true
    });

    const titleWithBr = (
        <>
            <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">주문표</span>를</div>
            <div>받으시고 <span className="primary">영수증 출력</span>을 선택합니다</div>
        </>
    );
    const titleWithoutBr = (
        <span>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">주문표</span>를 받으시고 <span className="primary">영수증 출력</span>을 선택합니다</span>
    );
    const titleContent = isLow ? titleWithoutBr : titleWithBr;
    const titleAndTask = (
        <>
            <div className="title">{titleContent}</div>
            <div className="task-manager">
                <Button onClick={() => order.sendPrintReceiptToApp()} navigate={PROCESS_NAME.RECEIPT_PRINT} label={<><span>영수증</span><span>출력</span></>} />
                <Button ttsText="출력 안함," navigate={PROCESS_NAME.FINISH} label={<><span>출력 안함</span><span>{countdown}</span></>} />
            </div>
        </>
    );
    return (
        <>
            {isLow ? (
                <>
                    <div className="content-container">
                        <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
                        <div className="order-num">
                            <span>주문</span>
                            <span>{order.orderNumber || 100}</span>
                        </div>
                    </div>
                    <div className="content-control">{titleAndTask}</div>
                </>
            ) : (
                <>
                    <div className="title">{titleContent}</div>
                    <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
                    <div className="order-num">
                        <span>주문</span>
                        <span>{order.orderNumber || 100}</span>
                    </div>
                    <div className="task-manager">
                        <Button onClick={() => order.sendPrintReceiptToApp()} navigate={PROCESS_NAME.RECEIPT_PRINT} label="영수증 출력" />
                        <Button ttsText="출력 안함," navigate={PROCESS_NAME.FINISH} label={`출력 안함${countdown}`} />
                    </div>
                </>
            )}
        </>
    );
});

ProcessOrderComplete.displayName = 'ProcessOrderComplete';
export default ProcessOrderComplete;
