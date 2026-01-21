import React, { memo, useContext } from "react";
import { BaseModal } from "../../ui/Modal";
import { ModalContext } from "../../../contexts/ModalContext";

export const CallModal = memo(() => {
    const modal = useContext(ModalContext);
    return (
        <BaseModal
            isOpen={modal.ModalCall.isOpen}
            type="call"
            onCancel={() => modal.ModalCall.close()}
            onConfirm={() => modal.ModalCall.close()}
        />
    );
});

CallModal.displayName = 'CallModal';
export default CallModal;
