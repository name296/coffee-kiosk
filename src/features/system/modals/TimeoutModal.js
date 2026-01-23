import React, { memo, useContext } from "react";
import { BaseModal } from "@shared/ui";
import { ModalContext, TimeoutContext, ScreenRouteContext } from "@shared/contexts";

export const TimeoutModal = memo(({ onExtend }) => {
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    return (
        <BaseModal
            isOpen={modal.ModalTimeout.isOpen}
            type="timeout"
            countdown={timeout?.globalRemainingTime}
            onCancel={() => { modal.ModalTimeout.close(); navigateTo('ScreenStart'); }}
            onConfirm={() => { modal.ModalTimeout.close(); onExtend?.(); }}
        />
    );
});

TimeoutModal.displayName = 'TimeoutModal';
export default TimeoutModal;
