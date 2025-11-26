/**
 * UI 상태 관리 Context
 * 모달, 페이지 네비게이션 등 UI 관련 상태 관리
 */
import React, { useState, useRef, useMemo, useCallback, createContext } from "react";

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // 모달 상태
  const [isReturnModal, setisReturnModal] = useState(false);
  const [isAccessibilityModal, setisAccessibilityModal] = useState(false);
  const [isResetModal, setisResetModal] = useState(false);
  const [isDeleteModal, setisDeleteModal] = useState(false);
  const [isDeleteCheckModal, setisDeleteCheckModal] = useState(false);
  const [isCallModal, setisCallModal] = useState(false);

  // 삭제 관련 상태
  const [deleteItemId, setDeleteItemId] = useState(0);

  // 페이지 네비게이션 상태
  const [currentPage, setCurrentPageState] = useState('first');
  const [history, setHistory] = useState(['first']);

  // 페이지 이동 함수 (히스토리 관리 포함)
  const setCurrentPage = useCallback((page) => {
    if (page !== currentPage) {
      setHistory(prev => [...prev, currentPage]);
      setCurrentPageState(page);
    }
  }, [currentPage]);

  // 뒤로가기 함수
  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPageState(previousPage);
    }
  }, [history]);

  // 기타 UI 상태
  const [intervalTime, setintervalTime] = useState(0);
  const [introFlag, setintroFlag] = useState(true);

  // DOM 참조 (sections) - useRef는 컴포넌트 생명주기 동안 유지되므로 useMemo 불필요
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

  // Context value
  const value = useMemo(() => ({
    // 모달 상태
    isReturnModal,
    setisReturnModal,
    isAccessibilityModal,
    setisAccessibilityModal,
    isResetModal,
    setisResetModal,
    isDeleteModal,
    setisDeleteModal,
    isDeleteCheckModal,
    setisDeleteCheckModal,
    isCallModal,
    setisCallModal,
    
    // 삭제 관련
    deleteItemId,
    setDeleteItemId,
    
    // 페이지 네비게이션
    currentPage,
    setCurrentPage,
    goBack,
    history,
    
    // 기타 UI 상태
    intervalTime,
    setintervalTime,
    introFlag,
    setintroFlag,
    
    // DOM 참조
    sections,
  }), [
    isReturnModal,
    isAccessibilityModal,
    isResetModal,
    isDeleteModal,
    isDeleteCheckModal,
    isCallModal,
    deleteItemId,
    currentPage,
    setCurrentPage,
    goBack,
    history,
    intervalTime,
    introFlag,
    sections,
  ]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

