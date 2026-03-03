import React, { memo } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";

const ProcessCardRemoval = memo(() => {
    return (
        <>
            <div className="title"><span><span className="primary">카드</span>를 뽑으세요.</span></div>
            <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" />
            <div className="task-manager">
                <Button navigate={PROCESS_NAME.CARD_INSERT} label="가상취소" />
                <Button navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상제거" />
            </div>
        </>
    );
});

ProcessCardRemoval.displayName = 'ProcessCardRemoval';
export default ProcessCardRemoval;
