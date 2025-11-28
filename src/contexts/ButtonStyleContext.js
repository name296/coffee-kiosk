/**
 * ButtonStyleContext
 * 버튼 스타일 상태를 React 방식으로 관리
 * 
 * 역할:
 * 1. pressed 상태 관리 (toggle 버튼)
 * 2. 버튼 그룹 관리 (라디오 버튼 동작)
 * 3. 비프음/TTS 재생
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSound } from '../hooks/useSound';

// ============================================================================
// Context 생성
// ============================================================================

export const ButtonStyleContext = createContext(null);

// ============================================================================
// Provider 컴포넌트
// ============================================================================

export const ButtonStyleProvider = ({ children }) => {
  // 버튼 그룹별 pressed 상태 관리
  // key: groupId, value: pressedButtonId
  const [groupStates, setGroupStates] = useState({});
  
  // 개별 버튼 pressed 상태 (그룹에 속하지 않는 버튼용)
  // key: buttonId, value: boolean
  const [buttonStates, setButtonStates] = useState({});
  
  // 사운드 훅
  const { play: playSound } = useSound();

  // ============================================================================
  // 비프음 재생
  // ============================================================================
  
  const playBeepSound = useCallback(() => {
    playSound('onPressed');
  }, [playSound]);

  // ============================================================================
  // 개별 버튼 pressed 상태 관리
  // ============================================================================
  
  /**
   * 버튼의 pressed 상태 설정
   * @param {string} buttonId - 버튼 고유 ID
   * @param {boolean} pressed - pressed 상태
   */
  const setButtonPressed = useCallback((buttonId, pressed) => {
    setButtonStates(prev => ({
      ...prev,
      [buttonId]: pressed
    }));
  }, []);

  /**
   * 버튼의 pressed 상태 토글
   * @param {string} buttonId - 버튼 고유 ID
   * @returns {boolean} 새로운 pressed 상태
   */
  const toggleButtonPressed = useCallback((buttonId) => {
    let newState;
    setButtonStates(prev => {
      newState = !prev[buttonId];
      return {
        ...prev,
        [buttonId]: newState
      };
    });
    return newState;
  }, []);

  /**
   * 버튼의 pressed 상태 가져오기
   * @param {string} buttonId - 버튼 고유 ID
   * @returns {boolean} pressed 상태
   */
  const isButtonPressed = useCallback((buttonId) => {
    return buttonStates[buttonId] || false;
  }, [buttonStates]);

  // ============================================================================
  // 버튼 그룹 상태 관리 (라디오 버튼 동작)
  // ============================================================================

  /**
   * 그룹 내 버튼 선택 (라디오 버튼 동작)
   * @param {string} groupId - 그룹 ID
   * @param {string} buttonId - 선택할 버튼 ID
   */
  const selectInGroup = useCallback((groupId, buttonId) => {
    setGroupStates(prev => ({
      ...prev,
      [groupId]: buttonId
    }));
  }, []);

  /**
   * 그룹 내 선택된 버튼 ID 가져오기
   * @param {string} groupId - 그룹 ID
   * @returns {string|null} 선택된 버튼 ID
   */
  const getSelectedInGroup = useCallback((groupId) => {
    return groupStates[groupId] || null;
  }, [groupStates]);

  /**
   * 그룹 내 특정 버튼이 선택되었는지 확인
   * @param {string} groupId - 그룹 ID
   * @param {string} buttonId - 확인할 버튼 ID
   * @returns {boolean} 선택 여부
   */
  const isSelectedInGroup = useCallback((groupId, buttonId) => {
    return groupStates[groupId] === buttonId;
  }, [groupStates]);

  /**
   * 그룹 선택 해제
   * @param {string} groupId - 그룹 ID
   */
  const clearGroupSelection = useCallback((groupId) => {
    setGroupStates(prev => {
      const newState = { ...prev };
      delete newState[groupId];
      return newState;
    });
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue = useMemo(() => ({
    // 비프음
    playBeepSound,
    
    // 개별 버튼 상태
    setButtonPressed,
    toggleButtonPressed,
    isButtonPressed,
    buttonStates,
    
    // 그룹 상태
    selectInGroup,
    getSelectedInGroup,
    isSelectedInGroup,
    clearGroupSelection,
    groupStates,
  }), [
    playBeepSound,
    setButtonPressed,
    toggleButtonPressed,
    isButtonPressed,
    buttonStates,
    selectInGroup,
    getSelectedInGroup,
    isSelectedInGroup,
    clearGroupSelection,
    groupStates,
  ]);

  return (
    <ButtonStyleContext.Provider value={contextValue}>
      {children}
    </ButtonStyleContext.Provider>
  );
};

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * ButtonStyleContext 사용 훅
 */
export const useButtonStyle = () => {
  const context = useContext(ButtonStyleContext);
  if (!context) {
    // Context 없이도 기본 동작하도록 폴백
    return {
      playBeepSound: () => {},
      setButtonPressed: () => {},
      toggleButtonPressed: () => false,
      isButtonPressed: () => false,
      buttonStates: {},
      selectInGroup: () => {},
      getSelectedInGroup: () => null,
      isSelectedInGroup: () => false,
      clearGroupSelection: () => {},
      groupStates: {},
    };
  }
  return context;
};

/**
 * 개별 버튼 상태 관리 훅
 * @param {string} buttonId - 버튼 고유 ID
 * @param {boolean} initialPressed - 초기 pressed 상태
 */
export const useButtonState = (buttonId, initialPressed = false) => {
  const { setButtonPressed, isButtonPressed, toggleButtonPressed, playBeepSound } = useButtonStyle();
  
  // 초기 상태 설정 (마운트 시 한 번만)
  React.useEffect(() => {
    if (initialPressed) {
      setButtonPressed(buttonId, true);
    }
  }, [buttonId, initialPressed, setButtonPressed]);

  const pressed = isButtonPressed(buttonId);
  
  const toggle = useCallback(() => {
    playBeepSound();
    return toggleButtonPressed(buttonId);
  }, [buttonId, toggleButtonPressed, playBeepSound]);

  const setPressed = useCallback((value) => {
    playBeepSound();
    setButtonPressed(buttonId, value);
  }, [buttonId, setButtonPressed, playBeepSound]);

  return {
    pressed,
    toggle,
    setPressed,
  };
};

/**
 * 버튼 그룹 상태 관리 훅 (라디오 버튼 동작)
 * @param {string} groupId - 그룹 ID
 * @param {string} buttonId - 현재 버튼 ID
 */
export const useButtonGroup = (groupId, buttonId) => {
  const { selectInGroup, isSelectedInGroup, playBeepSound } = useButtonStyle();
  
  const isSelected = isSelectedInGroup(groupId, buttonId);
  
  const select = useCallback(() => {
    if (!isSelected) {
      playBeepSound();
      selectInGroup(groupId, buttonId);
    }
  }, [groupId, buttonId, isSelected, selectInGroup, playBeepSound]);

  return {
    isSelected,
    select,
  };
};

export default ButtonStyleContext;

