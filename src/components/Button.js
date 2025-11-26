// ============================================================================
// 강철 스타일 시스템 - 통합 버튼 컴포넌트
// 27 프로젝트의 DOM 구조를 React로 구현
// ============================================================================

import React, { memo, useContext, useCallback } from 'react';
import { AppContext } from '../context';

// ============================================================================
// 컴포넌트
// ============================================================================

/**
 * 통합 버튼 컴포넌트
 * 모든 입력 이벤트(클릭, 터치, 키보드)를 내부적으로 onPressed 핸들러로 처리
 * 인터랙션 훅(useMultiModalButtonHandler)은 data-react-handler 속성을 통해 React 핸들러 처리 여부를 확인
 * 
 * @param {object} props
 * @param {string} props.styleClass - 추가 클래스 (palette, size 등)
 * @param {ReactNode} props.icon - 아이콘 컴포넌트
 * @param {string} props.label - 버튼 텍스트
 * @param {Function} props.onPressed - 통합 입력 핸들러 (선택적, 커스텀 동작이 필요한 경우에만 사용)
 * @param {string} props.actionType - 액션 타입 ('navigate', 'payment', 'cancel', 'receipt', 'finish', 'selectTab', 'tabNav')
 * @param {string} props.actionTarget - 액션 타겟 (예: 'second', 'third', 'first', 'print', 'skip', 'prev', 'next')
 * @param {string} props.actionMethod - 액션 메서드 (예: 'card', 'mobile')
 * @param {Function} props.onKeyDown - 키다운 핸들러 (선택적, 키보드 네비게이션 등)
 * @param {string} props.ttsText - TTS 음성 안내 텍스트 (data-tts-text에 설정됨)
 * @param {boolean} props.disabled - 비활성 상태
 * @param {object} props.style - 인라인 스타일
 */
const Button = memo(({
  styleClass = '',
  icon = null,
  label,
  onPressed,
  actionType,
  actionTarget,
  actionMethod,
  onKeyDown,
  ttsText,
  disabled = false,
  style = {},
  children,
  ...rest
}) => {
  const buttonClasses = `button ${styleClass}`.trim();
  const context = useContext(AppContext);
  const { 
    setCurrentPage, 
    setisCreditPayContent,
    sendOrderDataToApp,
    sendPrintReceiptToApp,
    sendCancelPayment,
    setSelectedTab,
    handlePreviousTab,
    handleNextTab
  } = context || {};

  // prop 기반 자동 액션 처리
  const handleAutoAction = useCallback((e) => {
    if (disabled) return;
    
    e.preventDefault();
    e.target.focus();

    if (actionType === 'navigate' && actionTarget && setCurrentPage) {
      setCurrentPage(actionTarget);
    } else if (actionType === 'selectTab' && actionTarget && setSelectedTab) {
      // 탭 선택 처리
      setSelectedTab(actionTarget);
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
    }
  }, [disabled, actionType, actionTarget, actionMethod, setCurrentPage, setisCreditPayContent, sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, setSelectedTab, handlePreviousTab, handleNextTab]);

  // 통합 입력 핸들러: 모든 입력 이벤트(클릭, 터치, 키보드)를 하나의 핸들러로 처리
  const handlePressed = useCallback((e) => {
    if (disabled) return;
    
    // 커스텀 onPressed가 있으면 우선 사용, 없으면 자동 액션 처리
    if (onPressed) {
      onPressed(e);
    } else if (actionType) {
      handleAutoAction(e);
    }
  }, [disabled, onPressed, actionType, handleAutoAction]);

  // 키보드 입력 핸들러: Enter, Space 키를 통합 핸들러로 전달
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    // Enter 또는 Space 키인 경우 통합 핸들러 호출
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'NumpadEnter') {
      e.preventDefault();
      handlePressed(e);
      return;
    }
    
    // 다른 키는 기존 onKeyDown 핸들러로 전달
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // onPressed는 내부에서만 사용하므로 HTML button 태그로 전달하지 않음
  // (onPressed는 이미 destructuring에서 추출되었으므로 rest에는 포함되지 않음)

  return (
    <button
      className={buttonClasses}
      data-tts-text={ttsText}
      onClick={handlePressed}
      onTouchEnd={handlePressed}
      onKeyDown={handleKeyDown}
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

