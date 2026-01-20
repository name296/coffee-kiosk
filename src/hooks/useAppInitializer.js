import { useContext, useCallback } from "react";
import { OrderContext } from "../contexts/OrderContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { initializeApp } from "../utils/appUtils";

/**
 * 애플리케이션 초기화(리셋) 기능을 제공하는 훅입니다.
 * 초기화 로직을 라우팅 컨텍스트로부터 분리합니다.
 */
export const useAppInitializer = (setCurrentPageState) => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);

    const resetApp = useCallback(() => {
        console.log('[초기화] useAppInitializer -> resetApp 실행');

        initializeApp({
            // 모달 관리
            ModalRestart: accessibility?.ModalRestart,
            ModalAccessibility: accessibility?.ModalAccessibility,
            ModalReset: accessibility?.ModalReset,
            ModalDelete: accessibility?.ModalDelete,
            ModalDeleteCheck: accessibility?.ModalDeleteCheck,
            ModalCall: accessibility?.ModalCall,
            ModalTimeout: accessibility?.ModalTimeout,
            ModalPaymentError: accessibility?.ModalPaymentError,

            // 상태 설정 함수 (Setters)
            setQuantities: order?.setQuantities,
            setIsDark: accessibility?.setIsDark,
            setVolume: accessibility?.setVolume,
            setIsLarge: accessibility?.setIsLarge,
            setIsLow: accessibility?.setIsLow,

            // 페이지 이동 함수
            setCurrentPage: setCurrentPageState
        });
    }, [accessibility, order, setCurrentPageState]);

    return { resetApp };
};
