import React, { memo, useContext, useEffect, useRef } from "react";
import Button from "../../ui/Button";

import { useFocusableSectionsManager } from "../../../hooks/useFocusManagement";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

const ScreenSimplePay = memo(() => {
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
                <div>오른쪽 아래에 있는 <span className="primary">QR리더기</span>에</div>
                <div><span className="primary">QR코드</span>를 인식시킵니다</div>
            </div>
            <img src="./images/device-codeReader-simple.png" alt="" className="credit-pay-image" onClick={() => navigateTo('ScreenOrderComplete')} />
            <div ref={actionBarRef} className="task-manager">
                <Button className="w500h120" navigate="ScreenPayments" label="취소" />
            </div>
        </>
    );
});

ScreenSimplePay.displayName = 'ScreenSimplePay';
export default ScreenSimplePay;
