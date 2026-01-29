import React, { memo, useContext } from "react";
import { BaseModal } from "./Modal";
import { ModalContext } from "../contexts";

export const ModalPaymentError = memo(({ onConfirm }) => {
    const modal = useContext(ModalContext);
    return (
        <BaseModal
            isOpen={modal.ModalPaymentError.isOpen}
            type="paymentError"
            onCancel={() => { }} // 취소 없음
            onConfirm={() => {
                modal.ModalPaymentError.close();
                onConfirm?.();
            }}
        />
    );
});

ModalPaymentError.displayName = 'ModalPaymentError';
export default ModalPaymentError;
