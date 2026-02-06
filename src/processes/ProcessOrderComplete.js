import React, { memo, useContext } from "react";
import { Button } from "../components";
import { OrderContext, ScreenRouteContext } from "../contexts";
import { useTimeoutCountdown } from "../hooks";

const ProcessOrderComplete = memo(() => {
    const order = useContext(OrderContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    const { remainingSeconds: countdown } = useTimeoutCountdown({
        durationMs: 60000,
        enabled: true,
        onTimeout: () => navigateTo('ProcessFinish'),
        resetOnUserActivity: true
    });

    return (
        <>
            <div className="title">
                <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">주문표</span>를</div>
                <div>받으시고 <span className="primary">영수증 출력</span>을 선택합니다</div>
            </div>
            <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
            <div className="order-num">
                <p>주문번호</p>
                <h1>{order.orderNumber || 100}</h1>
            </div>
            <div className="task-manager">
                <Button onClick={() => order.sendPrintReceiptToApp()} navigate="ProcessReceiptPrint" label="영수증 출력" />
                <Button ttsText="출력 안함," navigate="ProcessFinish" label={`출력 안함${countdown}`} />
            </div>
        </>
    );
});

ProcessOrderComplete.displayName = 'ProcessOrderComplete';
export default ProcessOrderComplete;
