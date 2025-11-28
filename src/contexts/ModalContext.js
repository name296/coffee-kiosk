/**
 * 모달 상태 관리 Context
 * 모든 모달의 열림/닫힘 상태를 중앙에서 관리
 */
import React, { useState, useMemo, useCallback, createContext, useContext } from "react";

export const ModalContext = createContext();

/**
 * 모달 Context 훅
 */
export const useModal = () => useContext(ModalContext);

/**
 * 개별 모달 상태 훅
 * @param {string} modalName - 모달 이름 (Return, Accessibility, Reset, Delete, DeleteCheck, Call)
 */
export const useModalState = (modalName) => {
  const context = useContext(ModalContext);
  const key = `Modal${modalName}`;
  
  return {
    isOpen: context[key]?.isOpen ?? false,
    open: context[key]?.open ?? (() => {}),
    close: context[key]?.close ?? (() => {}),
    toggle: context[key]?.toggle ?? (() => {}),
  };
};

export const ModalProvider = ({ children }) => {
  // 모달 상태
  const [ModalReturnOpen, setModalReturnOpen] = useState(false);
  const [ModalAccessibilityOpen, setModalAccessibilityOpen] = useState(false);
  const [ModalResetOpen, setModalResetOpen] = useState(false);
  const [ModalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [ModalDeleteCheckOpen, setModalDeleteCheckOpen] = useState(false);
  const [ModalCallOpen, setModalCallOpen] = useState(false);

  // 삭제 관련 상태
  const [ModalDeleteItemId, setModalDeleteItemId] = useState(0);

  // 모달 핸들러 생성 함수
  const createModalHandlers = useCallback((isOpen, setIsOpen) => ({
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  }), []);

  // Context value
  const value = useMemo(() => ({
    // 모달 상태 (Modal 접두어 API)
    ModalReturn: createModalHandlers(ModalReturnOpen, setModalReturnOpen),
    ModalAccessibility: createModalHandlers(ModalAccessibilityOpen, setModalAccessibilityOpen),
    ModalReset: createModalHandlers(ModalResetOpen, setModalResetOpen),
    ModalDelete: createModalHandlers(ModalDeleteOpen, setModalDeleteOpen),
    ModalDeleteCheck: createModalHandlers(ModalDeleteCheckOpen, setModalDeleteCheckOpen),
    ModalCall: createModalHandlers(ModalCallOpen, setModalCallOpen),

    // 삭제 아이템 ID
    ModalDeleteItemId,
    setModalDeleteItemId,
  }), [
    ModalReturnOpen,
    ModalAccessibilityOpen,
    ModalResetOpen,
    ModalDeleteOpen,
    ModalDeleteCheckOpen,
    ModalCallOpen,
    ModalDeleteItemId,
    createModalHandlers,
  ]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

