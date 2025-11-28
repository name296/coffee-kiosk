// ============================================================================
// 버튼 스타일 시스템 통합 훅
// 동적 스타일(padding, border-radius) + 이벤트 핸들러
// 팔레트 CSS는 App.css에서 정적으로 관리
// ============================================================================

import { useEffect, useCallback, useRef, useState } from 'react';

// ============================================================================
// 키보드 상수
// ============================================================================

const KEYBOARD_KEYS = {
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
};

// ============================================================================
// 버튼 동적 스타일 상수
// ============================================================================

const BASE = 0.03125; // 1/32

export const BUTTON_CONSTANTS = {
  BASE,
  BACKGROUND_BORDER_RADIUS: BASE,
  BUTTON_BORDER_RADIUS: 2 * BASE,
  BACKGROUND_OUTLINE_WIDTH: BASE,
  BUTTON_PADDING: BASE,
  BUTTON_OUTLINE_WIDTH: 3 * BASE,
  BUTTON_OUTLINE_OFFSET: -1 * BASE,
  SELECTED_ICON_SIZE: 4 * BASE,
};

// ============================================================================
// 동적 스타일 적용
// ============================================================================

const styleCache = new WeakMap();

/**
 * 단일 버튼에 동적 스타일 적용
 * @param {HTMLElement} button - 버튼 요소
 */
export const applyButtonDynamicStyles = (button) => {
  const background = button.querySelector('.background.dynamic') || button.querySelector('.background');
  if (!background) return;

  const rect = button.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  
  const minSide = Math.min(rect.width, rect.height);

  // 스타일 계산
  const buttonPadding = minSide * BUTTON_CONSTANTS.BUTTON_PADDING;
  const buttonBorderRadius = minSide * BUTTON_CONSTANTS.BUTTON_BORDER_RADIUS;
  const buttonOutlineWidth = minSide * BUTTON_CONSTANTS.BUTTON_OUTLINE_WIDTH;
  const buttonOutlineOffset = minSide * BUTTON_CONSTANTS.BUTTON_OUTLINE_OFFSET;
  const backgroundBorderRadius = minSide * BUTTON_CONSTANTS.BACKGROUND_BORDER_RADIUS;
  const backgroundOutlineWidth = minSide * BUTTON_CONSTANTS.BACKGROUND_OUTLINE_WIDTH;
  const iconSize = minSide * BUTTON_CONSTANTS.SELECTED_ICON_SIZE;

  // 캐시 확인
  const cached = styleCache.get(button) || {};
  if (cached.minSide === minSide) return;

  // 버튼 스타일 적용
  button.style.padding = `${buttonPadding}px`;
  button.style.borderRadius = `${buttonBorderRadius}px`;
  button.style.outlineWidth = `${buttonOutlineWidth}px`;
  button.style.outlineOffset = `${buttonOutlineOffset}px`;

  // 배경 스타일 적용
  background.style.borderRadius = `${backgroundBorderRadius}px`;
  background.style.outlineWidth = `${backgroundOutlineWidth}px`;

  // 아이콘 스타일 적용
  const iconPressed = button.querySelector('.content.icon.pressed');
  if (iconPressed) {
    iconPressed.style.width = `${iconSize}px`;
    iconPressed.style.height = `${iconSize}px`;
    iconPressed.style.top = `${buttonPadding}px`;
    iconPressed.style.right = `${buttonPadding}px`;
  }

  // 캐시 저장
  styleCache.set(button, { minSide, buttonPadding });
};

/**
 * 모든 버튼에 스타일 적용
 */
const applyAllDynamicStyles = () => {
  const buttons = document.querySelectorAll('.button');
  buttons.forEach(applyButtonDynamicStyles);
};

// ============================================================================
// 버튼 상태 헬퍼
// ============================================================================

const isButtonDisabled = (button) => {
  return button.classList.contains('disabled') || 
         button.getAttribute('aria-disabled') === 'true' ||
         button.disabled === true;
};

const isToggleButton = (button) => {
  return button.classList.contains('toggle');
};

// ============================================================================
// 통합 훅
// ============================================================================

