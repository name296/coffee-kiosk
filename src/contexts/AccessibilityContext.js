/**
 * 접근성 설정 관리 Context
 * 고대비, 큰글씨, 낮은화면, 볼륨 등 접근성 관련 설정
 */
import React, { useState, useEffect, useMemo, createContext } from "react";
import { useBodyClass } from "../hooks/useBodyClass";

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  // 접근성 설정 상태
  const [isDark, setisDark] = useState(false);
  const [isLow, setisLow] = useState(false);
  const [isLarge, setisLarge] = useState(false);
  const [volume, setVolume] = useState(1);

  // body 클래스 자동 관리
  useBodyClass('dark', isDark);
  useBodyClass('large', isLarge);
  useBodyClass('low', isLow);

  // accessibility 객체 메모이제이션
  const accessibility = useMemo(() => ({
    isHighContrast: isDark,
    isLowScreen: isLow,
    isBigSize: isLarge,
    volume: volume,
  }), [isDark, isLow, isLarge, volume]);

  // accessibilityState (이전 버전 호환성 유지)
  const [accessibilityState, setAccessibilityState] = useState(accessibility);

  // accessibility와 동기화
  useEffect(() => {
    setAccessibilityState(accessibility);
  }, [accessibility]);

  // Context value
  const value = useMemo(() => ({
    // 접근성 설정
    isDark,
    setisDark,
    isLow,
    setisLow,
    isLarge,
    setisLarge,
    volume,
    setVolume,
    
    // accessibility 객체
    accessibility,
    setAccessibility: setAccessibilityState,
  }), [
    isDark,
    isLow,
    isLarge,
    volume,
    accessibility,
  ]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

