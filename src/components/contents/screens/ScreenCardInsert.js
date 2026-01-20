import React, { memo, useContext, useEffect, useRef } from "react";
import Button from "../../ui/Button";

import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { useFocusableSectionsManager } from "../../../hooks/useFocusManagement";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

const ScreenCardInsert = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            navigateTo('ScreenCardRemoval');
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigateTo]);

    return (
        <>
            <div className="title">
                <div>가운데 아래에 있는 <span className="primary">카드리더기</span>{accessibility.isLow && !accessibility.isLarge ? <><br /><div className="flex center">에</div></> : "에"}</div>
                <div><span className="primary">신용카드</span>를 끝까지 넣으세요</div>
            </div>
            <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image" onClick={(e) => { e.stopPropagation(); accessibility.ModalPaymentError.open(); }} />
            <div ref={actionBarRef} className="task-manager">
                <Button className="w500h120" navigate="ScreenPayments" label="취소" />
            </div>
        </>
    );
});

ScreenCardInsert.displayName = 'ScreenCardInsert';
export default ScreenCardInsert;
