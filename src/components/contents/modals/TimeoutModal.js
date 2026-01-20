import React, { memo, useContext } from "react";
import { BaseModal } from "../../ui/Modal";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

export const TimeoutModal = memo(({ onExtend }) => {
    const accessibility = useContext(AccessibilityContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    return (
        <BaseModal
            isOpen={accessibility.ModalTimeout.isOpen}
            type="timeout"
            countdown={accessibility.globalRemainingTime}
            onCancel={() => { accessibility.ModalTimeout.close(); navigateTo('ScreenStart'); }}
            onConfirm={() => { accessibility.ModalTimeout.close(); onExtend?.(); }}
        />
    );
});

TimeoutModal.displayName = 'TimeoutModal';
export default TimeoutModal;
