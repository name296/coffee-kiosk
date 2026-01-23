import React, { memo, useContext } from "react";
import { BaseModal } from "@shared/ui";
import { ModalContext } from "@shared/contexts";

export const PaymentErrorModal = memo(({ onConfirm }) => {
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

PaymentErrorModal.displayName = 'PaymentErrorModal';
export default PaymentErrorModal;
