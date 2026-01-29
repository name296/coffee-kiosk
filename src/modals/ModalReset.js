import React, { memo, useContext } from "react";
import { BaseModal } from "./Modal";
import { ModalContext, OrderContext } from "../contexts";

export const ModalReset = memo(() => {
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

ModalReset.displayName = 'ModalReset';
export default ModalReset;
