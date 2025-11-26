// ============================================================================
// 주문 및 결제 프로세스 관련 Context
// ============================================================================

import React, { useState, useMemo, useCallback, createContext } from "react";
import { tabs, totalMenuItems, useMenuUtils } from "../hooks/useMenuUtils";
import { convertToKoreanQuantity } from "../utils/numberUtils";
import { safeLocalStorage, safeParseInt } from "../utils/browserCompatibility";
import { WEBVIEW_COMMANDS, STORAGE_KEYS } from "../config/appConfig";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // 메뉴 유틸리티 훅 사용
  const { categorizeMenu, calculateSum, calculateTotal, filterMenuItems, createOrderItems } = useMenuUtils();

  // 메뉴 및 카테고리 상태
  const [selectedTab, setSelectedTab] = useState("전체메뉴");
  const menuItems = useMemo(() => categorizeMenu(totalMenuItems, selectedTab), [selectedTab, categorizeMenu]);

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
  const totalCount = useMemo(() => calculateSum(quantities), [quantities, calculateSum]);
  const totalSum = useMemo(() => calculateTotal(quantities, totalMenuItems), [quantities, totalMenuItems, calculateTotal]);

  // 주문 아이템 생성 (메모이제이션)
  const orderItems = useMemo(
    () => createOrderItems(totalMenuItems, quantities),
    [totalMenuItems, quantities, createOrderItems]
  );

  // 주문 번호 업데이트 함수
  const updateOrderNumber = useCallback(() => {
    const currentNum = safeParseInt(safeLocalStorage.getItem(STORAGE_KEYS.ORDER_NUM), 0);
    const tmpOrderNum = currentNum + 1;
    safeLocalStorage.setItem(STORAGE_KEYS.ORDER_NUM, tmpOrderNum);
    return tmpOrderNum;
  }, []);

  // 웹뷰 앱 통신 함수
  const setCallWebToApp = useCallback((p_cmd, p_val) => {
    var obj_cmd = {
      Command: p_cmd,
      arg: p_val,
    };
    console.log("obj_cmd: " + JSON.stringify(obj_cmd));
    if (window.chrome?.webview) {
      window.chrome.webview.postMessage(JSON.stringify(obj_cmd));
    }
  }, []);

  // 애플리케이션에 주문정보 전달 함수
  const sendOrderDataToApp = useCallback((paymentType) => {
    var arr_order_data = [];
    orderItems.forEach((item) => {
      arr_order_data.push({
        menuName: item.name,
        quantity: item.quantity,
        price: item.price * item.quantity,
      });
    });
    const supplyPrice = (totalSum / 1.1).toFixed(2);
    var cmd_val = {
      orderData: arr_order_data,
      totalPrice: totalSum,
      supplyPrice: supplyPrice,
      tax: (totalSum - supplyPrice).toFixed(2),
      paymentType: paymentType,
      orderNumber: updateOrderNumber(),
    };
    setCallWebToApp(WEBVIEW_COMMANDS.PAY, cmd_val);
  }, [orderItems, totalSum, updateOrderNumber, setCallWebToApp]);

  // 영수증 출력 함수
  const sendPrintReceiptToApp = useCallback(() => {
    setCallWebToApp(WEBVIEW_COMMANDS.PRINT, '');
  }, [setCallWebToApp]);

  // 결제 취소 함수
  const sendCancelPayment = useCallback(() => {
    setCallWebToApp(WEBVIEW_COMMANDS.CANCEL, "");
  }, [setCallWebToApp]);

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
    
    // 결제 처리 함수들
    sendOrderDataToApp,
    sendPrintReceiptToApp,
    sendCancelPayment,
    updateOrderNumber,
  }), [
    menuItems,
    selectedTab,
    quantities,
    handleIncrease,
    handleDecrease,
    totalCount,
    totalSum,
    isCreditPayContent,
    filterMenuItems,
    createOrderItems,
    calculateSum,
    calculateTotal,
    orderItems,
    sendOrderDataToApp,
    sendPrintReceiptToApp,
    sendCancelPayment,
    updateOrderNumber,
  ]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

