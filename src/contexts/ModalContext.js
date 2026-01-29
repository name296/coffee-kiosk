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
    const [modalButtonInfo, setModalButtonInfo] = useState({});
    const [deleteItemId, setDeleteItemId] = useState(null);

    const createModalHandlers = useCallback((key) => ({
        open: (buttonLabel, buttonIcon) => {
            if (buttonLabel || buttonIcon) {
                setModalButtonInfo(p => ({ ...p, [key]: { label: buttonLabel, icon: buttonIcon } }));
            }
            setModals(p => ({ ...p, [key]: true }));
        },
        close: () => setModals(p => ({ ...p, [key]: false })),
        toggle: () => setModals(p => ({ ...p, [key]: !p[key] })),
        isOpen: modals[key] ?? false
    }), [modals]);

    const value = useMemo(() => ({
        ModalRestart: createModalHandlers('restart'),
        ModalAccessibility: createModalHandlers('accessibility'),
        ModalReset: createModalHandlers('reset'),
        ModalDelete: createModalHandlers('delete'),
        ModalDeleteCheck: createModalHandlers('deleteCheck'),
        ModalCall: createModalHandlers('call'),
        ModalTimeout: createModalHandlers('timeout'),
        ModalPaymentError: createModalHandlers('paymentError'),
        ModalDeleteItemId: deleteItemId,
        setModalDeleteItemId: setDeleteItemId,
        ModalButtonInfo: modalButtonInfo
    }), [createModalHandlers, deleteItemId, modalButtonInfo]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
