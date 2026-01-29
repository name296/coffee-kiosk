import React, { memo, useContext, useEffect } from "react";
import { TTSStateContext } from "./TTSStateContext";

// TTS Audio Player 컴포넌트 (React 방식으로 TTS 재생 관리)
const TTSAudioPlayer = memo(() => {
    const ttsState = useContext(TTSStateContext);
    const audioPlayerRef = ttsState?.audioPlayerRef;

    // React state로 Audio 제어
    const src = ttsState?.audioSrc ?? '';
    const playbackRate = ttsState?.audioPlaybackRate ?? 1;
    const volume = ttsState?.audioVolume ?? 1;
    const shouldPlay = ttsState?.shouldPlay ?? false;
    const setIsPlaying = ttsState?.setIsPlaying;

    // App 최상위의 audioPlayer 요소에 ref 연결
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const existingAudio = document.getElementById('audioPlayer');
        if (existingAudio && audioPlayerRef) {
            audioPlayerRef.current = existingAudio;
        }
    }, [audioPlayerRef]);

    // 통합된 Audio 제어: src, playbackRate, volume, shouldPlay 설정
    useEffect(() => {
        if (!audioPlayerRef?.current) return;
        const audio = audioPlayerRef.current;

        if (src) {
            audio.src = src;
        }

        audio.playbackRate = playbackRate;
        audio.volume = volume;

        if (shouldPlay && src) {
            audio.setAttribute('autoplay', 'autoplay');
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 오디오 autoplay 속성 설정: ${src.substring(0, 60)}...`);
            }
        } else {
            audio.removeAttribute('autoplay');
        }
    }, [src, playbackRate, volume, shouldPlay, audioPlayerRef]);

    // 재생 시작/에러 감지 (autoplay로 재생 시작됨)
    useEffect(() => {
        if (!audioPlayerRef?.current || !src || !shouldPlay) return;

        const audio = audioPlayerRef.current;

        const handlePlay = () => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 오디오 재생 시작 (autoplay)`);
            }
            if (setIsPlaying) setIsPlaying(true);
        };

        const handleError = (error) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 오디오 재생 실패:`, error);
            }
            if (setIsPlaying) setIsPlaying(false);
            if (ttsState?.setShouldPlay) ttsState.setShouldPlay(false);
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('error', handleError);
        };
    }, [shouldPlay, src, audioPlayerRef, setIsPlaying, ttsState]);

    // 재생 완료 이벤트 처리
    useEffect(() => {
        if (!audioPlayerRef?.current) return;

        const audio = audioPlayerRef.current;

        const handleEnded = () => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 오디오 재생 완료`);
            }
            if (setIsPlaying) setIsPlaying(false);
            if (ttsState?.setShouldPlay) ttsState.setShouldPlay(false);
        };

        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioPlayerRef, setIsPlaying, ttsState]);

    // 실제 audio 요소는 App에서 렌더링, 여기서는 ref만 연결
    return null;
});
TTSAudioPlayer.displayName = 'TTSAudioPlayer';

export default TTSAudioPlayer;
