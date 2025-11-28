/**
 * 전역 비활성 타임아웃 훅
 * 사용자 활동이 없으면 지정된 시간 후 첫 화면으로 이동
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { TIMER_CONFIG, PAGE_CONFIG } from "../config/appConfig";

/**
 * 남은 시간을 MM:SS 형식으로 변환
 */
export const formatRemainingTime = (ms) => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * @param {Function} onTimeout - 타임아웃 시 실행할 콜백
 * @param {number} timeout - 타임아웃 시간 (ms), 기본값: TIMER_CONFIG.IDLE_TIMEOUT
 * @param {boolean} enabled - 활성화 여부, 기본값: true
 */
export const useIdleTimeout = (onTimeout, timeout = TIMER_CONFIG.IDLE_TIMEOUT, enabled = true) => {
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const onTimeoutRef = useRef(onTimeout);
  const timeoutRef = useRef(timeout);
  const [remainingTime, setRemainingTime] = useState(timeout);

  // 참조 업데이트
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    timeoutRef.current = timeout;
  }, [onTimeout, timeout]);

  // 타이머 리셋 함수 (ref 사용으로 의존성 제거)
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingTime(timeoutRef.current);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      if (onTimeoutRef.current) {
        onTimeoutRef.current();
      }
    }, timeoutRef.current);
  }, []); // 의존성 없음 - ref 사용

  // 카운트다운 interval (별도 useEffect)
  useEffect(() => {
    if (!enabled) {
      setRemainingTime(timeout);
      return;
    }

    // 1초마다 남은 시간 업데이트
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, timeout - elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, timeout]);

  // 사용자 활동 감지 이벤트
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const events = [
      'mousedown',
      'keydown',
      'touchstart',
      'click',
    ];

    // 이벤트 핸들러
    const handleActivity = () => {
      resetTimer();
    };

    // 이벤트 리스너 등록
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // 초기 타이머 시작
    resetTimer();

    // 클린업
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimer]);

  return {
    resetTimer,
    remainingTime,
    remainingTimeFormatted: formatRemainingTime(remainingTime),
  };
};

/**
 * 앱 레벨 idle timeout 훅
 * 모든 페이지에서 활성화 (첫 페이지 포함)
 * @returns {{ remainingTime: number, remainingTimeFormatted: string, isActive: boolean }}
 */
export const useAppIdleTimeout = (currentPage, setCurrentPage, resetOrder) => {
  const handleTimeout = useCallback(() => {
    // 주문 초기화
    if (resetOrder) {
      resetOrder();
    }
    // 첫 화면으로 이동
    setCurrentPage(PAGE_CONFIG.FIRST);
  }, [setCurrentPage, resetOrder]);

  const { remainingTime, remainingTimeFormatted, resetTimer } = useIdleTimeout(
    handleTimeout, 
    TIMER_CONFIG.IDLE_TIMEOUT, 
    true  // 항상 활성화
  );

  return {
    remainingTime,
    remainingTimeFormatted,
    isActive: true,  // 항상 활성화
    resetTimer,
  };
};

export default useIdleTimeout;

