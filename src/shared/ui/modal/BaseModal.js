import React, { memo, useContext, useLayoutEffect } from "react";
import Button from "../Button";
import Icon from "../../../Icon";
import Highlight, { H } from "../Highlight";
import { TTS } from "../../constants";
import { RefContext, ScreenRouteContext } from "../../contexts";
import { useFocusTrap, useDOM } from "../../hooks";
import MODAL_CONFIG from "./ModalConfig";

// 공통 모달 베이스 (프레임)
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

    const { currentPage } = useContext(ScreenRouteContext);
    useLayoutEffect(() => {
        if (isOpen) {
            focusModalContent();
        } else {
            if (currentPage === 'ScreenStart') {
                requestAnimationFrame(() => focusMain());
            }
        }
    }, [isOpen, currentPage, focusModalContent, focusMain]);

    return (
        <div className="main modal" ref={containerRef} data-tts-text={finalTts ? (finalTts + TTS.replay) : ''} tabIndex={-1}>
            <div className="up-content">
                {finalIcon && <Icon name={finalIcon} className="modal-image" />}
                {finalTitle && <div className="modal-title">{finalTitle}</div>}
            </div>
            <div className="down-content">
                {customContent || (
                    <>
                        <div className="modal-message">{config.message(H, countdown)}</div>
                        <div data-tts-text={finalCancelLabel ? "작업관리, 버튼 두 개," : "작업관리, 버튼 한 개,"} ref={refsData.refs.BaseModal.modalConfirmButtonsRef} className="task-manager">
                            {finalCancelLabel && (
                                <Button className="w285h090" svg={<Icon name={finalCancelIcon} />} label={finalCancelLabel} onClick={onCancel} />
                            )}
                            <Button
                                className={`w285h090 ${config.confirmButtonStyle === 'delete' ? 'delete-item' : ''}`}
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
BaseModal.displayName = 'BaseModal';
