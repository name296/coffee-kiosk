import React, { memo, useContext } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext } from "../contexts";

const titleWithBr = (
    <span>가운데 아래에 있는 <span className="primary">카드리더기</span>에<br /><span className="primary">모바일페이</span>를 켜고 접근시킵니다</span>
);
const titleWithoutBr = (
    <span>가운데 아래에 있는 <span className="primary">카드리더기</span>에 <span className="primary">모바일페이</span>를 켜고 접근시킵니다</span>
);

const ProcessMobilePay = memo(() => {
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
                        <img src="./images/device-cardReader-mobile.png" alt="" className="pay-guide" />
                    </div>
                    <div className="content-control">{titleAndTask}</div>
                </>
            ) : (
                <>
                    <div className="title">{titleContent}</div>
                    <img src="./images/device-cardReader-mobile.png" alt="" className="pay-guide" />
                    <div className="task-manager">
                        <Button navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                        <Button navigate={PROCESS_NAME.ORDER_COMPLETE} label="가상인식" />
                    </div>
                </>
            )}
        </>
    );
});

ProcessMobilePay.displayName = 'ProcessMobilePay';
export default ProcessMobilePay;
