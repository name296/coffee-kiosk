import React, { memo, useContext } from "react";
import { Button, Main, Step, Bottom } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { AccessibilityContext } from "@/contexts";
import { processTts } from "@/lib/processTts";

const ProcessCardRemoval = memo(() => {
    const { isLow } = useContext(AccessibilityContext);
    return (
        <div className="process fifth">
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.CARD_REMOVAL]}>
                {isLow ? (
                    <>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src="images/device-cardReader-remove.png" alt="" />
                            </div>
                        </div>
                        <div className="content-control">
                            <div className="title">
                                <span>
                                    <span className="primary">카드</span>를 뽑습니다.
                                </span>
                            </div>
                            <div className="task-manager" data-tts-text="작업관리,">
                                <Button className="skel-inline skin-secondary" navigate={PROCESS_NAME.CARD_INSERT} label="가상취소" />
                                <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상제거" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="title">
                            <span>
                                <span className="primary">카드</span>를 뽑습니다.
                            </span>
                        </div>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src="images/device-cardReader-remove.png" alt="" />
                            </div>
                        </div>
                        <div className="task-manager" data-tts-text="작업관리,">
                            <Button className="skel-inline skin-secondary" navigate={PROCESS_NAME.CARD_INSERT} label="가상취소" />
                            <Button className="skel-inline skin-primary" navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상제거" />
                        </div>
                    </>
                )}
            </Main>
            <Bottom />
        </div>
    );
});

ProcessCardRemoval.displayName = "ProcessCardRemoval";
export default ProcessCardRemoval;
