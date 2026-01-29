import React, { createContext, useState, useMemo, useEffect } from "react";
import { useBodyClass } from "../hooks";

// Accessibility Context - 접근성 설정 및 모달 상태 관리

export const AccessibilityContext = createContext();


export const AccessibilityProvider = ({ children }) => {
    // 접근성 설정 상태
    const [isDark, setIsDark] = useState(false);
    const [isLow, setIsLow] = useState(false);
    const [isLarge, setIsLarge] = useState(false);
    const [volume, setVolume] = useState(1);

    useBodyClass('dark', isDark);
    useBodyClass('large', isLarge);
    useBodyClass('low', isLow);

    const accessibility = useMemo(() => ({
        isDark,
        isLow,
        isLarge,
        volume
    }), [isDark, isLow, isLarge, volume]);

    const [accessibilityState, setAccessibilityState] = useState(accessibility);

    useEffect(() => {
        setAccessibilityState(accessibility);
    }, [accessibility]);

    const value = useMemo(() => ({
        // 접근성 설정
        isDark, setIsDark,
        isLow, setIsLow,
        isLarge, setIsLarge,
        volume, setVolume,
        accessibility,
        setAccessibility: setAccessibilityState,
    }), [isDark, isLow, isLarge, volume, accessibility]);

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
};
