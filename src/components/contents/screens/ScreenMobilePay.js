import React, { memo, useContext, useEffect, useRef } from "react";
import Button from "../../ui/Button";

import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { useFocusableSectionsManager } from "../../../hooks/useFocusManagement";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

const ScreenMobilePay = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);
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
                <div><span className="primary">모바일페이</span>를 켜고 접근시키세요</div>
            </div>
            <img src="./images/device-cardReader-mobile.png" alt="" className="credit-pay-image" onClick={() => navigateTo('ScreenOrderComplete')} />
            <div ref={actionBarRef} className="task-manager">
                <Button className="w500h120" navigate="ScreenPayments" label="취소" />
            </div>
        </>
    );
});

ScreenMobilePay.displayName = 'ScreenMobilePay';
export default ScreenMobilePay;
