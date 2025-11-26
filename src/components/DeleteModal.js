import React, { useContext, useCallback } from "react";
import { AppContext } from "../context";
import { useTextHandler } from '../assets/tts';
import { useActiveElementTTS } from "../hooks";
import { getAssetPath } from "../utils/pathUtils";

const DeleteModal = ({ handleDecrease, id, quantities, currentItems }) => {
  const {
    sections,
    isDark,
    isDeleteModal,
    setisDeleteModal,
    volume,
    commonScript,
    readCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);

  // 모달이 열릴 때만 포커스된 요소의 TTS 재생
  useActiveElementTTS(handleText, 500, isDeleteModal);

  const handleTouchDeleteButton = useCallback((id) => {
    if (quantities[id] !== 1) {
      quantities[id] = 0;
    } else {
      handleDecrease(id);
    }

    setisDeleteModal(false);
    readCurrentPage();
  }, [quantities, handleDecrease, setisDeleteModal, readCurrentPage]);

  // 모달 버튼 핸들러들 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handleCancelPress = useCallback((e) => {
    e.preventDefault();
    setisDeleteModal(false);
    readCurrentPage();
  }, [setisDeleteModal, readCurrentPage]);

  const handleConfirmPress = useCallback((e) => {
    e.preventDefault();
    handleTouchDeleteButton(id);
  }, [handleTouchDeleteButton, id]);

  if (isDeleteModal) {
    return (
      <>
        <div className="hidden-div" ref={sections.modalPage}>
          <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 상품삭제, 상품을 삭제합니다, 계속 진행하시려면 확인 버튼을 누릅니다, " + commonScript.replay}></button>
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
              상품을{" "}
              <span
                className="return-highlight"
                style={
                  isDark ? { color: "#FFE101" } : { color: "#A4693F" }
                }
              >
                삭제
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
          <div data-tts-text="작업 관리, 버튼 두 개, "
            ref={sections.confirmSections} className="return-modal-buttons">
            <button data-tts-text="취소,"
              className="return-btn-cancel"
              onClick={handleCancelPress}
            >
              취소
            </button>
            <button data-tts-text="확인,"
              className="return-btn-confirm"
              onClick={handleConfirmPress}
            >
              확인
            </button>
          </div>
        </div>
      </>
    );
  }
};

export default DeleteModal;
