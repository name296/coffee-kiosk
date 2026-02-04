import { useCallback, useEffect } from "react";
import { useSound } from "../hooks/useSound";

// 버튼 pressed 상태 추가 (단일책임: pressed 클래스 추가 및 사운드 재생만)
export const addButtonPressedState = (btn, playSoundFn) => {
    if (btn.dataset.reactHandler !== 'true') {
        btn.classList.add('pressed');
        // 사운드 재생 (사용자 인터랙션마다)
        if (playSoundFn && typeof playSoundFn === 'function') {
            playSoundFn('onPressed');
        }
    }
};

// 버튼 pressed 상태 제거 (단일책임: pressed 클래스 제거 및 포커스 복원만)
export const removeButtonPressedState = (btn) => {
    if (btn.classList.contains('pressed')) {
        btn.classList.remove('pressed');
        if (btn.dataset.reactHandler !== 'true') {
            requestAnimationFrame(() => {
                if (btn instanceof HTMLElement && document.activeElement !== btn) {
                    btn.focus();
                }
            });
        }
    }
};

// 버튼 클릭 핸들러 (단일책임: 버튼 클릭 시 TTS 재생만)
export const useButtonClickHandler = (finalHandleText, prefixOpt) => {
    return useCallback((e) => {
        const btn = e.target?.closest?.('.button');
        const isButtonDisabled = (btn) => btn.classList.contains('disabled') ||
            btn.getAttribute('aria-disabled') === 'true' ||
            btn.disabled === true;
        if (!btn || isButtonDisabled(btn)) return;
        if (btn.dataset.reactHandler === 'true') return;

        const ttsText = btn.dataset.ttsText;
        if (ttsText && finalHandleText) {
            finalHandleText(prefixOpt ? `${prefixOpt}${ttsText}` : ttsText);
        }
    }, [finalHandleText, prefixOpt]);
};

// 토글 버튼 클릭 핸들러 (단일책임: 토글 버튼 클릭 처리만)
export const useToggleButtonClickHandler = (enableGlobalHandlers) => {
    useEffect(() => {
        if (!enableGlobalHandlers) return;

        const isButtonDisabled = (btn) => btn.classList.contains('disabled') ||
            btn.getAttribute('aria-disabled') === 'true' ||
            btn.disabled === true;
        const isToggleButton = (btn) => btn.classList.contains('toggle');

        const handleToggleClick = (e) => {
            const btn = e.target?.closest?.('.button');
            if (!btn || isButtonDisabled(btn) || !isToggleButton(btn)) return;
            if (btn.dataset.reactHandler === 'true') return;
        };

        document.addEventListener('click', handleToggleClick, false);
        return () => document.removeEventListener('click', handleToggleClick, false);
    }, [enableGlobalHandlers]);
};

// 비활성화 버튼 클릭 방지 (단일책임: 비활성화 버튼 클릭 차단만)
export const useDisabledButtonBlocker = (enableGlobalHandlers) => {
    useEffect(() => {
        if (!enableGlobalHandlers) return;

        const isButtonDisabled = (btn) => btn.classList.contains('disabled') ||
            btn.getAttribute('aria-disabled') === 'true' ||
            btn.disabled === true;

        const blockDisabledButton = (e) => {
            const btn = e.target?.closest?.('.button');
            if (btn && isButtonDisabled(btn)) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        document.addEventListener('click', blockDisabledButton, true);
        return () => document.removeEventListener('click', blockDisabledButton, true);
    }, [enableGlobalHandlers]);
};

// 마우스/터치 pressed 상태 관리 (단일책임: pressed 상태 관리만)
export const usePressStateHandler = (enableGlobalHandlers) => {
    // useSound 훅을 사용하여 사운드 재생 함수 가져오기
    const { play: playSound } = useSound();

    useEffect(() => {
        if (!enableGlobalHandlers) return;

        const isButtonDisabled = (btn) => btn.classList.contains('disabled') ||
            btn.getAttribute('aria-disabled') === 'true' ||
            btn.disabled === true;
        const isToggleButton = (btn) => btn.classList.contains('toggle');

        const handlePressState = (e, action) => {
            const btn = e.target?.closest?.('.button');
            if (!btn || isButtonDisabled(btn) || isToggleButton(btn)) return;

            if (action === 'add') {
                addButtonPressedState(btn, playSound);
            } else if (action === 'remove') {
                removeButtonPressedState(btn);
            }
        };

        const handleMouseDown = (e) => handlePressState(e, 'add');
        const handleMouseUp = (e) => {
            handlePressState(e, 'remove');
            const btn = e.target?.closest?.('.button');
            if (btn && !isButtonDisabled(btn) && !isToggleButton(btn) && btn.dataset.reactHandler !== 'true') {
                requestAnimationFrame(() => btn instanceof HTMLElement && btn.focus());
            }
        };
        const handleMouseLeave = (e) => e.target?.closest && handlePressState(e, 'remove');
        const handleTouchStart = (e) => handlePressState(e, 'add');
        const handleTouchEnd = (e) => {
            handlePressState(e, 'remove');
            const btn = e.target?.closest?.('.button');
            if (btn && !isButtonDisabled(btn) && !isToggleButton(btn) && btn.dataset.reactHandler !== 'true') {
                requestAnimationFrame(() => btn instanceof HTMLElement && btn.focus());
            }
        };
        const handleTouchCancel = (e) => handlePressState(e, 'remove');

        document.addEventListener('mousedown', handleMouseDown, true);
        document.addEventListener('mouseup', handleMouseUp, true);
        document.addEventListener('mouseleave', handleMouseLeave, true);
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
        document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

        return () => {
            document.removeEventListener('mousedown', handleMouseDown, true);
            document.removeEventListener('mouseup', handleMouseUp, true);
            document.removeEventListener('mouseleave', handleMouseLeave, true);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchcancel', handleTouchCancel);
        };
    }, [enableGlobalHandlers, playSound]);
};
