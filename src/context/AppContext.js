import React, { useRef, useState, useEffect, createContext } from "react";
import { useTextHandler } from "../assets/tts";
import { tabs, totalMenuItems, categorizeMenu, calculateSum, calculateTotal, filterMenuItems, createOrderItems } from "../utils/menuUtils";
import { convertToKoreanQuantity } from "../utils/numberUtils";
import { commonScript } from "../constants/commonScript";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState("전체메뉴");
  const menuItems = categorizeMenu(totalMenuItems, selectedTab);

  const [isDark, setisDark] = useState(false);
  const [isLow, setisLow] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLarge, setisLarge] = useState(false);
  const [isCreditPayContent, setisCreditPayContent] = useState(0);
  const [quantities, setQuantities] = useState(
    menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );
  const [isReturnModal, setisReturnModal] = useState(false);
  const [isAccessibilityModal, setisAccessibilityModal] = useState(false);
  const [isResetModal, setisResetModal] = useState(false);
  const [isDeleteModal, setisDeleteModal] = useState(false);
  const [isDeleteCheckModal, setisDeleteCheckModal] = useState(false);
  const [isCallModal, setisCallModal] = useState(false);
  const [intervalTime, setintervalTime] = useState(0);
  const [introFlag, setintroFlag] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState(0); // 삭제할 아이템 ID
  const [currentPage, setCurrentPageState] = useState('first'); // 현재 페이지 상태
  const [history, setHistory] = useState(['first']); // 페이지 히스토리 스택
  
  // 페이지 이동 함수 (히스토리 관리 포함)
  const setCurrentPage = (page) => {
    // 히스토리에 현재 페이지 추가 (같은 페이지로 이동하는 경우 제외)
    if (page !== currentPage) {
      setHistory(prev => [...prev, currentPage]);
      setCurrentPageState(page);
    }
  };
  
  // 뒤로가기 함수
  const goBack = () => {
    // 히스토리에서 이전 페이지로 이동
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // 현재 페이지 제거
      const previousPage = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPageState(previousPage);
    }
  };

  const [accessibility, setAccessibility] = useState({
    isHighContrast: isDark,
    isLowScreen: isLow,
    isBigSize: isLarge,
    volume: volume,
  });

  // 수량 증가
  const handleIncrease = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  // 수량 감소
  const handleDecrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const totalCount = calculateSum(quantities);
  const totalSum = calculateTotal(quantities, totalMenuItems);

  const { handleText } = useTextHandler(volume);
  const readCurrentPage = (newVolume) => {
    const pageTts = document.querySelector('.hidden-btn.page-btn')?.dataset.text;
    if (pageTts) {
      handleText(pageTts, true, newVolume);
    }
  };

  useEffect(() => {
    if (isDark) {
      document.querySelector('body')?.classList.add('dark');
    } else {
      document.querySelector('body')?.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (isLarge) {
      document.querySelector('body')?.classList.add('large');
    } else {
      document.querySelector('body')?.classList.remove('large');
    }
  }, [isLarge]);

  useEffect(() => {
    if (isLow) {
      document.querySelector('body')?.classList.add('low');
    } else {
      document.querySelector('body')?.classList.remove('low');
    }
  }, [isLow]);

  const sections = {
    top: useRef(null),
    row1: useRef(null),
    row2: useRef(null),
    row3: useRef(null),
    row4: useRef(null),
    row5: useRef(null),
    row6: useRef(null),
    page: useRef(null),
    modalPage: useRef(null),
    middle: useRef(null),
    bottom: useRef(null),
    footer: useRef(null),
    bottomfooter: useRef(null),
    confirmSections: useRef(null),
    AccessibilitySections1: useRef(null),
    AccessibilitySections2: useRef(null),
    AccessibilitySections3: useRef(null),
    AccessibilitySections4: useRef(null),
    AccessibilitySections5: useRef(null),
    AccessibilitySections6: useRef(null),
  };

  return (
    <AppContext.Provider
      value={{
        accessibility,
        setAccessibility,
        isResetModal,
        setisResetModal,
        isDeleteModal,
        setisDeleteModal,
        isDeleteCheckModal,
        setisDeleteCheckModal,
        totalMenuItems,
        sections,
        isLow,
        setisLow,
        isDark,
        setisDark,
        isCreditPayContent,
        setisCreditPayContent,
        tabs,
        commonScript,
        menuItems,
        selectedTab,
        setSelectedTab,
        quantities,
        setQuantities,
        handleIncrease,
        handleDecrease,
        calculateSum,
        calculateTotal,
        totalCount,
        totalSum,
        convertToKoreanQuantity,
        filterMenuItems,
        createOrderItems,
        isReturnModal,
        setisReturnModal,
        isAccessibilityModal,
        setisAccessibilityModal,
        isCallModal,
        setisCallModal,
        intervalTime,
        setintervalTime,
        introFlag,
        setintroFlag,
        volume,
        setVolume,
        isLarge,
        setisLarge,
        readCurrentPage,
        deleteItemId,
        setDeleteItemId,
        currentPage,
        setCurrentPage,
        goBack,
        history
      }}
    >
      {children}
    </AppContext.Provider>
  );
};