import React, { useState, useRef, useMemo, useLayoutEffect, useCallback, memo, useEffect, useContext } from "react";
import { useSound } from "../hooks";
import { ScreenRouteContext, ModalContext } from "../contexts";

export const isActionKey = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'NumpadEnter';

const BUTTON_RELEASE_DELAY_MS = 90;
const BUTTON_ACTION_DELAY_MS = 180;

// 포커스 가능한 요소에 --button-min-side 계산
const applyFocusableMinSide = (el) => {
    if (!el) return;
    else el.style.setProperty('--button-min-side', `${Math.min(el.offsetWidth, el.offsetHeight)}px`);
};

const Button = memo(({
    className = '',
    style = {},
    svg = null,
    img,
    imgAlt = '',
    imgStyle = {},
    label,
    children,
    disabled = false,
    pressed: pressedProp = false,
    pointed = false,
    toggle = false,
    value,
    selectedValue,
    onChange,
    navigate,
    modal,
    onClick,
    onPressed,
    onPointed,
    ttsText,
    iconFirst = true,
    ...rest
}) => {
    // 각 Button 인스턴스마다 자체 ref 생성
    const btnRef = useRef(null);
    const [isPressing, setIsPressing] = useState(false);
    const isPressingRef = useRef(false);
    const releaseTimerRef = useRef(null);
    const actionTimerRef = useRef(null);
    const { play: playSound } = useSound();

    // Context 직접 주입 (Zero-Abstraction)
    const { navigateTo } = useContext(ScreenRouteContext);
    const modalContext = useContext(ModalContext);

    // pressed 계산: value와 selectedValue가 제공되면 자동 계산, 아니면 pressed prop 사용
    const pressed = useMemo(() => {
        if (value !== undefined && selectedValue !== undefined) {
            return value === selectedValue;
        }
        return pressedProp;
    }, [value, selectedValue, pressedProp]);

    useEffect(() => {
        isPressingRef.current = isPressing;
    }, [isPressing]);

    useEffect(() => {
        return () => {
            if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
            if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
        };
    }, []);

    // SVG에서 아이콘 이름 추출
    const getIconNameFromSvg = useMemo(() => {
        if (!svg || typeof svg !== 'object') return null;
        const componentName = svg.type?.name || '';
        if (componentName.endsWith('Icon')) {
            return componentName.replace('Icon', '');
        }
        return null;
    }, [svg]);

    const buttonIcon = getIconNameFromSvg;

    // 버튼 최소축-> 최소축 비례 스타일 적용
    useLayoutEffect(() => {
        if (btnRef.current) {
            applyFocusableMinSide(btnRef.current);
            const resizeObserver = new ResizeObserver(() => {
                if (btnRef.current) applyFocusableMinSide(btnRef.current);
            });
            resizeObserver.observe(btnRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    // TTS 텍스트 생성
    const finalTtsText = useMemo(() => {
        const baseText = (ttsText !== undefined && ttsText !== null) ? ttsText : (label !== undefined && label !== null) ? label : '';
        if (baseText === '') return '';

        let cleanedText = String(baseText).replace(/\s*비활성\s*,?\s*/g, '').trim();

        if (toggle) {
            const statusText = pressed ? '선택됨, ' : '선택가능, ';
            cleanedText = cleanedText
                .replace(/\s*선택됨\s*,\s*/g, '')
                .replace(/\s*선택가능\s*,\s*/g, '')
                .trim();
            const result = cleanedText ? `${cleanedText}, ${statusText}` : statusText;
            return disabled ? `${result}비활성, ` : result;
        }

        return disabled ? `${cleanedText}, 비활성, ` : cleanedText;
    }, [ttsText, label, toggle, pressed, disabled]);

    // 버튼 클래스명 생성
    const cls = useMemo(() => {
        const c = ['button'];
        if (!/primary[123]|secondary[123]/.test(className)) c.push('primary2');
        if (toggle) c.push('toggle');
        if (pressed || (isPressing && !toggle)) c.push('pressed');
        if (isPressing) c.push('pressing');
        if (className) c.push(className);
        return c.join(' ');
    }, [className, toggle, pressed, isPressing]);

    // 다운 시점에 액션 실행 (mousedown, touchstart, keydown)
    const runAction = useCallback((e) => {
        if (onChange && selectedValue !== undefined) {
            onChange(selectedValue);
        } else {
            if (navigate) navigateTo(navigate);
            if (modal) {
                const modalInstance = modalContext?.[`Modal${modal}`];
                if (modalInstance) modalInstance.open(label, buttonIcon);
            }
            if (onClick) onClick(e, btnRef.current);
        }
    }, [navigate, modal, navigateTo, modalContext, label, buttonIcon, onClick, onChange, selectedValue]);

    const clearReleaseTimer = useCallback(() => {
        if (releaseTimerRef.current) {
            clearTimeout(releaseTimerRef.current);
            releaseTimerRef.current = null;
        }
    }, []);

    // 버튼 시작 이벤트 핸들러 (다운 시점: 액티브 + 사운드)
    const onStart = useCallback((e) => {
        if (disabled || (e.type === 'keydown' && !isActionKey(e))) return;
        if (e.type === 'keydown') {
            if (e.repeat) return;
            e.preventDefault();
        }

        clearReleaseTimer();
        setIsPressing(true);
        onPressed?.(true);

        if (!disabled) {
            playSound('onPressed');
            releaseTimerRef.current = setTimeout(() => {
                releaseTimerRef.current = null;
                setIsPressing(false);
                onPressed?.(false);
            }, BUTTON_RELEASE_DELAY_MS);
            actionTimerRef.current = setTimeout(() => {
                actionTimerRef.current = null;
                runAction(e);
            }, BUTTON_ACTION_DELAY_MS);
        }
    }, [disabled, onPressed, playSound, runAction, clearReleaseTimer]);

    // 버튼 종료 이벤트 핸들러 (업 시점: release 타이머는 유지하여 100ms 풀림 보장)
    const onEnd = useCallback((e) => {
        if (disabled || (e.type === 'keyup' && !isActionKey(e))) return;
        if (e.type === 'keyup' || e.type === 'touchend') e.preventDefault();

        // release 타이머는 그대로 두어 다운 후 100ms 동안 isPressing 유지
        // (빨리 손 떼어도 100ms 풀림 보장)
    }, [disabled]);

    return (
        <button
            ref={btnRef}
            className={cls}
            style={style}
            data-tts-text={finalTtsText}
            data-react-handler="true"
            aria-disabled={disabled}
            aria-pressed={toggle ? pressed : undefined}
            tabIndex={disabled ? 0 : undefined}
            onMouseDown={onStart}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
            onTouchStart={onStart}
            onTouchEnd={onEnd}
            onTouchCancel={onEnd}
            onKeyDown={onStart}
            onKeyUp={onEnd}
            {...rest}
        >
            {iconFirst ? (
                <>
                    {(svg || img) && (
                        <span className="icon" aria-hidden="true">
                            {svg || <img src={img} alt={imgAlt} style={imgStyle} />}
                        </span>
                    )}
                    {label}
                </>
            ) : (
                <>
                    {label}
                    {(svg || img) && (
                        <span className="icon" aria-hidden="true">
                            {svg || <img src={img} alt={imgAlt} style={imgStyle} />}
                        </span>
                    )}
                </>
            )}
            {children}
            {toggle && (
                <span className="icon pressed" aria-hidden="true"></span>
            )}
        </button>
    );
});

Button.displayName = 'Button';
export default Button;
