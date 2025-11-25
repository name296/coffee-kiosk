import React, { useContext } from "react";
import { AppContext } from "../context";
import { useTextHandler } from '../assets/tts';
import { useActiveElementTTS } from "../hooks";

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

  const handleTouchDeleteButton = (id)=>{
    if (quantities[id] !== 1) {
      quantities[id] = 0;
    } else {
      handleDecrease(id);
    }

    setisDeleteModal(false);
    readCurrentPage();
  }

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
                ? "/images/contrast-Group 13.png"
                : "/images/ico_notice.png"
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
              onClick={(e) => { e.preventDefault(); setisDeleteModal(false);readCurrentPage();}}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleText('실행, ', false);
                  setTimeout(() => { setisDeleteModal(false); readCurrentPage(); },300);
                }
              }}
            >
              취소
            </button>
            <button data-tts-text="확인,"
              className="return-btn-confirm"
              onClick={(e) => { e.preventDefault(); handleTouchDeleteButton(id)}}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleText('실행, ', false);
                  setTimeout(() => { handleTouchDeleteButton(id);},300);
                }
              }}
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
