import React, { memo, useContext } from "react";
import { BaseModal } from "../../ui/Modal";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { OrderContext } from "../../../contexts/OrderContext";

export const ResetModal = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);

    return (
        <BaseModal
            isOpen={accessibility.ModalReset.isOpen}
            type="reset"
            onCancel={() => accessibility.ModalReset.close()}
            onConfirm={() => {
                accessibility.ModalReset.close();
                order?.setQuantities?.({});
            }}
        />
    );
});

ResetModal.displayName = 'ResetModal';
export default ResetModal;
