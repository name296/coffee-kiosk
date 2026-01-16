import React, { createContext, useState, useCallback, useMemo, useRef, useContext, useEffect, memo } from "react";

// TTS Database Context - IndexedDB 관리 (TTS 오디오 파일 캐싱)
// 레벨: 서버 상태/데이터 레벨
// 의존성: 없음 (독립)
// 사용처: useTextHandler, ScreenStart (직접), Screen 컴포넌트들 (간접)
// 제공 값: db, initDB, getFromDB, saveToDB
// Provider 위치: 최상위, ScreenRouteProvider보다 바깥 (TTSDBProvider)
export const TTSDBContext = createContext();

// TTS State Context - TTS 재생 상태 관리
// 레벨: 서버 상태/데이터 레벨
// 의존성: 없음 (독립, 하지만 useTextHandler가 TTSDBContext와 함께 사용)
// 사용처: useTextHandler, TTSAudioPlayer, Screen 컴포넌트들 (간접)
// 제공 값: isPlaying, setIsPlaying, replayText, setReplayText, requestIdRef, audioSrc, setAudioSrc, audioPlaybackRate, setAudioPlaybackRate, audioVolume, setAudioVolume, shouldPlay, setShouldPlay, audioPlayerRef, hasUserInteracted, setHasUserInteracted
// Provider 위치: TTSDBProvider 내부, ScreenRouteProvider보다 바깥 (TTSStateProvider)
export const TTSStateContext = createContext();

// TTS Audio Player 컴포넌트 (React 방식으로 TTS 재생 관리)
// 의존성: TTSStateContext
// 사용처: TTSStateProvider 내부 (Provider 안에서 Context 사용, JSX 방식)
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

export const TTSDBProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const dbName = 'TTSDatabase';
    const storeName = 'TTSStore';

    const initDB = useCallback(() => {
        return new Promise((res, rej) => {
            if (db) {
                res(db);
                return;
            }
            const r = indexedDB.open(dbName, 1);
            r.onerror = (e) => rej(e.target.errorCode);
            r.onsuccess = (e) => {
                const database = e.target.result;
                setDb(database);
                res(database);
            };
            r.onupgradeneeded = (e) => {
                const database = e.target.result;
                database.createObjectStore(storeName, { keyPath: 'key' });
                setDb(database);
            };
        });
    }, [db]);

    const getFromDB = useCallback(async (k) => {
        const database = db || await initDB();
        return new Promise((r) => {
            const t = database.transaction([storeName], 'readonly');
            const req = t.objectStore(storeName).get(k);
            req.onsuccess = (e) => r(e.target.result?.data || null);
            req.onerror = () => r(null);
        });
    }, [db, initDB]);

    const saveToDB = useCallback(async (k, d) => {
        const database = db || await initDB();
        return new Promise((r) => {
            const t = database.transaction([storeName], 'readwrite');
            t.objectStore(storeName).put({ key: k, data: d });
            t.oncomplete = r;
        });
    }, [db, initDB]);

    const value = useMemo(() => ({
        db,
        initDB,
        getFromDB,
        saveToDB
    }), [db, initDB, getFromDB, saveToDB]);

    return (
        <TTSDBContext.Provider value={value}>
            {children}
        </TTSDBContext.Provider>
    );
};
export const useTTSDB = () => {
    const context = useContext(TTSDBContext);
    return {
        db: context?.db ?? null,
        initDB: context?.initDB ?? (async () => null),
        getFromDB: context?.getFromDB ?? (async () => null),
        saveToDB: context?.saveToDB ?? (async () => { })
    };
};

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
        audioSrc,
        setAudioSrc,
        audioPlaybackRate,
        setAudioPlaybackRate,
        audioVolume,
        setAudioVolume,
        shouldPlay,
        setShouldPlay,
        audioPlayerRef,
        hasUserInteracted,
        setHasUserInteracted
    }), [isPlaying, replayText, audioSrc, audioPlaybackRate, audioVolume, shouldPlay, hasUserInteracted]);

    // 오디오 플레이어 ref 연결은 TTSAudioPlayer 컴포넌트에서 처리

    return (
        <TTSStateContext.Provider value={value}>
            {/* TTSAudioPlayer는 포커스 기반 TTS용 (이니셜 TTS는 Run 컴포넌트 최상위의 audioPlayer 사용) */}
            <TTSAudioPlayer />
            {children}
        </TTSStateContext.Provider>
    );
};
export const useTTSState = () => {
    const context = useContext(TTSStateContext);
    return {
        isPlaying: context?.isPlaying ?? false,
        setIsPlaying: context?.setIsPlaying ?? (() => { }),
        replayText: context?.replayText ?? '',
        setReplayText: context?.setReplayText ?? (() => { }),
        audioSrc: context?.audioSrc ?? '',
        setAudioSrc: context?.setAudioSrc ?? (() => { }),
        audioPlaybackRate: context?.audioPlaybackRate ?? 1,
        setAudioPlaybackRate: context?.setAudioPlaybackRate ?? (() => { }),
        audioVolume: context?.audioVolume ?? 1,
        setAudioVolume: context?.setAudioVolume ?? (() => { }),
        shouldPlay: context?.shouldPlay ?? false,
        setShouldPlay: context?.setShouldPlay ?? (() => { }),
        audioPlayerRef: context?.audioPlayerRef,
        hasUserInteracted: context?.hasUserInteracted ?? false,
        setHasUserInteracted: context?.setHasUserInteracted ?? (() => { })
    };
};
