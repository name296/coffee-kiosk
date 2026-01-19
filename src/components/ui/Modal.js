import React, { memo, useContext, useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import Button from "./Button";
import Icon from "../../Icon";
import Highlight, { H } from "./Highlight";
import { TTS } from "../../constants/constants";
import { RefContext } from "../../contexts/RefContext";
import { AccessibilityContext } from "../../contexts/AccessibilityContext";
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

// 공통 모달 베이스 (컨텍스트 기반)
export const BaseModal = memo(({ isOpen, type, onCancel, onConfirm, cancelLabel, cancelIcon, confirmIcon, confirmLabel, customContent, customTts, icon: customIcon, title: customTitle, countdown }) => {
    // RefContext에서 값 가져오기
    const refsData = useContext(RefContext);
    const accessibility = useContext(AccessibilityContext);
    const { containerRef } = useFocusTrap(isOpen);
    const { setAudioVolume, focusModalContent, focusMain } = useDOM();

    const config = MODAL_CONFIG[type];

    // customContent가 있으면 config 없이도 작동 가능
    if (!isOpen || (!config && !customContent)) return null;

    // customContent 사용 시 또는 config 사용 시
    const finalIcon = customIcon || config?.icon;
    const finalTitle = customTitle || config?.title;
    const finalTts = customTts || config?.tts;
    const finalCancelLabel = cancelLabel !== undefined ? cancelLabel : (config?.cancelLabel ?? "취소");
    const finalCancelIcon = cancelIcon || config?.cancelIcon || "Cancel";
    const finalConfirmIcon = confirmIcon || finalIcon || config?.confirmIcon || "Ok";
    const finalConfirmLabel = confirmLabel || finalTitle || config?.confirmLabel || "확인";

    // 접근성 모달일 때만 접근성 설정 로직 사용
    const isAccessibilityModal = type === 'accessibility';
    const originalSettingsRef = isAccessibilityModal ? refsData.refs.AccessibilityModal.originalSettingsRef : null;

    // 접근성 모달: 현재 접근성 설정 상태 관리 (Hook은 항상 호출해야 함)
    const accessibilitySettings = useAccessibilitySettings({ isDark: accessibility.isDark, isLow: accessibility.isLow, isLarge: accessibility.isLarge, volume: accessibility.volume });

    const currentSettings = isAccessibilityModal ? accessibilitySettings.settings : null;
    const setDark = accessibilitySettings.setDark;
    const setLow = accessibilitySettings.setLow;
    const setLarge = accessibilitySettings.setLarge;
    const setSettingsVolume = accessibilitySettings.setVolume;
    const updateAllSettings = accessibilitySettings.updateAll;
    const getStatusText = accessibilitySettings.getStatusText;

    // 접근성 모달: 원래 설정 저장
    useEffect(() => {
        if (isAccessibilityModal && originalSettingsRef) {
            if (isOpen && !originalSettingsRef.current) {
                originalSettingsRef.current = { isDark: accessibility.isDark, isLow: accessibility.isLow, isLarge: accessibility.isLarge, volume: accessibility.volume };
            } else if (!isOpen) {
                originalSettingsRef.current = null;
            }
        }
    }, [isAccessibilityModal, isOpen, originalSettingsRef, accessibility.isDark, accessibility.isLow, accessibility.isLarge, accessibility.volume]);

    // 접근성 모달: 즉시 적용 핸들러들
    const handleDarkChange = useCallback((val) => {
        if (!isAccessibilityModal || !setDark) return;
        setDark(val);
        accessibility.setIsDark(val);
    }, [isAccessibilityModal, setDark, accessibility.setIsDark]);

    const handleVolumeChange = useCallback((val) => {
        if (!isAccessibilityModal || !setSettingsVolume) return;
        setSettingsVolume(val);
        accessibility.setVolume(val);
        setAudioVolume('audioPlayer', ({ 0: 0, 1: 0.5, 2: 0.75, 3: 1 })[val]);
    }, [isAccessibilityModal, setSettingsVolume, accessibility.setVolume, setAudioVolume]);

    const handleLargeChange = useCallback((val) => {
        if (!isAccessibilityModal || !setLarge) return;
        setLarge(val);
        accessibility.setIsLarge(val);
    }, [isAccessibilityModal, setLarge, accessibility.setIsLarge]);

    const handleLowChange = useCallback((val) => {
        if (!isAccessibilityModal || !setLow) return;
        setLow(val);
        accessibility.setIsLow(val);
    }, [isAccessibilityModal, setLow, accessibility.setIsLow]);

    // 접근성 모달: 초기설정 핸들러
    const handleInitialSettingsPress = useCallback(() => {
        if (!isAccessibilityModal || !updateAllSettings) return;
        updateAllSettings({ isDark: false, isLow: false, isLarge: false, volume: 1 });
        accessibility.setIsDark(false);
        accessibility.setVolume(1);
        accessibility.setIsLarge(false);
        accessibility.setIsLow(false);
        setAudioVolume('audioPlayer', 0.5);
    }, [isAccessibilityModal, updateAllSettings, accessibility.setIsDark, accessibility.setVolume, accessibility.setIsLarge, accessibility.setIsLow, setAudioVolume]);

    // 접근성 모달: 적용안함 핸들러 (원래 상태로 복원)
    const handleCancelPress = useCallback(() => {
        if (!isAccessibilityModal || !originalSettingsRef) {
            onCancel?.();
            return;
        }
        const original = originalSettingsRef.current;
        if (original) {
            accessibility.setIsDark(original.isDark);
            accessibility.setVolume(original.volume);
            accessibility.setIsLarge(original.isLarge);
            accessibility.setIsLow(original.isLow);
            setAudioVolume('audioPlayer', ({ 0: 0, 1: 0.5, 2: 0.75, 3: 1 })[original.volume]);
        }
        accessibility.ModalAccessibility.close();
    }, [isAccessibilityModal, originalSettingsRef, accessibility, setAudioVolume, onCancel]);

    // 접근성 모달: 적용하기 핸들러
    const handleConfirmPress = useCallback(() => {
        if (!isAccessibilityModal || !currentSettings) {
            onConfirm?.();
            return;
        }
        accessibility.setAccessibility(currentSettings);
        accessibility.ModalAccessibility.close();
    }, [isAccessibilityModal, currentSettings, accessibility, onConfirm]);

    // 모달 열릴 때 main.modal에 포커스 (isOpen 변경 시에만 실행)
    const route = useContext(ScreenRouteContext);
    const currentPage = route?.currentPage;
    useLayoutEffect(() => {
        if (isOpen) {
            focusModalContent();
        } else {
            if (currentPage === 'ScreenStart') {
                requestAnimationFrame(() => {
                    focusMain();
                });
            }
        }
    }, [isOpen, currentPage, focusModalContent, focusMain]);

    // 접근성 모달: 접근성 설정 요소들
    const accessibilityContent = isAccessibilityModal && currentSettings && getStatusText ? (
        <>
            <div className="modal-message">
                <div>원하시는&nbsp;<Highlight>접근성 옵션</Highlight>을 선택하시고</div>
                <div><Highlight>적용하기</Highlight>&nbsp;버튼을 누르세요</div>
            </div>
            <div className="setting-row" data-tts-text="초기설정으로 일괄선택, 버튼 한 개, ">
                <span className="setting-name"><Highlight>초기설정</Highlight>으로 일괄선택</span>
                <div className="task-manager">
                    <Button className="w242h076" svg={<Icon name="Restart" />} label="초기설정" onClick={handleInitialSettingsPress} />
                </div>
            </div>
            <hr className="setting-line" />
            <div className="setting-row">
                <span className="setting-name"><span className="icon"><Icon name="Contrast" /></span>고대비화면</span>
                <div className="task-manager" data-tts-text={`고대비 화면, 선택상태, ${getStatusText.dark}, 버튼 두 개,`}>
                    <Button toggle value={currentSettings.isDark} selectedValue={false} onChange={handleDarkChange} label="끔" className="w113h076" />
                    <Button toggle value={currentSettings.isDark} selectedValue={true} onChange={handleDarkChange} label="켬" className="w113h076" />
                </div>
            </div>
            <hr className="setting-line" />
            <div className="setting-row">
                <span className="setting-name"><span className="icon"><Icon name="Volume" /></span>소리크기</span>
                <div className="task-manager" data-tts-text={`소리크기, 선택상태, ${getStatusText.volume}, 버튼 네 개, `}>
                    <Button toggle value={currentSettings.volume} selectedValue={0} onChange={handleVolumeChange} label="끔" className="w070h076" />
                    <Button toggle value={currentSettings.volume} selectedValue={1} onChange={handleVolumeChange} label="약" className="w070h076" />
                    <Button toggle value={currentSettings.volume} selectedValue={2} onChange={handleVolumeChange} label="중" className="w070h076" />
                    <Button toggle value={currentSettings.volume} selectedValue={3} onChange={handleVolumeChange} label="강" className="w070h076" />
                </div>
            </div>
            <hr className="setting-line" />
            <div className="setting-row">
                <span className="setting-name"><span className="icon"><Icon name="Large" /></span>큰글씨화면</span>
                <div className="task-manager" data-tts-text={`큰글씨 화면, 선택상태, ${getStatusText.large}, 버튼 두 개, `}>
                    <Button toggle value={currentSettings.isLarge} selectedValue={false} onChange={handleLargeChange} label="끔" className="w113h076" />
                    <Button toggle value={currentSettings.isLarge} selectedValue={true} onChange={handleLargeChange} label="켬" className="w113h076" />
                </div>
            </div>
            <hr className="setting-line" />
            <div className="setting-row">
                <span className="setting-name"><span className="icon"><Icon name="Wheelchair" /></span>낮은화면</span>
                <div className="task-manager" data-tts-text={`낮은 화면, 선택상태, ${getStatusText.low}, 버튼 두 개, `}>
                    <Button toggle value={currentSettings.isLow} selectedValue={false} onChange={handleLowChange} label="끔" className="w113h076" />
                    <Button toggle value={currentSettings.isLow} selectedValue={true} onChange={handleLowChange} label="켬" className="w113h076" />
                </div>
            </div>
        </>
    ) : null;

    return (
        <>
            <div className="modal-overlay">
                <div className="main modal" ref={containerRef} data-tts-text={finalTts ? (finalTts + TTS.replay) : ''} tabIndex={-1}>
                    <div className="up-content">
                        {finalIcon && <Icon name={finalIcon} className="modal-image" />}
                        {finalTitle && <div className="modal-title">{finalTitle}</div>}
                    </div>
                    <div className="down-content">
                        {customContent || (
                            <>
                                {isAccessibilityModal ? (
                                    <>
                                        {accessibilityContent}
                                        <div data-tts-text="작업 관리, 버튼 두 개, " ref={refsData.refs.BaseModal.modalConfirmButtonsRef} className="task-manager">
                                            <Button className="w285h090" svg={<Icon name={finalCancelIcon} />} label={finalCancelLabel} onClick={handleCancelPress} />
                                            <Button className="w285h090" svg={<Icon name={finalConfirmIcon} />} label={finalConfirmLabel} onClick={handleConfirmPress} />
                                        </div>
                                    </>
                                ) : (
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
});
BaseModal.displayName = 'BaseModal';

// 시작화면 모달 (Restart)
export const RestartModal = memo(({ onConfirm }) => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalRestart.isOpen}
            type="restart"
            onCancel={() => accessibility.ModalRestart.close()}
            onConfirm={() => { accessibility.ModalRestart.close(); onConfirm(); }}
        />
    );
});
RestartModal.displayName = 'RestartModal';

// 초기화 모달 (Reset)
export const ResetModal = memo(({ onConfirm }) => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalReset.isOpen}
            type="reset"
            onCancel={() => accessibility.ModalReset.close()}
            onConfirm={() => { accessibility.ModalReset.close(); onConfirm(); }}
        />
    );
});
ResetModal.displayName = 'ResetModal';

