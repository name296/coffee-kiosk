import React, { createContext, useState, useMemo, useEffect } from "react";

// Accessibility Context - 접근성 설정 및 모달 상태 관리

const useBodyClass = (className, condition) => {
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (condition) document.body.classList.add(className);
        else document.body.classList.remove(className);
        return () => document.body.classList.remove(className);
    }, [className, condition]);
};

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

    const value = useMemo(() => ({
        isDark, setIsDark,
        isLow, setIsLow,
        isLarge, setIsLarge,
        volume, setVolume,
    }), [isDark, isLow, isLarge, volume]);

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
};
