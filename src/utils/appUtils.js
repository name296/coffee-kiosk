
// 애플리케이션 초기화 유틸리티
// (타임아웃, 초기화 버튼 등에서 사용)
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
    setVolume?.(1); // 기본 볼륨 1 (최대) -> 요구사항에 따라 0.5(1) 또는 1(3) 확인 필요. 
    // 기존 코드에서는 handleInitialSettingsPress에서 1로 설정함.
    // volume 1은 "약"? 아니면 인덱스? 
    // useAccessibilitySettings.js: volume state is 0, 1, 2, 3. 
    // 1 is default?
    setIsLarge?.(false);
    setIsLow?.(false);

    // 시작 화면으로 이동
    setCurrentPage?.('ScreenStart');
};
