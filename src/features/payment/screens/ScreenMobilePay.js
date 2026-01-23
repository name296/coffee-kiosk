import React, { memo, useContext, useRef } from "react";
import { Button } from "@shared/ui";

import { useFocusableSectionsManager } from "@shared/hooks";
import { ScreenRouteContext } from "@shared/contexts";

const ScreenMobilePay = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);

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
                <div><span className="primary">모바일페이</span>를 켜고 접근시키세요</div>
            </div>
            <img src="./images/device-cardReader-mobile.png" alt="" className="credit-pay-image" />
            <div ref={actionBarRef} className="task-manager">
                <Button className="w371h120" navigate="ScreenPayments" label="취소" />
                <Button className="w371h120" navigate="ScreenOrderComplete" label="가상인식" />
            </div>
        </>
    );
});

ScreenMobilePay.displayName = 'ScreenMobilePay';
export default ScreenMobilePay;
