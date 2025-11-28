/**
 * 포커스 트랩 훅
 * 모달/다이얼로그에서 Tab 키로 포커스가 외부로 나가지 않도록 함
 */
import { useEffect, useRef, useCallback } from "react";

// 포커스 가능한 요소 선택자
const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * 포커스 트랩 훅
 * @param {boolean} isActive - 트랩 활성화 여부
 * @param {Object} options - 옵션
 * @param {boolean} options.autoFocus - 활성화 시 첫 번째 요소에 자동 포커스 (기본: true)
 * @param {boolean} options.restoreFocus - 비활성화 시 이전 포커스 복원 (기본: true)
 * @returns {{ containerRef: React.RefObject }}
 */
export const useFocusTrap = (isActive, options = {}) => {
  const { 
    autoFocus = true, 
    restoreFocus = true 
  } = options;
  
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  // 포커스 가능한 요소들 가져오기
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS)
    ).filter(el => {
      // 숨겨진 요소 제외
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }, []);

  // 첫 번째 포커스 가능한 요소로 포커스 이동
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  // 마지막 포커스 가능한 요소로 포커스 이동
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      // Shift + Tab (뒤로 이동)
      if (e.shiftKey) {
        if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
          e.preventDefault();
          focusLast();
        }
      } 
      // Tab (앞으로 이동)
      else {
        if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
          e.preventDefault();
          focusFirst();
        }
      }
    };

    // Escape 키로 포커스 트랩 내 첫 요소로 이동 (선택적)
    const handleEscape = (e) => {
      if (e.key === 'Escape' && containerRef.current?.contains(document.activeElement)) {
        focusFirst();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActive, getFocusableElements, focusFirst, focusLast]);

  // 활성화 시 이전 포커스 저장 & 자동 포커스
  useEffect(() => {
    if (isActive) {
      // 이전 포커스 저장
      previousActiveElement.current = document.activeElement;
      
      // 자동 포커스
      if (autoFocus) {
        // 약간의 지연 후 포커스 (애니메이션 대기)
        const timer = setTimeout(() => {
          focusFirst();
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      // 비활성화 시 이전 포커스 복원
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isActive, autoFocus, restoreFocus, focusFirst]);

  // 컨테이너 외부 클릭 시 포커스를 컨테이너 내부로 되돌림
  useEffect(() => {
    if (!isActive) return;

    const handleFocusOut = (e) => {
      // 포커스가 컨테이너 외부로 나가려고 할 때
      if (
        containerRef.current && 
        !containerRef.current.contains(e.relatedTarget) &&
        e.relatedTarget !== null
      ) {
        e.preventDefault();
        focusFirst();
      }
    };

    containerRef.current?.addEventListener('focusout', handleFocusOut);
    
    return () => {
      containerRef.current?.removeEventListener('focusout', handleFocusOut);
    };
  }, [isActive, focusFirst]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    getFocusableElements,
  };
};

export default useFocusTrap;

