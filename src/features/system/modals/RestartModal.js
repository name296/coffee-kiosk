import React, { memo, useContext } from "react";
import { BaseModal } from "@shared/ui";
import { ModalContext, ScreenRouteContext } from "@shared/contexts";

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
