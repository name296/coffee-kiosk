import React, { memo } from "react";
import { Button } from "../components";

const ProcessMobilePay = memo(() => {
    return (
        <>
            <div className="title">
                <div>가운데 아래에 있는 <span className="primary">카드리더기</span>에</div>
                <div><span className="primary">모바일페이</span>를 켜고 접근시키세요</div>
            </div>
            <img src="./images/device-cardReader-mobile.png" alt="" className="credit-pay-image" />
            <div className="task-manager">
                <Button navigate="ProcessPayments" label="취소" />
                <Button navigate="ProcessOrderComplete" label="가상인식" />
            </div>
        </>
    );
});

ProcessMobilePay.displayName = 'ProcessMobilePay';
export default ProcessMobilePay;
