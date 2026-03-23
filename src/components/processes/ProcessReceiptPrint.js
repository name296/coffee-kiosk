import React, { memo, useContext } from "react";
import { Button, Main, Step, Bottom } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { AccessibilityContext } from "@/contexts";
import { processTts } from "@/lib/processTts";

const ProcessReceiptPrint = memo(() => {
    const { isLow } = useContext(AccessibilityContext);

    return (
        <div className="process fifth">
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
                            <div className="task-manager" data-tts-text="작업관리,">
                                <Button
                                    className="skel-inline skin-secondary"
                                    navigate={PROCESS_NAME.FINISH}
                                    label="마무리"
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
                        <div className="task-manager" data-tts-text="작업관리,">
                            <Button
                                className="skel-inline skin-secondary"
                                navigate={PROCESS_NAME.FINISH}
                                label="마무리"
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
