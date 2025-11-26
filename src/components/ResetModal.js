import React, { useContext, useCallback } from "react";
import { AppContext } from "../context";
import { useTextHandler } from '../assets/tts';
import { useActiveElementTTS } from "../hooks";
import { getAssetPath } from "../utils/pathUtils";

const ResetModal = ({ }) => {
  const {
    sections,
    isDark,
    totalMenuItems,
    setQuantities,
    isResetModal,
    setisResetModal,
    volume,
    commonScript,
    readCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);

  // 모달이 열릴 때만 포커스된 요소의 TTS 재생
  useActiveElementTTS(handleText, 500, isResetModal);

  const handleTouchConfirm = useCallback(() => {
    setQuantities(
      totalMenuItems.reduce(
        (acc, item) => ({ ...acc, [item.id]: 0 }),
        {}
      )
    );
    setisResetModal(false);
    readCurrentPage();
  }, [totalMenuItems, setQuantities, setisResetModal, readCurrentPage]);

  // 모달 버튼 핸들러들 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handleCancelPress = useCallback((e) => {
    e.preventDefault();
    setisResetModal(false);
    readCurrentPage();
  }, [setisResetModal, readCurrentPage]);

  const handleConfirmPress = useCallback((e) => {
    e.preventDefault();
    handleTouchConfirm();
  }, [handleTouchConfirm]);

  if (isResetModal) {
    return (
      <>
        <div className="hidden-div" ref={sections.modalPage}>
          <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 주문초기화, 주문 내역을 초기화합니다, 계속 진행하시려면 확인 버튼을 누릅니다, " + commonScript.replay}></button>
        </div>
        <div
          className="return-modal-overlay"
        ></div>
        <div
          className="return-modal-content"
        >
          <img
            className="return-modal-image"
            src={
              isDark
                ? getAssetPath("/images/contrast-Group 13.png")
                : getAssetPath("/images/ico_notice.png")
            }
          ></img>
          <div
            className="return-modal-message"
          >
            <p>
              주문내역을{" "}
              <span
                className="return-highlight"
                style={
                  isDark ? { color: "#FFE101" } : { color: "#A4693F" }
                }
              >
                초기화
              </span>
              합니다
            </p>
            <p>
              계속 진행하시려면{" "}
              <span
                className="return-highlight"
                style={
                  isDark ? { color: "#FFE101" } : { color: "#A4693F" }
                }
              >
                확인
              </span>{" "}
              버튼을 누르세요
            </p>
          </div>
          <div data-tts-text="작업관리, 버튼 두 개, "
            ref={sections.confirmSections} className="return-modal-buttons">
            <button data-tts-text="취소, "
              className="button return-btn-cancel"
              onClick={handleCancelPress}
            >
              <div className="background dynamic">
                <span className="content label">취소</span>
              </div>
            </button>
            <button data-tts-text="확인, "
              className="button return-btn-confirm"
              onClick={handleConfirmPress}
            >
              <div className="background dynamic">
                <span className="content label">확인</span>
              </div>
            </button>
          </div>
        </div>
      </>
    );
  }
};

export default ResetModal;
