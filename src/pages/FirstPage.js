import React, { useContext, useRef, useEffect, useLayoutEffect } from "react";
import { AppContext } from "../App";
import TakeInIcon from "../components/icons/TakeInIcon";
import TakeOutIcon from "../components/icons/TakeOutIcon";
import { useNavigate, useLocation } from "react-router-dom";
import { startIntroTimer } from "../assets/timer";
import { useKeyboardNavigation } from "../assets/useKeyboardNavigation";
import { useTextHandler } from '../assets/tts';

const FirstPage = ({ }) => {
  const navigate = useNavigate();
  const { sections, isHighContrast,setisHighContrast,totalMenuItems, isAccessibilityModal, commonScript, volume,setVolume,setisBigSize, setisLowScreen, setQuantities } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const location = useLocation();

  // useKeyboardNavigation
  useKeyboardNavigation({
    initFocusableSections: ["page", "middle", "bottomfooter"],
    initFirstButtonSection: "page",
    // isAccessibilityModal,
    // isReturnModal: false,
    // isResetModal: false,
    // isCreditPayContent: 0
  });
  useLayoutEffect(() => {
    setQuantities(
      totalMenuItems.reduce(
        (acc, item) => ({ ...acc, [item.id]: 0 }),
        {}
      )
    );
    setisHighContrast(false);
    setVolume(1);
    setisBigSize(false);
    setisLowScreen(false);
  }, []);

  useEffect(() => {
    document.querySelectorAll('button').forEach(btn => {
      const { width, height } = btn.getBoundingClientRect();
      const shortSize = Math.min(width, height);
      btn.style.setProperty('--short-size', `${shortSize}px`);
    });
    
    const timer = setTimeout(() => {

      // 페이지 로드 시 모든 포커스 제거
      if (document.activeElement) {
        document.activeElement.blur();
      }
      if(location.state) handleText(commonScript.return + commonScript.intro);
      else handleText(commonScript.intro);
      startIntroTimer(commonScript.intro, handleText, ()=>{
        setisHighContrast(false);
        setVolume(1);
        setisBigSize(false);
        setisLowScreen(false);
      });    
    }, 200);

    return () => clearTimeout(timer); // 클린업
  }, []);

  return (
    <div className="max-width" >
      <img
        className="first-image"
        src="/images/poster_home.png"
        alt="coffee"
      ></img>
      <div className="hidden-div" ref={sections.page}>
        <button type="hidden" className="hidden-btn page-btn" data-text={"작업 안내, 시작화면 단계, 음식을 포장할지 먹고갈지 선택합니다." + commonScript.replay} />
      </div>
      <div data-text="취식방식, 버튼 두개,"
        ref={sections.middle}
        className="first-content"
      >
        <button data-text="포장하기" 
          onClick={(e) => {e.preventDefault(); navigate("/second")}}
          onKeyDown={(e)=> {
            if(e.key === 'Enter'){
              e.preventDefault();
              handleText('실행, ', false);
              setTimeout(()=>{navigate("/second")},100);
          }
        }}
          className="home-btn">
          <TakeOutIcon></TakeOutIcon>
          <p>포장하기</p>
        </button>
        <button data-text="먹고가기" 
        onClick={(e) => {e.preventDefault(); navigate("/second")}}
        onKeyDown={(e)=> {
          if(e.key === 'Enter'){
            e.preventDefault();
            handleText('실행, ', false);
            setTimeout(()=>{navigate("/second")},100);
        }
      }}
        className="home-btn">
          <TakeInIcon></TakeInIcon>
          <p>먹고가기</p>
        </button>
      </div>
    </div>
  );
};

export default FirstPage;
