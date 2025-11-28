/**
 * 초기화 Context
 * 앱 시작 시 필요한 모든 초기화를 순서대로 관리
 */
import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { useTextHandler } from "../hooks/useTTS";
import { useButtonStyleSystem, useMultiModalButtonHandler } from "../hooks/useButtonStyleSystem";
import { SizeControlManager } from "../utils/sizeControlManager";
import { setViewportZoom, setupViewportResize } from "../utils/viewportManager";

export const InitializationContext = createContext({
  isInitialized: false,
  initializationSteps: {},
});

export const useInitialization = () => useContext(InitializationContext);

/**
 * 초기화 순서:
 * 1. 버튼 스타일 시스템 (CSS 주입)
 * 2. TTS IndexedDB 초기화
 * 3. 전역 버튼 이벤트 핸들러
 * 4. 크기 조절 시스템
 * 5. 뷰포트 설정
 */
export const InitializationProvider = ({ children }) => {
  const [initializationSteps, setInitializationSteps] = useState({
    buttonStyle: false,
    ttsDatabase: false,
    buttonHandler: false,
    sizeControl: false,
    viewport: false,
  });

  // 1️⃣ 버튼 스타일 시스템 (팔레트 CSS + 동적 스타일)
  useButtonStyleSystem();
  
  // 초기화 완료 표시
  useEffect(() => {
    setInitializationSteps(prev => ({ ...prev, buttonStyle: true }));
  }, []);

  // 2️⃣ TTS IndexedDB 초기화
  const { initDB } = useTextHandler();
  useEffect(() => {
    const initializeDatabase = async () => {
      await initDB();
      setInitializationSteps(prev => ({ ...prev, ttsDatabase: true }));
    };
    initializeDatabase();
  }, [initDB]);

  // 3️⃣ 전역 버튼 이벤트 핸들러
  useMultiModalButtonHandler({
    enableGlobalHandlers: true,
    enableKeyboardNavigation: false
  });
  
  useEffect(() => {
    setInitializationSteps(prev => ({ ...prev, buttonHandler: true }));
  }, []);

  // 4️⃣ & 5️⃣ 크기 조절 시스템 & 뷰포트 설정
  useLayoutEffect(() => {
    // 크기 조절 시스템 초기화
    SizeControlManager.init();
    setInitializationSteps(prev => ({ ...prev, sizeControl: true }));

    // 뷰포트에 맞춰 줌 배율 조절
    setViewportZoom();
    setupViewportResize();
    setInitializationSteps(prev => ({ ...prev, viewport: true }));
  }, []);

  // 모든 초기화 완료 여부
  const isInitialized = Object.values(initializationSteps).every(Boolean);

  const value = {
    isInitialized,
    initializationSteps,
  };

  return (
    <InitializationContext.Provider value={value}>
      {children}
    </InitializationContext.Provider>
  );
};

