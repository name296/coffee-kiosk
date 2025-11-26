// ============================================================================
// 강철 스타일 시스템 - 통합 버튼 컴포넌트
// 27 프로젝트의 DOM 구조를 React로 구현
// ============================================================================

import React, { memo } from 'react';

// ============================================================================
// 컴포넌트
// ============================================================================

/**
 * 통합 버튼 컴포넌트
 * @param {object} props
 * @param {string} props.styleClass - 추가 클래스 (palette, size 등)
 * @param {ReactNode} props.icon - 아이콘 컴포넌트
 * @param {string} props.label - 버튼 텍스트
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {Function} props.onKeyDown - 키다운 핸들러
 * @param {string} props.ttsText - TTS 음성 안내 텍스트 (data-tts-text에 설정됨)
 * @param {boolean} props.disabled - 비활성 상태
 * @param {object} props.style - 인라인 스타일
 */
const Button = memo(({
  styleClass = '',
  icon = null,
  label,
  onClick,
  onKeyDown,
  ttsText,
  disabled = false,
  style = {},
  children,
  ...rest
}) => {
  const buttonClasses = `button ${styleClass}`.trim();

  return (
    <button
      className={buttonClasses}
      data-tts-text={ttsText}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      aria-disabled={disabled}
      style={style}
      {...rest}
    >
      <div className="background dynamic">
        {icon && (
          <span className="content icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {label && (
          <span className="content label">{label}</span>
        )}
        {children}
      </div>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

