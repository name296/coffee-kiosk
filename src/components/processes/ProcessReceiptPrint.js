import React, { memo, useContext } from "react";
import { Button, Main, Step, Bottom } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { useTimeoutCountdown } from "@/hooks";
import { AccessibilityContext, ScreenRouteContext } from "@/contexts";
import { processTts } from "@/lib/processTts";

const ProcessReceiptPrint = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);
    const { isLow } = useContext(AccessibilityContext);

    const { remainingSeconds: countdown } = useTimeoutCountdown({
        durationMs: 60000,
        enabled: true,
        onTimeout: () => navigateTo(PROCESS_NAME.FINISH),
        resetOnUserActivity: true
    });

    return (
        <div className="process fifth" tabIndex={-1}>
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.RECEIPT_PRINT]}>
                {isLow ? (
                    <>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src="images/device-printer-receipt.png" alt="" />
                            </div>
                        </div>
                        <div className="content-control">
                            <div className="title">
                                <span>
                                    왼쪽 아래의 <span className="primary">프린터</span>에서{" "}
                                    <span className="primary">영수증</span>을 받으시고{" "}
                                    <span className="primary">마무리</span> 버튼을 누릅니다
                                </span>
                            </div>
                            <div className="task-manager">
                                <Button
                                    className="skel-inline skin-secondary"
                                    navigate={PROCESS_NAME.FINISH}
                                    label={
                                        <>
                                            <span>마무리</span>
                                            <span>{countdown}초</span>
                                        </>
                                    }
                                    ttsText="마무리하기"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="title">
                            <>
                                <div>
                                    왼쪽 아래의 <span className="primary">프린터</span>에서{" "}
                                    <span className="primary">영수증</span>을
                                </div>
                                <div>
                                    받으시고 <span className="primary">마무리</span>&nbsp;버튼을 누릅니다
                                </div>
                            </>
                        </div>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src="images/device-printer-receipt.png" alt="" />
                            </div>
                        </div>
                        <div className="task-manager">
                            <Button
                                className="skel-inline skin-secondary"
                                navigate={PROCESS_NAME.FINISH}
                                label={
                                    <>
                                        <span>마무리</span>
                                        <span>{countdown}초</span>
                                    </>
                                }
                                ttsText="마무리하기"
                            />
                        </div>
                    </>
                )}
            </Main>
            <Bottom />
        </div>
    );
});
ProcessReceiptPrint.displayName = "ProcessReceiptPrint";

export default ProcessReceiptPrint;
