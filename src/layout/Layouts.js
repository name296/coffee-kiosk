import React, { useContext } from "react";
import { Step, Summary, Bottom } from "../components/Frame";
import { AppContext } from "../context";
import ReturnModal from "../components/ReturnModal";
import AccessibilityModal from "../components/AccessibilityModal";
import ResetModal from "../components/ResetModal";
import CallModal from "../components/CallModal";
import DeleteModal from "../components/DeleteModal";
import DeleteCheckModal from "../components/DeleteCheckModal";

// 전역 모달 컴포넌트
const GlobalModals = () => {
  const {
    isReturnModal,
    isAccessibilityModal,
    isResetModal,
    isCallModal,
    isDeleteModal,
    isDeleteCheckModal,
    quantities,
    handleDecrease,
    deleteItemId,
    totalMenuItems,
    filterMenuItems
  } = useContext(AppContext);

  // DeleteModal과 DeleteCheckModal에 필요한 currentItems 계산
  const priceItems = filterMenuItems(totalMenuItems, quantities);
  const currentItems = priceItems; // 전체 아이템 사용 (페이지네이션 제외)

  return (
    <>
      {isReturnModal && <ReturnModal />}
      {isResetModal && <ResetModal />}
      {isAccessibilityModal && <AccessibilityModal />}
      {isCallModal && <CallModal />}
      {isDeleteModal && (
        <DeleteModal
          handleDecrease={handleDecrease}
          id={deleteItemId}
          quantities={quantities}
          currentItems={currentItems}
        />
      )}
      {isDeleteCheckModal && (
        <DeleteCheckModal
          handleDecrease={handleDecrease}
          id={deleteItemId}
          quantities={quantities}
          currentItems={currentItems}
        />
      )}
    </>
  );
};

/**
 * 메인 레이아웃 컴포넌트
 * 헤더(Step), 본문(children), 푸터(Summary, Bottom) 및 전역 모달을 포함
 */
export const Layout = ({ children }) => {
  return (
    <div className="frame">
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      {children}
      <Summary />
      <Bottom />
      <GlobalModals />
    </div>
  );
};