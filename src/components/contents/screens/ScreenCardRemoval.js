import React, { memo, useContext, useEffect, useRef } from "react";
import Button from "../../ui/Button";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { ModalContext } from "../../../contexts/ModalContext";
import { useFocusableSectionsManager } from "../../../hooks/useFocusManagement";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

const ScreenCardRemoval = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);
    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    return (
        <>
            <div className="title"><span><span className="primary">카드</span>를 뽑으세요.</span></div>
            <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" />
            <div ref={actionBarRef} className="task-manager" data-tts-text="작업관리. 버튼 세 개,">
                <Button className="w371h120" navigate="ScreenCardInsert" label="가상취소" />
                <Button className="w371h120" navigate="ScreenOrderComplete" label="가상제거" />
            </div>

        </>
    );
});

ScreenCardRemoval.displayName = 'ScreenCardRemoval';
export default ScreenCardRemoval;
