import { useEffect } from "react";
import { convertToKoreanQuantity } from "@/lib";

const applyButtonCounts = () => {
    const parents = new Set();
    document.querySelectorAll('.button').forEach(btn => {
        const parent = btn.parentElement;
        if (!parent) return;
        if (parent.closest('[inert]') || parent.closest('[aria-hidden="true"]')) return;
        parents.add(parent);
    });
    parents.forEach(parent => {
        if (parent.classList?.contains('order-row')) return;
        const count = parent.querySelectorAll(':scope > .button').length;
        if (count <= 0) return;
        /* task-manager는 버튼 1개일 때 섹션 TTS만 (버튼 n개 접미사 생략) */
        if (parent.classList?.contains('task-manager') && count === 1) return;
        // 부모의 상위가 이미 섹션(data-tts-text)이면 하위 섹션 생성 방지 (.main은 컨테이너이므로 제외)
        const ancestor = parent.parentElement?.closest('[data-tts-text]');
        const isTaskManager = parent.classList?.contains('task-manager');
        if (ancestor && ancestor.getAttribute('data-tts-text') && !ancestor.classList.contains('main') && !isTaskManager) return;
        const existing = parent.getAttribute('data-tts-text') || '';
        if (existing.includes('버튼')) return;
        const suffix = `버튼 ${convertToKoreanQuantity(count)}개,`;
        parent.setAttribute('data-tts-text', existing ? `${existing} ${suffix}` : suffix);
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
            attributeFilter: ['data-tts-text']
        });

        return () => observer.disconnect();
    }, []);

    return null;
};
