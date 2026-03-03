import React, { memo } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";

const ProcessSimplePay = memo(() => {
    return (
        <>
            <div className="title">
                <div>오른쪽 아래에 있는 <span className="primary">QR리더기</span>에</div>
                <div><span className="primary">QR코드</span>를 인식시킵니다</div>
            </div>
            <img src="./images/device-codeReader-simple.png" alt="" className="credit-pay-image" />
            <div className="task-manager">
                <Button navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                <Button navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상인식" />
            </div>
        </>
    );
});

ProcessSimplePay.displayName = 'ProcessSimplePay';
export default ProcessSimplePay;
