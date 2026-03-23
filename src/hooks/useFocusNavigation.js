import { useEffect } from "react";
import { getFocusableElements, getSectionParent } from "./useFocusElementFinder";

/** 주문 행 내부(.order-quantity 등 data-tts-text)는 섹션으로 쪼개지지 않고 .order-row 하나로 묶음 */
const getNavSectionParent = (el) => {
    const row = el?.closest?.(".order-row");
    if (row) return row;
    return getSectionParent(el);
};

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

            // 모달 상태 확인 (최상단 모달만 포커스)
            const modalElements = document.querySelectorAll('.modal');
            const topmostModal = modalElements.length ? modalElements[modalElements.length - 1] : null;
            const isModalOpen = !!topmostModal;
            const allFocusable = getFocusableElements();
            const scopedFocusable = isModalOpen
                ? allFocusable.filter(el => topmostModal.contains(el))
                : allFocusable.filter(el => !el.closest('.modal'));

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

                const currentParent = getNavSectionParent(activeEl);
                if (!currentParent) {
                    return;
                }

                // 부모(섹션) 단위로 이동: .main > rowN > summary 순서 보장
                const sectionParents = [];
                for (const el of focusableButtons) {
                    const parent = getNavSectionParent(el);
                    if (parent && !sectionParents.includes(parent)) {
                        sectionParents.push(parent);
                    }
                }
                if (sectionParents.length === 0) return;
                const currentParentIndex = sectionParents.indexOf(currentParent);
                if (currentParentIndex === -1) return;

                const targetParent = key === 'ArrowDown'
                    ? sectionParents[(currentParentIndex + 1) % sectionParents.length]
                    : sectionParents[(currentParentIndex - 1 + sectionParents.length) % sectionParents.length];

                // order-row 섹션 진입 시 첫 포커스를 항상 .order-name으로 고정
                if (targetParent?.classList?.contains('order-row')) {
                    const targetOrderNameIndex = focusableButtons.findIndex((el) =>
                        getSectionParent(el) === targetParent && el.classList?.contains('order-name')
                    );
                    if (targetOrderNameIndex !== -1) {
                        focusableButtons[targetOrderNameIndex]?.focus();
                        return;
                    }
                }

                // order-row에서 이름 셀(.order-name) 기준 상하 이동 시 다음/이전 row의 .order-name으로 우선 이동
                if (activeEl.classList?.contains('order-name')) {
                    if (targetParent) {
                        const targetOrderNameIndex = focusableButtons.findIndex((el) =>
                            getNavSectionParent(el) === targetParent && el.classList?.contains('order-name')
                        );
                        if (targetOrderNameIndex !== -1) {
                            focusableButtons[targetOrderNameIndex]?.focus();
                            return;
                        }
                    }
                }

                // 기본: 타겟 섹션의 첫 포커스 가능한 요소
                const targetIndex = focusableButtons.findIndex((el) => getNavSectionParent(el) === targetParent);
                if (targetIndex === -1) return;
                focusableButtons[targetIndex]?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [enableFocusNavigation]);
};
