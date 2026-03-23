// 포커스 엘레멘트 파인더: 포커스 가능 요소 조회 및 섹션 이동 계산

// 조상 중 display:none 또는 visibility:hidden 있으면 포커스 불가
const isVisible = (el) => {
    for (let n = el; n; n = n.parentElement) {
        const s = window.getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false;
    }
    return true;
};

const isProcessShell = (el) =>
    el?.classList?.contains('process') && !!el.querySelector?.('.main');

const dedupeFocusOrder = (list) => {
    const seen = new Set();
    const out = [];
    for (const el of list) {
        if (el && !seen.has(el)) {
            seen.add(el);
            out.push(el);
        }
    }
    return out;
};

// 포커스 가능한 요소 찾기 (단일책임: 포커스 가능 요소 필터링만)
export const getFocusableElements = () => {
    const elements = Array.from(document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(el => isVisible(el))
        .filter(el => el.dataset?.focusExclude !== 'true')
        .filter(el => !isProcessShell(el));

    const modalElements = document.querySelectorAll('.modal');

    // 화면/모달의 .main·.modal-panel 포커스 루프에 포함 (최상단 모달의 .modal-panel)
    const processMain = document.querySelector('.process .main');
    const modalMains = Array.from(modalElements).map((el) => el.querySelector('.modal-panel')).filter(Boolean);
    const modalMain = modalMains.length ? modalMains[modalMains.length - 1] : null;
    const prepend = [];

    if (modalMain && isVisible(modalMain)) prepend.push(modalMain);
    if (processMain && isVisible(processMain)) prepend.push(processMain);
    if (prepend.length) {
        elements.unshift(...prepend);
    }

    return dedupeFocusOrder(elements);
};

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
