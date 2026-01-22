// 애플리케이션 초기화 유틸리티
export const initializeApp = (callbacks) => {
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
        setCurrentPage
    } = callbacks;

    // 모든 모달 닫기
    ModalRestart?.close();
    ModalAccessibility?.close();
    ModalReset?.close();
    ModalDelete?.close();
    ModalDeleteCheck?.close();
    ModalCall?.close();
    ModalTimeout?.close();
    ModalPaymentError?.close();

    // 상태 초기화
    setQuantities?.({});

    // 접근성 설정 초기화
    setIsDark?.(false);
    setVolume?.(1);
    setIsLarge?.(false);
    setIsLow?.(false);

    // 시작 화면으로 이동
    setCurrentPage?.('ScreenStart');
};
