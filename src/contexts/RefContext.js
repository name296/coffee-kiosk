import React, { createContext, useRef, useMemo } from "react";

// Ref Context - 전역 refs 관리 (Hook refs, Component refs)
// 레벨: 전역 UI 상태/알림 레벨
// 의존성: 없음 (독립)
// 사용처: 모든 Screen 컴포넌트, Hook들 (useDOM, useCategoryAssemble 등)
// 제공 값: refs
export const RefContext = createContext();

// ============================================================================
// Ref Provider - refs만 제공
// ============================================================================
export const RefProvider = ({ children }) => {
    // 모든 refs를 Ref Provider에서 직접 정의
    const useSound_timerInstanceRef = useRef(null);
    const useSound_audioRefs = useRef({});

    const BaseModal_modalConfirmButtonsRef = useRef(null);
    const ModalAccessibility_originalSettingsRef = useRef(null);

    const contextValue = useMemo(() => ({
        refs: {
            useSound: { timerInstanceRef: useSound_timerInstanceRef, audioRefs: useSound_audioRefs },
            BaseModal: { modalConfirmButtonsRef: BaseModal_modalConfirmButtonsRef },
            ModalAccessibility: { originalSettingsRef: ModalAccessibility_originalSettingsRef }
        }
    }), []);

    return (
        <RefContext.Provider value={contextValue}>
            {children}
        </RefContext.Provider>
    );
};
