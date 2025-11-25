/**
 * React 컴포넌트를 DOM에 마운트하는 유틸리티
 * 순수 JavaScript 환경에서 React 컴포넌트를 사용하기 위한 헬퍼
 */
import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * React 컴포넌트를 DOM 요소에 마운트
 * @param {React.Component} Component - 마운트할 React 컴포넌트
 * @param {HTMLElement} container - 마운트할 DOM 요소
 * @param {Object} props - 컴포넌트에 전달할 props
 * @returns {Object} - { root, unmount } - root와 unmount 함수
 */
export function mountReactComponent(Component, container, props = {}) {
  // 기존에 마운트된 root가 있으면 제거
  if (container._reactRoot) {
    try {
      container._reactRoot.unmount();
    } catch (error) {
      console.warn('Error unmounting previous root:', error);
    }
    container._reactRoot = null;
  }

  // 컨테이너가 DOM에 연결되어 있는지 확인
  // 주의: 새로 생성된 요소는 즉시 마운트할 수 없으므로, 호출하는 쪽에서 requestAnimationFrame 사용 권장
  if (!container.isConnected) {
    console.warn('⚠️ [mountReactComponent] Container is not connected to DOM, cannot mount React component');
    console.warn('   Tip: Use requestAnimationFrame after inserting element to DOM');
    return null;
  }

  try {
    // React 18의 createRoot 사용
    const root = createRoot(container);
    root.render(React.createElement(Component, props));
    
    // 나중에 unmount할 수 있도록 저장
    container._reactRoot = root;
    
    return {
      root,
      unmount: () => {
        try {
          root.unmount();
          container._reactRoot = null;
        } catch (error) {
          console.warn('Error unmounting root:', error);
        }
      }
    };
  } catch (error) {
    console.error('Error mounting React component:', error);
    return null;
  }
}

/**
 * React 컴포넌트를 문자열로 렌더링 (SSR 스타일)
 * 주의: 이 방법은 제한적이며, 완전한 React 기능을 사용할 수 없음
 * @param {React.Component} Component - 렌더링할 React 컴포넌트
 * @param {Object} props - 컴포넌트에 전달할 props
 * @returns {string} - HTML 문자열
 */
export function renderReactComponentToString(Component, props = {}) {
  // 이 방법은 제한적이므로 사용하지 않음
  // 대신 mountReactComponent를 사용하는 것이 좋음
  throw new Error('renderReactComponentToString is not recommended. Use mountReactComponent instead.');
}

