// ============================================================================
// 사운드 훅
// 사운드 파일을 React 방식으로 관리
// ============================================================================

import { useRef, useCallback } from 'react';
// 사운드 맵 (정적 경로 사용 - 번들러 중복 방지)
const SOUNDS = {
  onPressed: './sounds/onPressed.mp3',
  note: './sounds/note.wav',
};

// 기본 볼륨
const DEFAULT_VOLUME = 0.5;

/**
 * 사운드 재생 훅
 * @returns {Object} { play, setVolume }
 */
export const useSound = () => {
  const audioRefs = useRef({});
  const volumeRef = useRef(DEFAULT_VOLUME);

  // 사운드 재생
  const play = useCallback((name) => {
    const soundSrc = SOUNDS[name];
    if (!soundSrc) {
      console.warn(`⚠️ Sound "${name}" not found`);
      return;
    }

    // 캐시된 Audio 객체 사용 또는 새로 생성
    if (!audioRefs.current[name]) {
      audioRefs.current[name] = new Audio(soundSrc);
    }

    const audio = audioRefs.current[name];
    audio.volume = volumeRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // 자동재생 정책으로 인한 에러 무시
    });
  }, []);

  // 볼륨 설정
  const setVolume = useCallback((volume) => {
    volumeRef.current = Math.max(0, Math.min(1, volume));
  }, []);

  return { play, setVolume };
};

export default useSound;

