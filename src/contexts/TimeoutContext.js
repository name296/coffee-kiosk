import React, { createContext, useMemo, useState } from "react";

export const TimeoutContext = createContext();

export const TimeoutProvider = ({ children }) => {
    const [globalRemainingTime, setGlobalRemainingTime] = useState(null);

    const value = useMemo(() => ({
        globalRemainingTime,
        setGlobalRemainingTime
    }), [globalRemainingTime]);

    return (
        <TimeoutContext.Provider value={value}>
            {children}
        </TimeoutContext.Provider>
    );
};
