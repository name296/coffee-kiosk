import { useState, useRef, useEffect, useCallback } from "react";

// 포커스 가능한 요소 찾기 (단일책임: 포커스 가능 요소 필터링만)
export const getFocusableElements = () => {
    const elements = Array.from(document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });

    // 모달 상태 확인
    const modalElement = document.querySelector('.modal');
    const isModalOpen = modalElement?.classList.contains('active');

    if (isModalOpen && modalElement) {
        // 모달이 열려있을 때: .modal(흐려짐 영역)을 포커스 루프에 추가
        const modalStyle = window.getComputedStyle(modalElement);
        if (modalStyle.display !== 'none' && modalStyle.visibility !== 'hidden') {
            elements.unshift(modalElement);
        }
    } else {
        // 모달이 닫혀있을 때: .process를 포커스 루프에 추가 (화면 전환 시 포커스 지정을 위해)
        const processElement = document.querySelector('.process');
        if (processElement) {
            const processStyle = window.getComputedStyle(processElement);
            if (processStyle.display !== 'none' && processStyle.visibility !== 'hidden') {
                elements.unshift(processElement);
            }
        }
    }

    return elements;
};

// 다음 섹션(부모)으로 이동할 요소 찾기 (단일책임: 다음 부모의 첫 요소 찾기만)
export const findNextSectionElement = (allFocusable, currentIndex, currentParent) => {
    // 현재 부모와 다른 부모를 가진 첫 번째 요소 찾기
    const seenParents = new Set();
    seenParents.add(currentParent);

    for (let i = currentIndex + 1; i < allFocusable.length; i++) {
        const nextParent = allFocusable[i].closest('[data-tts-text]');
        if (nextParent && nextParent !== currentParent && !seenParents.has(nextParent)) {
            // 다른 부모를 찾았으면, 이 부모의 첫 번째 포커스 가능한 요소 반환
            for (let j = i; j < allFocusable.length; j++) {
                if (allFocusable[j].closest('[data-tts-text]') === nextParent) {
                    return j;
                }
            }
        }
    }

    // 마지막까지 찾지 못하면 첫 번째 다른 부모로 순환
    for (let i = 0; i < currentIndex; i++) {
        const nextParent = allFocusable[i].closest('[data-tts-text]');
        if (nextParent && nextParent !== currentParent && !seenParents.has(nextParent)) {
            return i;
        }
    }

    return -1; // 다른 부모가 없으면 -1 반환
};

// 이전 섹션(부모)으로 이동할 요소 찾기 (단일책임: 이전 부모의 첫 요소 찾기만)
export const findPrevSectionElement = (allFocusable, currentIndex, currentParent) => {
    // 현재 부모와 다른 부모를 가진 첫 번째 요소 찾기
    const seenParents = new Set();
    seenParents.add(currentParent);

    for (let i = currentIndex - 1; i >= 0; i--) {
        const prevParent = allFocusable[i].closest('[data-tts-text]');
        if (prevParent && prevParent !== currentParent && !seenParents.has(prevParent)) {
            // 다른 부모를 찾았으면, 이 부모의 첫 번째 포커스 가능한 요소 반환
            for (let j = i; j >= 0; j--) {
                const checkParent = allFocusable[j].closest('[data-tts-text]');
                if (checkParent === prevParent) {
                    // 이전 요소가 같은 부모면 계속, 다른 부모면 반환
                    if (j === 0 || allFocusable[j - 1].closest('[data-tts-text]') !== prevParent) {
                        return j;
                    }
                }
            }
            return i;
        }
    }

    // 처음까지 찾지 못하면 마지막 다른 부모로 순환
    for (let i = allFocusable.length - 1; i > currentIndex; i--) {
        const prevParent = allFocusable[i].closest('[data-tts-text]');
        if (prevParent && prevParent !== currentParent && !seenParents.has(prevParent)) {
            // 이 부모의 첫 번째 요소 찾기
            for (let j = i; j >= 0; j--) {
                if (allFocusable[j].closest('[data-tts-text]') === prevParent) {
                    if (j === 0 || allFocusable[j - 1].closest('[data-tts-text]') !== prevParent) {
                        return j;
                    }
                }
            }
            return i;
        }
    }

    return -1; // 다른 부모가 없으면 -1 반환
};

// 섹션 업데이트 관리 (단일책임: 포커스 가능 섹션 관리만)
export const useFocusableSectionsManager = (initFocusableSections, sectionsRefs) => {
    const [, setFocusableSections] = useState(initFocusableSections);
    const keyboardNavState = useRef(null);

    if (!keyboardNavState.current) {
        keyboardNavState.current = {
            currentSectionIndex: 0,
            currentButtonIndex: 0,
            sections: initFocusableSections,
            sectionsRefs: sectionsRefs
        };
    }

    useEffect(() => {
        if (sectionsRefs && Object.keys(sectionsRefs).length > 0) {
            keyboardNavState.current.sectionsRefs = sectionsRefs;
        }
    }, [sectionsRefs]);

    const updateFocusableSections = useCallback((newSections, newSectionsRefs = null) => {
        setFocusableSections(newSections);
        keyboardNavState.current.sections = newSections;
        if (newSectionsRefs) {
            keyboardNavState.current.sectionsRefs = newSectionsRefs;
        }
    }, []);

    return { updateFocusableSections };
};
