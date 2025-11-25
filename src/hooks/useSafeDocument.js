import { useEffect, useCallback } from 'react';
import { safeQuerySelector, safeAddEventListener } from '../utils/browserCompatibility';

/**
 * 안전한 document 조작을 위한 커스텀 훅
 */
export const useSafeDocument = () => {
  /**
   * 안전한 querySelector
   */
  const querySelector = useCallback((selector) => {
    return safeQuerySelector(selector);
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

  return {
    querySelector,
    toggleBodyClass,
    blurActiveElement,
    getActiveElementText,
  };
};

