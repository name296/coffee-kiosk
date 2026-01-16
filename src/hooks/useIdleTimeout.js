import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// 활성 요소 TTS 재생 훅 (단일책임: 활성 요소 TTS 재생만)
// 남은 시간 포맷팅 (단일책임: 시간 포맷팅만) - MM:SS 형식
const formatRemainingTime = (ms) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const useIdleTimeout = (onTimeout, timeout = 300000, enabled = true, checkTimeoutModal = null) => {
    const timerRef = useRef(null);
    const intervalRef = useRef(null);
    const lastActivityRef = useRef(Date.now());
    const onTimeoutRef = useRef(null);
    const timeoutRef = useRef(null);
    const currentTimeoutRef = useRef(null); // 현재 적용된 타임아웃 시간 저장
    const prevLogSecondRef = useRef(-1); // 로그 중복 방지용
    const checkTimeoutModalRef = useRef(checkTimeoutModal);
    const [remainingTime, setRemainingTime] = useState(timeout);

    // 초기값 설정
    if (lastActivityRef.current === null) lastActivityRef.current = Date.now();
    if (onTimeoutRef.current === null) onTimeoutRef.current = onTimeout;
    if (timeoutRef.current === null) timeoutRef.current = timeout;
    if (currentTimeoutRef.current === null) currentTimeoutRef.current = timeout;

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
        timeoutRef.current = timeout;
        checkTimeoutModalRef.current = checkTimeoutModal;
    }, [onTimeout, timeout, checkTimeoutModal]);

    // 마지막 resetTimer 호출 시간 추적 (너무 자주 호출되는 것 방지)
    const lastResetTimeRef = useRef(0);

    const resetTimer = useCallback(() => {
        const now = Date.now();
        // 100ms 이내에 중복 호출 방지
        if (now - lastResetTimeRef.current < 100) {
            console.log('[타이머] resetTimer 중복 호출 방지', {
                timeSinceLastReset: now - lastResetTimeRef.current
            });
            return;
        }
        lastResetTimeRef.current = now;

        // 타임아웃 모달 열림 여부와 상관없이 항상 기본 타임아웃으로 리셋
        const resetTime = timeoutRef.current;

        // 사용자 입력 시 리셋
        const prevLastActivity = lastActivityRef.current;
        const prevCurrentTimeout = currentTimeoutRef.current;
        lastActivityRef.current = now;
        currentTimeoutRef.current = resetTime;

        console.log('[타이머] resetTimer 호출됨', {
            now: new Date(now).toISOString(),
            resetTime,
            resetTime,
            prevLastActivity: new Date(prevLastActivity).toISOString(),
            prevCurrentTimeout,
            timeoutRef: timeoutRef.current
        });

        // setRemainingTime은 setInterval에서만 호출하여 충돌 방지
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            console.log('[타이머] setTimeout 콜백 실행 (타임아웃)');
            if (onTimeoutRef.current) onTimeoutRef.current();
        }, resetTime);
    }, []); // checkTimeoutModal removed

    useEffect(() => {
        if (!enabled) {
            console.log('[타이머] 비활성화됨');
            setRemainingTime(timeout);
            currentTimeoutRef.current = timeout;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // 초기 타이머 설정
        const initialTime = timeoutRef.current || timeout;
        const initialTimeMs = Date.now();
        lastActivityRef.current = initialTimeMs;
        currentTimeoutRef.current = initialTime;
        setRemainingTime(initialTime);
        console.log('[타이머] 초기화', {
            initialTime,
            initialTimeMs,
            timeout: timeoutRef.current,
            enabled
        });

        // 100ms마다 실행되는 카운트다운
        intervalRef.current = setInterval(() => {
            // 타임아웃 모달 상태 확인
            const isTimeoutModalOpen = checkTimeoutModalRef.current ? checkTimeoutModalRef.current() : false;

            // 타임아웃 모달이 닫혔는데 20초로 설정되어 있으면 기본 타임아웃(2분)으로 리셋
            if (!isTimeoutModalOpen && currentTimeoutRef.current === 20000) {
                const resetTime = timeoutRef.current || timeout;
                const resetTimeMs = Date.now();
                lastActivityRef.current = resetTimeMs;
                currentTimeoutRef.current = resetTime;
                console.log('[타이머] 모달 닫힘 → 기본 타임아웃으로 리셋', { resetTime, resetTimeMs });
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
                timerRef.current = setTimeout(() => {
                    if (onTimeoutRef.current) onTimeoutRef.current();
                }, resetTime);
            }

            // 경과 시간 계산 및 남은 시간 업데이트 (항상 실행)
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;
            const remaining = Math.max(0, currentTimeoutRef.current - elapsed);

            // 관측성: 1초마다 로그 출력 (중복 방지)
            const currentSecond = Math.floor(remaining / 1000);
            if (currentSecond !== prevLogSecondRef.current && currentSecond >= 0) {
                prevLogSecondRef.current = currentSecond;
                console.log('[타이머] 카운트다운', {
                    remaining: currentSecond + '초',
                    remainingMs: remaining,
                    elapsed: Math.ceil(elapsed / 1000) + '초',
                    elapsedMs: elapsed,
                    currentTimeout: currentTimeoutRef.current,
                    lastActivity: new Date(lastActivityRef.current).toISOString(),
                    now: new Date(now).toISOString()
                });
            }

            // 상태 업데이트 (항상 업데이트하여 카운트다운이 정상 작동하도록)
            setRemainingTime(remaining);

            // 0초가 되면 초기화
            if (remaining <= 0 && onTimeoutRef.current) {
                console.log('[타이머] 타임아웃 발생! 초기화 실행', {
                    onTimeoutRef: !!onTimeoutRef.current,
                    remaining,
                    currentTimeout: currentTimeoutRef.current
                });
                // onTimeout 호출 전에 타이머 리셋하지 않음 (초기화가 완료된 후 리셋)
                const timeoutCallback = onTimeoutRef.current;
                if (timeoutCallback) {
                    try {
                        timeoutCallback();
                        console.log('[타이머] onTimeout 콜백 실행 완료');
                    } catch (error) {
                        console.error('[타이머] onTimeout 콜백 실행 중 에러', error);
                    }
                }
                // 초기화 후 타이머 리셋 (초기화가 완료된 후)
                const resetTime = timeoutRef.current || timeout;
                const resetTimeMs = Date.now();
                lastActivityRef.current = resetTimeMs;
                currentTimeoutRef.current = resetTime;
                setRemainingTime(resetTime);
                console.log('[타이머] 자동 리셋', { resetTime, resetTimeMs });
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
                timerRef.current = setTimeout(() => {
                    if (onTimeoutRef.current) onTimeoutRef.current();
                }, resetTime);
            }
        }, 100);

        console.log('[타이머] setInterval 시작됨', { intervalId: intervalRef.current });

        return () => {
            console.log('[타이머] cleanup - setInterval 정리', { intervalId: intervalRef.current });
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [enabled]); // checkTimeoutModal removed

    // 이벤트 핸들러를 useCallback으로 정의하여 의존성 문제 해결
    const handleUserActivity = useCallback((eventType = 'unknown') => {
        const now = Date.now();
        if (now - lastResetTimeRef.current < 100) {
            console.log('[타이머] handleUserActivity 중복 호출 방지', {
                eventType,
                timeSinceLastReset: now - lastResetTimeRef.current
            });
            return;
        }
        lastResetTimeRef.current = now;

        // 타임아웃 모달 열림 여부와 상관없이 항상 기본 타임아웃으로 리셋
        // (사용자 활동이 있으면 시간 연장)
        const resetTime = timeoutRef.current;

        const prevLastActivity = lastActivityRef.current;
        lastActivityRef.current = now;
        currentTimeoutRef.current = resetTime;

        console.log('[타이머] handleUserActivity 호출됨', {
            eventType,
            now: new Date(now).toISOString(),
            resetTime,
            resetTime,
            prevLastActivity: new Date(prevLastActivity).toISOString(),
            timeoutRef: timeoutRef.current
        });

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            console.log('[타이머] setTimeout 콜백 실행 (타임아웃)', { eventType });
            if (onTimeoutRef.current) onTimeoutRef.current();
        }, resetTime);
    }, []); // checkTimeoutModal removed

    useEffect(() => {
        if (!enabled) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // 이벤트 리스너 등록
        const keydownHandler = () => handleUserActivity('keydown');
        const touchstartHandler = () => handleUserActivity('touchstart');
        const clickHandler = () => handleUserActivity('click');

        document.addEventListener('keydown', keydownHandler, { passive: true });
        document.addEventListener('touchstart', touchstartHandler, { passive: true });
        document.addEventListener('click', clickHandler, { passive: true });

        console.log('[타이머] 이벤트 리스너 등록됨', { enabled, onTimeout: !!onTimeoutRef.current });

        return () => {
            console.log('[타이머] cleanup - 이벤트 리스너 제거', {
                timerRef: !!timerRef.current,
                enabled
            });
            if (timerRef.current) clearTimeout(timerRef.current);
            document.removeEventListener('keydown', keydownHandler);
            document.removeEventListener('touchstart', touchstartHandler);
            document.removeEventListener('click', clickHandler);
        };
    }, [enabled, handleUserActivity]); // handleUserActivity는 useCallback으로 안정화됨

    // remainingTime이 변경될 때마다 포맷팅된 시간 재계산
    const remainingTimeFormatted = useMemo(() => formatRemainingTime(remainingTime), [remainingTime]);

    return { resetTimer, remainingTime, remainingTimeFormatted, onTimeoutRef };
};
