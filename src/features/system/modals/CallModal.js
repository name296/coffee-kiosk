import React, { memo, useContext } from "react";
import { BaseModal } from "@shared/ui";
import { ModalContext } from "@shared/contexts";

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
