import React, { memo, useContext } from "react";
import { BaseModal } from "./Modal";
import { ModalContext } from "../contexts";

export const ModalPaymentError = memo(() => {
    const modal = useContext(ModalContext);
    return (
        <BaseModal
            isOpen={modal.ModalPaymentError.isOpen}
            type="paymentError"
            onCancel={() => { }}
            onConfirm={() => modal.ModalPaymentError.close()}
        />
    );
});

ModalPaymentError.displayName = 'ModalPaymentError';
export default ModalPaymentError;
