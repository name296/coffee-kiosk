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

    const Category_categoryPageNavRef = useRef(null);
    const Summary_categoryPageNavRef = useRef(null);

    const ModalAccessibility_originalSettingsRef = useRef(null);

    // Context value - refs만 제공
    const contextValue = useMemo(() => ({
        refs: {
            // Hooks refs
            useSound: { timerInstanceRef: useSound_timerInstanceRef, audioRefs: useSound_audioRefs },
            // Component refs
            BaseModal: { modalConfirmButtonsRef: BaseModal_modalConfirmButtonsRef },
            Category: { categoryPageNavRef: Category_categoryPageNavRef },
            Summary: { categoryPageNavRef: Summary_categoryPageNavRef },
            ModalAccessibility: { originalSettingsRef: ModalAccessibility_originalSettingsRef }
        }
    }), []);

    return (
        <RefContext.Provider value={contextValue}>
            {children}
        </RefContext.Provider>
    );
};
