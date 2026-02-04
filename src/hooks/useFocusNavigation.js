import { useEffect } from "react";
import { getFocusableElements, getSectionParent, findNextSectionElement, findPrevSectionElement } from "./useFocusElementFinder";

// 포커스 네비게이션: 방향키로 포커스 이동
// 스크린과 모달 모두에서 일관된 포커스 이동 경로 제공
export const useFocusNavigationHandler = (enableFocusNavigation = true) => {
    useEffect(() => {
        if (!enableFocusNavigation) return;

        const handleKeyDown = (e) => {
            const { key } = e;

            // 방향키만 처리
            if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown') {
                return;
            }

            e.preventDefault();
            const activeEl = document.activeElement;
            if (!activeEl) return;

            // 모달 상태 확인
            const modalElement = document.querySelector('.modal');
            const isModalOpen = modalElement?.classList.contains('active');
            const allFocusable = getFocusableElements();
            const scopedFocusable = (isModalOpen && modalElement)
                ? allFocusable.filter(el => modalElement.contains(el) && !el.classList.contains('modal'))
                : allFocusable.filter(el => !el.classList.contains('modal'));

            // 좌우 방향키: 모든 포커스 가능한 개체를 선형으로 탐색
            if (key === 'ArrowLeft' || key === 'ArrowRight') {
                const focusableElements = scopedFocusable;

                if (focusableElements.length === 0) {
                    return;
                }

                const currentIndex = focusableElements.indexOf(activeEl);
                if (currentIndex === -1) {
                    focusableElements[0]?.focus();
                    return;
                }

                if (key === 'ArrowLeft') {
                    // 좌 방향키: 이전 요소로 이동 (순환)
                    const targetIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                    const targetElement = focusableElements[targetIndex];
                    targetElement?.focus();
                } else {
                    // 우 방향키: 다음 요소로 이동 (순환)
                    const targetIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                    const targetElement = focusableElements[targetIndex];
                    targetElement?.focus();
                }
                return;
            }

            // 상하 방향키: 부모가 바뀌는 지점(data-tts-text가 있는 조건)만 확인해서 이동
            if (key === 'ArrowUp' || key === 'ArrowDown') {
                // .modal 제외 (모달 컨테이너는 제외, .main은 포함)
                const focusableButtons = scopedFocusable;

                if (focusableButtons.length === 0) {
                    return;
                }

                const currentIndex = focusableButtons.indexOf(activeEl);
                if (currentIndex === -1) {
                    focusableButtons[0]?.focus();
                    return;
                }

                const currentParent = getSectionParent(activeEl);
                if (!currentParent) {
                    return;
                }

                const targetIndex = key === 'ArrowDown'
                    ? findNextSectionElement(focusableButtons, currentIndex, currentParent)
                    : findPrevSectionElement(focusableButtons, currentIndex, currentParent);

                if (targetIndex === -1) return;
                focusableButtons[targetIndex]?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [enableFocusNavigation]);
};
