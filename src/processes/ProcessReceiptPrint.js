import React, { memo, useContext } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";
import { useTimeoutCountdown } from "../hooks";
import { AccessibilityContext, ScreenRouteContext } from "../contexts";

const ProcessReceiptPrint = memo(() => {
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
            <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">영수증</span>을</div>
            <div>받으시고 <span className="primary">마무리</span>&nbsp;버튼을 누릅니다</div>
        </>
    );
    const titleWithoutBr = (
        <span>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">영수증</span>을 받으시고 <span className="primary">마무리</span> 버튼을 누릅니다</span>
    );
    const titleContent = isLow ? titleWithoutBr : titleWithBr;
    const titleAndTask = (
        <>
            <div className="title">{titleContent}</div>
            <div className="task-manager">
                <Button navigate={PROCESS_NAME.FINISH} label={<><span>마무리</span><span>{countdown}</span></>} ttsText="마무리하기" />
            </div>
        </>
    );
    return (
        <>
            {isLow ? (
                <>
                    <div className="content-container">
                        <img src="./images/device-printer-receipt.png" alt="" className="pay-guide" />
                    </div>
                    <div className="content-control">{titleAndTask}</div>
                </>
            ) : (
                <>
                    <div className="title">{titleContent}</div>
                    <img src="./images/device-printer-receipt.png" alt="" className="pay-guide" />
                    <div className="task-manager">
                        <Button navigate={PROCESS_NAME.FINISH} label={`마무리${countdown}`} ttsText="마무리하기" />
                    </div>
                </>
            )}
        </>
    );
});
ProcessReceiptPrint.displayName = 'ProcessReceiptPrint';

export default ProcessReceiptPrint;
