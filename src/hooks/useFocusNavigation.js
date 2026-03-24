import { useEffect } from "react";
import { getFocusableElements, getSectionParent } from "./useFocusElementFinder";

/** 주문 행 내부(.order-quantity 등 data-tts-text)는 섹션으로 쪼개지지 않고 .order-row 하나로 묶음 */
const getNavSectionParent = (el) => {
    // 섹션 부모 자체에 포커스된 경우는 자기 자신을 섹션으로 본다.
    if (el?.matches?.('.main, .modal-panel, .order-row, [data-tts-text]:not(.button):not(.button-like)')) return el;

    const row = el?.closest?.(".order-row");
    if (row) return row;
    return getSectionParent(el);
};

const focusTargetSection = (targetParent, focusableElements) => {
    if (!targetParent) return false;

    // 부모 섹션 자체가 포커스 가능하면 부모로 진입
    if (typeof targetParent.focus === 'function' && targetParent.tabIndex >= 0) {
        targetParent.focus();
        return true;
    }
    return false;
};

const toDomOrderedUnique = (elements) =>
    elements
        .filter(Boolean)
        .filter((el, idx, arr) => arr.indexOf(el) === idx)
        .sort((a, b) => {
            if (a === b) return 0;
            const pos = a.compareDocumentPosition(b);
            if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return 0;
        });

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

                // 부모(섹션) 단위로 이동: 포커스 수집 순서가 아닌 DOM 순서로 계산
                const mainInScope = activeEl.closest?.('.main') || null;
                const sectionParents = toDomOrderedUnique([
                    ...focusableButtons.map((el) => getNavSectionParent(el)),
                    mainInScope
                ]);
                if (sectionParents.length === 0) return;
                const currentParentIndex = sectionParents.indexOf(currentParent);
                if (currentParentIndex === -1) return;

                const direction = key === 'ArrowDown' ? 1 : -1;
                let targetParent = null;
                for (let i = 1; i <= sectionParents.length; i++) {
                    const idx = (currentParentIndex + direction * i + sectionParents.length) % sectionParents.length;
                    const candidate = sectionParents[idx];
                    if (candidate === currentParent) continue;
                    if (typeof candidate?.focus === 'function' && candidate.tabIndex >= 0) {
                        targetParent = candidate;
                        break;
                    }
                }
                if (!targetParent) return;

                // 기본: 부모 섹션만 탐색(자식 fallback 없음)
                focusTargetSection(targetParent, focusableButtons);
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [enableFocusNavigation]);
};
