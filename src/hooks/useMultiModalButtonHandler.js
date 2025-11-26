import { useEffect, useCallback, useRef, useContext, useState } from 'react';
import { AppContext } from '../contexts';
import { useTextHandler } from '../utils/tts';
import { useButtonUtils } from './useButtonUtils';
import { useTimer } from './useSingletonTimer';

// ============================================================================
// 상수 정의
// ============================================================================
const BEEP_SOUND_VOLUME = 0.5;
const PRESSED_STATE_TIMEOUT = 100;
const KEYBOARD_NAV_DELAY = 300;

const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  NUMPAD_ENTER: 'NumpadEnter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  BACKSPACE: 'Backspace',
  ASTERISK: '*',
  HASH: '#',
  H: 'h'
};

const KEYPAD_SCRIPT = '키패드 사용법,상 하 버튼으로 탐색 영역을 이동할 수 있습니다,좌 우 버튼으로 초점을 이동할 수 있습니다,동그라미 버튼으로 초점의 대상을 실행 또는 선택할 수 있습니다,홈 버튼으로 시작단계에서 음성유도 안내를 다시 듣거나, 작업 중인 경우 모든 선택을 취소하고 시작단계로 돌아올 수 있습니다,뒤로 버튼으로 이전 작업단계로 이동 할 수 있습니다, 별 버튼으로 키패드 사용법을 재생할 수 있습니다, 샵 버튼으로 직전 안내를 다시 들을 수 있습니다,';

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 옵션 객체 정규화 (기존 API 호환성)
 */
const normalizeOptions = (handleText, groupSelector, onToggle, prefix, options) => {
  if (typeof handleText === 'object' && handleText !== null && !groupSelector && !onToggle && !prefix) {
    return handleText;
  }
  return {
    handleText,
    groupSelector,
    onToggle,
    prefix,
    ...options
  };
};

// ============================================================================
// 메인 훅
// ============================================================================

/**
 * 통합 버튼 이벤트 핸들러 훅
 * 버튼 클릭, 키보드 네비게이션, TTS 재생, 토글 상태 관리 등을 통합 처리
 * 
 * @param {Object|Function} handleText - TTS 핸들러 함수 또는 옵션 객체
 * @param {string} groupSelector - 토글 그룹 선택자
 * @param {Function} onToggle - 토글 시 실행할 콜백 함수
 * @param {string} prefix - TTS 문구 앞에 추가할 접두사
 * @param {Object} options - 추가 옵션
 * @returns {Object|Function} handleButtonClick 또는 { handleButtonClick, updateFocusableSections }
 */
