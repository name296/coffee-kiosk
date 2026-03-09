import React, { memo, useContext } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext } from "../contexts";

const ProcessCardRemoval = memo(() => {
    const { isLow } = useContext(AccessibilityContext);
    const titleAndTask = (
        <>
            <div className="title"><span><span className="primary">카드</span>를 뽑으세요.</span></div>
            <div className="task-manager">
                <Button navigate={PROCESS_NAME.CARD_INSERT} label="가상취소" />
                <Button navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상제거" />
            </div>
        </>
    );
    return (
        <>
            {isLow ? (
                <>
                    <div className="content-container">
                        <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" />
                    </div>
                    <div className="content-control">{titleAndTask}</div>
                </>
            ) : (
                <>
                    <div className="title"><span><span className="primary">카드</span>를 뽑으세요.</span></div>
                    <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" />
                    <div className="task-manager">
                        <Button navigate={PROCESS_NAME.CARD_INSERT} label="가상취소" />
                        <Button navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상제거" />
                    </div>
                </>
            )}
        </>
    );
});

ProcessCardRemoval.displayName = 'ProcessCardRemoval';
export default ProcessCardRemoval;
