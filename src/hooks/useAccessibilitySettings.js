// ============================================================================
// 접근성 설정 훅
// 접근성 모달의 상태 관리를 React 방식으로 처리
// ============================================================================

import { useState, useCallback, useMemo } from 'react';

/**
 * 볼륨 레벨 매핑
 */
export const VOLUME_MAP = {
  0: '끔',
  1: '약',
  2: '중',
  3: '강'
};

/**
 * 볼륨 실제 값 매핑
 */
export const VOLUME_VALUES = {
  0: 0,
  1: 0.5,
  2: 0.75,
  3: 1
};

/**
 * 접근성 설정 기본값
 */
export const DEFAULT_ACCESSIBILITY = {
  isHighContrast: false,
  isLowScreen: false,
  isBigSize: false,
  volume: 1
};

/**
 * 접근성 설정 훅
 * @param {Object} initialSettings - 초기 설정값
 * @returns {Object} 설정 상태 및 핸들러
 */
export const useAccessibilitySettings = (initialSettings = DEFAULT_ACCESSIBILITY) => {
  const [settings, setSettings] = useState(initialSettings);
  
  // 개별 설정 변경 핸들러
  const setHighContrast = useCallback((value) => {
    setSettings(prev => ({ ...prev, isHighContrast: value }));
  }, []);
  
  const setLowScreen = useCallback((value) => {
    setSettings(prev => ({ ...prev, isLowScreen: value }));
  }, []);
  
  const setBigSize = useCallback((value) => {
    setSettings(prev => ({ ...prev, isBigSize: value }));
  }, []);
  
  const setVolume = useCallback((value) => {
    setSettings(prev => ({ ...prev, volume: value }));
  }, []);
  
  // 초기값으로 리셋
  const resetToDefault = useCallback(() => {
    setSettings(DEFAULT_ACCESSIBILITY);
  }, []);
  
  // 특정 값으로 전체 업데이트
  const updateAll = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);
  
  // TTS용 상태 텍스트 생성
  const getStatusText = useMemo(() => ({
    highContrast: settings.isHighContrast ? '켬' : '끔',
    lowScreen: settings.isLowScreen ? '켬' : '끔',
    bigSize: settings.isBigSize ? '켬' : '끔',
    volume: VOLUME_MAP[settings.volume]
  }), [settings]);
  
  return {
    settings,
    setHighContrast,
    setLowScreen,
    setBigSize,
    setVolume,
    resetToDefault,
    updateAll,
    getStatusText
  };
};

export default useAccessibilitySettings;

