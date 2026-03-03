import React, { createContext, useState, useMemo, useCallback } from "react";

export const ModalContext = createContext();

export const MODAL_REGISTRY = Object.freeze([
    { key: "restart", contextName: "ModalRestart" },
    { key: "accessibility", contextName: "ModalAccessibility" },
    { key: "reset", contextName: "ModalReset" },
    { key: "delete", contextName: "ModalDelete" },
    { key: "deleteCheck", contextName: "ModalDeleteCheck" },
    { key: "call", contextName: "ModalCall" },
    { key: "timeout", contextName: "ModalTimeout" },
    { key: "paymentError", contextName: "ModalPaymentError" }
]);

const createInitialModalState = () =>
    MODAL_REGISTRY.reduce((acc, { key }) => {
        acc[key] = false;
        return acc;
    }, {});

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState(createInitialModalState);
    const [deleteItemId, setDeleteItemId] = useState(null);

    const openModal = useCallback((key) => {
        setModals((prev) => {
            if (!Object.prototype.hasOwnProperty.call(prev, key) || prev[key]) {
                return prev;
            }
            return { ...prev, [key]: true };
        });
    }, []);

    const closeModal = useCallback((key) => {
        setModals((prev) => {
            if (!Object.prototype.hasOwnProperty.call(prev, key) || !prev[key]) {
                return prev;
            }
            return { ...prev, [key]: false };
        });
    }, []);

    const closeAllModals = useCallback(() => {
        setModals((prev) => {
            const hasOpen = Object.values(prev).some(Boolean);
            if (!hasOpen) return prev;
            return Object.keys(prev).reduce((acc, key) => {
                acc[key] = false;
                return acc;
            }, {});
        });
    }, []);

    const modalHandlers = useMemo(
        () =>
            MODAL_REGISTRY.reduce((acc, { key, contextName }) => {
                acc[contextName] = {
                    open: () => openModal(key),
                    close: () => closeModal(key),
                    isOpen: modals[key] ?? false
                };
                return acc;
            }, {}),
        [closeModal, modals, openModal]
    );

    const isAnyOpen = useMemo(() => Object.values(modals).some(Boolean), [modals]);

    const value = useMemo(() => ({
        isAnyOpen,
        ...modalHandlers,
        modalStates: modals,
        openModal,
        closeModal,
        closeAllModals,
        ModalDeleteItemId: deleteItemId,
        setModalDeleteItemId: setDeleteItemId
    }), [isAnyOpen, modalHandlers, modals, openModal, closeModal, closeAllModals, deleteItemId]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
