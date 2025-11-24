import React, { useState, useRef, useContext, useEffect } from "react";
import { AppContext } from "../App";
import FocusTrap from "focus-trap-react";
import { useTextHandler } from '../assets/tts';

const AccessibilityModal = ({ }) => {
  const {
    accessibility,
    setAccessibility,
    sections,
    isLowScreen,
    setisLowScreen,
    isHighContrast,
    setisHighContrast,
    isAccessibilityModal,
    setisAccessibilityModal,
    volume,
    setVolume,
    isBigSize,
    setisBigSize,
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
    isHighContrast: isHighContrast,
    isLowScreen: isLowScreen,
    isBigSize: isBigSize,
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

    setisHighContrast(prevAccessibility.isHighContrast);
    setVolume(prevAccessibility.volume);
    setisBigSize(prevAccessibility.isBigSize)
    setisLowScreen(prevAccessibility.isLowScreen);
    setAccessibility(prevAccessibility);
    setisAccessibilityModal(false);
    readCurrentPage(prevAccessibility.volume);
  }

  useEffect(() => {
    if (document.activeElement) {
      const pageTTS = document.activeElement.dataset.text;
      setTimeout(() => {
        handleText(pageTTS);
      }, 500); // "실행" 송출 후에 실행 되도록 0.5초 뒤로 설정
    }
  }, [isAccessibilityModal]);


  if (isAccessibilityModal) {
    return (
      <>
        <div className="hidden-div" ref={sections.modalPage}>
          <button type="hidden" autoFocus className="hidden-btn" data-text={'오버레이, 설정, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다,' + commonScript.replay}></button>
        </div>
        <div
          className="accessibility-modal-overlay"
        ></div>
        <div
          className={`accessibility-modal-content ${isLowScreen ? "reverse" : ""
            }
          `}
        >
          <div
            className="accessibility-up-content"
          >
            <div
              style={{ color: "#E7E3E0", fontSize: "6rem", fontWeight: "600" }}
            >
              접근성
            </div>
            <div>
              <div style={{ color: "#E7E3E0", fontSize: "4.1rem" }}>
                원하시는&nbsp;
                <span
                  style={
                    isHighContrast
                      ? { color: "#FFE101", fontSize: "4.1rem" }
                      : { color: "#EB9B63", fontSize: "4.1rem" }
                  }
                >
                  접근성 옵션
                </span>
                을 선택하시고
              </div>
              <div
                style={{
                  color: "#E7E3E0",
                  textAlign: "center",
                  marginTop: "3px",
                }}
              >
                <span
                  style={
                    isHighContrast ? { color: "#FFE101" } : { color: "#EB9B63" }
                  }
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
              className="accessibility-down-content-div1" data-text="초기설정으로 일괄선택, 버튼 한 개, "
              ref={sections.AccessibilitySections1}
            >
              <p>초기 설정으로 일괄선택</p>
              <button data-text="초기설정,"
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
              <div className="flex" style={{ alignItems: "center" }}>
                <img
                  src={
                    isHighContrast
                      ? "/images/contrast_ico_high_cont.png"
                      : "/images/ico_high_cont.png"
                  }
                  className="accessibility-down-content-div-img"
                ></img>
                <p>고대비화면</p>
              </div>
              <div
                className="flex"
                style={{ gap: "10px" }}
                ref={sections.AccessibilitySections2}
                data-text={`고대비 화면, 선택상태, ${prevAccessibility.isHighContrast ? '켬' : '끔'}, 버튼 두 개,`}
              >
                <button data-text={`끔, ${prevAccessibility.isHighContrast ? '선택가능, ' : '선택됨, '}`}
                  className={`button select-btn accessibility-down-content-div-btn1 
                    ${prevAccessibility.isHighContrast ? "" : "accessibility-btn-active"}`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setPrevAccessibility(prevState => ({ ...prevState, isHighContrast: false })); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, isHighContrast: false }));
                      }, 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">끔</span>
                  </div>
                </button>
                <button data-text={`켬, ${prevAccessibility.isHighContrast ? '선택됨, ' : '선택가능, '}`}
                  className={`button select-btn accessibility-down-content-div-btn1 
                    ${prevAccessibility.isHighContrast ? "accessibility-btn-active" : ""}`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setPrevAccessibility(prevState => ({ ...prevState, isHighContrast: true })); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, isHighContrast: true }));
                      }, 100);
                    }
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
              <div className="flex" style={{ alignItems: "center" }}>
                <img
                  src={
                    isHighContrast
                      ? "/images/contrast_ico_volume.png"
                      : "/images/ico_volume.png"
                  }
                  className="accessibility-down-content-div-img"
                ></img>
                <p>소리크기</p>
              </div>
              <div
                className="flex"
                style={{ gap: "10px" }}
                ref={sections.AccessibilitySections3}
                data-text={`소리크기, 선택상태, ${volumeMap[prevAccessibility.volume]}, 버튼 네 개, `}
              >
                <button data-text={`끔, ${prevAccessibility.volume === 0 ? '선택됨, ' : '선택가능, '}`}
                  className={`button select-btn accessibility-down-content-div-btn2 ${prevAccessibility.volume === 0 ? "accessibility-btn-active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.focus();
                    setPrevAccessibility(prevState => ({ ...prevState, volume: 0 }));
                    setTmpVolume(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, volume: 0 }));
                        setTmpVolume(0);
                      }, 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">끔</span>
                  </div>
                </button>
                <button data-text={`약, ${prevAccessibility.volume === 1 ? '선택됨, ' : '선택가능, '}`}
                  className={`button select-btn accessibility-down-content-div-btn2 ${prevAccessibility.volume === 1 ? "accessibility-btn-active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.focus();
                    setPrevAccessibility(prevState => ({ ...prevState, volume: 1 }));
                    setTmpVolume(0.5);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, volume: 1 }));
                        setTmpVolume(0.5);
                      }, 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">약</span>
                  </div>
                </button>
                <button data-text={`중, ${prevAccessibility.volume === 2 ? '선택됨, ' : '선택가능, '}`}
                  className={`button select-btn accessibility-down-content-div-btn2 ${prevAccessibility.volume === 2 ? "accessibility-btn-active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.focus();
                    setPrevAccessibility(prevState => ({ ...prevState, volume: 2 }));
                    setTmpVolume(0.75);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, volume: 2 }));
                    setTmpVolume(0.75);
                      }, 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">중</span>
                  </div>
                </button>
                <button data-text={`강, ${prevAccessibility.volume === 3 ? '선택됨, ' : '선택가능, '}`}
                  className={`button select-btn accessibility-down-content-div-btn2 ${prevAccessibility.volume === 3 ? "accessibility-btn-active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.focus();
                    setPrevAccessibility(prevState => ({ ...prevState, volume: 3 }));
                    setTmpVolume(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, volume: 3 }));
                        setTmpVolume(1);
                      }, 100);
                    }
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
              <div className="flex" style={{ alignItems: "center" }}>
                <img
                  src={
                    isHighContrast
                      ? "/images/contrast_ico_zoom.png"
                      : "/images/ico_zoom.png"
                  }
                  className="accessibility-down-content-div-img"
                ></img>
                <p>큰글씨 화면</p>
              </div>
              <div
                className="flex"
                style={{ gap: "10px" }}
                ref={sections.AccessibilitySections4}
                data-text={`큰글씨 화면, 선택상태, ${prevAccessibility.isBigSize ? '켬' : '끔'}, 버튼 두 개, `}
              >
                <button data-text={`끔, ${prevAccessibility.isBigSize ? '선택가능, ' : '선택됨, '}`}
                  className={`button select-btn accessibility-down-content-div-btn1 ${prevAccessibility.isBigSize ? "" : "accessibility-btn-active"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.focus();
                    setPrevAccessibility(prevState => ({ ...prevState, isBigSize: false }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, isBigSize: false }));
                      }, 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">끔</span>
                  </div>
                </button>
                <button data-text={`켬, ${prevAccessibility.isBigSize ? '선택됨, ' : '선택가능, '}`}
                  className={`button select-btn accessibility-down-content-div-btn1 ${prevAccessibility.isBigSize ? "accessibility-btn-active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.focus();
                    setPrevAccessibility(prevState => ({ ...prevState, isBigSize: true }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, isBigSize: true }));
                      }, 100);
                    }
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
              <div className="flex" style={{ alignItems: "center" }}>
                <img
                  src={
                    isHighContrast
                      ? "/images/contrast_ico_low_sc.png"
                      : "/images/ico_low_sc.png"
                  }
                  className="accessibility-down-content-div-img"
                ></img>
                <p>낮은화면</p>
              </div>
              <div
                className="flex"
                style={{ gap: "10px" }}
                ref={sections.AccessibilitySections5}
                data-text={`낮은 화면, 선택상태, ${prevAccessibility.isLowScreen ? '켬' : '끔'}, 버튼 두 개, `}
              >
                <button data-text={`끔, ${prevAccessibility.isBigSize ? '선택가능, ' : '선택됨, '}`}
                  className={`button select-btn accessibility-down-content-div-btn1 ${prevAccessibility.isLowScreen ? "" : "accessibility-btn-active"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.focus();
                    setPrevAccessibility(prevState => ({ ...prevState, isLowScreen: false }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, isLowScreen: false }));
                      }, 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">끔</span>
                  </div>
                </button>
                <button data-text={`켬, ${prevAccessibility.isBigSize ? '선택됨, ' : '선택가능, '}`}
                  className={`button select-btn accessibility-down-content-div-btn1 ${prevAccessibility.isLowScreen ? "accessibility-btn-active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.focus();
                    setPrevAccessibility(prevState => ({ ...prevState, isLowScreen: true }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        setPrevAccessibility(prevState => ({ ...prevState, isLowScreen: true }));
                      }, 100);
                    }
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
              data-text="작업 관리, 버튼 두 개, "
            >
              <button data-text="적용안함, "
                className="button accessibility-btn-cancel"
                onClick={(e) => {
                  e.preventDefault();
                  setAccessibility({ isHighContrast: isHighContrast, volume: volume, isBigSize: isBigSize, isLowScreen: isLowScreen });
                  setisAccessibilityModal(false);
                  readCurrentPage();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(() => {
                      setAccessibility({ isHighContrast: isHighContrast, volume: volume, isBigSize: isBigSize, isLowScreen: isLowScreen });
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
              <button data-text="적용하기, "
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
