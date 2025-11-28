// ============================================================================
// 강철 스타일 시스템 - 통합 버튼 컴포넌트
// 27 프로젝트의 DOM 구조를 React로 구현
// ============================================================================

import React, { memo, useContext, useCallback, useMemo, useRef, useLayoutEffect, useState } from 'react';
import { AppContext, useButtonStyle, useModal, applyButtonMinSide } from '../App';
import { ToggleIcon } from './Icon';


// ============================================================================
// 컴포넌트
// ============================================================================

/**
 * 통합 버튼 컴포넌트
 * 모든 입력 이벤트(클릭, 터치, 키보드)를 내부적으로 onPressed 핸들러로 처리
 * 
 * 대원칙: DOM 직접 조작 금지 - props/state 기반으로 ReactDOM 조작
 * 
 * @param {object} props
 * @param {string} props.className - 추가 CSS 클래스 (React 표준)
 * @param {object} props.style - 인라인 스타일 객체 (React 표준)
 * @param {ReactNode} props.svg - SVG 아이콘 컴포넌트 (JSX)
 * @param {string} props.img - 이미지 경로 (PNG 등)
 * @param {string} props.imgAlt - 이미지 alt 텍스트
 * @param {string} props.imgStyle - 이미지 인라인 스타일
 * @param {string} props.label - 버튼 텍스트
 * @param {string} props.actionType - 액션 타입 ('navigate', 'payment', 'cancel', 'receipt', 'finish', 'selectTab', 'tabNav', 'categoryNav')
 * @param {string} props.actionTarget - 액션 타겟 (예: 'second', 'third', 'first', 'print', 'skip', 'prev', 'next')
 * @param {string} props.actionMethod - 액션 메서드 (예: 'card', 'mobile')
 * @param {string} props.ttsText - TTS 음성 안내 텍스트 (data-tts-text에 설정됨)
 * @param {boolean} props.disabled - 비활성 상태
 * @param {boolean} props.pressed - 눌린 상태 (토글 버튼용)
 * @param {boolean} props.toggle - 토글 버튼 여부
 */
