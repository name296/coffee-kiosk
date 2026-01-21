import { useContext, useCallback } from "react";
import { OrderContext } from "../contexts/OrderContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { ModalContext } from "../contexts/ModalContext";
import { initializeApp } from "../utils/appInitializer";

/**
 * 애플리케이션 초기화(리셋) 기능을 제공하는 훅입니다.
 */
export const useAppInitializer = (setCurrentPageState) => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);

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

            // 페이지 이동 함수
            setCurrentPage: setCurrentPageState
        });
    }, [accessibility, modal, order, setCurrentPageState]);

    return { resetApp };
};
