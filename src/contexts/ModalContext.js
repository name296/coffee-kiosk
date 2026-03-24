import React, { createContext, useState, useMemo, useCallback, useRef } from "react";

export const ModalContext = createContext();

export const MODAL_REGISTRY = Object.freeze([
    { key: "restart", contextName: "ModalRestart" },
    { key: "accessibility", contextName: "ModalAccessibility" },
    { key: "reselect", contextName: "ModalReselect" },
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

/** 모달이 뜨기 직전 포커스(자동 모달·연장 등에서 복귀용). body·모달 안은 제외 */
const snapshotFocusBeforeModal = () => {
    if (typeof document === "undefined") return null;
    const ae = document.activeElement;
    if (!(ae instanceof HTMLElement) || !ae.isConnected || ae === document.body) return null;
    if (ae.closest?.(".modal")) return null;
    return ae;
};

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState(createInitialModalState);
    const [openOrder, setOpenOrder] = useState([]);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const modalOpenersRef = useRef({});
    /** 모달 열릴 때의 document.activeElement (타임아웃 연장 등) */
    const modalLastFocusRef = useRef({});
    const pendingReturnFocusRef = useRef(null);

    const openModal = useCallback((key, openerElement = null) => {
        setModals((prev) => {
            if (!Object.prototype.hasOwnProperty.call(prev, key) || prev[key]) {
                return prev;
            }
            modalOpenersRef.current[key] = openerElement ?? null;
            modalLastFocusRef.current[key] = snapshotFocusBeforeModal();
            return { ...prev, [key]: true };
        });
        setOpenOrder((prev) => prev.includes(key) ? prev : [...prev.filter((k) => k !== key), key]);
    }, []);

    const closeModal = useCallback((key, options = {}) => {
        const returnToOpener = Boolean(options.returnToOpener);
        const returnToLastFocus = Boolean(options.returnToLastFocus);
        /* React 18 Strict Mode는 이 업데이터를 연속 두 번 호출할 수 있음. 첫 호출에서 ref를 지우면
           둘째 호출에서 opener가 사라져 pending이 null이 됨 → 포커스가 항상 .main으로 감. */
        const capture = { opener: null, lastFocus: null, taken: false };
        setModals((prev) => {
            if (!Object.prototype.hasOwnProperty.call(prev, key) || !prev[key]) {
                return prev;
            }
            if (!capture.taken) {
                capture.opener = modalOpenersRef.current[key] ?? null;
                capture.lastFocus = modalLastFocusRef.current[key] ?? null;
                capture.taken = true;
                delete modalOpenersRef.current[key];
                delete modalLastFocusRef.current[key];
            }
            const next = { ...prev, [key]: false };
            const anyLeft = Object.values(next).some(Boolean);
            if (!anyLeft) {
                if (returnToLastFocus) {
                    pendingReturnFocusRef.current = capture.lastFocus || capture.opener;
                } else if (returnToOpener) {
                    pendingReturnFocusRef.current = capture.opener;
                } else {
                    pendingReturnFocusRef.current = null;
                }
            }
            return next;
        });
        setOpenOrder((prev) => prev.filter((k) => k !== key));
    }, []);

    const closeAllModals = useCallback(() => {
        pendingReturnFocusRef.current = null;
        modalOpenersRef.current = {};
        modalLastFocusRef.current = {};
        setModals((prev) => {
            const hasOpen = Object.values(prev).some(Boolean);
            if (!hasOpen) return prev;
            return Object.keys(prev).reduce((acc, k) => {
                acc[k] = false;
                return acc;
            }, {});
        });
        setOpenOrder([]);
    }, []);

    const modalHandlers = useMemo(
        () =>
            MODAL_REGISTRY.reduce((acc, { key, contextName }) => {
                acc[contextName] = {
                    open: (opener) => openModal(key, opener),
                    close: (opts) => closeModal(key, opts),
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
        openOrder,
        openModal,
        closeModal,
        closeAllModals,
        ModalDeleteItemId: deleteItemId,
        setModalDeleteItemId: setDeleteItemId,
        pendingReturnFocusRef
    }), [isAnyOpen, modalHandlers, modals, openOrder, openModal, closeModal, closeAllModals, deleteItemId]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};
