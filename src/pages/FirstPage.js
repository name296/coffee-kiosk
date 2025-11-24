import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import TakeInIcon from "../components/icons/TakeInIcon";
import TakeOutIcon from "../components/icons/TakeOutIcon";
import Button from "../components/Button";
import { useKeyboardNavigation } from "../assets/useKeyboardNavigation";
import { useTextHandler } from '../assets/tts';
import { startIntroTimer } from "../assets/timer";
import { commonScript } from "../constants/commonScript";

const FirstPage = () => {
  const {
    sections,
    setCurrentPage,
    volume,
    setisDark,
    setVolume,
    setisLarge,
    setisLow
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);

  // useKeyboardNavigation
  useKeyboardNavigation({
    initFocusableSections: ["page", "middle", "bottomfooter"],
    initFirstButtonSection: "page",
  });

  // FirstPage 진입 시 TTS 및 타이머 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      // 포커스 제거
      if (document.activeElement) {
        document.activeElement.blur();
      }
      // TTS 초기화
      handleText(commonScript.intro);
      // 인트로 타이머 시작
      startIntroTimer(commonScript.intro, handleText, () => {
        setisDark(false);
        setVolume(1);
        setisLarge(false);
        setisLow(false);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [handleText, setisDark, setVolume, setisLarge, setisLow]);

  return (
    <div
      className="main first"
    >
      <div className="hidden-div" ref={sections.page}>
        <button
          type="hidden"
          className="hidden-btn page-btn"
          data-text={"작업 안내, 시작화면 단계, 음식을 포장할지 먹고갈지 선택합니다." + commonScript.replay}
        />
      </div>
        <img
          className="first-image"
          src="public/images/poster.svg"
          alt="coffee"
        />
        <div 
          className="task-manager"
          data-text="취식방식, 버튼 두개,"
          ref={sections.middle}
        >
          <Button
            className="home-btn"
            dataText="포장하기"
            icon={<TakeOutIcon />}
            label="포장하기"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage('second');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleText('실행, ', false);
                setTimeout(() => {
                  setCurrentPage('second');
                }, 100);
              }
            }}
          />
          <Button
            className="home-btn"
            dataText="먹고가기"
            icon={<TakeInIcon />}
            label="먹고가기"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage('second');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleText('실행, ', false);
                setTimeout(() => {
                  setCurrentPage('second');
                }, 100);
              }
            }}
          />
        </div>
    </div>
  );
};

export default FirstPage;
