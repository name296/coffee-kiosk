import React, { memo } from "react";
import { Button } from "../components";

const ProcessCardInsert = memo(() => {
    return (
        <>
            <div className="title">
                <div>가운데 아래에 있는 <span className="primary">카드리더기</span>에</div>
                <div><span className="primary">신용카드</span>를 끝까지 넣으세요</div>
            </div>
            <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image"/>
            <div className="task-manager">
                <Button navigate="ProcessPayments" label="취소" />
                <Button style={{ width: "fit-content" }} modal="PaymentError" label="가상오류" />
                <Button style={{ width: "fit-content" }} navigate="ProcessCardRemoval" label="가상투입" />
            </div>
        </>
    );
});

ProcessCardInsert.displayName = 'ProcessCardInsert';
export default ProcessCardInsert;
