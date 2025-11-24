import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
// import { updateTimer } from "../assets/timer";
import { useTextHandler } from '../assets/tts';

const CallModal = ({ }) => {
    const {
        sections,
        isLow,
        setisLow,
        isDark,
        setisDark,
        isCreditPayContent,
        setisCreditPayContent,
        menuItems,
        setQuantities,
        isResetModal,
        setisResetModal,
        isCallModal,
        setisCallModal,
        volume,
        commonScript,
        readCurrentPage
    } = useContext(AppContext);
    const { handleText } = useTextHandler(volume);

    useEffect(() => {
        if (document.activeElement) {
            const pageTTS = document.activeElement.dataset.text;
            // document.activeElement.blur(); // 현재 포커스를 제거
            setTimeout(() => {
                handleText(pageTTS);
            }, 500); // "실행" 송출 후에 실행 되도록 0.5초 뒤로 설정
        }
    }, [isCallModal]);

    if (isCallModal) {
        return (
            <>
                <div className="hidden-div" ref={sections.modalPage}>
                    <button type="hidden" autoFocus className="hidden-btn" data-text={"오버레이, 알림, 직원 호출, 직원을 호출합니다, 계속 진행하시려면 확인 버튼을 누릅니다," + commonScript.replay }></button>
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
                                ? "/images/contrast_ico_help.png"
                                : "/images/ico_help.png"
                        }
                    ></img>
                    <div
                        className="return-modal-message"
                    >
                        <p>
                            직원을{" "}
                            <span
                                className="return-highlight"
                                style={
                                    isDark ? { color: "#FFE101" } : { color: "#A4693F" }
                                }
                            >
                                호출
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
                    <div data-text="작업관리, 버튼 두 개, "
                        ref={sections.confirmSections} className="return-modal-buttons">
                        <button data-text="취소, "
                            className="button return-btn-cancel"
                            onClick={(e) => { e.preventDefault(); setisCallModal(false); readCurrentPage();}}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleText('실행, ', false);
                                setTimeout(() => { setisCallModal(false); readCurrentPage();},300);
                              }
                            }}
                        >
                            <div className="background dynamic">
                              <span className="content label">취소</span>
                            </div>
                        </button>
                        <button data-text="확인, "
                            className="button return-btn-confirm"
                            onClick={(e) => { e.preventDefault(); setisCallModal(false); readCurrentPage();}}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleText('실행, ', false);
                                setTimeout(() => { setisCallModal(false); readCurrentPage();},300);
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

export default CallModal;
