import { useEffect, useRef, useCallback } from "react";
import { getFocusableElements as getAppFocusableElements } from "./useFocusElementFinder";

export const useFocusTrap = (isActive, options = {}) => {
    // 모드: 'modal' (기본값, 특정 컨테이너) 또는 'app' (전체 앱, .main 기준)
    const mode = options.mode || 'modal';
    const isAppMode = mode === 'app';

    // useContext(ContextBase) 대신 로컬 ref 생성 (ContextProvider 밖에서도 작동)
    const containerRef = useRef(null);

    const getFocusableElements = useCallback(() => {
        if (isAppMode) {
            // 앱 모드: 공통 포커스 리스트 사용 (.process/.modal의 .main 포함)
            return getAppFocusableElements();
        }
        // 모달 모드: 특정 컨테이너 내부에서만 포커스 가능한 요소 찾기
        if (!containerRef.current) return [];
        const elements = Array.from(containerRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter(el => {
                const st = window.getComputedStyle(el);
                return st.display !== 'none' && st.visibility !== 'hidden';
            });

        // .main(컨테이너 자체)을 포커스 루프에 추가
        const containerEl = containerRef.current;
        if (containerEl && !elements.includes(containerEl)) {
            const containerStyle = window.getComputedStyle(containerEl);
            if (containerStyle.display !== 'none' && containerStyle.visibility !== 'hidden') {
                elements.unshift(containerEl);
            }
        }

        return elements;
    }, [isAppMode]);

    const focusFirst = useCallback(() => {
        const els = getFocusableElements();
        if (els.length > 0) els[0].focus();
    }, [getFocusableElements]);

    const focusLast = useCallback(() => {
        const els = getFocusableElements();
        if (els.length > 0) els[els.length - 1].focus();
    }, [getFocusableElements]);

    // Tab 키 트래핑
    useEffect(() => {
        if (!isActive) return;

        const hkd = (e) => {
            if (e.key !== 'Tab') return;
            const els = getFocusableElements();
            if (els.length === 0) return;

            const first = els[0];
            const last = els[els.length - 1];
            const active = document.activeElement;

            // Shift+Tab
            if (e.shiftKey) {
                if (active === first) {
                    e.preventDefault();
                    last.focus();
                }
            }
            // Tab
            else {
                if (active === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', hkd);
        return () => document.removeEventListener('keydown', hkd);
    }, [isActive, getFocusableElements]);

    return { containerRef, focusFirst };
};
