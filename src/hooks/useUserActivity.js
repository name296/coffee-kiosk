/*
타임아웃 갱신을 “통일된 리스너/핸들러”에 의존하도록 구조를 정리하기.
적용 업무강령: 0(근본 원인), 3(사용자 이해), 5(사용처 확인)
작업 계획: 전역 입력을 하나의 사용자 활동 이벤트로 통합 → useIdleTimeout은 그 이벤트만 구독 → 전역 초기화에서 브로드캐스트 등록.
*/

import { useEffect } from "react";

export const USER_ACTIVITY_EVENT = 'app:user-activity';

const DEFAULT_ACTIVITY_EVENTS = [
    'keydown',
    'keyup',
    'mousedown',
    'mouseup',
    'touchstart',
    'touchend',
    'pointerdown',
    'pointerup',
    'click'
];

const dispatchUserActivity = (sourceEventType) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(USER_ACTIVITY_EVENT, {
        detail: {
            sourceEventType,
            timestamp: Date.now()
        }
    }));
};

// 전역 사용자 활동 브로드캐스트 (단일책임: 사용자 입력을 하나의 이벤트로 통합)
export const useUserActivityBroadcast = (enabled = true, events = DEFAULT_ACTIVITY_EVENTS) => {
    useEffect(() => {
        if (!enabled || typeof document === 'undefined') return;

        const handleActivity = (e) => {
            dispatchUserActivity(e.type);
        };

        const useCapture = true;
        events.forEach((eventName) => {
            document.addEventListener(eventName, handleActivity, useCapture);
        });

        return () => {
            events.forEach((eventName) => {
                document.removeEventListener(eventName, handleActivity, useCapture);
            });
        };
    }, [enabled, events]);
};
