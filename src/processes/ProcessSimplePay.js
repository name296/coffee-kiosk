import React, { memo, useContext } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext } from "../contexts";

const titleWithBr = (
    <>
        <div>오른쪽 아래에 있는 <span className="primary">QR리더기</span>에</div>
        <div><span className="primary">QR코드</span>를 인식시킵니다</div>
    </>
);
const titleWithoutBr = (
    <span>오른쪽 아래에 있는 <span className="primary">QR리더기</span>에 <span className="primary">QR코드</span>를 인식시킵니다</span>
);

const ProcessSimplePay = memo(() => {
    const { isLow } = useContext(AccessibilityContext);
    const titleContent = isLow ? titleWithoutBr : titleWithBr;
    const titleAndTask = (
        <>
            <div className="title">{titleContent}</div>
            <div className="task-manager">
                <Button navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                <Button navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상인식" />
            </div>
        </>
    );
    return (
        <>
            {isLow ? (
                <>
                    <div className="content-container">
                        <img src="./images/device-codeReader-simple.png" alt="" className="pay-guide" />
                    </div>
                    <div className="content-control">{titleAndTask}</div>
                </>
            ) : (
                <>
                    <div className="title">{titleContent}</div>
                    <img src="./images/device-codeReader-simple.png" alt="" className="pay-guide" />
                    <div className="task-manager">
                        <Button navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                        <Button navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상인식" />
                    </div>
                </>
            )}
        </>
    );
});

ProcessSimplePay.displayName = 'ProcessSimplePay';
export default ProcessSimplePay;
