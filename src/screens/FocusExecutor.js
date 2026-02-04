import React, { useContext, useLayoutEffect } from "react";
import { ModalContext, ScreenRouteContext } from "../contexts";

const getIsAnyModalOpen = (modal) => {
    if (!modal) return false;
    return [
        modal.ModalRestart.isOpen,
        modal.ModalAccessibility.isOpen,
        modal.ModalReset.isOpen,
        modal.ModalDelete.isOpen,
        modal.ModalDeleteCheck.isOpen,
        modal.ModalCall.isOpen,
        modal.ModalTimeout.isOpen,
        modal.ModalPaymentError.isOpen
    ].some(Boolean);
};

const focusWithRefire = (el) => {
    if (!el) return;
    if (document.activeElement === el && el.blur) {
        el.blur();
    }
    requestAnimationFrame(() => {
        el.focus();
    });
};

export const FocusExecutor = () => {
    const modal = useContext(ModalContext);
    const { currentProcess, transitionCount } = useContext(ScreenRouteContext);
    const isAnyModalOpen = getIsAnyModalOpen(modal);

    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        if (isAnyModalOpen) {
            focusWithRefire(document.querySelector('.modal .main'));
            return;
        }
        focusWithRefire(document.querySelector('.process .main'));
    }, [isAnyModalOpen, currentProcess, transitionCount]);

    return null;
};
