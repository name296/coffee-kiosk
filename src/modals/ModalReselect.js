import React, { memo, useContext } from "react";
import { BaseModal } from "./Modal";
import { ModalContext, OrderContext } from "../contexts";

export const ModalReselect = memo(() => {
    const modal = useContext(ModalContext);
    const order = useContext(OrderContext);

    return (
        <BaseModal
            isOpen={modal.ModalReselect.isOpen}
            type="reselect"
            onCancel={() => modal.ModalReselect.close()}
            onConfirm={() => {
                modal.ModalReselect.close();
                order?.setQuantities?.({});
            }}
        />
    );
});

ModalReselect.displayName = 'ModalReselect';
export default ModalReselect;
