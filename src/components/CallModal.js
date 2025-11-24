import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";
// import { updateTimer } from "../assets/timer";
import { useTextHandler } from '../assets/tts';

const CallModal = ({ }) => {
    const navigate = useNavigate();
    const {
        sections,
        isLowScreen,
        setisLowScreen,
        isHighContrast,
        setisHighContrast,
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
                            isHighContrast
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
                                    isHighContrast ? { color: "#FFE101" } : { color: "#A4693F" }
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
                                    isHighContrast ? { color: "#FFE101" } : { color: "#A4693F" }
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
                            className="return-btn-cancel"
                            onClick={(e) => { e.preventDefault(); setisCallModal(false); readCurrentPage();}}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleText('실행, ', false);
                                setTimeout(() => { setisCallModal(false); readCurrentPage();},300);
                              }
                            }}
                        >
                            취소
                        </button>
                        <button data-text="확인, "
                            className="return-btn-confirm"
                            onClick={(e) => { e.preventDefault(); setisCallModal(false); readCurrentPage();}}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleText('실행, ', false);
                                setTimeout(() => { setisCallModal(false); readCurrentPage();},300);
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

export default CallModal;
