import React, { createContext, useMemo, useState, useRef, useCallback } from "react";

export const TimeoutContext = createContext();

export const TimeoutProvider = ({ children }) => {
    const [globalRemainingTime, setGlobalRemainingTime] = useState(null);
    const [globalRemainingTimeFormatted, setGlobalRemainingTimeFormatted] = useState("00:00");
    const resetIdleTimeoutRef = useRef(null);

    const setResetIdleTimeout = useCallback((fn) => {
        resetIdleTimeoutRef.current = fn || null;
    }, []);

    const resetIdleTimeout = useCallback(() => {
        if (resetIdleTimeoutRef.current) {
            resetIdleTimeoutRef.current();
        }
    }, []);

    const value = useMemo(() => ({
        globalRemainingTime,
        globalRemainingTimeFormatted,
        setGlobalRemainingTime,
        setGlobalRemainingTimeFormatted,
        resetIdleTimeout,
        setResetIdleTimeout
    }), [
        globalRemainingTime,
        globalRemainingTimeFormatted,
        resetIdleTimeout,
        setResetIdleTimeout
    ]);

    return (
        <TimeoutContext.Provider value={value}>
            {children}
        </TimeoutContext.Provider>
    );
};
