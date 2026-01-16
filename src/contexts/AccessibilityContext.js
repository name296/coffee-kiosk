import React, { createContext, useState, useMemo, useEffect, useCallback } from "react";
import { useBodyClass, useHtmlClass } from "../hooks/useTheme";

// Accessibility Context - 접근성 설정 및 모달 상태 관리
// 레벨: 스타일/테마 레벨
// 의존성: 없음 (독립)
// 사용처: 모든 Screen 컴포넌트, 모달 컴포넌트, Button 컴포넌트
// 제공 값: isDark, setIsDark, isLow, setIsLow, isLarge, setIsLarge, volume, setVolume, accessibility, setAccessibility, ModalRestart, ModalAccessibility, ModalReset, ModalDelete, ModalDeleteCheck, ModalCall, ModalTimeout, ModalPaymentError, ModalDeleteItemId, setModalDeleteItemId, globalRemainingTime, setGlobalRemainingTime
// Provider 위치: TTSStateProvider 내부, ScreenRouteProvider보다 바깥 (AccessibilityProvider)
export const AccessibilityContext = createContext();


export const AccessibilityProvider = ({ children }) => {
    // 접근성 설정 상태
    const [isDark, setIsDark] = useState(false);
    const [isLow, setIsLow] = useState(false);
    const [isLarge, setIsLarge] = useState(false);
    const [volume, setVolume] = useState(1);

    useBodyClass('dark', isDark);
    useHtmlClass('large', isLarge);  // html에 적용 (font-size 스케일링)
    useBodyClass('low', isLow);

    const accessibility = useMemo(() => ({
        isDark,
        isLow,
        isLarge,
        volume
    }), [isDark, isLow, isLarge, volume]);

    const [accessibilityState, setAccessibilityState] = useState(accessibility);

    useEffect(() => {
        setAccessibilityState(accessibility);
    }, [accessibility]);

    // 모달 상태 관리
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
    const [globalRemainingTime, setGlobalRemainingTime] = useState(null);

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

    // 모달 핸들러들 메모이제이션 (modals 변경 시에만 재생성)
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
        // 접근성 설정
        isDark, setIsDark,
        isLow, setIsLow,
        isLarge, setIsLarge,
        volume, setVolume,
        accessibility,
        setAccessibility: setAccessibilityState,
        // 모달 상태 (안정적인 참조)
        ...modalHandlers,
        ModalDeleteItemId: deleteItemId,
        setModalDeleteItemId: setDeleteItemId,
        // 전역 타이머 (TimeoutModal에서 사용)
        globalRemainingTime,
        setGlobalRemainingTime
    }), [isDark, isLow, isLarge, volume, accessibility, modalHandlers, deleteItemId, globalRemainingTime]);

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
};
