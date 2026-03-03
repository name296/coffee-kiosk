import React, { memo, useContext } from "react";
import { BaseModal } from "./Modal";
import { PROCESS_NAME } from "../constants";
import { ModalContext, ScreenRouteContext } from "../contexts";

export const ModalRestart = memo(() => {
    const modal = useContext(ModalContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    return (
        <BaseModal
            isOpen={modal.ModalRestart.isOpen}
            type="restart"
            onCancel={() => modal.ModalRestart.close()}
            onConfirm={() => { modal.ModalRestart.close(); navigateTo(PROCESS_NAME.START); }}
        />
    );
});

ModalRestart.displayName = 'ModalRestart';
export default ModalRestart;
