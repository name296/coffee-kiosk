import React, { memo, useContext } from "react";
import { BaseModal } from "../../ui/Modal";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";

export const CallModal = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalCall.isOpen}
            type="call"
            onCancel={() => accessibility.ModalCall.close()}
            onConfirm={() => accessibility.ModalCall.close()}
        />
    );
});

CallModal.displayName = 'CallModal';
export default CallModal;
