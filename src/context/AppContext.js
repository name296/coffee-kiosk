/**
 * 통합 App Context
 * 모든 하위 Context를 통합하고 공통 유틸리티 제공
 */
import React, { useMemo, useCallback, createContext } from "react";
import { useTextHandler } from "../assets/tts";
import { commonScript } from "../constants/commonScript";
import { safeQuerySelector } from "../utils/browserCompatibility";
import { OrderProvider, OrderContext } from "./OrderContext";
import { UIProvider, UIContext } from "./UIContext";
import { AccessibilityProvider, AccessibilityContext } from "./AccessibilityContext";

export const AppContext = createContext();

/**
 * 통합 App Provider
 * 모든 하위 Context를 중첩하여 제공
 */
export const AppProvider = ({ children }) => {
  return (
    <AccessibilityProvider>
      <OrderProvider>
        <UIProvider>
          <AppContextProvider>{children}</AppContextProvider>
        </UIProvider>
      </OrderProvider>
    </AccessibilityProvider>
  );
};

/**
 * 내부 App Context Provider
 * 공통 유틸리티 및 하위 Context 값들을 통합
 */
const AppContextProvider = ({ children }) => {
  // 하위 Context에서 필요한 값들 가져오기
  const accessibilityContext = React.useContext(AccessibilityContext);
  const orderContext = React.useContext(OrderContext);
  const uiContext = React.useContext(UIContext);

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
    
    // 공통 유틸리티
    commonScript,
    readCurrentPage,
  }), [
    accessibilityContext,
    orderContext,
    uiContext,
    readCurrentPage,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
