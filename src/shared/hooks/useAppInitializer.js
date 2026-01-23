import { useContext, useCallback } from "react";
import { OrderContext, AccessibilityContext, ModalContext, TimeoutContext } from "../contexts";

const DEFAULT_GLOBAL_TIMEOUT_MS = 120000;
const formatRemainingTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
const DEFAULT_GLOBAL_TIMEOUT_LABEL = formatRemainingTime(DEFAULT_GLOBAL_TIMEOUT_MS);

const initializeApp = (callbacks) => {
    if (!callbacks) return;

    const {
        ModalRestart,
        ModalAccessibility,
        ModalReset,
        ModalDelete,
        ModalDeleteCheck,
        ModalCall,
        ModalTimeout,
        ModalPaymentError,

        setQuantities,
        setIsDark,
        setVolume,
        setIsLarge,
        setIsLow,
        setGlobalRemainingTime,
        setGlobalRemainingTimeFormatted,
        resetIdleTimeout,
        setCurrentPage
    } = callbacks;

    ModalRestart?.close();
    ModalAccessibility?.close();
    ModalReset?.close();
    ModalDelete?.close();
    ModalDeleteCheck?.close();
    ModalCall?.close();
    ModalTimeout?.close();
    ModalPaymentError?.close();

    setQuantities?.({});

    setIsDark?.(false);
    setVolume?.(1);
    setIsLarge?.(false);
    setIsLow?.(false);
    setGlobalRemainingTime?.(DEFAULT_GLOBAL_TIMEOUT_MS);
    setGlobalRemainingTimeFormatted?.(DEFAULT_GLOBAL_TIMEOUT_LABEL);
    resetIdleTimeout?.();

    setCurrentPage?.('ScreenStart');
};

/**
 * 애플리케이션 초기화(리셋) 기능을 제공하는 훅입니다.
 */
export const useAppInitializer = (setCurrentPageState) => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);

    const resetApp = useCallback(() => {
        console.log('[초기화] useAppInitializer -> resetApp 실행');

        initializeApp({
            // 모달 관리
            ModalRestart: modal?.ModalRestart,
            ModalAccessibility: modal?.ModalAccessibility,
            ModalReset: modal?.ModalReset,
            ModalDelete: modal?.ModalDelete,
            ModalDeleteCheck: modal?.ModalDeleteCheck,
            ModalCall: modal?.ModalCall,
            ModalTimeout: modal?.ModalTimeout,
            ModalPaymentError: modal?.ModalPaymentError,

            // 상태 설정 함수 (Setters)
            setQuantities: order?.setQuantities,
            setIsDark: accessibility?.setIsDark,
            setVolume: accessibility?.setVolume,
            setIsLarge: accessibility?.setIsLarge,
            setIsLow: accessibility?.setIsLow,
            setGlobalRemainingTime: timeout?.setGlobalRemainingTime,
            setGlobalRemainingTimeFormatted: timeout?.setGlobalRemainingTimeFormatted,
            resetIdleTimeout: timeout?.resetIdleTimeout,

            // 페이지 이동 함수
            setCurrentPage: setCurrentPageState
        });
    }, [accessibility, modal, order, timeout, setCurrentPageState]);

    return { resetApp };
};
