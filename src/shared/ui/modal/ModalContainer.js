import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import {
    RestartModal,
    ResetModal,
    DeleteModal,
    DeleteCheckModal,
    CallModal,
    TimeoutModal
} from "../../../features/system/modals";
import { PaymentErrorModal } from "../../../features/payment/modals";
import { AccessibilityModal } from "../../../features/accessibility/modals";

// 모달 컨테이너 (전역 프레임 주입부)
export const ModalContainer = () => {
    const modal = useContext(ModalContext);

    if (!modal) return null;

    const isAnyModalOpen = [
        modal.ModalRestart.isOpen,
        modal.ModalAccessibility.isOpen,
        modal.ModalReset.isOpen,
        modal.ModalDelete.isOpen,
        modal.ModalDeleteCheck.isOpen,
        modal.ModalCall.isOpen,
        modal.ModalTimeout.isOpen,
        modal.ModalPaymentError.isOpen
    ].some(Boolean);

    return (
        <div className={`modal-overlay ${isAnyModalOpen ? 'active' : ''}`} aria-hidden="true">
            {modal.ModalRestart.isOpen && <RestartModal />}
            {modal.ModalReset.isOpen && <ResetModal />}
            {modal.ModalCall.isOpen && <CallModal />}
            {modal.ModalAccessibility.isOpen && <AccessibilityModal />}
            {modal.ModalDelete.isOpen && <DeleteModal />}
            {modal.ModalDeleteCheck.isOpen && <DeleteCheckModal />}
            {modal.ModalTimeout.isOpen && <TimeoutModal />}
            {modal.ModalPaymentError.isOpen && <PaymentErrorModal />}
        </div>
    );
};
