import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/browserCompatibility';

/**
 * localStorage와 동기화되는 상태를 관리하는 커스텀 훅
 * @param {string} key - localStorage 키
 * @param {*} initialValue - 초기값
 * @returns {[any, function]} [값, setter 함수]
 */
export const useLocalStorage = (key, initialValue) => {
  // 초기값을 localStorage에서 읽거나 제공된 initialValue 사용
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = safeLocalStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // localStorage에 값을 저장하는 함수
  const setValue = useCallback((value) => {
    try {
      // 함수를 받을 수 있도록 처리
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      safeLocalStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // localStorage 변경 감지 (다른 탭에서 변경된 경우)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
};

