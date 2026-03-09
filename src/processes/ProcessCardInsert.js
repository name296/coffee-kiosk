import React, { memo, useContext } from "react";
import { Button } from "../components";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext } from "../contexts";

const titleWithBr = (
    <>
        <div>가운데 아래에 있는 <span className="primary">카드리더기</span>에</div>
        <div><span className="primary">신용카드</span>를 끝까지 넣으세요</div>
    </>
);
const titleWithoutBr = (
    <span>가운데 아래에 있는 <span className="primary">카드리더기</span>에 <span className="primary">신용카드</span>를 끝까지 넣으세요</span>
);

const ProcessCardInsert = memo(() => {
    const { isLow } = useContext(AccessibilityContext);
    const titleContent = isLow ? titleWithoutBr : titleWithBr;
    const titleAndTask = (
        <>
            <div className="title">{titleContent}</div>
            <div className="task-manager">
                <Button navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                <Button style={{ width: "fit-content" }} modal="PaymentError" label="가상오류" />
                <Button style={{ width: "fit-content" }} navigate={PROCESS_NAME.CARD_REMOVAL} label="가상투입" />
            </div>
        </>
    );
    return (
        <>
            {isLow ? (
                <>
                    <div className="content-container">
                        <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image"/>
                    </div>
                    <div className="content-control">{titleAndTask}</div>
                </>
            ) : (
                <>
                    <div className="title">{titleContent}</div>
                    <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image"/>
                    <div className="task-manager">
                        <Button navigate={PROCESS_NAME.PAYMENTS} label="취소" />
                        <Button style={{ width: "fit-content" }} modal="PaymentError" label="가상오류" />
                        <Button style={{ width: "fit-content" }} navigate={PROCESS_NAME.CARD_REMOVAL} label="가상투입" />
                    </div>
                </>
            )}
        </>
    );
});

ProcessCardInsert.displayName = 'ProcessCardInsert';
export default ProcessCardInsert;
