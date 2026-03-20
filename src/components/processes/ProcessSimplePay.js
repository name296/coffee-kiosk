import React, { memo, useContext } from "react";
import { Button, Main, Step, Bottom } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { AccessibilityContext } from "@/contexts";
import { processTts } from "@/lib/processTts";
import { publicAsset } from "@/lib/publicPath";

const ProcessSimplePay = memo(() => {
    const { isLow } = useContext(AccessibilityContext);
    return (
        <div className="process fifth" tabIndex={-1}>
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.SIMPLE_PAY]}>
                {isLow ? (
                    <>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src={publicAsset("/images/device-codeReader-simple.png")} alt="" />
                            </div>
                        </div>
                        <div className="content-control">
                            <div className="title">
                                <span>
                                    오른쪽 아래에 있는 <span className="primary">QR리더기</span>에{" "}
                                    <span className="primary">QR코드</span>를 인식시킵니다
                                </span>
                            </div>
                            <div className="task-manager">
                                <Button className="skel-inline skin-secondary" navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                                <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상인식" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="title">
                            <>
                                <div>
                                    오른쪽 아래에 있는 <span className="primary">QR리더기</span>에
                                </div>
                                <div>
                                    <span className="primary">QR코드</span>를 인식시킵니다
                                </div>
                            </>
                        </div>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src={publicAsset("/images/device-codeReader-simple.png")} alt="" />
                            </div>
                        </div>
                        <div className="task-manager">
                            <Button className="skel-inline skin-secondary" navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                            <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상인식" />
                        </div>
                    </>
                )}
            </Main>
            <Bottom />
        </div>
    );
});

ProcessSimplePay.displayName = "ProcessSimplePay";
export default ProcessSimplePay;
