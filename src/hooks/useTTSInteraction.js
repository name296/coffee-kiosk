
import { useEffect, useContext } from "react";
import { TTSStateContext } from "@/contexts";

// 포커스 인 및 마우스 엔터 시 TTS 재생 핸들러 (단일책임: 포커스 인 및 마우스 엔터 시 TTS 재생만)
export const useInteractiveTTSHandler = (enableGlobalHandlers, finalHandleText) => {
    const ttsState = useContext(TTSStateContext);

    useEffect(() => {
        if (!enableGlobalHandlers) return;

        // 사용자 인터랙션 감지 (키보드, 마우스, 터치)
        const handleUserInteraction = () => {
            if (ttsState && !ttsState.hasUserInteracted && ttsState.setHasUserInteracted) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`🔊 [TTS] 사용자 인터랙션 감지 → TTS 활성화`);
                }
                ttsState.setHasUserInteracted(true);
            }
        };

        // 사용자 인터랙션 이벤트 리스너 등록
        document.addEventListener('keydown', handleUserInteraction, { once: true, passive: true });
        document.addEventListener('mousedown', handleUserInteraction, { once: true, passive: true });
        document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });

        const getHoverTtsTarget = (target) => {
            if (!target) return null;

            const btn = target.closest?.('.button, .button-like');
            if (btn) {
                return { type: 'button', element: btn };
            }

            const panel = target.closest?.('.modal-panel');
            if (panel) {
                const hasHoveringInteractive = panel.querySelector('.button:hover, .button-like:hover, img:hover, [role="button"]:hover');
                if (hasHoveringInteractive) return null;
                return { type: 'container', element: panel };
            }

            const main = target.closest?.('.main');
            if (main) {
                const hasHoveringInteractive = main.querySelector('.button:hover, .button-like:hover, img:hover, [role="button"]:hover');
                if (hasHoveringInteractive) return null;
                return { type: 'container', element: main };
            }

            return null;
        };

        const handleTTS = (e) => {
            const target = e.target;
            if (!target) return;

            // 호버 이벤트: 호버 스타일 대상에 대해서만 TTS 재생
            if (e.type === 'mouseover') {
                const hoverTarget = getHoverTtsTarget(target);
                if (!hoverTarget) return;

                if (hoverTarget.type === 'button') {
                    const btn = hoverTarget.element;
                    const btnTts = btn.dataset?.ttsText || '';
                    if (btnTts) {
                        finalHandleText(btnTts);
                    }
                    return;
                }

                if (hoverTarget.type === 'container') {
                    const elementTts = hoverTarget.element.dataset?.ttsText || '';
                    if (elementTts) {
                        finalHandleText(elementTts);
                    }
                    return;
                }
            }

            // 버튼인 경우
            const btn = target.closest?.('.button, .button-like');
            if (btn) {
                const btnTts = btn.dataset?.ttsText || '';
                if (btnTts) {
                    finalHandleText(btnTts);
                }
                return;
            }

            // 버튼이 아닌 경우: 섹션(data-tts-text) 자신이 포커스되면 부모 진입 컨텍스트 재생
            if (e.type === 'focusin' && target.matches?.('[data-tts-text]')) {
                const elementTts = target.dataset?.ttsText || '';
                if (elementTts) {
                    finalHandleText(elementTts);
                }
                return;
            }

            // 버튼이 아닌 경우: .main / .modal-panel 자신이 포커스됐을 때만 재생
            const container = target.closest?.('.main, .modal-panel');
            if (container && container === target) {
                const elementTts = container.dataset?.ttsText || '';
                if (elementTts) {
                    finalHandleText(elementTts);
                }
            }
        };

        // 포커스 인 이벤트 (키보드 네비게이션)
        document.addEventListener('focusin', handleTTS, true);
        // 마우스 오버 이벤트 (마우스 호버)
        document.addEventListener('mouseover', handleTTS, true);

        return () => {
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('mousedown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('focusin', handleTTS, true);
            document.removeEventListener('mouseover', handleTTS, true);
        };
    }, [enableGlobalHandlers, finalHandleText, ttsState]);
};
