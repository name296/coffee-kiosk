import { useState, useEffect } from 'react';

/**
 * 값을 디바운스하는 커스텀 훅
 * @param {*} value - 디바운스할 값
 * @param {number} delay - 지연 시간 (ms)
 * @returns {*} 디바운스된 값
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

