import React, { createContext, useCallback, useMemo, useState } from "react";

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
    const [deleteItemId, setDeleteItemId] = useState(0);
    const [modalButtonInfo, setModalButtonInfo] = useState({});

    const createModalHandlers = useCallback((key) => ({
        isOpen: modals[key],
        open: (buttonLabel, buttonIcon) => {
            if (buttonLabel || buttonIcon) {
                setModalButtonInfo(p => ({ ...p, [key]: { label: buttonLabel, icon: buttonIcon } }));
            }
            setModals(p => ({ ...p, [key]: true }));
        },
        close: () => setModals(p => ({ ...p, [key]: false })),
        toggle: () => setModals(p => ({ ...p, [key]: !p[key] })),
        buttonLabel: modalButtonInfo[key]?.label,
        buttonIcon: modalButtonInfo[key]?.icon
    }), [modals, modalButtonInfo]);

    const modalHandlers = useMemo(() => ({
        ModalRestart: createModalHandlers('restart'),
        ModalAccessibility: createModalHandlers('accessibility'),
        ModalReset: createModalHandlers('reset'),
        ModalDelete: createModalHandlers('delete'),
        ModalDeleteCheck: createModalHandlers('deleteCheck'),
        ModalCall: createModalHandlers('call'),
        ModalTimeout: createModalHandlers('timeout'),
        ModalPaymentError: createModalHandlers('paymentError'),
    }), [createModalHandlers]);

    const value = useMemo(() => ({
        ...modalHandlers,
        ModalDeleteItemId: deleteItemId,
        setModalDeleteItemId: setDeleteItemId,
    }), [modalHandlers, deleteItemId]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