// 삭제 확인 모달 (DeleteCheck - 내역 없음)
export const DeleteCheckModal = memo(({ handleDelete, id }) => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalDeleteCheck.isOpen}
            type="deleteCheck"
            onCancel={() => accessibility.ModalDeleteCheck.close()}
            onConfirm={() => { handleDelete(id); accessibility.ModalDeleteCheck.close(); }}
        />
    );
});
DeleteCheckModal.displayName = 'DeleteCheckModal';

// 삭제 모달 (Delete - 실제 삭제)
export const DeleteModal = memo(({ handleDelete, id }) => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalDelete.isOpen}
            type="delete"
            onCancel={() => accessibility.ModalDelete.close()}
            onConfirm={() => { handleDelete(id); accessibility.ModalDelete.close(); }}
        />
    );
});
DeleteModal.displayName = 'DeleteModal';

// 직원호출 모달 (Call)
export const CallModal = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalCall.isOpen}
            type="call"
            onCancel={() => accessibility.ModalCall.close()}
            onConfirm={() => accessibility.ModalCall.close()}
        />
    );
});
CallModal.displayName = 'CallModal';

// 시간연장 모달 (Timeout)
export const TimeoutModal = memo(({ onExtend, onEnd }) => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalTimeout.isOpen}
            type="timeout"
            countdown={accessibility.globalRemainingTime}
            onCancel={() => { accessibility.ModalTimeout.close(); onEnd(); }}
            onConfirm={() => { accessibility.ModalTimeout.close(); onExtend(); }}
        />
    );
});
TimeoutModal.displayName = 'TimeoutModal';

