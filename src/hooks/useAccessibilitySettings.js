import { useState, useCallback, useMemo } from "react";

export const useAccessibilitySettings = (initialSettings = { isDark: false, isLow: false, isLarge: false, volume: 1 }) => {
    const [settings, setSettings] = useState(initialSettings);

    const setDark = useCallback((v) => setSettings(p => ({ ...p, isDark: v })), []);
    const setLow = useCallback((v) => setSettings(p => ({ ...p, isLow: v })), []);
    const setLarge = useCallback((v) => setSettings(p => ({ ...p, isLarge: v })), []);
    const setVolumeVal = useCallback((v) => setSettings(p => ({ ...p, volume: v })), []);
    const resetToDefault = useCallback(() => setSettings({ isDark: false, isLow: false, isLarge: false, volume: 1 }), []);
    const updateAll = useCallback((ns) => setSettings(ns), []);

    const getStatusText = useMemo(() => ({
        dark: settings.isDark ? '켬' : '끔',
        low: settings.isLow ? '켬' : '끔',
        large: settings.isLarge ? '켬' : '끔',
        volume: ({ 0: '끔', 1: '약', 2: '중', 3: '강' })[settings.volume]
    }), [settings]);

    return {
        settings, setDark, setLow, setLarge,
        setVolume: setVolumeVal, updateAll, getStatusText
    };
};
