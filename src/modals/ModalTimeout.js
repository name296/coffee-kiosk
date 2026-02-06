import React, { memo, useContext } from "react";
import { BaseModal } from "./Modal";
import { ModalContext, TimeoutContext, ScreenRouteContext } from "../contexts";

export const ModalTimeout = memo(() => {
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    return (
        <BaseModal
            isOpen={modal.ModalTimeout.isOpen}
            type="timeout"
            countdown={timeout?.globalRemainingTime}
            onCancel={() => { modal.ModalTimeout.close(); navigateTo('ProcessStart'); }}
            onConfirm={() => { modal.ModalTimeout.close(); timeout?.resetIdleTimeout?.(); }}
        />
    );
});

ModalTimeout.displayName = 'ModalTimeout';
export default ModalTimeout;