/**
 * 버튼 스타일 시스템 통합 훅
 * - 팔레트 CSS 주입
 * - 동적 스타일 (padding, border-radius 등) 적용
 * - 새 버튼 감지 및 자동 스타일 적용
 * 
 * @param {Object} options - 옵션
 * @param {Array<string>} options.additionalPalettes - 추가 팔레트
 */
export const useButtonStyleSystem = (options = {}) => {
  const { additionalPalettes = [] } = options;
  
  const rafIdRef = useRef(null);
  
  // 동적 스타일 적용 (debounced)
  const applyDynamicStyles = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(() => {
      applyAllDynamicStyles();
    });
  }, []);
  
  useEffect(() => {
    // 팔레트 CSS는 이제 정적 CSS(App.css)에서 처리
    // 리사이즈 시 동적 스타일(padding, border-radius) 재계산만 수행
    const handleResize = () => {
      applyDynamicStyles();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 클린업
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [applyDynamicStyles]);
  
  return {
    applyDynamicStyles,
  };
};

// ============================================================================
// 멀티모달 버튼 핸들러 훅
// 키보드 네비게이션 + 버튼 이벤트 처리
// ============================================================================

/**
 * 멀티모달 버튼 핸들러 훅
 * 키보드 네비게이션 및 버튼 상호작용 처리
 */
export const useMultiModalButtonHandler = (options = {}) => {
  const {
    initFocusableSections = [],
    initFirstButtonSection = null,
    enableGlobalHandlers = true,
    handleTextOpt = null,
    prefixOpt = '',
    enableKeyboardNavigation = false,
  } = options;

  const [, setFocusableSections] = useState(initFocusableSections);
  const handlersRef = useRef({});

  // 키보드 네비게이션 상태 관리
  const keyboardNavState = useRef({
    currentSectionIndex: 0,
    currentButtonIndex: 0,
    sections: initFocusableSections,
    firstButtonSection: initFirstButtonSection
  });

  // 섹션 업데이트 함수
  const updateFocusableSections = useCallback((newSections) => {
    setFocusableSections(newSections);
    keyboardNavState.current.sections = newSections;
  }, []);

  // TTS 핸들러
  const finalHandleText = useCallback((text) => {
    if (handleTextOpt && typeof handleTextOpt === 'function') {
      handleTextOpt(text);
    }
  }, [handleTextOpt]);

  // 버튼 클릭 핸들러 (React 컴포넌트는 data-react-handler로 스킵)
  const handleButtonClick = useCallback((event) => {
    const button = event.target?.closest?.('.button');
    if (!button || isButtonDisabled(button)) return;
    if (button.dataset.reactHandler === 'true') return;

    const ttsText = button.dataset.ttsText;
    if (ttsText && finalHandleText) {
      const fullText = prefixOpt ? `${prefixOpt}${ttsText}` : ttsText;
      finalHandleText(fullText);
    }
  }, [finalHandleText, prefixOpt]);

  // 전역 이벤트 핸들러: 토글 버튼 클릭
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const handleToggleClick = (event) => {
      const button = event.target?.closest?.('.button');
      if (!button || isButtonDisabled(button) || !isToggleButton(button)) return;
      if (button.dataset.reactHandler === 'true') return;
    };
    
    document.addEventListener('click', handleToggleClick, false);
    handlersRef.current.toggleClickHandler = handleToggleClick;
    
    return () => document.removeEventListener('click', handleToggleClick, false);
  }, [enableGlobalHandlers]);

  // 전역 이벤트 핸들러: 비활성 버튼 차단
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const blockDisabledButtons = (event) => {
      const button = event.target?.closest?.('.button');
      if (button && isButtonDisabled(button)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('click', blockDisabledButtons, true);
    return () => document.removeEventListener('click', blockDisabledButtons, true);
  }, [enableGlobalHandlers]);

  // 전역 이벤트 핸들러: 키보드 네비게이션
  useEffect(() => {
    if (!enableGlobalHandlers || !enableKeyboardNavigation) return;

    const handleKeydown = (event) => {
      const { key } = event;
      
      if ([KEYBOARD_KEYS.ARROW_UP, KEYBOARD_KEYS.ARROW_DOWN, 
           KEYBOARD_KEYS.ARROW_LEFT, KEYBOARD_KEYS.ARROW_RIGHT].includes(key)) {
        event.preventDefault();
        
        const activeElement = document.activeElement;
        if (!activeElement) return;
        
        const currentSection = activeElement.closest('[data-tts-text]');
        if (!currentSection) return;
        
        const buttons = currentSection.querySelectorAll('.button:not([aria-disabled="true"])');
        const currentIndex = Array.from(buttons).indexOf(activeElement);
        
        let nextIndex = currentIndex;
        if (key === KEYBOARD_KEYS.ARROW_RIGHT || key === KEYBOARD_KEYS.ARROW_DOWN) {
          nextIndex = (currentIndex + 1) % buttons.length;
        } else if (key === KEYBOARD_KEYS.ARROW_LEFT || key === KEYBOARD_KEYS.ARROW_UP) {
          nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        }
        
        if (buttons[nextIndex]) buttons[nextIndex].focus();
      }
      
      if (key === KEYBOARD_KEYS.TAB) {
        const sections = keyboardNavState.current.sections;
        if (sections.length === 0) return;
        
        event.preventDefault();
        
        const currentSectionIndex = keyboardNavState.current.currentSectionIndex;
        const nextSectionIndex = event.shiftKey 
          ? (currentSectionIndex - 1 + sections.length) % sections.length
          : (currentSectionIndex + 1) % sections.length;
        
        const nextSection = sections[nextSectionIndex]?.current;
        if (nextSection) {
          const firstButton = nextSection.querySelector('.button:not([aria-disabled="true"])');
          if (firstButton) {
            firstButton.focus();
            keyboardNavState.current.currentSectionIndex = nextSectionIndex;
          }
        }
      }
      
      if (key === KEYBOARD_KEYS.ENTER || key === KEYBOARD_KEYS.SPACE) {
        const activeElement = document.activeElement;
        if (activeElement?.classList?.contains('button')) {
          event.preventDefault();
          activeElement.click();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeydown, true);
    return () => document.removeEventListener('keydown', handleKeydown, true);
  }, [enableGlobalHandlers, enableKeyboardNavigation]);

  // 전역 이벤트 핸들러: 마우스/터치 이벤트
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const handlePressedState = (event, action) => {
      const button = event.target?.closest?.('.button');
      if (!button || isButtonDisabled(button) || isToggleButton(button)) return;
      if (button.dataset.reactHandler === 'true') return;
    
      if (action === 'add') {
        button.classList.add('pressed');
      } else if (action === 'remove' && button.classList.contains('pressed')) {
        button.classList.remove('pressed');
        requestAnimationFrame(() => {
          if (button instanceof HTMLElement && document.activeElement !== button) {
            button.focus();
          }
        });
      }
    };

    const handleMouseDown = (e) => handlePressedState(e, 'add');
    const handleMouseUp = (e) => {
      handlePressedState(e, 'remove');
      const button = e.target?.closest?.('.button');
      if (button && !isButtonDisabled(button) && !isToggleButton(button) && button.dataset.reactHandler !== 'true') {
        requestAnimationFrame(() => button instanceof HTMLElement && button.focus());
      }
    };
    const handleMouseLeave = (e) => e.target?.closest && handlePressedState(e, 'remove');
    const handleTouchStart = (e) => handlePressedState(e, 'add');
    const handleTouchEnd = (e) => {
      handlePressedState(e, 'remove');
      const button = e.target?.closest?.('.button');
      if (button && !isButtonDisabled(button) && !isToggleButton(button) && button.dataset.reactHandler !== 'true') {
        requestAnimationFrame(() => button instanceof HTMLElement && button.focus());
      }
    };
    const handleTouchCancel = (e) => handlePressedState(e, 'remove');

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
  }, [enableGlobalHandlers]);

  return enableKeyboardNavigation 
    ? { handleButtonClick, updateFocusableSections }
    : { handleButtonClick };
};

// ============================================================================
// 버튼 TTS 훅
// ============================================================================

export const useButtonTTS = (handleText, prefix = '') => {
  return useCallback((event) => {
    const button = event.target?.closest?.('.button');
    if (!button) return;
    
    const ttsText = button.dataset.ttsText;
    if (ttsText && handleText) {
      const fullText = prefix ? `${prefix}${ttsText}` : ttsText;
      handleText(fullText);
    }
  }, [handleText, prefix]);
};

export default useButtonStyleSystem;

