import React, { createContext, useState, useMemo, useCallback } from "react";

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState({
        restart: false,
        accessibility: false,
        reset: false,
        delete: false,
        deleteCheck: false,
        call: false,
        timeout: false,
        paymentError: false
    });
    const [deleteItemId, setDeleteItemId] = useState(null);

    const createModalHandlers = useCallback((key) => ({
        open: () => setModals(p => ({ ...p, [key]: true })),
        close: () => setModals(p => ({ ...p, [key]: false })),
        isOpen: modals[key] ?? false
    }), [modals]);

    const isAnyOpen = useMemo(() => Object.values(modals).some(Boolean), [modals]);

    const value = useMemo(() => ({
        isAnyOpen,
        ModalRestart: createModalHandlers('restart'),
        ModalAccessibility: createModalHandlers('accessibility'),
        ModalReset: createModalHandlers('reset'),
        ModalDelete: createModalHandlers('delete'),
        ModalDeleteCheck: createModalHandlers('deleteCheck'),
        ModalCall: createModalHandlers('call'),
        ModalTimeout: createModalHandlers('timeout'),
        ModalPaymentError: createModalHandlers('paymentError'),
        ModalDeleteItemId: deleteItemId,
        setModalDeleteItemId: setDeleteItemId
    }), [isAnyOpen, createModalHandlers, deleteItemId, modals]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
