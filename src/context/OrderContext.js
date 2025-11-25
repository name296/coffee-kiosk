/**
 * 주문 및 결제 프로세스 관련 Context
 * 서비스 프로세스의 핵심 비즈니스 로직 관리
 */
import React, { useState, useMemo, useCallback, createContext } from "react";
import { tabs, totalMenuItems, categorizeMenu, calculateSum, calculateTotal, filterMenuItems, createOrderItems } from "../utils/menuUtils";
import { convertToKoreanQuantity } from "../utils/numberUtils";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // 메뉴 및 카테고리 상태
  const [selectedTab, setSelectedTab] = useState("전체메뉴");
  const menuItems = useMemo(() => categorizeMenu(totalMenuItems, selectedTab), [selectedTab]);

  // 주문 수량 상태 (초기화는 App.js에서 totalMenuItems 로드 후 진행)
  const [quantities, setQuantities] = useState({});

  // 결제 프로세스 상태
  const [isCreditPayContent, setisCreditPayContent] = useState(0);

  // 주문 수량 조작 함수
  const handleIncrease = useCallback((id) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const handleDecrease = useCallback((id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  }, []);

  // 계산된 값들 (메모이제이션)
  const totalCount = useMemo(() => calculateSum(quantities), [quantities]);
  const totalSum = useMemo(() => calculateTotal(quantities, totalMenuItems), [quantities, totalMenuItems]);

  // Context value
  const value = useMemo(() => ({
    // 메뉴 관련
    tabs,
    totalMenuItems,
    menuItems,
    selectedTab,
    setSelectedTab,
    
    // 주문 관련
    quantities,
    setQuantities,
    handleIncrease,
    handleDecrease,
    totalCount,
    totalSum,
    
    // 주문 아이템 유틸리티
    filterMenuItems,
    createOrderItems,
    convertToKoreanQuantity,
    calculateSum,
    calculateTotal,
    
    // 결제 관련
    isCreditPayContent,
    setisCreditPayContent,
  }), [
    menuItems,
    selectedTab,
    quantities,
    handleIncrease,
    handleDecrease,
    totalCount,
    totalSum,
    isCreditPayContent,
  ]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

