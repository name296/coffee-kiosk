import { useCallback, useContext } from "react";
import { TTSStateContext } from "../contexts";

/**
 * DOM 유틸리티 (에러 방지 및 일관된 포커스 제어)
 */
export const safeQuerySelector = (s, c = null) => {
    try {
        if (typeof document === 'undefined') return null;
        return (c || document).querySelector(s);
    } catch { return null; }
};

export const focusWithRefire = (el) => {
    if (!el) return;
    if (document.activeElement === el && el.blur) el.blur();
    requestAnimationFrame(() => el.focus());
};

export const focusMainElement = () => {
    if (typeof document === 'undefined') return;
    const mainElement = document.querySelector('.process .main');
    if (mainElement) {
        const prevActive = document.activeElement;
        if (prevActive === mainElement && prevActive?.blur) {
            prevActive.blur();
        }
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
    const ttsState = useContext(TTSStateContext) || {};

    const setAudioVolume = useCallback((id, vol) => {
        if (id === 'audioPlayer') {
            if (ttsState?.setAudioVolume) {
                ttsState.setAudioVolume(Math.max(0, Math.min(1, vol)));
            } else {
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer) audioPlayer.volume = Math.max(0, Math.min(1, vol));
            }
        } else {
            const audio = document.getElementById(id);
            if (audio && audio instanceof HTMLAudioElement) {
                audio.volume = Math.max(0, Math.min(1, vol));
            }
        }
    }, [ttsState]);

    return { setAudioVolume };
};
