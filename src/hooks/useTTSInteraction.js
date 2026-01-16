import { useEffect, useContext, useRef } from "react";
import { TTSStateContext } from "../contexts/TTSContext";

// 이전 버튼의 부모 요소를 저장하는 전역 ref (같은 부모 안에서 버튼 변경 시 부모 TTS 재생 방지)
const prevButtonParentRef = { current: null };
// 이전 TTS 텍스트 저장 (중복 실행 방지)
const prevTtsTextRef = { current: '' };
const lastTtsTimeRef = { current: 0 };

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

        const handleTTS = (e) => {
            const target = e.target;
            if (!target) return;

            // 같은 요소에 대한 중복 실행 방지 (200ms 이내)
            const now = Date.now();
            if (now - lastTtsTimeRef.current < 200) return;
            lastTtsTimeRef.current = now;

            // 버튼인 경우
            const btn = target.closest?.('.button');
            if (btn) {
                // 현재 버튼의 부모 요소 찾기
                const currentParent = btn.parentElement?.closest('[data-tts-text]');
                const isSameParent = prevButtonParentRef.current && currentParent && prevButtonParentRef.current === currentParent;

                // 같은 부모 안에서 버튼이 바뀌면 부모 TTS 재생하지 않음
                const parentTts = isSameParent ? '' : (currentParent?.dataset?.ttsText || '');
                const btnTts = btn.dataset?.ttsText || '';
                const ttsText = parentTts + btnTts;

                // 이전과 같은 텍스트면 재생하지 않음
                if (ttsText && ttsText !== prevTtsTextRef.current) {
                    prevTtsTextRef.current = ttsText;
                    finalHandleText(ttsText);
                }

                // 현재 부모를 이전 부모로 저장
                prevButtonParentRef.current = currentParent;
                return;
            }

            // 버튼이 아닌 경우: data-tts-text가 있는 요소인지 확인 (예: .main)
            const elementTts = target.dataset?.ttsText || '';
            if (elementTts && elementTts !== prevTtsTextRef.current) {
                prevTtsTextRef.current = elementTts;
                finalHandleText(elementTts);
                // .main 같은 경우는 부모가 없으므로 prevButtonParentRef를 null로 설정
                prevButtonParentRef.current = null;
            }
        };

        // 포커스 인 이벤트 (키보드 네비게이션)
        document.addEventListener('focusin', handleTTS, true);
        // 마우스 엔터 이벤트 (마우스 호버)
        document.addEventListener('mouseenter', handleTTS, true);

        return () => {
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('mousedown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('focusin', handleTTS, true);
            document.removeEventListener('mouseenter', handleTTS, true);
        };
    }, [enableGlobalHandlers, finalHandleText, ttsState]);
};
