import React, { memo, useContext, useLayoutEffect } from "react";
import { Button } from "../components";
import Icon from "../Icon";
import { TTS } from "../constants";
import { RefContext, ScreenRouteContext, ModalContext } from "../contexts";
import { useFocusTrap, useDOM } from "../hooks";
import MODAL_CONFIG from "./ModalConfig";
import ModalRestart from "./ModalRestart";
import ModalReset from "./ModalReset";
import { ModalDelete, ModalDeleteCheck } from "./ModalDelete";
import ModalCall from "./ModalCall";
import ModalTimeout from "./ModalTimeout";
import ModalPaymentError from "./ModalPaymentError";
import ModalAccessibility from "./ModalAccessibility";

// ============================================================================
// BaseModal – 공통 모달 프레임 (타입/커스텀에 따라 업·다운 콘텐츠 렌더)
// ============================================================================
export const BaseModal = memo(({ isOpen, type, onCancel, onConfirm, cancelLabel, cancelIcon, confirmIcon, confirmLabel, customContent, customTts, icon: customIcon, title: customTitle, countdown }) => {
    const refsData = useContext(RefContext);
    const { containerRef } = useFocusTrap(isOpen);
    const { focusModalContent, focusMain } = useDOM();

    const config = MODAL_CONFIG[type];
    if (!isOpen || (!config && !customContent)) return null;

    const finalIcon = customIcon || config?.icon;
    const finalTitle = customTitle || config?.title;
    const finalTts = customTts || config?.tts;
    const finalCancelLabel = cancelLabel !== undefined ? cancelLabel : (config?.cancelLabel ?? "취소");
    const finalCancelIcon = cancelIcon || config?.cancelIcon || "Cancel";
    const finalConfirmIcon = confirmIcon || finalIcon || config?.confirmIcon || "Ok";
    const finalConfirmLabel = confirmLabel || finalTitle || config?.confirmLabel || "확인";

    const { currentProcess } = useContext(ScreenRouteContext);
    useLayoutEffect(() => {
        if (isOpen) {
            focusModalContent();
        } else {
            if (currentProcess === 'ProcessStart') {
                requestAnimationFrame(() => focusMain());
            }
        }
    }, [isOpen, currentProcess, focusModalContent, focusMain]);

    return (
        <div className="main" ref={containerRef} data-tts-text={finalTts ? (finalTts + TTS.replay) : ''}>
            <div className="up-content">
                {finalIcon && <Icon name={finalIcon} className="modal-image" />}
                {finalTitle && <div className="modal-title">{finalTitle}</div>}
            </div>
            <div className="down-content">
                {customContent || (
                    <>
                        <div className="modal-message">{typeof config.message === 'function' ? config.message(countdown) : config.message}</div>
                        <div data-tts-text={finalCancelLabel ? "작업관리, 버튼 두 개," : "작업관리, 버튼 한 개,"} ref={refsData.refs.BaseModal.modalConfirmButtonsRef} className="task-manager">
                            {finalCancelLabel && (
                                <Button svg={<Icon name={finalCancelIcon} />} label={finalCancelLabel} onClick={onCancel} />
                            )}
                            <Button
                                className={config.confirmButtonStyle === 'delete' ? 'delete-item' : ''}
                                svg={<Icon name={finalConfirmIcon} />}
                                label={finalConfirmLabel}
                                onClick={onConfirm}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});
BaseModal.displayName = "BaseModal";

// ============================================================================
// Modal – 전역 모달 프레임 (여러 모달 인스턴스 렌더)
// ============================================================================
export const Modal = () => {
    const modal = useContext(ModalContext);

    const isAnyModalOpen = modal ? [
        modal.ModalRestart.isOpen,
        modal.ModalAccessibility.isOpen,
        modal.ModalReset.isOpen,
        modal.ModalDelete.isOpen,
        modal.ModalDeleteCheck.isOpen,
        modal.ModalCall.isOpen,
        modal.ModalTimeout.isOpen,
        modal.ModalPaymentError.isOpen
    ].some(Boolean) : false;

    if (!modal) return null;

    return (
        <div className={`modal ${isAnyModalOpen ? 'active' : ''}`} aria-hidden="true" tabIndex={-1}>
            {modal.ModalRestart.isOpen && <ModalRestart />}
            {modal.ModalReset.isOpen && <ModalReset />}
            {modal.ModalCall.isOpen && <ModalCall />}
            {modal.ModalAccessibility.isOpen && <ModalAccessibility />}
            {modal.ModalDelete.isOpen && <ModalDelete />}
            {modal.ModalDeleteCheck.isOpen && <ModalDeleteCheck />}
            {modal.ModalTimeout.isOpen && <ModalTimeout />}
            {modal.ModalPaymentError.isOpen && <ModalPaymentError />}
        </div>
    );
};
