import React from "react";
import { ModalContext, MODAL_REGISTRY } from "../contexts";
import ModalRestart from "./ModalRestart";
import ModalReselect from "./ModalReselect";
import { ModalDelete, ModalDeleteCheck } from "./ModalDelete";
import ModalCall from "./ModalCall";
import ModalTimeout from "./ModalTimeout";
import ModalPaymentError from "./ModalPaymentError";
import ModalAccessibility from "./ModalAccessibility";

const MODAL_COMPONENT_BY_KEY = {
    restart: ModalRestart,
    accessibility: ModalAccessibility,
    reselect: ModalReselect,
    delete: ModalDelete,
    deleteCheck: ModalDeleteCheck,
    call: ModalCall,
    timeout: ModalTimeout,
    paymentError: ModalPaymentError
};

/** 열린 모달 키에 따라 해당 Modal* 만 렌더 (Process 라우팅과 동일 개념) */
export const Modal = () => {
    const modal = React.useContext(ModalContext);
    if (!modal) return null;

    const orderedKeys = modal.openOrder?.length
        ? modal.openOrder.filter((key) => modal.modalStates?.[key])
        : MODAL_REGISTRY.map(({ key }) => key).filter((key) => modal.modalStates?.[key]);

    if (!modal.isAnyOpen) return null;

    return (
        <>
            {orderedKeys.map((key) => {
                const Component = MODAL_COMPONENT_BY_KEY[key];
                return Component ? <Component key={key} /> : null;
            })}
        </>
    );
};
