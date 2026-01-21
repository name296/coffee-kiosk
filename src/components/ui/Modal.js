import React, { memo, useContext, useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import Button from "./Button";
import Icon from "../../Icon";
import Highlight, { H } from "./Highlight";
import { TTS } from "../../constants/constants";
import { RefContext } from "../../contexts/RefContext";
import { AccessibilityContext } from "../../contexts/AccessibilityContext";
import { ModalContext } from "../../contexts/ModalContext";
import { OrderContext } from "../../contexts/OrderContext";
import { ScreenRouteContext } from "../../contexts/ScreenRouteContext";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useAccessibilitySettings } from "../../hooks/useAccessibilitySettings";
import { useDOM } from "../../hooks/useDOM";

const MODAL_CONFIG = {
    deleteCheck: {
        tts: "알림, 내역이 없으면 메뉴선택으로 돌아갑니다, 계속 진행하시려면 확인 버튼을 누릅니다, ",
        icon: "GraphicWarning",
        title: "확인",
        cancelIcon: "Cancel",
        cancelLabel: "취소",
        confirmIcon: "Ok",
        confirmLabel: "확인",
        message: (H) => <><p>내역이 없으면 <H>메뉴선택</H>으로 돌아갑니다</p><p>계속 진행하시려면 <H>확인</H> 버튼을 누르세요</p></>,
    },
    delete: {
        tts: "알림, 상품삭제, 주문 상품을 삭제합니다, 계속 진행하시려면 삭제 버튼을 누릅니다, ",
        icon: "GraphicTrash",
        title: "삭제",
        cancelIcon: "Cancel",
        cancelLabel: "취소",
        confirmIcon: "Delete",
        confirmLabel: "삭제",
        message: (H) => <><p>주문 상품을 <H>삭제</H>합니다</p><p>계속 진행하시려면 <H>삭제</H> 버튼을 누릅니다</p></>,
    },
    reset: {
        tts: "알림, 초기화, 주문 내역을 초기화합니다, 계속 진행하시려면 초기화 버튼을 누릅니다, ",
        icon: "GraphicReset",
        title: "초기화",
        cancelIcon: "Cancel",
        cancelLabel: "취소",
        confirmIcon: "Reset",
        confirmLabel: "초기화",
        message: (H) => <><p>주문 내역을 <H>초기화</H>합니다</p><p>계속 진행하시려면 <H>초기화</H> 버튼을 누릅니다</p></>,
    },
    restart: {
        tts: "알림, 시작화면, 시작화면으로 이동합니다, 계속 진행하시려면 시작화면 버튼을 누릅니다,",
        icon: "GraphicHome",
        title: "시작화면",
        cancelIcon: "Cancel",
        cancelLabel: "취소",
        confirmIcon: "Ok",
        confirmLabel: "시작화면",
        message: (H) => <><p><H>시작화면</H>으로 이동합니다</p><p>계속 진행하시려면 <H>시작화면</H> 버튼을 누릅니다</p></>,
    },
    call: {
        tts: "알림, 직원 호출, 직원을 호출합니다, 계속 진행하시려면 호출 버튼을 누릅니다,",
        icon: "GraphicCall",
        title: "직원 호출",
        cancelIcon: "Cancel",
        cancelLabel: "취소",
        confirmIcon: "Call",
        confirmLabel: "호출",
        message: (H) => <><p>직원을 <H>호출</H>합니다</p><p>계속 진행하시려면 <H>호출</H> 버튼을 누릅니다</p></>,
    },
    timeout: {
        tts: "알림, 시간연장, 사용시간이 20초 남았습니다, 계속 사용하시려면 연장 버튼을 누릅니다, ",
        icon: "Extention",
        title: "시간연장",
        cancelIcon: "Home",
        cancelLabel: "시작화면",
        confirmIcon: "Extention",
        confirmLabel: "연장",
        message: (H, countdown) => <><p>사용시간이 <H>{countdown !== undefined ? `${Math.ceil(countdown / 1000)}초` : '20초'}</H> 남았습니다</p><p>계속 사용하시려면 <H>연장</H> 버튼을 누릅니다</p></>,
    },
    paymentError: {
        tts: "알림, 결제 경고, 카드가 잘못 삽입되었습니다, 카드를 제거하시고 다시결제 버튼을 누릅니다, ",
        icon: "GraphicWarning",
        title: "결제 경고",
        cancelIcon: null,
        cancelLabel: null,
        confirmIcon: "Warning",
        confirmLabel: "다시결제",
        confirmButtonStyle: "delete",
        message: (H) => <><p>카드가 <H>잘못 삽입</H>되었습니다</p><p>카드를 제거하시고</p><p><H>다시결제</H> 버튼을 누릅니다</p></>,
    },
    accessibility: {
        tts: "알림, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다, ",
        icon: "Wheelchair",
        title: "접근성",
        cancelIcon: "Cancel",
        cancelLabel: "적용안함",
        confirmIcon: "Ok",
        confirmLabel: "적용하기",
        message: (H) => <><p>원하시는 <H>접근성 옵션</H>을 선택하시고</p><p><H>적용하기</H> 버튼을 누르세요</p></>,
    },
};

// Content Modals
import RestartModal from "../contents/modals/RestartModal";
import ResetModal from "../contents/modals/ResetModal";
import { DeleteModal, DeleteCheckModal } from "../contents/modals/DeleteModal"; // This has two exports
import CallModal from "../contents/modals/CallModal";
import TimeoutModal from "../contents/modals/TimeoutModal";
import PaymentErrorModal from "../contents/modals/PaymentErrorModal";
import AccessibilityModal from "../contents/modals/AccessibilityModal";

// 공통 모달 베이스 (프레임)
export const BaseModal = memo(({ isOpen, type, onCancel, onConfirm, cancelLabel, cancelIcon, confirmIcon, confirmLabel, customContent, customTts, icon: customIcon, title: customTitle, countdown }) => {
    const refsData = useContext(RefContext);
    const accessibility = useContext(AccessibilityContext);
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
