// ============================================================================
// CSS 인젝터 커스텀 훅
// ============================================================================

import { useCallback, useEffect, useRef } from 'react';

/**
 * CSS를 동적으로 주입하고 관리하는 커스텀 훅
 */
export const useCSSInjector = () => {
  const injectedStylesRef = useRef(new Set());

  /**
   * CSS를 동적으로 주입
   */
  const inject = useCallback((id, content) => {
    const existingStyle = document.getElementById(id);
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.textContent = content;
    document.head.appendChild(styleElement);

    injectedStylesRef.current.add(id);
  }, []);

  /**
   * 특정 ID의 CSS 제거
   */
  const remove = useCallback((id) => {
    const existingStyle = document.getElementById(id);
    if (existingStyle) {
      existingStyle.remove();
      injectedStylesRef.current.delete(id);
    }
  }, []);

  /**
   * 모든 주입된 CSS 제거
   */
  const removeAll = useCallback(() => {
    injectedStylesRef.current.forEach((id) => {
      const styleElement = document.getElementById(id);
      if (styleElement) {
        styleElement.remove();
      }
    });
    injectedStylesRef.current.clear();
  }, []);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      removeAll();
    };
  }, [removeAll]);

  return {
    inject,
    remove,
    removeAll,
  };
};


