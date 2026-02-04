import React, { useState, useRef, useMemo, useLayoutEffect, useCallback, memo, useEffect, useContext } from "react";
import { useSound } from "../hooks";
import { ScreenRouteContext, ModalContext } from "../contexts";

export const isActionKey = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'NumpadEnter';

const BUTTON_ACTION_DELAY_MS = 50;

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

    // 버튼 시작 이벤트 핸들러
    const onStart = useCallback((e) => {
        if (disabled || (e.type === 'keydown' && !isActionKey(e))) return;
        if (e.type === 'keydown') e.preventDefault();

        setIsPressing(true);
        onPressed?.(true);

        if (!disabled) {
            playSound('onPressed');
        }
    }, [disabled, onPressed, playSound]);

    // 버튼 종료 이벤트 핸들러
    const onEnd = useCallback((e) => {
        if (disabled || (e.type === 'keyup' && !isActionKey(e))) return;
        if (e.type === 'keyup' || e.type === 'touchend') e.preventDefault();

        setIsPressing(false);
        onPressed?.(false);

        if (onChange && selectedValue !== undefined) {
            setTimeout(() => onChange(selectedValue), BUTTON_ACTION_DELAY_MS);
        } else {
            // 프레임워크 액션 100ms 딜레이 후 실행
            setTimeout(() => {
                if (navigate) {
                    navigateTo(navigate);
                }
                if (modal) {
                    const modalInstance = modalContext?.[`Modal${modal}`];
                    if (modalInstance) {
                        modalInstance.open(label, buttonIcon);
                    }
                }
                if (onClick) {
                    onClick(e, btnRef.current);
                }
            }, BUTTON_ACTION_DELAY_MS);
        }
    }, [disabled, navigate, modal, navigateTo, modalContext, label, buttonIcon, onClick, onChange, selectedValue, onPressed]);

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
            onTouchStart={onStart}
            onTouchEnd={onEnd}
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
