import { useEffect } from "react";
import { getFocusableElements } from "./useFocusManagement";

// 키보드 네비게이션 핸들러 (단일책임: 방향키 네비게이션만)
// 스크린과 모달 모두에서 일관된 포커스 이동 경로 제공
export const useKeyboardNavigationHandler = (enableGlobalHandlers, enableKeyboardNavigation) => {
    useEffect(() => {
        if (!enableKeyboardNavigation) return;

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
            const modalContentElement = document.querySelector('.main.modal');
            const isModalOpen = modalContentElement && window.getComputedStyle(modalContentElement).display !== 'none';

            // 좌우 방향키: 모든 포커스 가능한 개체를 선형으로 탐색 (부모 관계 없이, .main 포함)
            if (key === 'ArrowLeft' || key === 'ArrowRight') {
                // 모달이 열려있으면 모달 안의 요소만, 아니면 전체 요소 (.main 포함)
                const allFocusable = getFocusableElements();
                const focusableElements = isModalOpen
                    ? allFocusable.filter(el => {
                        return modalContentElement.contains(el) || el === modalContentElement;
                    })
                    : allFocusable; // 스크린일 때는 전체 요소 (.main 포함)

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
                // 모달이 열려있으면 모달 안의 요소만, 아니면 전체 요소
                const allFocusable = getFocusableElements();
                // .main 제외 (버튼들만)
                const focusableButtons = (isModalOpen
                    ? allFocusable.filter(el => {
                        return modalContentElement.contains(el) || el === modalContentElement;
                    })
                    : allFocusable).filter(el => !el.classList.contains('main'));

                if (focusableButtons.length === 0) {
                    return;
                }

                const currentIndex = focusableButtons.indexOf(activeEl);
                if (currentIndex === -1) {
                    focusableButtons[0]?.focus();
                    return;
                }

                const currentParent = activeEl.closest('[data-tts-text]');
                if (!currentParent) {
                    return;
                }

                // 부모가 바뀌는 지점 찾기 (단순 로직)
                let targetElement = null;
                if (key === 'ArrowDown') {
                    // 다음 부모로 이동: 현재 인덱스 이후에서 부모가 다른 첫 번째 요소
                    for (let i = currentIndex + 1; i < focusableButtons.length; i++) {
                        const el = focusableButtons[i];
                        const elParent = el.closest('[data-tts-text]');
                        if (elParent && elParent !== currentParent) {
                            targetElement = el;
                            break;
                        }
                    }
                    // 마지막까지 찾지 못하면 첫 번째 다른 부모로 순환
                    if (!targetElement) {
                        for (let i = 0; i < currentIndex; i++) {
                            const el = focusableButtons[i];
                            const elParent = el.closest('[data-tts-text]');
                            if (elParent && elParent !== currentParent) {
                                targetElement = el;
                                break;
                            }
                        }
                    }
                } else {
                    // 이전 부모로 이동: 현재 인덱스 이전에서 부모가 다른 첫 번째 요소
                    for (let i = currentIndex - 1; i >= 0; i--) {
                        const el = focusableButtons[i];
                        const elParent = el.closest('[data-tts-text]');
                        if (elParent && elParent !== currentParent) {
                            targetElement = el;
                            break;
                        }
                    }
                    // 처음까지 찾지 못하면 마지막 다른 부모로 순환
                    if (!targetElement) {
                        for (let i = focusableButtons.length - 1; i > currentIndex; i--) {
                            const el = focusableButtons[i];
                            const elParent = el.closest('[data-tts-text]');
                            if (elParent && elParent !== currentParent) {
                                targetElement = el;
                                break;
                            }
                        }
                    }
                }

                if (!targetElement) {
                    return;
                }

                targetElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [enableGlobalHandlers, enableKeyboardNavigation]);
};
