/**
 * Idle Timeout Context
 * 전역 비활성 타임아웃 상태 공유
 */
import React, { createContext, useContext } from "react";

export const IdleTimeoutContext = createContext({
  remainingTime: 0,
  remainingTimeFormatted: "00:00",
  isActive: false,
});

export const useIdleTimeoutContext = () => useContext(IdleTimeoutContext);

export const IdleTimeoutProvider = ({ value, children }) => {
  return (
    <IdleTimeoutContext.Provider value={value}>
      {children}
    </IdleTimeoutContext.Provider>
  );
};