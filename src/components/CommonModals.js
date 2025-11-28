// ============================================================================
// 공통 모달 컴포넌트 (확인/취소 모달들)
// 대원칙: DOM 직접 조작 금지 → Context/State 기반 ReactDOM 조작
// ============================================================================

import React, { useContext, useCallback } from "react";
import { AppContext } from "../contexts";
import { useButtonStyle } from "../contexts";
import { useTextHandler } from '../hooks/useTTS';
import { useActiveElementTTS, useFocusTrap } from "../hooks";
import Button from "./Button";
import Icon from "./Icon";

// ============================================================================
// 공통 모달 버튼 컴포넌트
// ============================================================================

export const ModalButton = ({ 
  label, 
  ttsText, 
  onClick, 
  styleClass = '', 
  variant = 'cancel'
}) => {
  const { playBeepSound } = useButtonStyle();
  
  const handleClick = useCallback((e) => {
    e.preventDefault();
    playBeepSound();
    onClick?.(e);
  }, [onClick, playBeepSound]);
  
  const buttonClass = variant === 'confirm' 
    ? `return-btn-confirm ${styleClass}` 
    : `return-btn-cancel ${styleClass}`;
  
  return (
    <Button
      styleClass={buttonClass}
      label={label}
      ttsText={ttsText}
      onClick={handleClick}
    />
  );
};

export const ModalToggleButton = ({ 
  label, 
  ttsText, 
  isPressed, 
  onClick, 
  styleClass = '' 
}) => {
  const { playBeepSound } = useButtonStyle();
  
  const handleClick = useCallback((e) => {
    e.preventDefault();
    playBeepSound();
    onClick?.(e);
  }, [onClick, playBeepSound]);
  
  const buttonClass = `toggle ${styleClass} ${isPressed ? 'pressed' : ''}`.trim();
  
  return (
    <Button
      styleClass={buttonClass}
      label={label}
      ttsText={ttsText}
      onClick={handleClick}
    />
  );
};

// ============================================================================
// 삭제 확인 모달 (마지막 아이템 삭제 시)
// ============================================================================

export const DeleteCheckModal = ({ handleDecrease, id, quantities }) => {
  const {
    sections,
    ModalDeleteCheck,
    volume,
    commonScript,
    readCurrentPage,
    setCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(ModalDeleteCheck.isOpen);

  useActiveElementTTS(handleText, 500, ModalDeleteCheck.isOpen);

  const handleTouchCheckDelete = useCallback((id) => {
    if (quantities[id] !== 1) {
      quantities[id] = 0;
    } else {
      handleDecrease(id);
    }
    ModalDeleteCheck.close();
    setCurrentPage("third");
  }, [quantities, handleDecrease, ModalDeleteCheck, setCurrentPage]);

  const handleCancelPress = useCallback(() => {
    ModalDeleteCheck.close();
    readCurrentPage();
  }, [ModalDeleteCheck, readCurrentPage]);

  const handleConfirmPress = useCallback(() => {
    handleTouchCheckDelete(id);
  }, [handleTouchCheckDelete, id]);

  if (!ModalDeleteCheck.isOpen) return null;

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 내역이 없으면 메뉴선택으로 돌아갑니다, 계속 진행하시려면 확인 버튼을 누릅니다, " + commonScript.replay}></button>
      </div>
      <div className="return-modal-overlay"></div>
      <div className="return-modal-content" ref={containerRef}>
        <Icon name="Warning" className="return-modal-image" />
        <div className="return-modal-message">
          <p>내역이 없으면 <span className="return-highlight">메뉴선택</span>으로 돌아갑니다.</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </div>
        <div data-tts-text="작업관리, 버튼 두 개," ref={sections.confirmSections} className="return-modal-buttons">
          <ModalButton label="취소" ttsText="취소, " onClick={handleCancelPress} variant="cancel" />
          <ModalButton label="확인" ttsText="확인, " onClick={handleConfirmPress} variant="confirm" />
        </div>
      </div>
    </>
  );
};

// ============================================================================
// 삭제 모달
// ============================================================================

export const DeleteModal = ({ handleDecrease, id, quantities }) => {
  const {
    sections,
    ModalDelete,
    volume,
    commonScript,
    readCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(ModalDelete.isOpen);

  useActiveElementTTS(handleText, 500, ModalDelete.isOpen);

  const handleTouchDeleteButton = useCallback((id) => {
    if (quantities[id] !== 1) {
      quantities[id] = 0;
    } else {
      handleDecrease(id);
    }
    ModalDelete.close();
    readCurrentPage();
  }, [quantities, handleDecrease, ModalDelete, readCurrentPage]);

  const handleCancelPress = useCallback(() => {
    ModalDelete.close();
    readCurrentPage();
  }, [ModalDelete, readCurrentPage]);

  const handleConfirmPress = useCallback(() => {
    handleTouchDeleteButton(id);
  }, [handleTouchDeleteButton, id]);

  if (!ModalDelete.isOpen) return null;

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 상품삭제, 상품을 삭제합니다, 계속 진행하시려면 확인 버튼을 누릅니다, " + commonScript.replay}></button>
      </div>
      <div className="return-modal-overlay"></div>
      <div className="return-modal-content" ref={containerRef}>
        <Icon name="Warning" className="return-modal-image" />
        <div className="return-modal-message">
          <p>상품을 <span className="return-highlight">삭제</span>합니다</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </div>
        <div data-tts-text="작업 관리, 버튼 두 개, " ref={sections.confirmSections} className="return-modal-buttons">
          <ModalButton label="취소" ttsText="취소," onClick={handleCancelPress} variant="cancel" />
          <ModalButton label="확인" ttsText="확인," onClick={handleConfirmPress} variant="confirm" />
        </div>
      </div>
    </>
  );
};

