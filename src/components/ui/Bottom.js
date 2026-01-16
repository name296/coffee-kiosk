import React, { memo, useContext, useCallback, useRef, useEffect } from "react";
import Button from "./Button";
import { HomeIcon, TimeIcon, WheelchairIcon } from "../../Icon";
import { ScreenRouteContext } from "../../contexts/ScreenRouteContext";
import { AccessibilityContext } from "../../contexts/AccessibilityContext";
import { OrderContext } from "../../contexts/OrderContext";
import { useIdleTimeout } from "../../hooks/useIdleTimeout";
import { initializeApp } from "../../utils/appUtils";

const Bottom = memo(({ systemControlsRef }) => {
    const route = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);

    // ScreenStart에서는 타임아웃이 모달 없이 실행됨 (이니셜 TTS 재생)
    // 다른 화면에서는 타임아웃 모달 표시
    const isTimeoutEnabled = true; // 모든 화면에서 타임아웃 활성화

    const onTimeout = useCallback(() => {
        console.log('[타이머] onTimeout 호출됨', { currentPage: route.currentPage });

        // 타임아웃 발생 시 항상 초기화 실행 (모든 화면에서 시작화면으로 이동)
        const callbacks = {
            ModalRestart: accessibility.ModalRestart,
            ModalAccessibility: accessibility.ModalAccessibility,
            ModalTimeout: accessibility.ModalTimeout, // 타임아웃 모달 닫기용
            setQuantities: order.setQuantities,
            totalMenuItems: order.totalMenuItems,
            setIsDark: accessibility.setIsDark,
            setVolume: accessibility.setVolume,
            setIsLarge: accessibility.setIsLarge,
            setIsLow: accessibility.setIsLow,
            setCurrentPage: route.setCurrentPage
        };
        console.log('[타이머] initializeApp 호출 시작', {
            callbacks: Object.keys(callbacks),
            currentPage: route.currentPage
        });
        initializeApp(callbacks);
        console.log('[타이머] initializeApp 호출 완료');

        // ScreenStart로 이동 후 포커스 갱신하여 TTS 재생 트리거
        requestAnimationFrame(() => {
            // document.querySelector 사용. useDOM을 사용해도 되지만 여기서는 직접 사용해도 무방
            // 하지만 일관성을 위해 useDOM을 사용하는 것이 좋지만.. Bottom에서 useDOM import 안함.
            // 그냥 DOM 접근 유지.
            if (typeof document !== 'undefined') {
                const mainElement = document.querySelector('.main.first');
                if (mainElement) {
                    const activeElement = document.activeElement;
                    if (activeElement && activeElement !== mainElement) {
                        activeElement.blur();
                    }
                    mainElement.focus();
                }
            }
        });
    }, [accessibility, order, route]);

    // 타임아웃 모달 상태 체크 함수 (useIdleTimeout에 전달)
    const checkTimeoutModal = useCallback(() => {
        return accessibility.ModalTimeout?.isOpen ?? false;
    }, [accessibility.ModalTimeout]);

    const { remainingTimeFormatted, remainingTime, resetTimer } = useIdleTimeout(
        onTimeout,
        120000, // 2분 (120초)
        isTimeoutEnabled,
        checkTimeoutModal
    );

    // 전역 타이머 remainingTime을 AccessibilityContext에 전달 (TimeoutModal에서 사용)
    useEffect(() => {
        if (accessibility.setGlobalRemainingTime) {
            accessibility.setGlobalRemainingTime(remainingTime);
        }
    }, [remainingTime, accessibility.setGlobalRemainingTime]);

    // 잔여시간이 20초 남았을 때 처리
    const hasShownWarningRef = useRef(false);
    useEffect(() => {
        // 20초 이하이고 아직 경고를 표시하지 않았을 때만 실행
        if (remainingTime > 0 && remainingTime <= 20000 && !hasShownWarningRef.current && !accessibility.ModalTimeout?.isOpen) {
            hasShownWarningRef.current = true;

            if (route.currentPage === 'ScreenStart') {
                // ScreenStart: 모달 없이 포커스 기반 TTS 재생
                // 20초 경고 시 TTS 재생하지 않음 (초기화 시에만 TTS 재생)
                console.log('[타이머] ScreenStart 20초 경고 - TTS 재생하지 않음');
            } else {
                // ScreenStart 외의 화면: 타임아웃 모달 표시
                if (accessibility.ModalTimeout) {
                    accessibility.ModalTimeout.open();
                }
            }
        }
        // remainingTime이 20초를 넘어가면 경고 플래그 리셋
        if (remainingTime > 20000) {
            hasShownWarningRef.current = false;
        }
    }, [remainingTime, accessibility.ModalTimeout, route.currentPage]);

    const openModalManually = useCallback(() => {
        if (accessibility.ModalTimeout) {
            accessibility.ModalTimeout.open();
        }
    }, [accessibility.ModalTimeout]);

    return (
        <div className="bottom" data-tts-text="시스템 설정, 버튼 세 개," ref={systemControlsRef}>
            <Button
                className="down-footer-button btn-home"
                svg={<HomeIcon />}
                label="시작화면"
                actionType="modal"
                actionTarget="Restart"
            />
            <Button
                className="down-footer-button"
                svg={<TimeIcon />}
                label={remainingTimeFormatted}
                onClick={openModalManually}
                disabled={!isTimeoutEnabled}
            />
            <Button className="down-footer-button" svg={<WheelchairIcon />} label="접근성" actionType="modal" actionTarget="Accessibility" />
        </div>
    );
});
Bottom.displayName = 'Bottom';

export default Bottom;
