import React, { memo, useContext } from "react";
import { Button } from "../components";
import Icon from "../Icon";
import { TTS } from "../constants";
import { RefContext, ModalContext, MODAL_REGISTRY } from "../contexts";
import { useFocusTrap } from "../hooks";
import MODAL_CONFIG from "./ModalConfig";
import ModalRestart from "./ModalRestart";
import ModalReset from "./ModalReset";
import { ModalDelete, ModalDeleteCheck } from "./ModalDelete";
import ModalCall from "./ModalCall";
import ModalTimeout from "./ModalTimeout";
import ModalPaymentError from "./ModalPaymentError";
import ModalAccessibility from "./ModalAccessibility";

const MODAL_COMPONENT_BY_KEY = {
    restart: ModalRestart,
    accessibility: ModalAccessibility,
    reset: ModalReset,
    delete: ModalDelete,
    deleteCheck: ModalDeleteCheck,
    call: ModalCall,
    timeout: ModalTimeout,
    paymentError: ModalPaymentError
};

// ============================================================================
// BaseModal – 공통 모달 프레임 (타입/커스텀에 따라 업·다운 콘텐츠 렌더)
// ============================================================================
export const BaseModal = memo(({ isOpen, type, onCancel, onConfirm, cancelLabel, cancelIcon, confirmIcon, confirmLabel, customContent, customTts, icon: customIcon, title: customTitle, countdown }) => {
    const refsData = useContext(RefContext);
    const { containerRef } = useFocusTrap(isOpen);

    const config = MODAL_CONFIG[type];
    if (!isOpen || (!config && !customContent)) return null;

    const finalIcon = customIcon || config?.icon;
    const finalTitle = customTitle || config?.title;
    const finalTts = customTts || config?.tts;
    const finalCancelLabel = cancelLabel !== undefined ? cancelLabel : (config?.cancelLabel ?? "취소");
    const finalCancelIcon = cancelIcon || config?.cancelIcon || "Cancel";
    const finalConfirmIcon = confirmIcon || finalIcon || config?.confirmIcon || "Ok";
    const finalConfirmLabel = confirmLabel || finalTitle || config?.confirmLabel || "확인";

    return (
        <div
            className="main"
            ref={containerRef}
            data-tts-text={finalTts ? (finalTts + TTS.replay) : ''}
            tabIndex={-1}
        >
            <div className="up-content">
                {finalIcon && <Icon name={finalIcon} className="modal-image" />}
                {finalTitle && <div className="modal-title">{finalTitle}</div>}
            </div>
            <div className="down-content">
                {customContent || (
                    <>
                        <div className="modal-message">{typeof config.message === 'function' ? config.message(countdown) : config.message}</div>
                        <div data-tts-text="작업관리," ref={refsData.refs.BaseModal.modalConfirmButtonsRef} className="task-manager">
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
    if (!modal) return null;

    return (
        <div className={`modal ${modal.isAnyOpen ? 'active' : ''}`} aria-hidden={!modal.isAnyOpen} tabIndex={-1}>
            {MODAL_REGISTRY.map(({ key }) => {
                const Component = MODAL_COMPONENT_BY_KEY[key];
                return modal.modalStates?.[key] && Component ? <Component key={key} /> : null;
            })}
        </div>
    );
};