// 결제오류 모달 (PaymentError)
export const PaymentErrorModal = memo(({ onConfirm }) => {
    const accessibility = useContext(AccessibilityContext);
    return (
        <BaseModal
            isOpen={accessibility.ModalPaymentError.isOpen}
            type="paymentError"
            onCancel={() => { }} // 취소 없음
            onConfirm={() => { accessibility.ModalPaymentError.close(); onConfirm && onConfirm(); }}
        />
    );
});
PaymentErrorModal.displayName = 'PaymentErrorModal';

// 모달 컨테이너 (전역 모달 렌더링)
export const ModalContainer = () => {
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);
    const route = useContext(ScreenRouteContext);

    if (!accessibility) return null;

    return (
        <>
            <div className={`modal-backdrop ${(
                accessibility.ModalRestart.isOpen ||
                accessibility.ModalAccessibility.isOpen ||
                accessibility.ModalReset.isOpen ||
                accessibility.ModalDelete.isOpen ||
                accessibility.ModalDeleteCheck.isOpen ||
                accessibility.ModalCall.isOpen ||
                accessibility.ModalTimeout.isOpen ||
                accessibility.ModalPaymentError.isOpen
            ) ? 'active' : ''}`} aria-hidden="true"></div>

            {accessibility.ModalRestart.isOpen && <RestartModal onConfirm={() => route.setCurrentPage('ScreenStart')} />}
            {accessibility.ModalReset.isOpen && <ResetModal onConfirm={order?.quantities ? () => order.setQuantities({}) : () => { }} />}
            {accessibility.ModalCall.isOpen && <CallModal />}

            {/* AccessibilityModal은 BaseModal을 직접 사용 (상태 관리가 복잡함) */}
            {accessibility.ModalAccessibility.isOpen && (
                <BaseModal
                    isOpen={accessibility.ModalAccessibility.isOpen}
                    type="accessibility"
                    onCancel={() => { }}
                    onConfirm={() => { }}
                />
            )}

            {(accessibility?.ModalDelete || { isOpen: false }).isOpen && <DeleteModal handleDelete={order?.handleDelete || (() => { })} id={accessibility?.ModalDeleteItemId || 0} />}
            {(accessibility?.ModalDeleteCheck || { isOpen: false }).isOpen && <DeleteCheckModal handleDelete={order?.handleDelete || (() => { })} id={accessibility?.ModalDeleteItemId || 0} />}

            {/* TimeoutModal과 PaymentErrorModal은 App에서 렌더링되거나 여기서 렌더링되거나, App.js에서는 ModalContainer에 포함되어 있음. */}
            {accessibility.ModalTimeout.isOpen && <TimeoutModal onExtend={() => { }} onEnd={() => route.setCurrentPage('ScreenStart')} />}
            {accessibility.ModalPaymentError.isOpen && <PaymentErrorModal />}
        </>
    );
};