// ============================================================================
// 초기화 모달
// ============================================================================

export const ResetModal = () => {
  const {
    sections,
    totalMenuItems,
    setQuantities,
    ModalReset,
    volume,
    commonScript,
    readCurrentPage,
    setCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(ModalReset.isOpen);

  useActiveElementTTS(handleText, 500, ModalReset.isOpen);

  const handleReset = useCallback(() => {
    const resetQuantities = {};
    totalMenuItems.forEach(item => {
      resetQuantities[item.id] = 0;
    });
    setQuantities(resetQuantities);
    ModalReset.close();
    setCurrentPage("second");
    readCurrentPage();
  }, [totalMenuItems, setQuantities, ModalReset, setCurrentPage, readCurrentPage]);

  const handleCancelPress = useCallback(() => {
    ModalReset.close();
    readCurrentPage();
  }, [ModalReset, readCurrentPage]);

  const handleConfirmPress = useCallback(() => {
    handleReset();
  }, [handleReset]);

  if (!ModalReset.isOpen) return null;

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 전체삭제, 주문내역을 전체삭제합니다, 계속 진행하시려면 확인 버튼을 누릅니다, " + commonScript.replay}></button>
      </div>
      <div className="return-modal-overlay"></div>
      <div className="return-modal-content" ref={containerRef}>
        <Icon name="Warning" className="return-modal-image" />
        <div className="return-modal-message">
          <p>주문내역을 <span className="return-highlight">전체삭제</span>합니다</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </div>
        <div data-tts-text="작업 관리, 버튼 두 개, " ref={sections.confirmSections} className="return-modal-buttons">
          <ModalButton label="취소" ttsText="취소," onClick={handleCancelPress} variant="cancel" />
          <ModalButton label="확인" ttsText="확인," onClick={handleConfirmPress} variant="confirm" />
        </div>
      </div>
    </>
  );
};

// ============================================================================
// 처음으로 모달
// ============================================================================

export const ReturnModal = () => {
  const {
    sections,
    totalMenuItems,
    setQuantities,
    ModalReturn,
    volume,
    commonScript,
    readCurrentPage,
    setCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(ModalReturn.isOpen);

  useActiveElementTTS(handleText, 500, ModalReturn.isOpen);

  const handleReturn = useCallback(() => {
    const resetQuantities = {};
    totalMenuItems.forEach(item => {
      resetQuantities[item.id] = 0;
    });
    setQuantities(resetQuantities);
    ModalReturn.close();
    setCurrentPage("first");
  }, [totalMenuItems, setQuantities, ModalReturn, setCurrentPage]);

  const handleCancelPress = useCallback(() => {
    ModalReturn.close();
    readCurrentPage();
  }, [ModalReturn, readCurrentPage]);

  const handleConfirmPress = useCallback(() => {
    handleReturn();
  }, [handleReturn]);

  if (!ModalReturn.isOpen) return null;

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 처음으로, 처음으로 돌아갑니다, 계속 진행하시려면 확인 버튼을 누릅니다," + commonScript.replay}></button>
      </div>
      <div className="return-modal-overlay"></div>
      <div className="return-modal-content" ref={containerRef}>
        <Icon name="Warning" className="return-modal-image" />
        <div className="return-modal-message">
          <p><span className="return-highlight">처음</span>으로 돌아갑니다</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </div>
        <div data-tts-text="작업관리, 버튼 두 개," ref={sections.confirmSections} className="return-modal-buttons">
          <ModalButton label="취소" ttsText="취소," onClick={handleCancelPress} variant="cancel" />
          <ModalButton label="확인" ttsText="확인," onClick={handleConfirmPress} variant="confirm" />
        </div>
      </div>
    </>
  );
};

// ============================================================================
// 직원 호출 모달
// ============================================================================

export const CallModal = () => {
  const {
    sections,
    ModalCall,
    volume,
    commonScript,
    readCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(ModalCall.isOpen);

  useActiveElementTTS(handleText, 500, ModalCall.isOpen);

  const handleCancelPress = useCallback(() => {
    ModalCall.close();
    readCurrentPage();
  }, [ModalCall, readCurrentPage]);

  const handleConfirmPress = useCallback(() => {
    ModalCall.close();
    readCurrentPage();
  }, [ModalCall, readCurrentPage]);

  if (!ModalCall.isOpen) return null;

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 직원 호출, 직원을 호출합니다, 계속 진행하시려면 확인 버튼을 누릅니다," + commonScript.replay}></button>
      </div>
      <div className="return-modal-overlay"></div>
      <div className="return-modal-content" ref={containerRef}>
        <Icon name="Help" className="return-modal-image" />
        <div className="return-modal-message">
          <p>직원을 <span className="return-highlight">호출</span>합니다</p>
          <p>계속 진행하시려면 <span className="return-highlight">확인</span> 버튼을 누르세요</p>
        </div>
        <div data-tts-text="작업관리, 버튼 두 개, " ref={sections.confirmSections} className="return-modal-buttons">
          <ModalButton label="취소" ttsText="취소, " onClick={handleCancelPress} variant="cancel" />
          <ModalButton label="확인" ttsText="확인, " onClick={handleConfirmPress} variant="confirm" />
        </div>
      </div>
    </>
  );
};

