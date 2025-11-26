// ============================================================================
// 강철 스타일 시스템 - 통합 버튼 컴포넌트
// 27 프로젝트의 DOM 구조를 React로 구현
// ============================================================================

import React, { memo, useContext, useCallback } from 'react';
import { AppContext } from '../contexts';

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
 * @param {string} props.actionType - 액션 타입 ('navigate', 'payment', 'cancel', 'receipt', 'finish', 'selectTab', 'tabNav', 'categoryNav')
 * @param {string} props.actionTarget - 액션 타겟 (예: 'second', 'third', 'first', 'print', 'skip', 'prev', 'next')
 * @param {string} props.actionMethod - 액션 메서드 (예: 'card', 'mobile')
 * @param {string} props.ttsText - TTS 음성 안내 텍스트 (data-tts-text에 설정됨)
 * @param {boolean} props.disabled - 비활성 상태
 * @param {object} props.style - 인라인 스타일
 */
const Button = memo(({
  styleClass = '',
  icon = null,
  label,
  actionType,
  actionTarget,
  actionMethod,
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
    handleNextTab,
    handleCategoryPageNav
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
    } else if (actionType === 'categoryNav' && actionTarget) {
      if (handleCategoryPageNav && typeof handleCategoryPageNav === 'function') {
        handleCategoryPageNav(actionTarget);
      }
    }
  }, [disabled, actionType, actionTarget, actionMethod, setCurrentPage, setisCreditPayContent, sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, setSelectedTab, handlePreviousTab, handleNextTab, handleCategoryPageNav]);

  // 통합 입력 핸들러: 모든 입력 이벤트(클릭, 터치, 키보드)를 하나의 핸들러로 처리
  const onPressed = useCallback((e) => {
    if (disabled) return;
    
    // React 이벤트 핸들러가 처리했음을 표시 (전역 핸들러가 중복 처리 방지)
    const button = e.target.closest('.button');
    if (button) {
      button.setAttribute('data-react-handler', 'true');
    }
    
    // actionType 기반 자동 액션 처리
    if (actionType) {
      handleAutoAction(e);
    }
  }, [disabled, actionType, handleAutoAction]);

  return (
    <button
      className={buttonClasses}
      data-tts-text={ttsText}
      onClick={onPressed}
      onTouchEnd={onPressed}
      onKeyDown={onPressed}
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

