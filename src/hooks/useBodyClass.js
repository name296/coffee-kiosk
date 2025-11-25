import { useEffect } from 'react';

/**
 * body 요소에 클래스를 추가/제거하는 커스텀 훅
 * @param {string} className - 추가할 클래스명
 * @param {boolean} condition - 클래스를 추가할 조건
 */
export const useBodyClass = (className, condition) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (condition) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    // cleanup: 컴포넌트 언마운트 시 클래스 제거
    return () => {
      document.body.classList.remove(className);
    };
  }, [className, condition]);
};

