import React, { useContext, useEffect, memo, useCallback } from "react";
import { AppContext } from "../context";
import TakeInIcon from "../components/icons/TakeInIcon";
import TakeOutIcon from "../components/icons/TakeOutIcon";
import Button from "../components/Button";
import { useMultiModalButtonHandler } from "../hooks/useMultiModalButtonHandler";
import { useTextHandler } from '../assets/tts';
import { startIntroTimer } from "../assets/timer";
import { commonScript } from "../constants/commonScript";
import { FOCUS_SECTIONS, TIMER_CONFIG, PAGE_CONFIG, DEFAULT_SETTINGS } from "../config";
import { useSafeDocument } from "../hooks";

const FirstPage = memo(() => {
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

  const { blurActiveElement } = useSafeDocument();

  // useKeyboardNavigation
  useMultiModalButtonHandler({
    initFocusableSections: [FOCUS_SECTIONS.PAGE, FOCUS_SECTIONS.MIDDLE, FOCUS_SECTIONS.BOTTOM_FOOTER],
    initFirstButtonSection: FOCUS_SECTIONS.PAGE,
    enableGlobalHandlers: true,
    handleTextOpt: handleText,
    enableKeyboardNavigation: true
  });

  // 초기화 콜백 (메모이제이션)
  const handleIntroComplete = useCallback(() => {
    setisDark(DEFAULT_SETTINGS.IS_DARK);
    setVolume(DEFAULT_SETTINGS.VOLUME);
    setisLarge(DEFAULT_SETTINGS.IS_LARGE);
    setisLow(DEFAULT_SETTINGS.IS_LOW);
  }, [setisDark, setVolume, setisLarge, setisLow]);

  // FirstPage 진입 시 TTS 및 타이머 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      blurActiveElement();
      handleText(commonScript.intro);
      startIntroTimer(commonScript.intro, handleText, handleIntroComplete);
    }, TIMER_CONFIG.ACTION_DELAY * 2);

    return () => clearTimeout(timer);
  }, [handleText, handleIntroComplete, blurActiveElement]);

  return (
    <div
      className="main first"
    >
        <img
          src="/images/poster.svg"
          alt="coffee"
        />
        <div 
          className="task-manager"
          data-tts-text="취식방식, 버튼 두개,"
          ref={sections.middle}
        >
          <Button
            styleClass="button start"
            ttsText="포장하기"
            icon={<TakeOutIcon />}
            label="포장하기"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(PAGE_CONFIG.SECOND);
            }}
          />
          <Button
            styleClass="button start"
            ttsText="먹고가기"
            icon={<TakeInIcon />}
            label="먹고가기"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(PAGE_CONFIG.SECOND);
            }}
          />
        </div>
    </div>
  );
});

FirstPage.displayName = 'FirstPage';

export default FirstPage;
