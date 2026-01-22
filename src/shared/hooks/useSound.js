import { useRef, useEffect, useCallback } from "react";

export const useSound = () => {
    const audioRefs = useRef({});
    const volumeRef = useRef(0.5);
    const globalAudioRefs = useRef(new Set());

    // 컴포넌트 마운트 시 audioRefs 등록, 언마운트 시 제거
    useEffect(() => {
        const refs = audioRefs.current;
        Object.values(refs).forEach(audio => {
            if (audio instanceof Audio) {
                globalAudioRefs.current.add(audio);
            }
        });

        return () => {
            Object.values(refs).forEach(audio => {
                if (audio instanceof Audio) {
                    globalAudioRefs.current.delete(audio);
                }
            });
        };
    }, [globalAudioRefs]);

    const play = useCallback((name) => {
        const src = name === 'onPressed' ? './SoundOnPressed.mp3' : name === 'note' ? './SoundNote.wav' : null;
        if (!src) return;

        // onPressed 사운드는 재생 중단 제외
        if (name !== 'onPressed') {
            // 기존 모든 사운드 중단
            Object.values(audioRefs.current).forEach(audio => {
                if (audio instanceof Audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
        }

        if (!audioRefs.current[name]) {
            const audio = new Audio(src);
            audioRefs.current[name] = audio;
            globalAudioRefs.current.add(audio);

            // 에러 핸들러 추가 (개발 환경 디버깅용)
            audio.addEventListener('error', (e) => {
                console.error(`[사운드] ${name} 재생 실패`, {
                    src,
                    error: e,
                    audioError: audio.error,
                    networkState: audio.networkState,
                    readyState: audio.readyState
                });
            });
        }
        const a = audioRefs.current[name];
        a.volume = volumeRef.current;
        a.currentTime = 0;

        // play() 호출 및 에러 처리
        const playPromise = a.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`[사운드] ${name} 재생 시작`, { src });
                    }
                })
                .catch((error) => {
                    console.error(`[사운드] ${name} 재생 실패`, {
                        src,
                        error,
                        errorName: error.name,
                        errorMessage: error.message
                    });
                });
        }
    }, []);

    const setVolume = useCallback((v) => {
        volumeRef.current = Math.max(0, Math.min(1, v));
    }, []);

    return { play, setVolume };
};
