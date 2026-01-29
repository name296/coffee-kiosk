// 오디오 중단 유틸리티 함수 (단일책임원칙: 각 오디오 타입별로 분리)
// ============================================================================

// 볼륨 매핑 상수 (중복 제거)
export const VOLUME_MAP = { 0: 0, 1: 0.5, 2: 0.75, 3: 1 };

// 모든 TTS 즉시 중단 (단일책임: 모든 TTS 중단만)
// 요구사항: 새 TTS 재생 시 이전 TTS 즉시 중단
// React 방식: TTSStateContext를 통해 Audio 제어
export const stopAllTTS = (ttsState) => {
    // 오디오 플레이어 중단 (React 방식)
    if (ttsState?.audioPlayerRef?.current) {
        const audioPlayer = ttsState.audioPlayerRef.current;
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }

    // 로컬 TTS 중단 (speechSynthesis)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // React state 이니셜
    if (ttsState?.setAudioSrc) ttsState.setAudioSrc('');
    if (ttsState?.setShouldPlay) ttsState.setShouldPlay(false);
    if (ttsState?.setIsPlaying) ttsState.setIsPlaying(false);

};

// 오디오 재생 (단일책임: 오디오 재생만)
export const playAudio = (ttsState, audioUrl, speed, volume) => {
    if (!ttsState || !audioUrl) return;

    ttsState.setAudioSrc?.(audioUrl);
    ttsState.setAudioPlaybackRate?.(speed);
    ttsState.setAudioVolume?.(volume);
    ttsState.setShouldPlay?.(true);
};

// 오디오를 DB에 저장 (단일책임: DB 저장만)
export const saveAudioToDB = async (saveToDB, key, blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            await saveToDB(key, reader.result);
            resolve();
        };
    });
};

// TTS 오디오 에러 핸들러 생성 (중복 제거)
export const createTTSAudioErrorHandler = (requestIdRef, currentRequestId, ttsState, setIsPlaying, source = '') => {
    return () => {
        if (!requestIdRef || requestIdRef.current !== currentRequestId) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 오디오 에러 핸들러: 요청 취소됨`);
            }
            return;
        }
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔊 [TTS] 오디오 에러 발생${source ? ` (${source})` : ''}`);
        }
        if (ttsState?.setAudioSrc) ttsState.setAudioSrc('');
        if (ttsState?.setShouldPlay) ttsState.setShouldPlay(false);
        if (setIsPlaying) setIsPlaying(false);
    };
};

// 외부 TTS 엔진 요청 (단일책임: 외부 엔진 전문 송수신만)
export const fetchTTSFromServer = async (text) => {
    try {
        const response = await fetch('http://gtts.tovair.com:5000/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (response.status !== 201) return null;

        const data = await response.json();
        const fileResponse = await fetch(`http://gtts.tovair.com:5000/api/download/${data.filename}`);

        if (!fileResponse.ok) return null;

        const blob = await fileResponse.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        return null;
    }
};

// 로컬 TTS 엔진 (브라우저 speechSynthesis API 사용) (단일책임: 로컬 TTS 재생만)
export const playLocalTTS = (text, speed, volume, setIsPlaying) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔊 [TTS] 로컬 엔진 사용 불가능 (speechSynthesis 없음)`);
        }
        return false;
    }

    try {
        // 이전 로컬 TTS 중단
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.volume = volume;
        utterance.lang = 'ko-KR'; // 한국어 설정

        // 재생 완료 시 isPlaying 해제
        utterance.onend = () => {
            if (setIsPlaying) setIsPlaying(false);
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 로컬 엔진 재생 완료`);
            }
        };

        // 에러 시 isPlaying 해제
        utterance.onerror = (error) => {
            if (setIsPlaying) setIsPlaying(false);
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 로컬 엔진 에러:`, error);
            }
        };

        // 로컬 TTS 재생
        window.speechSynthesis.speak(utterance);

        if (process.env.NODE_ENV === 'development') {
            console.log(`🔊 [TTS] 로컬 엔진 재생 시작: "${text.substring(0, 50)}..." (속도: ${speed}, 볼륨: ${volume})`);
        }

        return true;
    } catch (error) {
        if (setIsPlaying) setIsPlaying(false);
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔊 [TTS] 로컬 엔진 에러:`, error);
        }
        return false;
    }
};