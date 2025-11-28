/**
 * 통합 App Context
 * 모든 하위 Context를 통합하고 공통 유틸리티 제공
 * 
 * Provider 초기화 순서는 App.js에서 관리:
 * 1. InitializationProvider - 시스템 초기화
 * 2. AccessibilityProvider - 접근성 설정
 * 3. OrderProvider - 주문 관리
 * 4. UIProvider - UI 상태
 * 5. ButtonStyleProvider - 버튼 스타일
 * 6. AppContextProvider - 통합
 */
import React, { useMemo, useCallback, createContext } from "react";
import { useTextHandler } from "../hooks/useTTS";
import { commonScript } from "../config/messages";
import { safeQuerySelector } from "../utils/browserCompatibility";
import { OrderContext } from "./OrderContext";
import { UIContext } from "./UIContext";
import { AccessibilityContext } from "./AccessibilityContext";
import { ModalContext } from "./ModalContext";

export const AppContext = createContext();

/**
 * App Context Provider
 * 모든 하위 Context 값들을 통합하여 단일 접근점 제공
 */
export const AppContextProvider = ({ children }) => {
  // 하위 Context에서 필요한 값들 가져오기
  const accessibilityContext = React.useContext(AccessibilityContext);
  const orderContext = React.useContext(OrderContext);
  const uiContext = React.useContext(UIContext);
  const modalContext = React.useContext(ModalContext);
  
  // TTS 핸들러 (volume이 필요하므로 AccessibilityContext에서 가져옴)
  const { handleText } = useTextHandler(accessibilityContext.volume);

  // readCurrentPage 함수 (공통 유틸리티)
  const readCurrentPage = useCallback((newVolume) => {
    const element = safeQuerySelector('.hidden-btn.page-btn');
    const pageTts = element?.dataset.ttsText;
    if (pageTts) {
      handleText(pageTts, true, newVolume);
    }
  }, [handleText]);

  // 통합 Context value
  const contextValue = useMemo(() => ({
    // 하위 Context의 모든 값들을 통합
    ...accessibilityContext,
    ...orderContext,
    ...uiContext,
    ...modalContext,
    
    // 공통 유틸리티
    commonScript,
    readCurrentPage,
  }), [
    accessibilityContext,
    orderContext,
    uiContext,
    modalContext,
    readCurrentPage,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

