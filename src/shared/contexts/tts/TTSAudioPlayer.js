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

    // 포커스 기반 TTS는 Run 컴포넌트 최상위의 audioPlayer 사용 (과거 앱 방식)
    // TTSAudioPlayer는 ref만 연결하고 실제 audio 요소는 렌더링하지 않음
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

        // src 설정
        if (src) {
            audio.src = src;
        }

        // playbackRate와 volume 설정
        audio.playbackRate = playbackRate;
        audio.volume = volume;

        // shouldPlay에 따라 autoplay 속성 설정
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

    // TTSAudioPlayer는 실제 audio 요소를 렌더링하지 않음 (Run 컴포넌트의 audioPlayer 사용)
    return null;
});
TTSAudioPlayer.displayName = 'TTSAudioPlayer';

export default TTSAudioPlayer;
