import React, { memo } from "react";
import { Button } from "../components";

const ProcessCardRemoval = memo(() => {
    return (
        <>
            <div className="title"><span><span className="primary">카드</span>를 뽑으세요.</span></div>
            <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" />
            <div className="task-manager">
                <Button navigate="ProcessCardInsert" label="가상취소" />
                <Button navigate="ProcessOrderComplete" label="가상제거" />
            </div>
        </>
    );
});

ProcessCardRemoval.displayName = 'ProcessCardRemoval';
export default ProcessCardRemoval;
