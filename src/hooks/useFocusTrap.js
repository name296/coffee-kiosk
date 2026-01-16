import { useEffect, useRef, useCallback } from "react";

export const useFocusTrap = (isActive, options = {}) => {
    // 모드: 'modal' (기본값, 특정 컨테이너) 또는 'app' (전체 앱, .main 기준)
    const mode = options.mode || 'modal';
    const isAppMode = mode === 'app';

    // useContext(ContextBase) 대신 로컬 ref 생성 (ContextProvider 밖에서도 작동)
    const containerRef = useRef(null);

    const getFocusableElements = useCallback(() => {
        if (isAppMode) {
            // 앱 모드: document 전체에서 포커스 가능한 요소 찾기
            const elements = Array.from(document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                .filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });

            // main을 포커스 루프에 항상 추가 (화면 전환 시 포커스 지정을 위해)
            const mainElement = document.querySelector('.main');
            if (mainElement) {
                const mainStyle = window.getComputedStyle(mainElement);
                if (mainStyle.display !== 'none' && mainStyle.visibility !== 'hidden') {
                    // main을 첫 번째 요소로 추가 (화면 전환 시 main에 포커스가 가도록)
                    elements.unshift(mainElement);
                }
            }

            return elements;
        } else {
            // 모달 모드: 특정 컨테이너 내부에서만 포커스 가능한 요소 찾기
            if (!containerRef.current) return [];
            const elements = Array.from(containerRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                .filter(el => {
                    const st = window.getComputedStyle(el);
                    return st.display !== 'none' && st.visibility !== 'hidden';
                });

            // main.modal을 포커스 루프에 항상 추가 (모달 열릴 때 포커스 지정을 위해)
            const modalContentElement = containerRef.current;
            if (modalContentElement && modalContentElement.classList.contains('main') && modalContentElement.classList.contains('modal')) {
                // main.modal에 tabindex가 없으면 추가
                if (!modalContentElement.hasAttribute('tabindex')) {
                    modalContentElement.setAttribute('tabindex', '-1');
                }
                const modalContentStyle = window.getComputedStyle(modalContentElement);
                if (modalContentStyle.display !== 'none' && modalContentStyle.visibility !== 'hidden') {
                    // main.modal을 첫 번째 요소로 추가 (모달 열릴 때 main.modal에 포커스가 가도록)
                    elements.unshift(modalContentElement);
                }
            }

            return elements;
        }
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
