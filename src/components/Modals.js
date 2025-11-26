// ============================================================================
// 모달 컴포넌트 통합 파일
// 모든 모달 컴포넌트를 하나의 파일로 관리
// ============================================================================

import React, { useContext, useState, useCallback } from "react";
import FocusTrap from "focus-trap-react";
import { AppContext } from "../contexts";
import { useTextHandler } from '../utils/tts';
import { useActiveElementTTS, useMultiModalButtonHandler } from "../hooks";
import { getAssetPath } from "../utils/pathUtils";

// ============================================================================
// 삭제 확인 모달 (마지막 아이템 삭제 시)
// ============================================================================

const DeleteCheckModal = ({ handleDecrease, id, quantities, currentItems }) => {
    const {
        sections,
        isDark,
        isDeleteCheckModal,
        setisDeleteCheckModal,
        volume,
        commonScript,
        readCurrentPage,
        setCurrentPage
    } = useContext(AppContext);
    const { handleText } = useTextHandler(volume);

    // 모달이 열릴 때만 포커스된 요소의 TTS 재생
    useActiveElementTTS(handleText, 500, isDeleteCheckModal);

    const handleTouchCheckDelete = useCallback((id) => {
        if (quantities[id] !== 1) {
            quantities[id] = 0;
        } else {
            handleDecrease(id);
        }
        setisDeleteCheckModal(false);
        setCurrentPage("third");
    }, [quantities, handleDecrease, setisDeleteCheckModal, setCurrentPage]);

    // 모달 버튼 핸들러들 (메모이제이션)
    // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
    const handleCancelPress = useCallback((e) => {
        e.preventDefault();
        setisDeleteCheckModal(false);
        readCurrentPage();
    }, [setisDeleteCheckModal, readCurrentPage]);

    const handleConfirmPress = useCallback((e) => {
        e.preventDefault();
        handleTouchCheckDelete(id);
    }, [handleTouchCheckDelete, id]);

    if (isDeleteCheckModal) {
        return (
            <>
                <div className="hidden-div" ref={sections.modalPage}>
                    <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 내역이 없으면 메뉴선택으로 돌아갑니다, 계속 진행하시려면 확인 버튼을 누릅니다, " + commonScript.replay}></button>
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
                            내역이 없으면{" "}
                            <span
                                className="return-highlight"
                                style={
                                    isDark ? { color: "#FFE101" } : { color: "#A4693F" }
                                }
                            >
                                메뉴선택
                            </span>
                            으로 돌아갑니다.
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
                    <div data-tts-text="작업관리, 버튼 두 개," ref={sections.confirmSections} className="return-modal-buttons">
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

// ============================================================================
// 삭제 모달
// ============================================================================

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

// ============================================================================
// 초기화 모달
// ============================================================================

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

// ============================================================================
// 처음으로 돌아가기 모달
// ============================================================================

const ReturnModal = ({ }) => {
  const {
    sections,
    setisLow,
    isDark,
    setisDark,
    totalMenuItems,
    setQuantities,
    isReturnModal,
    setisReturnModal,
    volume,
    setVolume,
    setisLarge,
    commonScript,
    readCurrentPage,
    setCurrentPage
  } = useContext(AppContext);

  const { handleText } = useTextHandler(volume);
  
  // 모달이 열릴 때만 포커스된 요소의 TTS 재생
  useActiveElementTTS(handleText, 500, isReturnModal);

  // 모달 버튼 핸들러들 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handleCancelPress = useCallback((e) => {
    e.preventDefault();
    setisReturnModal(false);
    readCurrentPage();
  }, [setisReturnModal, readCurrentPage]);

  const handleConfirmPress = useCallback((e) => {
    e.preventDefault();
    setCurrentPage("first");
    setisReturnModal(false);
  }, [setCurrentPage, setisReturnModal]);

  if (isReturnModal) {
    return (
      <>
        <div className="hidden-div" ref={sections.modalPage}>
          <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 처음으로, 시작화면으로 돌아갑니다. 계속 진행하시려면 확인 버튼을 누릅니다, " + commonScript.replay}></button>
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
              isDark? getAssetPath("/images/contrast-Group 13.png") : getAssetPath("/images/ico_notice.png")
            }
          ></img>
          <div
            className="return-modal-message"
          >
            <p>
              <span
                className="return-highlight"
                style={
                  isDark ? { color: "#FFE101" } : { color: "#A4693F" }
                }
              >
                시작화면
              </span>
              으로 돌아갑니다
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
          <div data-tts-text="작업관리, 버튼 두 개," ref={sections.confirmSections} className="return-modal-buttons">
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

// ============================================================================
// 접근성 설정 모달
// ============================================================================

const AccessibilityModal = ({ }) => {
  const {
    accessibility,
    setAccessibility,
    sections,
    isLow,
    setisLow,
    isDark,
    setisDark,
    isAccessibilityModal,
    setisAccessibilityModal,
    volume,
    setVolume,
    isLarge,
    setisLarge,
    commonScript,
    readCurrentPage
  } = useContext(AppContext);

  const { handleText } = useTextHandler(volume);
  const volumeMap = {
    0: '끔',
    1: '약',
    2: '중',
    3: '강'
  };

  const [prevAccessibility, setPrevAccessibility] = useState({
    isHighContrast: isDark,
    isLowScreen: isLow,
    isBigSize: isLarge,
    volume: volume
  });

  const setTmpVolume = (vol) => {
    // const audio = document.getElementById('audioPlayer');
    // if(!audio.paused){
    //   audio.volume = vol;
    // }
  }

  const handleTouchSetAccessibility = useCallback(() => {
    const volumeValue = {
      0: '0',
      1: '0.5',
      2: '0.75',
      3: '1'
    };
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.volume = volumeValue[prevAccessibility.volume];

    setisDark(prevAccessibility.isHighContrast);
    setVolume(prevAccessibility.volume);
    setisLarge(prevAccessibility.isBigSize);
    setisLow(prevAccessibility.isLowScreen);
    setAccessibility(prevAccessibility);
    setisAccessibilityModal(false);
    readCurrentPage(prevAccessibility.volume);
  }, [prevAccessibility, setisDark, setVolume, setisLarge, setisLow, setAccessibility, setisAccessibilityModal, readCurrentPage]);

  // 모달이 열릴 때만 포커스된 요소의 TTS 재생
  useActiveElementTTS(handleText, 500, isAccessibilityModal);

  // 멀티모달 버튼 핸들러 (TTS + 토글 그룹 스위칭 통합)
  const handleButtonClick = useMultiModalButtonHandler(
    handleText,
    '.flex.gap-10',
    null,
    '선택, '
  );

  // 초기설정 버튼 핸들러 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handleInitialSettingsPress = useCallback((e) => {
    e.preventDefault();
    e.target.focus();
    setPrevAccessibility({ isHighContrast: false, isLowScreen: false, volume: 1, isBigSize: false });
  }, []);

  // 적용안함/적용하기 버튼 핸들러들 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handleCancelPress = useCallback((e) => {
    e.preventDefault();
    setAccessibility({ isHighContrast: isDark, volume: volume, isBigSize: isLarge, isLowScreen: isLow });
    setisAccessibilityModal(false);
    readCurrentPage();
  }, [isDark, volume, isLarge, isLow, setAccessibility, setisAccessibilityModal, readCurrentPage]);

  const handleApplyPress = useCallback((e) => {
    e.preventDefault();
    handleTouchSetAccessibility();
  }, [handleTouchSetAccessibility]);


  if (isAccessibilityModal) {
    return (
      <>
        <div className="hidden-div" ref={sections.modalPage}>
          <button type="hidden" autoFocus className="hidden-btn" data-tts-text={'오버레이, 설정, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다,' + commonScript.replay}></button>
        </div>
        <div
          className="accessibility-modal-overlay"
        ></div>
        <div
          className={`accessibility-modal-content ${isLow ? "reverse" : ""}`}
        >
          <div
            className="accessibility-up-content"
          >
            <div className="accessibility-title">
              접근성
            </div>
            <div>
              <div className="accessibility-subtitle">
                원하시는&nbsp;
                <span
                  className={isDark ? "accessibility-subtitle-highlight" : "accessibility-subtitle-highlight-light"}
                >
                  접근성 옵션
                </span>
                을 선택하시고
              </div>
              <div className="accessibility-description">
                <span
                  className={isDark ? "accessibility-subtitle-highlight" : "accessibility-subtitle-highlight-light"}
                >
                  적용하기
                </span>
                &nbsp;버튼을 누르세요
              </div>
            </div>
          </div>
          <div
            className="accessibility-down-content"
          >
            <div
              className="accessibility-down-content-div1" data-tts-text="초기설정으로 일괄선택, 버튼 한 개, "
              ref={sections.AccessibilitySections1}
            >
              <p>초기 설정으로 일괄선택</p>
              <button data-tts-text="초기설정,"
                className="button accessibility-down-content-div-btn"
                onClick={handleInitialSettingsPress}
              >
                <div className="background dynamic">
                  <span className="content label">초기설정</span>
                </div>
              </button>
            </div>
            <div className="accessibility-down-content-line"></div>
            <div className="accessibility-down-content-div2">
              <div className="flex align-center">
                <img
                  src={
                    isDark
                      ? getAssetPath("/images/contrast_ico_high_cont.png")
                      : getAssetPath("/images/ico_high_cont.png")
                  }
                  className="accessibility-down-content-div-img"
                ></img>
                <p>고대비화면</p>
              </div>
              <div
                className="flex gap-10"
                ref={sections.AccessibilitySections2}
                data-tts-text={`고대비 화면, 선택상태, ${prevAccessibility.isHighContrast ? '켬' : '끔'}, 버튼 두 개,`}
              >
                <button data-tts-text={`끔, ${prevAccessibility.isHighContrast ? '선택가능, ' : '선택됨, '}`}
                  className={`button toggle accessibility-down-content-div-btn1 
                    ${prevAccessibility.isHighContrast ? "" : "pressed"}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, isHighContrast: false }));
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">끔</span>
                  </div>
                </button>
                <button data-tts-text={`켬, ${prevAccessibility.isHighContrast ? '선택됨, ' : '선택가능, '}`}
                  className={`button toggle accessibility-down-content-div-btn1 
                    ${prevAccessibility.isHighContrast ? "pressed" : ""}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, isHighContrast: true }));
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">켬</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="accessibility-down-content-line"></div>
            <div className="accessibility-down-content-div3">
              <div className="flex align-center">
                <img
                  src={
                    isDark
                      ? getAssetPath("/images/contrast_ico_volume.png")
                      : getAssetPath("/images/ico_volume.png")
                  }
                  className="accessibility-down-content-div-img"
                ></img>
                <p>소리크기</p>
              </div>
              <div
                className="flex gap-10"
                ref={sections.AccessibilitySections3}
                data-tts-text={`소리크기, 선택상태, ${volumeMap[prevAccessibility.volume]}, 버튼 네 개, `}
              >
                <button data-tts-text={`끔, ${prevAccessibility.volume === 0 ? '선택됨, ' : '선택가능, '}`}
                  className={`button toggle accessibility-down-content-div-btn2 ${prevAccessibility.volume === 0 ? "pressed" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    // 같은 그룹 내 다른 버튼의 pressed 제거
                    const group = e.target.closest('.flex.gap-10');
                    if (group) {
                      group.querySelectorAll('.button.toggle').forEach(btn => {
                        if (btn !== e.target.closest('.button')) {
                          btn.classList.remove('pressed');
                        }
                      });
                    }
                    setPrevAccessibility(prevState => ({ ...prevState, volume: 0 }));
                    setTmpVolume(0);
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">끔</span>
                  </div>
                </button>
                <button data-tts-text={`약, ${prevAccessibility.volume === 1 ? '선택됨, ' : '선택가능, '}`}
                  className={`button toggle accessibility-down-content-div-btn2 ${prevAccessibility.volume === 1 ? "pressed" : ""}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, volume: 1 }));
                    setTmpVolume(0.5);
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">약</span>
                  </div>
                </button>
                <button data-tts-text={`중, ${prevAccessibility.volume === 2 ? '선택됨, ' : '선택가능, '}`}
                  className={`button toggle accessibility-down-content-div-btn2 ${prevAccessibility.volume === 2 ? "pressed" : ""}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, volume: 2 }));
                    setTmpVolume(0.75);
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">중</span>
                  </div>
                </button>
                <button data-tts-text={`강, ${prevAccessibility.volume === 3 ? '선택됨, ' : '선택가능, '}`}
                  className={`button toggle accessibility-down-content-div-btn2 ${prevAccessibility.volume === 3 ? "pressed" : ""}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, volume: 3 }));
                    setTmpVolume(1);
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">강</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="accessibility-down-content-line"></div>
            <div className="accessibility-down-content-div4">
              <div className="flex align-center">
                <img
                  src={
                    isDark
                      ? getAssetPath("/images/contrast_ico_zoom.png")
                      : getAssetPath("/images/ico_zoom.png")
                  }
                  className="accessibility-down-content-div-img"
                ></img>
                <p>큰글씨 화면</p>
              </div>
              <div
                className="flex gap-10"
                ref={sections.AccessibilitySections4}
                data-tts-text={`큰글씨 화면, 선택상태, ${prevAccessibility.isBigSize ? '켬' : '끔'}, 버튼 두 개, `}
              >
                <button data-tts-text={`끔, ${prevAccessibility.isBigSize ? '선택가능, ' : '선택됨, '}`}
                  className={`button toggle accessibility-down-content-div-btn1 ${prevAccessibility.isBigSize ? "" : "pressed"}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, isBigSize: false }));
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">끔</span>
                  </div>
                </button>
                <button data-tts-text={`켬, ${prevAccessibility.isBigSize ? '선택됨, ' : '선택가능, '}`}
                  className={`button toggle accessibility-down-content-div-btn1 ${prevAccessibility.isBigSize ? "pressed" : ""}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, isBigSize: true }));
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">켬</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="accessibility-down-content-line"></div>

            <div className="accessibility-down-content-div5">
              <div className="flex align-center">
                <img
                  src={
                    isDark
                      ? getAssetPath("/images/contrast_ico_low_sc.png")
                      : getAssetPath("/images/ico_low_sc.png")
                  }
                  className="accessibility-down-content-div-img"
                ></img>
                <p>낮은화면</p>
              </div>
              <div
                className="flex gap-10"
                ref={sections.AccessibilitySections5}
                data-tts-text={`낮은 화면, 선택상태, ${prevAccessibility.isLowScreen ? '켬' : '끔'}, 버튼 두 개, `}
              >
                <button data-tts-text={`끔, ${prevAccessibility.isLowScreen ? '선택가능, ' : '선택됨, '}`}
                  className={`button toggle accessibility-down-content-div-btn1 ${prevAccessibility.isLowScreen ? "" : "pressed"}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, isLowScreen: false }));
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">끔</span>
                  </div>
                </button>
                <button data-tts-text={`켬, ${prevAccessibility.isLowScreen ? '선택됨, ' : '선택가능, '}`}
                  className={`button toggle accessibility-down-content-div-btn1 ${prevAccessibility.isLowScreen ? "pressed" : ""}`}
                  onClick={(e) => {
                    handleButtonClick(e, null);
                    setPrevAccessibility(prevState => ({ ...prevState, isLowScreen: true }));
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">켬</span>
                  </div>
                </button>
              </div>
            </div>
            <div
              className="accessibility-modal-buttons"
              ref={sections.AccessibilitySections6}
              data-tts-text="작업 관리, 버튼 두 개, "
            >
              <button data-tts-text="적용안함, "
                className="button accessibility-btn-cancel"
                onClick={handleCancelPress}
              >
                <div className="background dynamic">
                  <span className="content label">적용안함</span>
                </div>
              </button>
              <button data-tts-text="적용하기, "
                className="button accessibility-btn-confirm"
                onClick={handleApplyPress}
              >
                <div className="background dynamic">
                  <span className="content label">적용하기</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
};

// ============================================================================
// 직원 호출 모달
// ============================================================================

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

    // 모달이 열릴 때만 포커스된 요소의 TTS 재생
    useActiveElementTTS(handleText, 500, isCallModal);

    // 모달 버튼 핸들러들 (메모이제이션)
    // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
    const handleCancelPress = useCallback((e) => {
        e.preventDefault();
        setisCallModal(false);
        readCurrentPage();
    }, [setisCallModal, readCurrentPage]);

    const handleConfirmPress = useCallback((e) => {
        e.preventDefault();
        setisCallModal(false);
        readCurrentPage();
    }, [setisCallModal, readCurrentPage]);

    if (isCallModal) {
        return (
            <>
                <div className="hidden-div" ref={sections.modalPage}>
                    <button type="hidden" autoFocus className="hidden-btn" data-tts-text={"오버레이, 알림, 직원 호출, 직원을 호출합니다, 계속 진행하시려면 확인 버튼을 누릅니다," + commonScript.replay }></button>
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
                                ? getAssetPath("/images/contrast_ico_help.png")
                                : getAssetPath("/images/ico_help.png")
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

// ============================================================================
// Export
// ============================================================================

export default DeleteCheckModal;
export { DeleteCheckModal, DeleteModal, ResetModal, ReturnModal, AccessibilityModal, CallModal };

