import { useCallback, useContext } from "react";
import { TTSDBContext, TTSStateContext } from "@/contexts";
import {
    stopAllTTS,
    playAudio,
    saveAudioToDB,
    createTTSAudioErrorHandler,
    fetchTTSFromServer,
    playLocalTTS
} from "@/lib";
import { VOLUME_MAP } from "@/constants";

// 티티에스 프로시저: TTS 재생 및 텍스트 핸들러
// 요구사항:
// 1. 캐시 우선 사용
// 2. 캐시 없으면 외부 엔진 → 캐시 저장
// 3. 외부 엔진 실패 시 재생 중단
// 4. 단일 재생 보장 (isPlaying 플래그)
// 5. 비동기 요청 취소 메커니즘 (빠른 포커스/호버 변경 시 이전 요청 취소)
// 6. Audio 상태 관리 (ttsState 및 ref)
export const playTTS = async (text, speed, vol, ttsDB, ttsState, requestIdRef) => {
    if (!text) return;

    // TTS 재생 관측성: 재생 시작 로그
    if (process.env.NODE_ENV === 'development') {
        const textPreview = text.length > 50 ? text.substring(0, 50) + '...' : text;
        console.log(`🔊 [TTS] 재생 시작: "${textPreview}" (속도: ${speed}, 볼륨: ${vol})`);
    }

    const { isPlaying, setIsPlaying } = ttsState || {};
    const { getFromDB, saveToDB } = ttsDB || {};

    // 요구사항 5: 새 재생 시 이전 TTS 즉시 중단
    stopAllTTS(ttsState);
    // 이전 재생 상태 해제 (새 재생을 위해)
    setIsPlaying(false);

    // 요구사항 4: 단일 재생 보장 (중복 재생 방지)
    // stopAllTTS() 후 즉시 재생 시작하므로 isPlaying 체크는 제거
    setIsPlaying(true);

    // 현재 요청 ID 생성 (빠른 포커스/호버 변경 시 이전 요청 취소를 위해)
    const currentRequestId = Date.now() + Math.random();
    if (requestIdRef) {
        requestIdRef.current = currentRequestId;
    }

    const audioPlayerRef = ttsState?.audioPlayerRef;
    const cacheKey = `audio_${text}`;

    // audioPlayerRef가 없으면 재생 불가능
    if (!audioPlayerRef) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔊 [TTS] 재생 불가능 (audioPlayerRef 없음)`);
        }
        setIsPlaying(false);
        return;
    }

    try {
        // 요구사항 1: 캐시 확인
        const cachedAudio = await getFromDB?.(cacheKey);

        // 요청이 취소되었는지 확인 (새로운 요청이 들어왔는지)
        if (requestIdRef && requestIdRef.current !== currentRequestId) {
            return;
        }

        if (cachedAudio) {
            // 캐시 있으면 캐시 재생
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 캐시에서 재생 (캐시 키: ${cacheKey})`);
            }

            // 요청이 취소되었는지 다시 확인
            if (requestIdRef && requestIdRef.current !== currentRequestId) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`🔊 [TTS] 요청 취소됨 (새 요청 들어옴)`);
                }
                return;
            }

            // React 방식으로 Audio 재생
            playAudio(ttsState, cachedAudio, speed, vol);

            // 에러 처리는 TTSAudioPlayer의 이벤트 리스너에서 처리
            if (audioPlayerRef?.current) {
                const errorHandler = createTTSAudioErrorHandler(requestIdRef, currentRequestId, ttsState, setIsPlaying, '캐시');
                audioPlayerRef.current.addEventListener('error', errorHandler, { once: true });
            }
        } else {
            // 요구사항 2: 캐시 없으면 외부 엔진 시도
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 캐시 없음 → 외부 엔진 요청 중...`);
            }
            const audioUrl = await fetchTTSFromServer(text);

            // 요청이 취소되었는지 확인 (외부 엔진 응답 후)
            if (requestIdRef && requestIdRef.current !== currentRequestId) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`🔊 [TTS] 요청 취소됨 (새 요청 들어옴)`);
                }
                return;
            }

            if (audioUrl) {
                // 외부 엔진 성공: 재생 및 캐시 저장
                if (process.env.NODE_ENV === 'development') {
                    console.log(`🔊 [TTS] 외부 엔진 성공 → 오디오 재생 및 캐시 저장`);
                }
                playAudio(ttsState, audioUrl, speed, vol);

                // 요구사항 2: 캐시에 저장 (비동기)
                fetch(audioUrl)
                    .then(res => res.blob())
                    .then(blob => saveAudioToDB(saveToDB, cacheKey, blob))
                    .catch(() => { });

                // 에러 처리는 TTSAudioPlayer의 이벤트 리스너에서 처리
                if (audioPlayerRef.current) {
                    const errorHandler = createTTSAudioErrorHandler(requestIdRef, currentRequestId, ttsState, setIsPlaying, '외부 엔진');
                    audioPlayerRef.current.addEventListener('error', errorHandler, { once: true });
                }
            } else {
                // 요구사항 3: 외부 엔진 실패 시 로컬 엔진 폴백
                if (!requestIdRef || requestIdRef.current === currentRequestId) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`🔊 [TTS] 외부 엔진 실패 → 로컬 엔진 폴백 시도`);
                    }

                    // 로컬 TTS 엔진으로 폴백
                    const localTTSSuccess = playLocalTTS(text, speed, vol, setIsPlaying);

                    if (!localTTSSuccess) {
                        // 로컬 TTS도 실패하면 재생 중단
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`🔊 [TTS] 로컬 엔진도 실패 → 재생 중단`);
                        }
                        setIsPlaying(false);
                    }
                    // 로컬 TTS 재생 성공 시 isPlaying은 utterance.onend에서 해제됨
                }
            }
        }
    } catch (error) {
        // 에러 시 재생 중단 (요청이 취소되지 않은 경우만)
        if (!requestIdRef || requestIdRef.current === currentRequestId) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔊 [TTS] 에러 발생`, error);
            }
            setIsPlaying(false);
        }
    }
};

