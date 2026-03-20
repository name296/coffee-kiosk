import React, { memo, useContext } from "react";
import { Button, Main, Step, Bottom } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { AccessibilityContext } from "@/contexts";
import { processTts } from "@/lib/processTts";

const ProcessCardInsert = memo(() => {
    const { isLow } = useContext(AccessibilityContext);
    return (
        <div className="process fifth" tabIndex={-1}>
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.CARD_INSERT]}>
                {isLow ? (
                    <>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src="/images/device-cardReader-insert.png" alt="" />
                            </div>
                        </div>
                        <div className="content-control">
                            <div className="title">
                                <span>
                                    가운데 아래에 있는 <span className="primary">카드리더기</span>에{" "}
                                    <span className="primary">신용카드</span>를 끝까지 넣습니다
                                </span>
                            </div>
                            <div className="task-manager">
                                <Button className="skel-inline skin-secondary" navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                                <Button className="skel-inline skin-primary" style={{ width: "fit-content" }} modal="PaymentError" label="가상오류" />
                                <Button className="skel-inline skin-secondary" style={{ width: "fit-content" }} navigate={PROCESS_NAME.CARD_REMOVAL} label="가상투입" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="title">
                            <>
                                <div>
                                    가운데 아래에 있는 <span className="primary">카드리더기</span>에
                                </div>
                                <div>
                                    <span className="primary">신용카드</span>를 끝까지 넣습니다
                                </div>
                            </>
                        </div>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src="/images/device-cardReader-insert.png" alt="" />
                            </div>
                        </div>
                        <div className="task-manager">
                            <Button className="skel-inline skin-secondary" navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                            <Button className="skel-inline skin-primary" style={{ width: "fit-content" }} modal="PaymentError" label="가상오류" />
                            <Button className="skel-inline skin-secondary" style={{ width: "fit-content" }} navigate={PROCESS_NAME.CARD_REMOVAL} label="가상투입" />
                        </div>
                    </>
                )}
            </Main>
            <Bottom />
        </div>
    );
});

ProcessCardInsert.displayName = "ProcessCardInsert";
export default ProcessCardInsert;
