import { useCallback } from 'react';
import { safeQuerySelector } from '../utils/browserCompatibility';

/**
 * 안전한 document 조작을 위한 커스텀 훅
 * 대원칙: 직접 DOM 조작 대신 이 훅을 통해 안전하게 접근
 */
export const useSafeDocument = () => {
  /**
   * 안전한 querySelector
   */
  const querySelector = useCallback((selector) => {
    return safeQuerySelector(selector);
  }, []);

  /**
   * 안전한 getElementById
   */
  const getElementById = useCallback((id) => {
    if (typeof document === 'undefined') return null;
    return document.getElementById(id);
  }, []);

  /**
   * body에 클래스 추가/제거
   */
  const toggleBodyClass = useCallback((className, condition) => {
    if (typeof document === 'undefined') return;
    
    if (condition) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }, []);

  /**
   * activeElement blur
   */
  const blurActiveElement = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement) {
      document.activeElement.blur();
    }
  }, []);

  /**
   * activeElement의 data-tts-text 속성 가져오기
   */
  const getActiveElementText = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement) {
      return document.activeElement.dataset.ttsText || null;
    }
    return null;
  }, []);

  /**
   * 오디오 요소 볼륨 설정
   */
  const setAudioVolume = useCallback((audioId, volume) => {
    if (typeof document === 'undefined') return;
    const audio = document.getElementById(audioId);
    if (audio) {
      audio.volume = volume;
    }
  }, []);

  return {
    querySelector,
    getElementById,
    toggleBodyClass,
    blurActiveElement,
    getActiveElementText,
    setAudioVolume,
  };
};

