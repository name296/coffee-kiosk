// ============================================================================
// 공통 모달 컴포넌트 (확인/취소 모달들)
// 대원칙: DOM 직접 조작 금지 → Context/State 기반 ReactDOM 조작
// ============================================================================

import React, { useContext, useCallback } from "react";
import { AppContext, useTextHandler, useActiveElementTTS, useFocusTrap } from "../App";
import Button from "./Button";
import Icon from "./Icon";

// ============================================================================
// 공통 모달 버튼 컴포넌트
// ============================================================================

export const ModalButton = ({ label, ttsText, onClick, className = '', variant = 'cancel', style = {} }) => (
  <Button
    className={`${variant === 'confirm' ? 'return-btn-confirm' : 'return-btn-cancel'} ${className}`.trim()}
    style={style}
    label={label}
    ttsText={ttsText}
    onClick={onClick}
  />
);

export const ModalToggleButton = ({ label, ttsText, isPressed, onClick, className = '', style = {} }) => (
  <Button
    toggle
    pressed={isPressed}
    className={className}
    style={style}
    label={label}
    ttsText={ttsText}
    onClick={onClick}
  />
);

// ============================================================================
// 공통 확인 모달 레이아웃
// ============================================================================

const ConfirmModal = ({
  isOpen,
  icon = "Warning",
  ttsText,
  message,
  onCancel,
  onConfirm,
}) => {
  const { sections, volume, commonScript } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(isOpen);

  useActiveElementTTS(handleText, 500, isOpen);

  if (!isOpen) return null;

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button 
          type="hidden" 
          autoFocus 
          className="hidden-btn" 
          data-tts-text={ttsText + commonScript.replay} 
        />
      </div>
      <div className="return-modal-overlay" />
      <div className="return-modal-content" ref={containerRef}>
        <Icon name={icon} className="return-modal-image" />
        <div className="return-modal-message">
          {message}
        </div>
        <div 
          data-tts-text="작업관리, 버튼 두 개," 
          ref={sections.confirmSections} 
          className="return-modal-buttons"
        >
          <ModalButton label="취소" ttsText="취소," onClick={onCancel} variant="cancel" />
          <ModalButton label="확인" ttsText="확인," onClick={onConfirm} variant="confirm" />
        </div>
      </div>
    </>
  );
};

// ============================================================================
// 삭제 확인 모달 (마지막 아이템 삭제 시)
// ============================================================================

export const DeleteCheckModal = ({ handleDecrease, id, quantities }) => {
  const { ModalDeleteCheck, readCurrentPage, setCurrentPage } = useContext(AppContext);

  const handleCancel = useCallback(() => {
    ModalDeleteCheck.close();
    readCurrentPage();
  }, [ModalDeleteCheck, readCurrentPage]);

  const handleConfirm = useCallback(() => {
    if (quantities[id] !== 1) {
      quantities[id] = 0;
    } else {
      handleDecrease(id);
    }
    ModalDeleteCheck.close();
    setCurrentPage('process3');
  }, [quantities, id, handleDecrease, ModalDeleteCheck, setCurrentPage]);

  return (
    <ConfirmModal
      isOpen={ModalDeleteCheck.isOpen}
      ttsText="오버레이, 알림, 내역이 없으면 메뉴선택으로 돌아갑니다, 계속 진행하시려면 확인 버튼을 누릅니다, "
      message={
        <>
          <p>내역이 없으면 <span className="return-highlight">메뉴선택</span>으로 돌아갑니다.</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </>
      }
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );
};

// ============================================================================
// 삭제 모달
// ============================================================================

export const DeleteModal = ({ handleDecrease, id, quantities }) => {
  const { ModalDelete, readCurrentPage } = useContext(AppContext);

  const handleCancel = useCallback(() => {
    ModalDelete.close();
    readCurrentPage();
  }, [ModalDelete, readCurrentPage]);

  const handleConfirm = useCallback(() => {
    if (quantities[id] !== 1) {
      quantities[id] = 0;
    } else {
      handleDecrease(id);
    }
    ModalDelete.close();
    readCurrentPage();
  }, [quantities, id, handleDecrease, ModalDelete, readCurrentPage]);

  return (
    <ConfirmModal
      isOpen={ModalDelete.isOpen}
      ttsText="오버레이, 알림, 상품삭제, 상품을 삭제합니다, 계속 진행하시려면 확인 버튼을 누릅니다, "
      message={
        <>
          <p>상품을 <span className="return-highlight">삭제</span>합니다</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </>
      }
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );
};

// ============================================================================
// 초기화 모달
// ============================================================================

export const ResetModal = () => {
  const { totalMenuItems, setQuantities, ModalReset, readCurrentPage, setCurrentPage } = useContext(AppContext);

  const resetQuantities = useCallback(() => {
    const reset = {};
    totalMenuItems.forEach(item => { reset[item.id] = 0; });
    setQuantities(reset);
  }, [totalMenuItems, setQuantities]);

  const handleCancel = useCallback(() => {
    ModalReset.close();
    readCurrentPage();
  }, [ModalReset, readCurrentPage]);

  const handleConfirm = useCallback(() => {
    resetQuantities();
    ModalReset.close();
    setCurrentPage('process2');
    readCurrentPage();
  }, [resetQuantities, ModalReset, setCurrentPage, readCurrentPage]);

  return (
    <ConfirmModal
      isOpen={ModalReset.isOpen}
      ttsText="오버레이, 알림, 전체삭제, 주문내역을 전체삭제합니다, 계속 진행하시려면 확인 버튼을 누릅니다, "
      message={
        <>
          <p>주문내역을 <span className="return-highlight">전체삭제</span>합니다</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </>
      }
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );
};

// ============================================================================
// 처음으로 모달
// ============================================================================

export const ReturnModal = () => {
  const { totalMenuItems, setQuantities, ModalReturn, readCurrentPage, setCurrentPage } = useContext(AppContext);

  const resetQuantities = useCallback(() => {
    const reset = {};
    totalMenuItems.forEach(item => { reset[item.id] = 0; });
    setQuantities(reset);
  }, [totalMenuItems, setQuantities]);

  const handleCancel = useCallback(() => {
    ModalReturn.close();
    readCurrentPage();
  }, [ModalReturn, readCurrentPage]);

  const handleConfirm = useCallback(() => {
    resetQuantities();
    ModalReturn.close();
    setCurrentPage('process1');
  }, [resetQuantities, ModalReturn, setCurrentPage]);

  return (
    <ConfirmModal
      isOpen={ModalReturn.isOpen}
      ttsText="오버레이, 알림, 처음으로, 처음으로 돌아갑니다, 계속 진행하시려면 확인 버튼을 누릅니다,"
      message={
        <>
          <p><span className="return-highlight">처음</span>으로 돌아갑니다</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </>
      }
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );
};

// ============================================================================
// 직원 호출 모달
// ============================================================================

export const CallModal = () => {
  const { ModalCall, readCurrentPage } = useContext(AppContext);

  const handleCancel = useCallback(() => {
    ModalCall.close();
    readCurrentPage();
  }, [ModalCall, readCurrentPage]);

  const handleConfirm = useCallback(() => {
    ModalCall.close();
    readCurrentPage();
  }, [ModalCall, readCurrentPage]);

  return (
    <ConfirmModal
      isOpen={ModalCall.isOpen}
      icon="Help"
      ttsText="오버레이, 알림, 직원 호출, 직원을 호출합니다, 계속 진행하시려면 확인 버튼을 누릅니다,"
      message={
        <>
          <p>직원을 <span className="return-highlight">호출</span>합니다</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </>
      }
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );
};
