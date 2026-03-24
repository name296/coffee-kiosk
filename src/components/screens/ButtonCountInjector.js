import { useEffect } from "react";
import { convertToKoreanQuantity, countDirectChildButtons } from "@/lib";

const isNaturallyFocusable = (el) =>
    el?.matches?.('button, a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"]');

const INTERACTIVE_CHILD_SELECTOR = '.button, .button-like, [role="button"]';

const hasFocusablePaginationButton = (parent) => {
    const buttons = Array.from(parent.querySelectorAll(`:scope > ${INTERACTIVE_CHILD_SELECTOR}`));
    return buttons.some((btn) =>
        btn?.dataset?.focusExclude !== 'true' &&
        btn.getAttribute('aria-disabled') !== 'true'
    );
};

const applyButtonCounts = () => {
    const parents = new Set();
    document.querySelectorAll(INTERACTIVE_CHILD_SELECTOR).forEach(btn => {
        const parent = btn.parentElement;
        if (!parent) return;
        if (parent.closest('[inert]') || parent.closest('[aria-hidden="true"]')) return;
        parents.add(parent);
    });
    parents.forEach(parent => {
        if (parent.classList?.contains('order-quantity')) return;

        const isPagination = parent.classList?.contains('pagination');
        if (isPagination && !hasFocusablePaginationButton(parent)) {
            // 1/1 페이지 등으로 이전/다음이 모두 비활성인 경우 부모 진입 포커스 제외
            parent.setAttribute('tabindex', '-1');
            return;
        }

        // 버튼 부모도 포커스 가능하게 만들어 섹션 단위 탐색 지원
        if (!isNaturallyFocusable(parent) && (!parent.hasAttribute('tabindex') || parent.getAttribute('tabindex') === '-1')) {
            parent.setAttribute('tabindex', '0');
        }

        if (parent.classList?.contains('order-row')) return;
        const count = countDirectChildButtons(parent);
        if (count <= 0) return;
        // 상위에 섹션 TTS가 있으면 중첩 접미사 방지 — 단 `.pagination` 행은 항상 `버튼 n개` 붙임 (Category 등)
        const ancestor = parent.parentElement?.closest('[data-tts-text]');
        const isTaskManager = parent.classList?.contains('task-manager');
        const skipNested =
            ancestor &&
            ancestor.getAttribute('data-tts-text') &&
            !ancestor.classList.contains('main') &&
            !isTaskManager;
        if (skipNested && !parent.classList?.contains('pagination')) return;
        const existing = parent.getAttribute('data-tts-text') || '';
        if (existing.includes('버튼')) return;
        const qty = convertToKoreanQuantity(count);
        const base = existing.trimEnd().replace(/,\s*$/, '').trimEnd();
        const merged = base ? `${base}, 버튼 ${qty}개,` : `버튼 ${qty}개,`;
        parent.setAttribute('data-tts-text', merged);
    });
};

export const ButtonCountInjector = () => {
    useEffect(() => {
        applyButtonCounts();

        let pending = false;
        const observer = new MutationObserver(() => {
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => {
                applyButtonCounts();
                pending = false;
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-tts-text', 'aria-disabled', 'data-focus-exclude', 'tabindex', 'class']
        });

        return () => observer.disconnect();
    }, []);

    return null;
};
