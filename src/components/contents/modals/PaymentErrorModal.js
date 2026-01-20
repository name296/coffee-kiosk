import React, { memo, useContext } from "react";
import { BaseModal } from "../../ui/Modal";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";

export const PaymentErrorModal = memo(({ onConfirm }) => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalPaymentError.isOpen}
            type="paymentError"
            onCancel={() => { }} // 취소 없음
            onConfirm={() => {
                accessibility.ModalPaymentError.close();
                onConfirm?.();
            }}
        />
    );
});

PaymentErrorModal.displayName = 'PaymentErrorModal';
export default PaymentErrorModal;