// TTS 텍스트 핸들러 훅 (단일책임: TTS 재생 관리만)
// 요구사항: 새 TTS 재생 시 이전 TTS 즉시 중단, 단일 재생 보장

export const useTextHandler = (volume) => {
    const ttsDB = useContext(TTSDBContext) || {};
    const ttsState = useContext(TTSStateContext) || {};
    const initDB = ttsDB?.initDB;

    // 비동기 요청 취소를 위한 요청 ID 추적 (TTSStateContext에서 공유)
    const requestIdRef = ttsState?.requestIdRef;

    // TTS 텍스트 처리 (요구사항 5: 새 재생 시 이전 TTS 즉시 중단)
    const handleText = useCallback((txt, flag = true, newVol = -1) => {
        if (!txt) return;

        // replayText 저장 (필요시)
        if (flag) ttsState?.setReplayText(txt);

        // 요구사항 5: 새 재생 시 이전 TTS 즉시 중단 및 재생
        const vol = newVol !== -1 ? VOLUME_MAP[newVol] : VOLUME_MAP[volume];
        playTTS(txt, 1, vol, ttsDB, ttsState, requestIdRef);
    }, [ttsState, ttsDB, volume, requestIdRef]);

    // TTS 재생 (replayText 재생)
    const handleReplayText = useCallback(() => {
        if (ttsState?.replayText) {
            const vol = VOLUME_MAP[volume];
            playTTS(ttsState.replayText, 1, vol, ttsDB, ttsState, requestIdRef);
        }
    }, [ttsState, ttsDB, volume, requestIdRef]);

    return { initDB, handleText, handleReplayText };
};
