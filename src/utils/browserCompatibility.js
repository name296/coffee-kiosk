/**
 * 브라우저 호환성 유틸리티
 * PC와 모바일(특히 iOS Safari) 간 호환성을 보장하는 헬퍼 함수들
 */

/**
 * 안전한 localStorage 접근
 * 모바일 사파리에서 private browsing 모드 등에서 localStorage가 비활성화될 수 있음
 */
export const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue;
      }
      const value = window.localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (e) {
      // Private browsing 모드나 쿠키 차단 시 에러 발생 가능
      console.warn(`localStorage.getItem failed for key "${key}":`, e);
      return defaultValue;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.setItem(key, String(value));
      return true;
    } catch (e) {
      console.warn(`localStorage.setItem failed for key "${key}":`, e);
      return false;
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`localStorage.removeItem failed for key "${key}":`, e);
      return false;
    }
  }
};

/**
 * 안전한 숫자 파싱
 * parseInt/parseFloat의 브라우저별 차이 보완
 */
export const safeParseInt = (value, defaultValue = 0) => {
  if (value == null || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const safeParseFloat = (value, defaultValue = 0) => {
  if (value == null || value === '') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * 브라우저 호환 숫자 포맷팅
 * toLocaleString이 지원되지 않거나 실패할 경우 폴백 제공
 */
export const formatNumber = (num, locale = 'ko-KR', options = {}) => {
  if (num == null || isNaN(num)) {
    return '0';
  }

  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) {
    return '0';
  }

  try {
    // 기본 옵션: 천 단위 구분 기호
    const defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options
    };
    
    return number.toLocaleString(locale, defaultOptions);
  } catch (e) {
    // 폴백: 수동으로 천 단위 구분 기호 추가
    console.warn('toLocaleString failed, using fallback:', e);
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

/**
 * 안전한 window 객체 접근
 */
export const safeWindow = {
  get: (path, defaultValue = undefined) => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const keys = path.split('.');
      let value = window;
      for (const key of keys) {
        if (value == null || typeof value !== 'object') {
          return defaultValue;
        }
        value = value[key];
      }
      return value !== undefined ? value : defaultValue;
    } catch (e) {
      console.warn(`safeWindow.get failed for path "${path}":`, e);
      return defaultValue;
    }
  },

  has: (path) => {
    return safeWindow.get(path) !== undefined;
  }
};

/**
 * 안전한 document.querySelector
 */
export const safeQuerySelector = (selector, context = null) => {
  try {
    if (typeof document === 'undefined') {
      return null;
    }
    const target = context || document;
    return target.querySelector(selector);
  } catch (e) {
    console.warn(`querySelector failed for selector "${selector}":`, e);
    return null;
  }
};

/**
 * 브라우저 감지 (필요시 사용)
 */
export const browserInfo = {
  isIOS: () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  isSafari: () => {
    if (typeof window === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
};

/**
 * 안전한 이벤트 리스너 추가
 */
export const safeAddEventListener = (target, event, handler, options = false) => {
  try {
    if (!target || typeof target.addEventListener !== 'function') {
      console.warn('Invalid target for addEventListener');
      return () => {};
    }
    
    target.addEventListener(event, handler, options);
    
    // cleanup 함수 반환
    return () => {
      try {
        target.removeEventListener(event, handler, options);
      } catch (e) {
        console.warn('removeEventListener failed:', e);
      }
    };
  } catch (e) {
    console.warn('addEventListener failed:', e);
    return () => {};
  }
};

/**
 * 안전한 requestAnimationFrame
 */
export const safeRequestAnimationFrame = (callback) => {
  if (typeof window === 'undefined') {
    return setTimeout(callback, 16); // 60fps 대략적 폴백
  }
  
  if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }
  
  // 폴백
  return setTimeout(callback, 16);
};

/**
 * 안전한 setTimeout/setInterval
 */
export const safeSetTimeout = (callback, delay = 0) => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return window.setTimeout(callback, delay);
  } catch (e) {
    console.warn('setTimeout failed:', e);
    return null;
  }
};

export const safeSetInterval = (callback, delay = 0) => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return window.setInterval(callback, delay);
  } catch (e) {
    console.warn('setInterval failed:', e);
    return null;
  }
};

/**
 * 안전한 clearTimeout/clearInterval
 */
export const safeClearTimeout = (timerId) => {
  if (typeof window === 'undefined' || timerId == null) {
    return;
  }
  
  try {
    window.clearTimeout(timerId);
  } catch (e) {
    console.warn('clearTimeout failed:', e);
  }
};

export const safeClearInterval = (timerId) => {
  if (typeof window === 'undefined' || timerId == null) {
    return;
  }
  
  try {
    window.clearInterval(timerId);
  } catch (e) {
    console.warn('clearInterval failed:', e);
  }
};

