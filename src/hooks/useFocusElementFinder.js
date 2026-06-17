// 포커스 엘레멘트 파인더: 포커스 가능 요소 조회 및 섹션 이동 계산

export { getFocusableElements } from "@/lib/layoutDebugUtils";

// 섹션(부모) 찾기: 자신이 data-tts-text면 상위에서 재탐색
export const getSectionParent = (el) => {
    if (!el) return null;
    const direct = el.closest('[data-tts-text]');
    if (!direct) return null;
    if (direct !== el) return direct;
    return el.parentElement?.closest('[data-tts-text]') ?? direct;
};

// 다음 섹션(부모)으로 이동할 요소 찾기 (단일책임: 다음 부모의 첫 요소 찾기만)
export const findNextSectionElement = (allFocusable, currentIndex, currentParent) => {
    if (!allFocusable || allFocusable.length === 0) return -1;

    const firstIndexByParent = new Map();
    for (let i = 0; i < allFocusable.length; i++) {
        const parent = getSectionParent(allFocusable[i]);
        if (!parent) continue;
        if (!firstIndexByParent.has(parent)) {
            firstIndexByParent.set(parent, i);
        }
    }

    if (!currentParent) return -1;

    let targetParent = null;
    for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const parent = getSectionParent(allFocusable[i]);
        if (parent && parent !== currentParent) {
            targetParent = parent;
            break;
        }
    }
    if (!targetParent) {
        for (let i = 0; i < currentIndex; i++) {
            const parent = getSectionParent(allFocusable[i]);
            if (parent && parent !== currentParent) {
                targetParent = parent;
                break;
            }
        }
    }

    if (!targetParent) return -1;
    return firstIndexByParent.get(targetParent) ?? -1;
};

// 이전 섹션(부모)으로 이동할 요소 찾기 (단일책임: 이전 부모의 첫 요소 찾기만)
export const findPrevSectionElement = (allFocusable, currentIndex, currentParent) => {
    if (!allFocusable || allFocusable.length === 0) return -1;

    const firstIndexByParent = new Map();
    for (let i = 0; i < allFocusable.length; i++) {
        const parent = getSectionParent(allFocusable[i]);
        if (!parent) continue;
        if (!firstIndexByParent.has(parent)) {
            firstIndexByParent.set(parent, i);
        }
    }

    if (!currentParent) return -1;

    let targetParent = null;
    for (let i = currentIndex - 1; i >= 0; i--) {
        const parent = getSectionParent(allFocusable[i]);
        if (parent && parent !== currentParent) {
            targetParent = parent;
            break;
        }
    }
    if (!targetParent) {
        for (let i = allFocusable.length - 1; i > currentIndex; i--) {
            const parent = getSectionParent(allFocusable[i]);
            if (parent && parent !== currentParent) {
                targetParent = parent;
                break;
            }
    }
    }

    if (!targetParent) return -1;
    return firstIndexByParent.get(targetParent) ?? -1;
};