const Button = memo(({
  // React 표준 props
  className = '',
  style = {},
  // 콘텐츠 props
  svg = null,
  img,
  imgAlt = '',
  imgStyle = {},
  label,
  children,
  // 상태 props
  disabled = false,
  pressed = false,
  toggle = false,
  // 액션 props
  actionType,
  actionTarget,
  actionMethod,
  onClick,
  // 접근성 props
  ttsText,
  ...rest
}) => {
  // Context에서 필요한 값들 가져오기
  const context = useContext(AppContext);
  const { playOnPressedSound } = useButtonStyle();
  const modalContext = useModal();
  const buttonRef = useRef(null);
  
  // Pressed 상태 (입력 중일 때 pressed 스타일 적용)
  const [isPressing, setIsPressing] = useState(false);
  
  // 마운트 시 --min-side 설정 (한 번만, offsetWidth/Height 사용 → scale 영향 없음)
  useLayoutEffect(() => { if (buttonRef.current) applyButtonMinSide(buttonRef.current); }, []);
  
  const { 
    setCurrentPage, 
    setisCreditPayContent,
    sendOrderDataToApp,
    sendPrintReceiptToApp,
    sendCancelPayment,
    setSelectedTab,
    selectedTab,
    handlePreviousTab,
    handleNextTab,
    handleCategoryPageNav
  } = context || {};
  
  // 팔레트 클래스 확인 (primary/secondary가 없으면 기본값 primary2 사용)
  const hasPalette = useMemo(() => 
    /primary[123]|secondary[123]/.test(className), 
    [className]
  );
  
  // 최종 className 계산 (React가 관리)
  const buttonClasses = useMemo(() => {
    const classes = ['button'];
    
    // 팔레트 기본값
    if (!hasPalette) classes.push('primary2');
    
    // 토글 버튼
    if (toggle) classes.push('toggle');
    
    // pressed 상태: props로 받은 pressed 또는 입력 중 상태
    if (pressed || (isPressing && !toggle)) classes.push('pressed');
    
    // 사용자 지정 클래스
    if (className) classes.push(className);
    
    return classes.filter(Boolean).join(' ');
  }, [className, hasPalette, toggle, pressed, isPressing]);

  // 사용자 style props만 사용 (기본 스타일은 CSS에서 처리)
  const buttonStyle = useMemo(() => style, [style]);

  // prop 기반 자동 액션 처리
  const handleAutoAction = useCallback((e) => {
    if (disabled) return;
    
    e.preventDefault();

    if (actionType === 'navigate' && actionTarget && setCurrentPage) {
      setCurrentPage(actionTarget);
    } else if (actionType === 'selectTab' && actionTarget && setSelectedTab) {
      // 탭 선택 처리 (라디오 버튼 방식: 다른 탭 클릭 시 전환)
      if (selectedTab !== actionTarget) {
        setSelectedTab(actionTarget);
      }
    } else if (actionType === 'payment' && actionMethod) {
      // 결제 처리: 주문 데이터 전송 후 상태 변경
      if (sendOrderDataToApp) {
        sendOrderDataToApp(actionMethod);
      }
      if (setisCreditPayContent) {
        setisCreditPayContent(actionMethod === "card" ? 1 : 2);
      }
    } else if (actionType === 'cancel') {
      if (actionTarget === 'third' && setCurrentPage) {
        setCurrentPage("third");
      } else {
        if (sendCancelPayment) {
          sendCancelPayment();
        }
        if (setisCreditPayContent) {
          setisCreditPayContent(0);
        }
      }
    } else if (actionType === 'receipt' && actionTarget) {
      if (actionTarget === 'print') {
        if (sendPrintReceiptToApp) {
          sendPrintReceiptToApp();
        }
        if (setisCreditPayContent) {
          setisCreditPayContent(6);
        }
      } else if (setisCreditPayContent) {
        setisCreditPayContent(7);
      }
    } else if (actionType === 'finish' && setisCreditPayContent) {
      setisCreditPayContent(7);
    } else if (actionType === 'tabNav' && actionTarget) {
      if (actionTarget === 'prev' && handlePreviousTab) {
        handlePreviousTab();
      } else if (actionTarget === 'next' && handleNextTab) {
        handleNextTab();
      }
    } else if (actionType === 'categoryNav' && actionTarget) {
      if (handleCategoryPageNav && typeof handleCategoryPageNav === 'function') {
        handleCategoryPageNav(actionTarget);
      }
    } else if (actionType === 'modal' && actionTarget && modalContext) {
      // 모달 열기: actionTarget = 'Return', 'Accessibility', 'Reset', 'Delete', 'DeleteCheck', 'Call'
      const modalKey = `Modal${actionTarget}`;
      if (modalContext[modalKey]?.open) {
        modalContext[modalKey].open();
      }
    }
  }, [disabled, actionType, actionTarget, actionMethod, setCurrentPage, setisCreditPayContent, sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, setSelectedTab, selectedTab, handlePreviousTab, handleNextTab, handleCategoryPageNav, modalContext]);

  // 키보드 유효성 검사
  const isValidKey = useCallback((e) => {
    return e.key === 'Enter' || e.key === ' ' || e.code === 'NumpadEnter';
  }, []);

  // 입력 시작 핸들러: pressed 스타일 + 사운드 재생
  const onPressStart = useCallback((e) => {
    if (disabled) return;
    
    // 키보드 이벤트 필터링
    if (e.type === 'keydown') {
      if (!isValidKey(e)) return;
      e.preventDefault();
    }
    
    // 사운드 재생
    playOnPressedSound();
    
    // 토글 버튼이 아닐 때만 pressed 스타일 적용
    if (!toggle) {
      setIsPressing(true);
    }
  }, [disabled, toggle, isValidKey, playOnPressedSound]);

  // 입력 종료 핸들러: 기능 실행 + pressed 스타일 제거
  const onPressEnd = useCallback((e) => {
    if (disabled) return;
    
    // 키보드 이벤트 필터링
    if (e.type === 'keyup') {
      if (!isValidKey(e)) return;
      e.preventDefault();
    }
    
    // 터치 이벤트: 중복 실행 방지
    if (e.type === 'touchend') {
      e.preventDefault();
    }
    
    // pressed 스타일 제거
    if (!toggle) {
      setIsPressing(false);
    }
    
    // 기능 실행: actionType 우선, 없으면 onClick 콜백
    if (actionType) {
      handleAutoAction(e);
    } else if (onClick) {
      onClick(e);
    }
  }, [disabled, actionType, handleAutoAction, toggle, isValidKey, onClick]);

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      data-tts-text={ttsText}
      data-react-handler="true"
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      onMouseLeave={() => setIsPressing(false)}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      onKeyDown={onPressStart}
      onKeyUp={onPressEnd}
      disabled={disabled}
      aria-disabled={disabled}
      aria-pressed={toggle ? pressed : undefined}
      style={buttonStyle}
      {...rest}
    >
      <div className="background dynamic">
        {(svg || img) && (
          <span className="content icon" aria-hidden="true">
            {svg || <img src={img} alt={imgAlt} style={imgStyle} />}
          </span>
        )}
        {label && (
          <span className="content label">{label}</span>
        )}
        {children}
        {/* 토글 버튼 pressed 상태 아이콘 */}
        {toggle && (
          <span className="content icon pressed" aria-hidden="true">
            <ToggleIcon />
          </span>
        )}
      </div>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

