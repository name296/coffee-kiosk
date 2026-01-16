import React, { createContext, useRef, useMemo } from "react";

// Ref Context - 전역 refs 관리 (Hook refs, Component refs)
// 레벨: 전역 UI 상태/알림 레벨
// 의존성: 없음 (독립)
// 사용처: 모든 Screen 컴포넌트, Hook들 (useDOM, useCategoryPagination 등)
// 제공 값: refs
export const RefContext = createContext();

// ============================================================================
// Ref Provider - refs만 제공
// ============================================================================
export const RefProvider = ({ children }) => {
    // 모든 refs를 Ref Provider에서 직접 정의
    // Hooks 내부 ref
    const useIdleTimeout_timerRef = useRef(null);
    const useIdleTimeout_intervalRef = useRef(null);
    const useIdleTimeout_lastActivityRef = useRef(Date.now());
    const useIdleTimeout_onTimeoutRef = useRef(null);
    const useIdleTimeout_timeoutRef = useRef(null);

    const useSound_timerInstanceRef = useRef(null);
    const useSound_audioRefs = useRef({});

    const BaseModal_modalConfirmButtonsRef = useRef(null);

    const CategoryNav_categoryPageNavRef = useRef(null);
    const Summary_categoryPageNavRef = useRef(null);

    const AccessibilityModal_originalSettingsRef = useRef(null);

    // Context value - refs만 제공
    const contextValue = useMemo(() => ({
        refs: {
            // Hooks refs
            useIdleTimeout: { timerRef: useIdleTimeout_timerRef, intervalRef: useIdleTimeout_intervalRef, lastActivityRef: useIdleTimeout_lastActivityRef, onTimeoutRef: useIdleTimeout_onTimeoutRef, timeoutRef: useIdleTimeout_timeoutRef },
            useSound: { timerInstanceRef: useSound_timerInstanceRef, audioRefs: useSound_audioRefs },
            // Component refs
            BaseModal: { modalConfirmButtonsRef: BaseModal_modalConfirmButtonsRef },
            CategoryNav: { categoryPageNavRef: CategoryNav_categoryPageNavRef },
            Summary: { categoryPageNavRef: Summary_categoryPageNavRef },
            AccessibilityModal: { originalSettingsRef: AccessibilityModal_originalSettingsRef }
        }
    }), []);

    return (
        <RefContext.Provider value={contextValue}>
            {children}
        </RefContext.Provider>
    );
};
