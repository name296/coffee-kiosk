import React, { memo, useContext } from "react";
import { BaseModal } from "./Modal";
import { ModalContext } from "../contexts";

export const ModalCall = memo(() => {
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

ModalCall.displayName = 'ModalCall';
export default ModalCall;
