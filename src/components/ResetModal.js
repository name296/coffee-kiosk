import React, { useContext } from "react";
import { AppContext } from "../context";
import { useTextHandler } from '../assets/tts';
import { useActiveElementTTS } from "../hooks";

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

  const handleTouchConfirm = ()=>{
    setQuantities(
      totalMenuItems.reduce(
        (acc, item) => ({ ...acc, [item.id]: 0 }),
        {}
      )
    );
    setisResetModal(false);
    readCurrentPage();
  }

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
                ? "/images/contrast-Group 13.png"
                : "/images/ico_notice.png"
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
              onClick={(e) => { 
                e.preventDefault();
                setisResetModal(false); readCurrentPage(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleText('실행, ', false);
                  setTimeout(() => {setisResetModal(false); readCurrentPage();}, 300);
                }
              }}
            >
              <div className="background dynamic">
                <span className="content label">취소</span>
              </div>
            </button>
            <button data-tts-text="확인, "
              className="button return-btn-confirm"
              onClick={(e) => { 
                e.preventDefault();
                handleTouchConfirm(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleText('실행, ', false);
                  setTimeout(() => handleTouchConfirm(), 300);
                }
              }}
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
