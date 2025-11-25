import { useRef, useEffect } from 'react';

/**
 * 이전 값을 저장하는 커스텀 훅
 * @param {*} value - 추적할 값
 * @returns {*} 이전 값
 */
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

