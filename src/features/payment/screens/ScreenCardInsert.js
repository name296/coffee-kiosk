import React, { memo, useContext, useRef } from "react";
import { Button } from "@shared/ui";

import { AccessibilityContext } from "@shared/contexts";
import { useFocusableSectionsManager } from "@shared/hooks";

const ScreenCardInsert = memo(() => {
    const accessibility = useContext(AccessibilityContext);

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    return (
        <>
            <div className="title">
                <div>가운데 아래에 있는 <span className="primary">카드리더기</span>에</div>
                <div><span className="primary">신용카드</span>를 끝까지 넣으세요</div>
            </div>
            <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image"/>
            <div ref={actionBarRef} className="task-manager" data-tts-text="작업관리. 버튼 세 개,">
                <Button className="w371h120" navigate="ScreenPayments" label="취소" />
                <Button style={{ height: "120px" }} modal="PaymentError" label="가상오류" />
                <Button style={{ height: "120px" }} navigate="ScreenCardRemoval" label="가상투입" />
            </div>
        </>
    );
});

ScreenCardInsert.displayName = 'ScreenCardInsert';
export default ScreenCardInsert;
