import React, { memo, useContext } from "react";
import { BaseModal } from "../../ui/Modal";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

export const RestartModal = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    return (
        <BaseModal
            isOpen={accessibility.ModalRestart.isOpen}
            type="restart"
            onCancel={() => accessibility.ModalRestart.close()}
            onConfirm={() => { accessibility.ModalRestart.close(); navigateTo('ScreenStart'); }}
        />
    );
});

RestartModal.displayName = 'RestartModal';
export default RestartModal;
