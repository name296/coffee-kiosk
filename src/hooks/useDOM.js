import { useCallback, useContext } from "react";
import { RefContext } from "../contexts/RefContext";
import { TTSStateContext } from "../contexts/TTSContext";

/**
 * DOM 유틸리티 (에러 방지 및 일관된 포커스 제어)
 */
export const safeQuerySelector = (s, c = null) => {
    try {
        if (typeof document === 'undefined') return null;
        return (c || document).querySelector(s);
    } catch { return null; }
};

export const focusMainElement = () => {
    if (typeof document === 'undefined') return;
    const mainElement = document.querySelector('.main');
    if (mainElement) {
        const prevActive = document.activeElement;
        const prevActiveInfo = prevActive ? {
            tagName: prevActive.tagName,
            className: prevActive.className,
            id: prevActive.id || null
        } : null;

        console.log('[포커스] focusMainElement 호출', {
            from: prevActiveInfo,
            to: { tagName: mainElement.tagName, className: mainElement.className },
            timestamp: new Date().toISOString()
        });

        mainElement.focus();
    }
};

export const useDOM = () => {
    const refsData = useContext(RefContext) || {};
    const ttsState = useContext(TTSStateContext) || {};
    const audioPlayerRef = ttsState?.audioPlayerRef || refsData?.refs?.audioPlayer?.ref;

    const querySelector = useCallback((s, c = null) => safeQuerySelector(s, c), []);

    const getElementById = useCallback((id) => {
        try {
            if (typeof document === 'undefined') return null;
            return document.getElementById(id);
        } catch { return null; }
    }, []);

    const toggleBodyClass = useCallback((className, condition) => {
        if (typeof document === 'undefined') return;
        if (condition) document.body.classList.add(className);
        else document.body.classList.remove(className);
    }, []);

    const blurActiveElement = useCallback(() => {
        if (typeof document !== 'undefined' && document.activeElement?.blur) {
            document.activeElement.blur();
        }
    }, []);

    const focusMain = useCallback(() => {
        // 원천 함수 focusMainElement 사용 (일관성 유지)
        focusMainElement();
    }, []);

    const focusModalContent = useCallback(() => {
        if (typeof document !== 'undefined') {
            // main.modal 클래스를 가진 첫 번째 요소 찾기
            const modalContentElement = document.querySelector('.main.modal');
            if (modalContentElement) {
                const prevActive = document.activeElement;
                const prevActiveInfo = prevActive ? {
                    tagName: prevActive.tagName,
                    className: prevActive.className,
                    id: prevActive.id || null
                } : null;

                // main.modal에 tabindex가 없으면 추가
                if (!modalContentElement.hasAttribute('tabindex')) {
                    modalContentElement.setAttribute('tabindex', '-1');
                }

                console.log('[포커스] focusModalContent 호출', {
                    from: prevActiveInfo,
                    to: { tagName: modalContentElement.tagName, className: modalContentElement.className },
                    timestamp: new Date().toISOString()
                });

                // 항상 포커스 설정 (모달이 열릴 때)
                modalContentElement.focus();
            } else {
                console.log('[포커스] focusModalContent 스킵 (.main.modal 요소 없음)');
            }
        }
    }, []);

    const getActiveElementText = useCallback(() => {
        if (typeof document !== 'undefined' && document.activeElement) {
            const el = document.activeElement;
            const elTts = el.dataset?.ttsText || '';
            const parentTts = el.parentElement?.dataset?.ttsText || '';
            return parentTts + elTts;
        }
        return '';
    }, []);

    const setAudioVolume = useCallback((id, vol) => {
        // 동적 오디오 플레이어 사용 (React 방식)
        if (id === 'audioPlayer') {
            // TTSStateContext를 통해 Audio volume 제어
            if (ttsState?.setAudioVolume) {
                ttsState.setAudioVolume(Math.max(0, Math.min(1, vol)));
            } else {
                // 폴백: 직접 DOM 접근
                const audioPlayer = audioPlayerRef?.current || document.getElementById('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.volume = Math.max(0, Math.min(1, vol));
                }
            }
        } else {
            // 다른 오디오 요소는 기존 방식 유지
            const audio = getElementById(id);
            if (audio && audio instanceof HTMLAudioElement) {
                audio.volume = Math.max(0, Math.min(1, vol));
            }
        }
    }, [getElementById, ttsState, audioPlayerRef]);

    return {
        querySelector,
        getElementById,
        toggleBodyClass,
        blurActiveElement,
        getActiveElementText,
        focusMain,
        focusModalContent,
        setAudioVolume
    };
};
