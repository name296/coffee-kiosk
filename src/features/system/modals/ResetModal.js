import React, { memo, useContext } from "react";
import { BaseModal } from "@shared/ui";
import { ModalContext, OrderContext } from "@shared/contexts";

export const ResetModal = memo(() => {
    const modal = useContext(ModalContext);
    const order = useContext(OrderContext);

    return (
        <BaseModal
            isOpen={modal.ModalReset.isOpen}
            type="reset"
            onCancel={() => modal.ModalReset.close()}
            onConfirm={() => {
                modal.ModalReset.close();
                order?.setQuantities?.({});
            }}
        />
    );
});

ResetModal.displayName = 'ResetModal';
export default ResetModal;
