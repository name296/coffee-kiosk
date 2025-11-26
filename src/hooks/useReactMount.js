// ============================================================================
// React 마운트 커스텀 훅
// ============================================================================

import { useCallback, useRef, useEffect } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * React 컴포넌트를 DOM에 마운트하고 관리하는 커스텀 훅
 */
export const useReactMount = () => {
  const mountedRootsRef = useRef(new Map());

  /**
   * React 컴포넌트를 DOM 요소에 마운트
   */
  const mountComponent = useCallback((Component, container, props = {}) => {
    // 기존에 마운트된 root가 있으면 제거
    const existingRoot = mountedRootsRef.current.get(container);
    if (existingRoot) {
      try {
        existingRoot.unmount();
      } catch (error) {
        console.warn('Error unmounting previous root:', error);
      }
      mountedRootsRef.current.delete(container);
    }

    // 컨테이너가 DOM에 연결되어 있는지 확인
    if (!container.isConnected) {
      console.warn('⚠️ [mountComponent] Container is not connected to DOM, cannot mount React component');
      console.warn('   Tip: Use requestAnimationFrame after inserting element to DOM');
      return null;
    }

    try {
      // React 18의 createRoot 사용
      const root = createRoot(container);
      root.render(React.createElement(Component, props));

      // 나중에 unmount할 수 있도록 저장
      mountedRootsRef.current.set(container, root);

      return {
        root,
        unmount: () => {
          try {
            root.unmount();
            mountedRootsRef.current.delete(container);
          } catch (error) {
            console.warn('Error unmounting root:', error);
          }
        },
      };
    } catch (error) {
      console.error('Error mounting React component:', error);
      return null;
    }
  }, []);

  /**
   * 특정 컨테이너의 컴포넌트 언마운트
   */
  const unmountComponent = useCallback((container) => {
    const root = mountedRootsRef.current.get(container);
    if (root) {
      try {
        root.unmount();
        mountedRootsRef.current.delete(container);
      } catch (error) {
        console.warn('Error unmounting component:', error);
      }
    }
  }, []);

  /**
   * 모든 마운트된 컴포넌트 언마운트
   */
  const unmountAll = useCallback(() => {
    mountedRootsRef.current.forEach((root, container) => {
      try {
        root.unmount();
      } catch (error) {
        console.warn('Error unmounting root:', error);
      }
    });
    mountedRootsRef.current.clear();
  }, []);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      unmountAll();
    };
  }, [unmountAll]);

  return {
    mountComponent,
    unmountComponent,
    unmountAll,
  };
};


