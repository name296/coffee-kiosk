import React, { memo, useContext } from "react";
import { Button } from "../components";
import { useTimeoutCountdown } from "../hooks";
import { ScreenRouteContext } from "../contexts";

const ProcessReceiptPrint = memo(() => {
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
                <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">영수증</span>을</div>
                <div>받으시고 <span className="primary">마무리</span>&nbsp;버튼을 누르세요</div>
            </div>
            <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
            <div className="task-manager">
                <Button navigate="ProcessFinish" label={`마무리${countdown}`} ttsText="마무리하기" />
            </div>
        </>
    );
});
ProcessReceiptPrint.displayName = 'ProcessReceiptPrint';

export default ProcessReceiptPrint;
