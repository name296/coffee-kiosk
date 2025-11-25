import React, { useState, useRef, useContext, useCallback } from "react";
import { AppContext } from "../context";
import FocusTrap from "focus-trap-react";
import { useTextHandler } from '../assets/tts';
import { useActiveElementTTS, useMultiModalButtonHandler } from "../hooks";

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

  const handleTouchSetAccessibility = ()=>{
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
  }

  // 모달이 열릴 때만 포커스된 요소의 TTS 재생
  useActiveElementTTS(handleText, 500, isAccessibilityModal);

  // 멀티모달 버튼 핸들러 (TTS + 토글 그룹 스위칭 통합)
  const handleButtonClick = useMultiModalButtonHandler(
    handleText,
    '.flex.gap-10',
    null,
    '선택, '
  );


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
                onClick={(e) => { e.preventDefault(); e.target.focus(); setPrevAccessibility({ isHighContrast: false, isLowScreen: false, volume: 1, isBigSize: false }); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(() => {
                      setPrevAccessibility({ isHighContrast: false, isLowScreen: false, volume: 1, isBigSize: false });
                    }, 100);
                  }
                }}
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
                      ? "/images/contrast_ico_high_cont.png"
                      : "/images/ico_high_cont.png"
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
                      ? "/images/contrast_ico_volume.png"
                      : "/images/ico_volume.png"
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
                      ? "/images/contrast_ico_zoom.png"
                      : "/images/ico_zoom.png"
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
                      ? "/images/contrast_ico_low_sc.png"
                      : "/images/ico_low_sc.png"
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
                onClick={(e) => {
                  e.preventDefault();
                  setAccessibility({ isHighContrast: isDark, volume: volume, isBigSize: isLarge, isLowScreen: isLow });
                  setisAccessibilityModal(false);
                  readCurrentPage();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(() => {
                      setAccessibility({ isHighContrast: isDark, volume: volume, isBigSize: isLarge, isLowScreen: isLow });
                      setisAccessibilityModal(false);
                      readCurrentPage();
                    }, 300);
                  }
                }}
              >
                <div className="background dynamic">
                  <span className="content label">적용안함</span>
                </div>
              </button>
              <button data-tts-text="적용하기, "
                className="button accessibility-btn-confirm"
                onClick={(e) => {
                  e.preventDefault();
                  handleTouchSetAccessibility();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(() => {
                      handleTouchSetAccessibility();
                    }, 300);
                  }
                }}
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

export default AccessibilityModal;
