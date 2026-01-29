import React, { createContext, useState, useMemo, useRef } from "react";
import TTSAudioPlayer from "./TTSAudioPlayer";

// TTS State Context - TTS 재생 상태 관리
export const TTSStateContext = createContext(null);

export const TTSStateProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [replayText, setReplayText] = useState('');
    // Audio 컴포넌트를 위한 React state
    const [audioSrc, setAudioSrc] = useState('');
    const [audioPlaybackRate, setAudioPlaybackRate] = useState(1);
    const [audioVolume, setAudioVolume] = useState(1);
    const [shouldPlay, setShouldPlay] = useState(false);
    // 사용자 인터랙션 플래그 (브라우저 자동 재생 정책 대응)
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    // 비동기 요청 취소를 위한 요청 ID 추적 (모달과 스크린 간 공유)
    const requestIdRef = useRef(null);
    const audioPlayerRef = useRef(null);

    const value = useMemo(() => ({
        isPlaying,
        setIsPlaying,
        replayText,
        setReplayText,
        requestIdRef,
        audioPlayerRef,
        audioSrc,
        setAudioSrc,
        audioPlaybackRate,
        setAudioPlaybackRate,
        audioVolume,
        setAudioVolume,
        shouldPlay,
        setShouldPlay,
        hasUserInteracted,
        setHasUserInteracted
    }), [isPlaying, replayText, audioSrc, audioPlaybackRate, audioVolume, shouldPlay, hasUserInteracted]);

    return (
        <TTSStateContext.Provider value={value}>
            <TTSAudioPlayer />
            {children}
        </TTSStateContext.Provider>
    );
};
