import React, { memo, useContext, useEffect, useRef } from "react";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { useFocusableSectionsManager } from "../../../hooks/useFocusManagement";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

const ScreenCardRemoval = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);

    const systemControlsRef = useRef(null);
    useFocusableSectionsManager([], { systemControls: systemControlsRef });

    return (
        <>
            <div className="title"><span><span className="primary">카드</span>를 뽑으세요.</span></div>
            <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" onClick={() => accessibility.ModalPaymentError.open()} />
        </>
    );
});

ScreenCardRemoval.displayName = 'ScreenCardRemoval';
export default ScreenCardRemoval;
