import React, { memo, useContext } from "react";
import { BaseModal } from "../../ui/Modal";
import { ModalContext } from "../../../contexts/ModalContext";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";

export const RestartModal = memo(() => {
    const modal = useContext(ModalContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    return (
        <BaseModal
            isOpen={modal.ModalRestart.isOpen}
            type="restart"
            onCancel={() => modal.ModalRestart.close()}
            onConfirm={() => { modal.ModalRestart.close(); navigateTo('ScreenStart'); }}
        />
    );
});

RestartModal.displayName = 'RestartModal';
export default RestartModal;
