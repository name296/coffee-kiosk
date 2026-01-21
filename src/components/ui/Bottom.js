import React, { memo, useContext, useCallback, useRef, useEffect } from "react";
import Button from "./Button";
import { HomeIcon, TimeIcon, WheelchairIcon } from "../../Icon";
import { AccessibilityContext } from "../../contexts/AccessibilityContext";
import { ModalContext } from "../../contexts/ModalContext";
import { TimeoutContext } from "../../contexts/TimeoutContext";
import { ScreenRouteContext } from "../../contexts/ScreenRouteContext";
import { OrderContext } from "../../contexts/OrderContext";
import { useIdleTimeout } from "../../hooks/useIdleTimeout";
import { initializeApp } from "../../utils/appInitializer";

const Bottom = memo(({ systemControlsRef }) => {
    const { currentPage, navigateTo } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);
    const order = useContext(OrderContext);

    // ScreenStart에서는 타임아웃이 모달 없이 실행됨 (이니셜 TTS 재생)
    // 다른 화면에서는 타임아웃 모달 표시
    const isTimeoutEnabled = true; // 모든 화면에서 타임아웃 활성화

    const onTimeout = useCallback(() => {
        // 타임아웃 발생 시 항상 초기화 실행 (모든 화면에서 시작화면으로 이동)
        console.log('[타이머] onTimeout 호출됨', { currentPage });
        const callbacks = {
            ModalRestart: modal?.ModalRestart,
            ModalAccessibility: modal?.ModalAccessibility,
            ModalTimeout: modal?.ModalTimeout, // 타임아웃 모달 닫기용
            setQuantities: order.setQuantities,
            totalMenuItems: order.totalMenuItems,
            setIsDark: accessibility.setIsDark,
            setVolume: accessibility.setVolume,
            setIsLarge: accessibility.setIsLarge,
            setIsLow: accessibility.setIsLow,
            setCurrentPage: (p) => navigateTo(p)
        };

        console.log('[타이머] initializeApp 호출 시작', {
            callbacks: Object.keys(callbacks),
            currentPage
        });
        initializeApp(callbacks);        
        console.log('[타이머] initializeApp 호출 완료');
    }, [accessibility, modal, order, currentPage, navigateTo]);

    // 타임아웃 모달 상태 체크 함수 (useIdleTimeout에 전달)
    const checkTimeoutModal = useCallback(() => {
        return modal?.ModalTimeout?.isOpen ?? false;
    }, [modal]);

    const { remainingTimeFormatted, remainingTime, resetTimer } = useIdleTimeout(
        onTimeout,
        120000, // 2분 (120초)
        isTimeoutEnabled,
        checkTimeoutModal
    );

    // 전역 타이머 remainingTime을 TimeoutModal에 전달
    useEffect(() => {
        if (timeout?.setGlobalRemainingTime) {
            timeout.setGlobalRemainingTime(remainingTime);
        }
    }, [remainingTime, timeout]);

    // 잔여시간이 20초 남았을 때 처리
    const hasShownWarningRef = useRef(false);    
    useEffect(() => {
        // 20초 이하이고 아직 경고를 표시하지 않았을 때만 실행
        if (remainingTime > 0 && remainingTime <= 20000 && !hasShownWarningRef.current && !modal?.ModalTimeout?.isOpen) {
            hasShownWarningRef.current = true;

            if (currentPage === 'ScreenStart') {
                // ScreenStart: 모달 없이 포커스 기반 TTS 재생
                // 20초 경고 시 TTS 재생하지 않음 (초기화 시에만 TTS 재생)
                console.log('[타이머] ScreenStart 20초 경고 - TTS 재생하지 않음');
            } else {
                // ScreenStart 외의 화면: 타임아웃 모달 표시
                if (modal?.ModalTimeout) {
                    modal.ModalTimeout.open();
                }
            }
        }
        // remainingTime이 20초를 넘어가면 경고 플래그 리셋
        if (remainingTime > 20000) {
            hasShownWarningRef.current = false;
        }
    }, [remainingTime, modal, currentPage]);

    const openModalManually = useCallback(() => {
        if (modal?.ModalTimeout) {
            modal.ModalTimeout.open();
        }
    }, [modal]);

    return (
        <div className="bottom" data-tts-text="시스템 설정, 버튼 세 개," ref={systemControlsRef}>
            <Button
                className="down-footer-button btn-home"
                svg={<HomeIcon />}
                label="시작화면"
                modal="Restart"
            />
            <Button
                className="down-footer-button"
                svg={<TimeIcon />}
                label={remainingTimeFormatted}
                onClick={openModalManually}
                disabled={!isTimeoutEnabled}
            />
            <Button className="down-footer-button" svg={<WheelchairIcon />} label="접근성" modal="Accessibility" />
        </div>
    );
});
Bottom.displayName = 'Bottom';

export default Bottom;
