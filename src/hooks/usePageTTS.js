import { useEffect } from 'react';
import { safeQuerySelector } from '../utils/browserCompatibility';
import { TIMER_CONFIG } from '../config/appConfig';

/**
 * 페이지 로드 시 TTS를 자동으로 재생하는 커스텀 훅
 * @param {Function} handleText - TTS 핸들러 함수
 * @param {string} selector - TTS 텍스트를 가져올 요소 선택자
 * @param {number} delay - TTS 재생 전 딜레이 (ms)
 */
export const usePageTTS = (handleText, selector = '.hidden-btn.page-btn', delay = TIMER_CONFIG.TTS_DELAY) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = safeQuerySelector(selector);
      if (element && element.dataset.ttsText) {
        handleText(element.dataset.ttsText);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [handleText, selector, delay]);
};

/**
 * 포커스된 요소의 TTS를 재생하는 커스텀 훅
 * @param {Function} handleText - TTS 핸들러 함수
 * @param {number} delay - TTS 재생 전 딜레이 (ms)
 * @param {boolean} condition - TTS를 재생할 조건 (기본값: true)
 * @param {boolean} shouldBlur - 포커스를 제거할지 여부 (기본값: false)
 */
export const useActiveElementTTS = (handleText, delay = TIMER_CONFIG.TTS_DELAY, condition = true, shouldBlur = false) => {
  useEffect(() => {
    if (!condition) return;

    // 포커스 제거 (필요한 경우)
    if (shouldBlur && typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    const timer = setTimeout(() => {
      if (typeof document !== 'undefined' && document.activeElement) {
        const pageTTS = document.activeElement.dataset.ttsText;
        if (pageTTS) {
          handleText(pageTTS);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [handleText, delay, condition, shouldBlur]);
};