export const useMultiModalButtonHandler = (
  handleText = null,
  groupSelector = null,
  onToggle = null,
  prefix = '',
  options = {}
) => {
  // 옵션 정규화
  const opts = normalizeOptions(handleText, groupSelector, onToggle, prefix, options);

  const {
    handleText: handleTextOpt,
    groupSelector: groupSelectorOpt,
    onToggle: onToggleOpt,
    prefix: prefixOpt,
    onButtonClick = null,
    onToggleButtonClick = null,
    onKeyboardNavigation = null,
    initFocusableSections = [],
    initFirstButtonSection = "button",
    enableGlobalHandlers = true,
    enableKeyboardNavigation = false
  } = opts;

  // 버튼 유틸리티 훅 사용
  const {
    playBeepSound,
    toggleButtonPressedState,
    getButtonTTS,
    clearOtherButtonsInGroup,
    isButtonDisabled,
    isToggleButton,
    getFocusableButtons,
  } = useButtonUtils();

  // 타이머 훅 사용
  const { updateTimer } = useTimer();

  // AppContext에서 필요한 값들 가져오기
  const contextValue = enableKeyboardNavigation ? useContext(AppContext) : null;
  const {
    sections = {},
    isAccessibilityModal = false,
    setisAccessibilityModal = null,
    isReturnModal = false,
    setisReturnModal = null,
    isDeleteModal = false,
    setisDeleteModal = null,
    isDeleteCheckModal = false,
    setisDeleteCheckModal = null,
    isResetModal = false,
    setisResetModal = null,
    isCallModal = false,
    setisCallModal = null,
    isCreditPayContent = 0,
    setisCreditPayContent = null,
    volume = 1,
    commonScript = {},
    currentPage = '',
    goBack = null
  } = contextValue || {};

  // TTS 핸들러
  const { handleText: handleTextFromTTS, handleReplayText } = useTextHandler(volume);
  const finalHandleText = handleTextOpt || (enableKeyboardNavigation ? handleTextFromTTS : null);
  const finalHandleReplayText = enableKeyboardNavigation ? handleReplayText : null;

  // 핸들러 참조
  const handlersRef = useRef({
    resizeHandler: null,
    clickHandler: null,
    toggleClickHandler: null,
    blockDisabledHandler: null,
    keydownHandler: null,
    arrowKeyHandler: null,
    keyboardNavHandler: null,
    mousedownHandler: null,
    mouseupHandler: null,
    mouseleaveHandler: null,
    touchstartHandler: null,
    touchendHandler: null,
    touchcancelHandler: null
  });

  // 키보드 네비게이션 상태 관리
  const initialState = useRef({
    focusableSections: initFocusableSections,
    firstButtonSection: initFirstButtonSection,
  });
  const [focusableSections, setFocusableSections] = useState(initFocusableSections);
  const [firstButtonSection, setFirstButtonSection] = useState(initFirstButtonSection);

  const updateFocusableSections = useCallback((newSections) => {
    setFocusableSections(newSections);
  }, []);

  // ============================================================================
  // 키보드 네비게이션: 포커스 가능한 섹션 업데이트
  // ============================================================================
  useEffect(() => {
    if (!enableKeyboardNavigation || !contextValue) return;

    if (isAccessibilityModal) {
      setFocusableSections(["modalPage", "AccessibilitySections1", "AccessibilitySections2", "AccessibilitySections3", "AccessibilitySections4",
        "AccessibilitySections5", "AccessibilitySections6"]);
      setFirstButtonSection('AccessibilitySections1');
    } else if (isReturnModal || isResetModal || isDeleteModal || isDeleteCheckModal || isCallModal) {
      setFocusableSections(["modalPage", "confirmSections"]);
      setFirstButtonSection('confirmSections');
    } else if (currentPage === 'forth') {
      const creditPaySections = isCreditPayContent === 0 ? ["page", "middle", "bottom", "bottomfooter"]
        : isCreditPayContent === 7 ? ["page", "bottomfooter"]
          : ["page", "bottom", "bottomfooter"];
      setFocusableSections(creditPaySections);
      setFirstButtonSection('AccessibilitySections1');
    } else {
      setFocusableSections(initialState.current.focusableSections);
      setFirstButtonSection(initialState.current.firstButtonSection);
    }
  }, [enableKeyboardNavigation, contextValue, isAccessibilityModal, isReturnModal, isResetModal, isDeleteModal, isDeleteCheckModal, isCallModal, isCreditPayContent, currentPage]);

  // ============================================================================
  // 버튼 클릭 핸들러
  // ============================================================================
  const handleButtonClick = useCallback((e, value = null) => {
    const button = e.target.closest('.button');
    if (!button || isButtonDisabled(button)) {
      if (button && isButtonDisabled(button)) {
      e.preventDefault();
      e.stopPropagation();
      }
      return;
    }
    
    // React의 이벤트 시스템을 먼저 거치고, 그 다음 전역 핸들러로 넘어가도록
    // React의 onClick이 먼저 실행되므로 여기서 공통 로직 처리
    // 전역 핸들러는 data-react-handler를 확인하여 중복 처리 방지
    
    // 키보드 이벤트로 발생한 클릭인지 확인 (detail === 0)
    const isKeyboardEvent = e.detail === 0;
    
    updateTimer();
    
    // 비프음 재생 (마우스 또는 터치로 클릭된 경우만)
    if (!isKeyboardEvent) {
      playBeepSound();
      }
    
    button.setAttribute('data-react-handler', 'true');
    
    // 포커스 유지
    requestAnimationFrame(() => {
      if (button instanceof HTMLElement) {
        button.focus();
      }
    });
    
    const wasPressed = button.classList.contains('pressed');
    const iconPressed = button.querySelector('.content.icon.pressed');
    
    // 토글 버튼 처리 (React 이벤트에서 먼저 처리)
    if (isToggleButton(button)) {
    // 토글 버튼 그룹 스위칭 처리
      if (groupSelectorOpt) {
        const group = button.closest(groupSelectorOpt);
      if (group) {
          // 같은 그룹 내 다른 버튼의 pressed 상태 제거
          clearOtherButtonsInGroup(button, group);
        }
      }
      
      // 토글 상태 변경 (항상 실행 - 이미 pressed 상태일 때도 토글)
      toggleButtonPressedState(button, wasPressed, iconPressed);
    }
    
    // TTS 재생은 전역 핸들러에서 처리
    // (키보드 이벤트인 경우 버튼의 data-tts-text가 있으면 그 텍스트를 읽고, 없으면 "실행, "을 폴백값으로 사용)
    
    // 콜백 실행 (pressed 상태일 때도 다시 실행)
    if (onToggleOpt) {
      onToggleOpt(value !== null ? value : button.dataset.ttsText);
    }
  }, [
    finalHandleText,
    groupSelectorOpt,
    onToggleOpt,
    prefixOpt,
    playBeepSound,
    toggleButtonPressedState,
    clearOtherButtonsInGroup,
    isButtonDisabled,
    isToggleButton,
    updateTimer,
  ]);

  // ============================================================================
  // 전역 이벤트 핸들러: 윈도우 리사이즈
  // ============================================================================
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    let resizeScheduled = false;
    const handleResize = () => {
      if (resizeScheduled) return;
      resizeScheduled = true;
            requestAnimationFrame(() => {
        if (window.ButtonStyleGenerator) {
          window.ButtonStyleGenerator.calculateButtonSizes();
        }
        resizeScheduled = false;
      });
    };
    
    window.addEventListener('resize', handleResize);
    handlersRef.current.resizeHandler = handleResize;
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [enableGlobalHandlers]);

  // ============================================================================
  // 전역 이벤트 핸들러: 클릭 및 사운드 처리
  // ============================================================================
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const handleClick = (event) => {
      const button = event.target?.closest?.('.button');
      
      if (!button || isButtonDisabled(button)) {
        return;
      }
      
      // React의 onClick 핸들러가 이미 처리했는지 확인
      // React의 onClick이 먼저 실행되어 data-react-handler를 설정하면
      // 전역 핸들러는 공통 로직만 처리
      if (button.hasAttribute('data-react-handler')) {
        // React의 onClick이 이미 처리했으므로 공통 로직만 처리
        updateTimer();
        
        const target = event.target;
        if (target && (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') && event.detail !== 0) {
          playBeepSound();
              }
        
        // TTS 재생 (모든 입력: 마우스, 터치, 키보드에 적용)
        // 버튼에 data-tts-text가 있으면 그 텍스트를 읽고, 없으면 "실행, "을 폴백값으로 사용
        if (finalHandleText) {
          const ttsText = getButtonTTS(button, prefixOpt);
          finalHandleText(ttsText, false);
        }
        
        // 포커스 유지
        requestAnimationFrame(() => {
          if (button instanceof HTMLElement) {
            button.focus();
          }
        });
        return;
    }
    
      // React의 onClick이 실행되지 않은 경우 - 직접 입력 차단
      // React 이벤트 시스템을 거치지 않은 직접 입력은 무시
      // 단, 터치 이벤트의 경우 브라우저가 자동으로 click 이벤트를 발생시키므로
      // touchend는 무시하고 click 이벤트만 처리
      event.preventDefault();
      event.stopPropagation();
      console.warn('⚠️ [handleClick] Direct input detected without React handler. Event blocked.');
    };
    
    // bubble phase에서 실행하여 React의 onClick이 먼저 실행되도록 함
    // 모바일에서 터치 이벤트는 브라우저가 자동으로 click 이벤트로 변환하므로
    // touchend는 처리하지 않고 click만 처리
    document.addEventListener('click', handleClick, false);
    handlersRef.current.clickHandler = handleClick;
    
    return () => {
      document.removeEventListener('click', handleClick, false);
    };
  }, [
    enableGlobalHandlers,
    onButtonClick,
    playBeepSound,
    getButtonTTS,
    isButtonDisabled,
    prefixOpt,
    finalHandleText,
    updateTimer,
  ]);

  // ============================================================================
  // 전역 이벤트 핸들러: 토글 버튼 클릭 처리 (React 이벤트 버블링만 처리)
  // ============================================================================
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const handleToggleClick = (event) => {
      const button = event.target?.closest?.('.button');
      if (!button || isButtonDisabled(button) || !isToggleButton(button)) {
        return;
      }

      // React의 onClick이 있으면 이미 처리되었으므로 무시
      // React 이벤트 시스템이 먼저 처리하도록 함
      if (!button.hasAttribute('data-react-handler')) {
        // React 이벤트를 거치지 않은 직접 입력 차단
        event.preventDefault();
        event.stopPropagation();
        console.warn('⚠️ [handleToggleClick] Direct input detected without React handler. Event blocked.');
        return;
      }

      // React 이벤트가 처리한 경우, 추가 처리가 필요한 경우만 실행
      // (현재는 React의 handleButtonClick에서 모든 토글 처리를 하므로 여기는 실행되지 않음)
      if (onToggleButtonClick) {
        onToggleButtonClick(event, button);
      }
    };
    
    document.addEventListener('click', handleToggleClick, false);
    handlersRef.current.toggleClickHandler = handleToggleClick;
    
    return () => {
      document.removeEventListener('click', handleToggleClick, false);
    };
  }, [
    enableGlobalHandlers,
    onToggleButtonClick,
    isButtonDisabled,
    isToggleButton,
  ]);

  // ============================================================================
  // 전역 이벤트 핸들러: 비활성 버튼 차단
  // ============================================================================
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const blockDisabled = (event) => {
      const disabledButton = event.target?.closest?.('.button[aria-disabled="true"]');
      if (disabledButton) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') {
          event.stopImmediatePropagation();
        }
      }
    };
    
    document.addEventListener('click', blockDisabled, true);
    handlersRef.current.blockDisabledHandler = blockDisabled;
    
    return () => {
      document.removeEventListener('click', blockDisabled, true);
    };
  }, [enableGlobalHandlers]);

  // ============================================
  // 전역 이벤트 핸들러: 키보드 입력 처리 (Enter, Space)
  // ============================================
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const handleKeydown = (event) => {
      const button = event.target?.closest('.button');
      
      if (isButtonDisabled(button) && 
          (event.key === KEYBOARD_KEYS.SPACE || event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.NUMPAD_ENTER)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (!button || isButtonDisabled(button)) {
        return;
      }

      if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.NUMPAD_ENTER || event.key === KEYBOARD_KEYS.SPACE) {
        // React의 이벤트 시스템을 먼저 거치고, 그 다음 전역 핸들러로 넘어가도록
        // React의 onClick이 이미 처리했는지 확인
        if (button.hasAttribute('data-react-handler')) {
          // React의 onClick이 이미 처리했으므로 공통 로직만 처리
          // TTS 재생 (모든 입력: 마우스, 터치, 키보드에 적용)
          // 버튼에 data-tts-text가 있으면 그 텍스트를 읽고, 없으면 "실행, "을 폴백값으로 사용
          if (finalHandleText) {
            const ttsText = getButtonTTS(button, prefixOpt);
            finalHandleText(ttsText, false);
          }
          
          updateTimer();
          
          // 포커스 유지
        requestAnimationFrame(() => {
            if (button instanceof HTMLElement) {
              button.focus();
            }
          });
          return;
        }
        
        // React의 onClick이 아직 실행되지 않은 경우
        // React의 이벤트 시스템을 거치도록 클릭 이벤트를 dispatch
        event.preventDefault();
        event.stopPropagation();
        
        // React의 이벤트 시스템을 거치도록 클릭 이벤트를 dispatch
        // React는 이벤트를 가상 DOM을 통해 처리하므로,
        // 실제 DOM 이벤트를 dispatch하면 React의 이벤트 시스템이 자동으로 처리함
        const syntheticEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          button: 0,
          detail: 0 // 키보드 이벤트임을 표시
        });
        
        // React의 이벤트 시스템이 이벤트를 감지하도록 dispatch
        // React의 onClick이 먼저 실행되고, 그 다음 버블링되어 전역 핸들러로 전달됨
        button.dispatchEvent(syntheticEvent);
      }
    };
    
    // bubble phase에서 실행하여 React의 onKeyDown이 먼저 실행되도록 함
    // React의 이벤트 시스템을 먼저 거치고, 그 다음 전역 핸들러로 넘어가도록
    document.addEventListener('keydown', handleKeydown, false);
    handlersRef.current.keydownHandler = handleKeydown;
    
    return () => {
      document.removeEventListener('keydown', handleKeydown, false);
    };
  }, [
    enableGlobalHandlers,
    finalHandleText,
    prefixOpt,
    onToggleOpt,
    groupSelectorOpt,
    updateTimer,
    getButtonTTS,
    isButtonDisabled,
    isToggleButton,
  ]);

  // ============================================================================
  // 전역 이벤트 핸들러: 방향키 네비게이션
  // ============================================================================
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const handleArrowKeys = (event) => {
      if (onKeyboardNavigation) {
        const handled = onKeyboardNavigation(event);
        if (handled) return;
      }

      const focusedButton = document.activeElement;
      const isArrowKey = [
        KEYBOARD_KEYS.ARROW_DOWN, 
        KEYBOARD_KEYS.ARROW_UP, 
        KEYBOARD_KEYS.ARROW_RIGHT, 
        KEYBOARD_KEYS.ARROW_LEFT, 
        KEYBOARD_KEYS.HOME, 
        KEYBOARD_KEYS.END
      ].includes(event.key);
      
      if ((!focusedButton || !focusedButton.classList.contains('button')) && isArrowKey) {
        event.preventDefault();
        const firstButton = document.querySelector('.button');
        if (firstButton) {
          firstButton.focus();
        }
        return;
      }

      if (!focusedButton || !focusedButton.classList.contains('button')) {
        return;
      }

      const allButtons = getFocusableButtons();
      let targetButton = null;

      switch (event.key) {
        case KEYBOARD_KEYS.ARROW_RIGHT:
          event.preventDefault();
          const currentIndex = allButtons.indexOf(focusedButton);
          targetButton = allButtons[(currentIndex + 1) % allButtons.length];
          break;
          
        case KEYBOARD_KEYS.ARROW_LEFT:
          event.preventDefault();
          const currentIndex2 = allButtons.indexOf(focusedButton);
          targetButton = allButtons[currentIndex2 === 0 ? allButtons.length - 1 : currentIndex2 - 1];
          break;

        case KEYBOARD_KEYS.ARROW_DOWN:
          event.preventDefault();
          const currentContainer = focusedButton.closest('.showcase');
          const currentIndexForDown = allButtons.indexOf(focusedButton);
          
          for (let i = 1; i < allButtons.length; i++) {
            const nextIndex = (currentIndexForDown + i) % allButtons.length;
            const nextButton = allButtons[nextIndex];
            if (nextButton.closest('.showcase') !== currentContainer) {
              targetButton = nextButton;
              break;
            }
          }
          break;
          
        case KEYBOARD_KEYS.ARROW_UP:
          event.preventDefault();
          const currentContainerUp = focusedButton.closest('.showcase');
          const currentIndexUp = allButtons.indexOf(focusedButton);
          
          for (let i = 1; i < allButtons.length; i++) {
            const prevIndex = (currentIndexUp - i + allButtons.length) % allButtons.length;
            const prevButton = allButtons[prevIndex];
            const prevContainer = prevButton.closest('.showcase');
            
            if (prevContainer !== currentContainerUp) {
              const buttonsInPrevContainer = allButtons.filter(btn => btn.closest('.showcase') === prevContainer);
              targetButton = buttonsInPrevContainer[0];
              break;
            }
          }
          break;
        
        case KEYBOARD_KEYS.HOME:
          event.preventDefault();
          targetButton = allButtons[0];
          break;
        
        case KEYBOARD_KEYS.END:
          event.preventDefault();
          targetButton = allButtons[allButtons.length - 1];
          break;
      }

      if (targetButton) {
        targetButton.focus();
      }
    };
    
    document.addEventListener('keydown', handleArrowKeys, true);
    handlersRef.current.arrowKeyHandler = handleArrowKeys;
    
    return () => {
      document.removeEventListener('keydown', handleArrowKeys, true);
    };
  }, [enableGlobalHandlers, onKeyboardNavigation]);

  // ============================================
  // 키보드 네비게이션: 섹션 기반 네비게이션
  // ============================================
  useEffect(() => {
    if (!enableKeyboardNavigation || !contextValue) return;

    const getSectionIndex = (element) => {
      return focusableSections.findIndex(
        (section) =>
          sections[section]?.current &&
          sections[section].current.contains(element)
      );
    };

    const moveFocus = (sectionIndex, itemIndex = 0, isLast = false) => {
      const section = sections[focusableSections[sectionIndex]]?.current;
      if (!section) return;

      const isEnteringSection = sectionIndex !== getSectionIndex(document.activeElement);
      let ttsText = "";

      if (isEnteringSection) {
        ttsText += section.dataset.ttsText || "";
      }

      const focusableItems = Array.from(section.querySelectorAll("button"));
      const targetElement = isLast
        ? focusableItems[focusableItems.length - 1]
        : focusableItems[itemIndex];

      if (targetElement) {
        ttsText += targetElement.dataset.ttsText || "";
        if (finalHandleText) finalHandleText(ttsText);
        targetElement.focus();
      }
    };

    const handleKeyDown = (event) => {
      updateTimer();
      const key = event.key;
      const activeElement = document.activeElement;
      const currentSectionIndex = getSectionIndex(activeElement);

      const focusableItems = Array.from(
        sections[focusableSections[currentSectionIndex]]?.current.querySelectorAll("button") || []
      );
      const currentItemIndex = focusableItems.indexOf(activeElement);

      const isAnyModalOpen = isReturnModal || isAccessibilityModal || isDeleteCheckModal || 
                            isDeleteModal || isResetModal || isCallModal;

      switch (key) {
        case KEYBOARD_KEYS.ARROW_UP:
          if (currentSectionIndex > 0) {
            moveFocus(currentSectionIndex - 1);
          } else if (finalHandleText) {
            finalHandleText('이전 영역이 없습니다.', false);
          }
          break;
 
        case KEYBOARD_KEYS.ARROW_DOWN:
          if (currentSectionIndex < focusableSections.length - 1) {
            moveFocus(currentSectionIndex + 1);
          } else if (finalHandleText) {
            finalHandleText('다음 영역이 없습니다.', false);
          }
          break;

        case KEYBOARD_KEYS.ARROW_LEFT:
          if (currentItemIndex > 0) {
            moveFocus(currentSectionIndex, currentItemIndex - 1);
          } else if (currentSectionIndex > 0) {
            moveFocus(currentSectionIndex - 1, 0, true);
          } else if (finalHandleText) {
            finalHandleText('이전 영역이 없습니다.', false);
          }
          break;

        case KEYBOARD_KEYS.ARROW_RIGHT:
          if (currentItemIndex < focusableItems.length - 1) {
            moveFocus(currentSectionIndex, currentItemIndex + 1);
          } else if (currentSectionIndex < focusableSections.length - 1) {
            moveFocus(currentSectionIndex + 1);
          } else if (finalHandleText) {
            finalHandleText('다음 영역이 없습니다.', false);
          }
          break;

        case KEYBOARD_KEYS.HOME:
          if (isAnyModalOpen) {
            if (finalHandleText) finalHandleText('홈, 진행 중인 작업이 있어 이동 할 수 없습니다');
            return;
          }
          if (currentPage === 'forth' && isCreditPayContent > 2) {
            if (finalHandleText) finalHandleText('홈, 결제 과정에 진입하여 이동할 수 없습니다.');
            return;
          }
          if (finalHandleText) finalHandleText('홈, ');
          if (document.activeElement) document.activeElement.blur();
          setTimeout(() => {
            if (currentPage !== 'first' && currentPage !== '') {
              if (setisReturnModal) setisReturnModal(true);
            } else if (finalHandleText && commonScript?.intro) {
              finalHandleText(commonScript.intro);
            }
          }, KEYBOARD_NAV_DELAY);
          break;
        
        case KEYBOARD_KEYS.ASTERISK:
          if (finalHandleText) finalHandleText(KEYPAD_SCRIPT);
          break;

        case KEYBOARD_KEYS.HASH:
          if (finalHandleReplayText) finalHandleReplayText();
          break;

        case KEYBOARD_KEYS.H:
          if (setisReturnModal) setisReturnModal(false);
          if (setisResetModal) setisResetModal(false);
          if (setisDeleteModal) setisDeleteModal(false);
          if (setisDeleteCheckModal) setisDeleteCheckModal(false);
          if (setisAccessibilityModal) setisAccessibilityModal(false);
          if (setisCallModal) setisCallModal(true);
          break;

        case KEYBOARD_KEYS.BACKSPACE:
          if (isAnyModalOpen) {
            if (finalHandleText) finalHandleText('뒤로, 진행 중인 작업이 있어 이동 할 수 없습니다');
            return;
          }
          if (currentPage === 'forth' && isCreditPayContent > 2) {
            if (finalHandleText) finalHandleText('뒤로, 결제 과정에 진입하여 이동할 수 없습니다.');
            return;
          }
          if (finalHandleText) finalHandleText('뒤로, ');
          if (currentPage === 'first' || currentPage === '') {
            return;
    }
          setTimeout(() => {
            if (currentPage === 'forth' && [1, 2].includes(isCreditPayContent)) {
              if (setisCreditPayContent) setisCreditPayContent(0);
            } else if (goBack) {
              goBack();
            }
          }, KEYBOARD_NAV_DELAY);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    handlersRef.current.keyboardNavHandler = handleKeyDown;

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    enableKeyboardNavigation,
    contextValue,
    focusableSections,
    sections,
    isAccessibilityModal,
    isReturnModal,
    isDeleteModal,
    isDeleteCheckModal,
    isResetModal,
    isCallModal,
    getFocusableButtons,
    isButtonDisabled,
    isToggleButton, 
    isCreditPayContent, 
    currentPage, 
    commonScript, 
    finalHandleText, 
    finalHandleReplayText, 
    setisReturnModal, 
    setisResetModal, 
    setisDeleteModal, 
    setisDeleteCheckModal, 
    setisAccessibilityModal, 
    setisCallModal, 
    setisCreditPayContent, 
    goBack
  ]);

  // ============================================
  // 전역 이벤트 핸들러: 마우스/터치 이벤트 처리
  // ============================================
  useEffect(() => {
    if (!enableGlobalHandlers) return;

    const handlePressedState = (event, action) => {
      const button = event.target?.closest?.('.button');
      if (!button || isButtonDisabled(button) || isToggleButton(button)) {
        return;
    }
    
      if (action === 'add') {
        button.classList.add('pressed');
      } else if (action === 'remove' && button.classList.contains('pressed')) {
        button.classList.remove('pressed');
        // 마우스/터치 이벤트 후 포커스 유지
        requestAnimationFrame(() => {
          if (button instanceof HTMLElement && document.activeElement !== button) {
            button.focus();
          }
        });
      }
    };

    const handleMouseDown = (event) => handlePressedState(event, 'add');
    const handleMouseUp = (event) => {
      handlePressedState(event, 'remove');
      // 마우스 업 후 포커스 유지
      const button = event.target?.closest?.('.button');
      if (button && !isButtonDisabled(button) && !isToggleButton(button)) {
        requestAnimationFrame(() => {
          if (button instanceof HTMLElement) {
            button.focus();
          }
        });
      }
    };
    const handleMouseLeave = (event) => {
      if (event.target?.closest) {
        handlePressedState(event, 'remove');
    }
    };
    const handleTouchStart = (event) => handlePressedState(event, 'add');
    const handleTouchEnd = (event) => {
      handlePressedState(event, 'remove');
      // 터치 엔드 후 포커스 유지
      const button = event.target?.closest?.('.button');
      if (button && !isButtonDisabled(button) && !isToggleButton(button)) {
        requestAnimationFrame(() => {
          if (button instanceof HTMLElement) {
            button.focus();
          }
        });
      }
    };
    const handleTouchCancel = (event) => handlePressedState(event, 'remove');

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    handlersRef.current.mousedownHandler = handleMouseDown;
    handlersRef.current.mouseupHandler = handleMouseUp;
    handlersRef.current.mouseleaveHandler = handleMouseLeave;
    handlersRef.current.touchstartHandler = handleTouchStart;
    handlersRef.current.touchendHandler = handleTouchEnd;
    handlersRef.current.touchcancelHandler = handleTouchCancel;

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('touchstart', handleTouchStart, { passive: true });
      document.removeEventListener('touchend', handleTouchEnd, { passive: true });
      document.removeEventListener('touchcancel', handleTouchCancel, { passive: true });
    };
  }, [enableGlobalHandlers]);

  // ============================================
  // 반환값
  // ============================================
  if (enableKeyboardNavigation) {
    return {
      handleButtonClick,
      updateFocusableSections
    };
  }

  return handleButtonClick;
};

/**
 * useButtonTTS 호환 함수 (기존 API 유지)
 * @deprecated useMultiModalButtonHandler를 직접 사용하세요
 */
export const useButtonTTS = (handleText, prefix = '') => {
  return useMultiModalButtonHandler({
    handleText,
    prefix,
    enableGlobalHandlers: false,
    enableKeyboardNavigation: false
  });
};
