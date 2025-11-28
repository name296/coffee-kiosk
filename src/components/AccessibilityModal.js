// ============================================================================
// 접근성 모달 컴포넌트
// 대원칙: DOM 직접 조작 금지 → Context/State 기반 ReactDOM 조작
// ============================================================================

import React, { useContext, useCallback } from "react";
import { AppContext } from "../contexts";
import { useTextHandler } from '../hooks/useTTS';
import { useActiveElementTTS, useAccessibilitySettings, useSafeDocument, useFocusTrap, VOLUME_MAP, VOLUME_VALUES } from "../hooks";
import Button from "./Button";
import Icon from "./Icon";
import { ModalToggleButton } from "./CommonModals";

// ============================================================================
// 접근성 모달
// ============================================================================

const AccessibilityModal = () => {
  const {
    sections,
    isLow,
    setisLow,
    isDark,
    setisDark,
    setAccessibility,
    ModalAccessibility,
    volume,
    setVolume,
    isLarge,
    setisLarge,
    commonScript,
    readCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  
  // 포커스 트랩
  const { containerRef } = useFocusTrap(ModalAccessibility.isOpen);

  // 이전 접근성 설정 상태 관리 (훅 사용)
  const { 
    settings: prevAccessibility, 
    setHighContrast, 
    setLowScreen, 
    setBigSize, 
    setVolume: setPrevVolume,
    updateAll: setPrevAccessibility,
    getStatusText 
  } = useAccessibilitySettings({
    isHighContrast: isDark,
    isLowScreen: isLow,
    isBigSize: isLarge,
    volume: volume
  });

  useActiveElementTTS(handleText, 500, ModalAccessibility.isOpen);

  // 초기설정 핸들러
  const handleInitialSettingsPress = useCallback(() => {
    setPrevAccessibility({ isHighContrast: false, isLowScreen: false, volume: 1, isBigSize: false });
  }, [setPrevAccessibility]);

  // 적용안함 핸들러
  const handleCancelPress = useCallback(() => {
    setAccessibility({ isHighContrast: isDark, volume: volume, isBigSize: isLarge, isLowScreen: isLow });
    ModalAccessibility.close();
    readCurrentPage();
  }, [isDark, volume, isLarge, isLow, setAccessibility, ModalAccessibility, readCurrentPage]);

  // 안전한 DOM 접근
  const { setAudioVolume } = useSafeDocument();

  // 적용하기 핸들러
  const handleApplyPress = useCallback(() => {
    // 안전한 오디오 볼륨 설정 (useSafeDocument 훅 사용)
    setAudioVolume('audioPlayer', VOLUME_VALUES[prevAccessibility.volume]);
    
    setisDark(prevAccessibility.isHighContrast);
    setVolume(prevAccessibility.volume);
    setisLarge(prevAccessibility.isBigSize);
    setisLow(prevAccessibility.isLowScreen);
    setAccessibility(prevAccessibility);
    ModalAccessibility.close();
    readCurrentPage(prevAccessibility.volume);
  }, [prevAccessibility, setisDark, setVolume, setisLarge, setisLow, setAccessibility, ModalAccessibility, readCurrentPage, setAudioVolume]);

  if (!ModalAccessibility.isOpen) return null;

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={'오버레이, 설정, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다,' + commonScript.replay}></button>
      </div>
      <div className="accessibility-modal-overlay"></div>
      <div className={`accessibility-modal-content ${isLow ? "reverse" : ""}`} ref={containerRef}>
        <div className="accessibility-up-content">
          <div className="accessibility-title">접근성</div>
          <div>
            <div className="accessibility-subtitle">
              원하시는&nbsp;
              <span className={isDark ? "accessibility-subtitle-highlight" : "accessibility-subtitle-highlight-light"}>
                접근성 옵션
              </span>
              을 선택하시고
            </div>
            <div className="accessibility-description">
              <span className={isDark ? "accessibility-subtitle-highlight" : "accessibility-subtitle-highlight-light"}>
                적용하기
              </span>
              &nbsp;버튼을 누르세요
            </div>
          </div>
        </div>
        <div className="accessibility-down-content">
          {/* 초기설정 */}
          <div className="accessibility-down-content-div1" data-tts-text="초기설정으로 일괄선택, 버튼 한 개, " ref={sections.AccessibilitySections1}>
            <p>초기 설정으로 일괄선택</p>
            <Button
              styleClass="accessibility-down-content-div-btn"
              label="초기설정"
              ttsText="초기설정,"
              onClick={handleInitialSettingsPress}
            />
          </div>
          
          <div className="accessibility-down-content-line"></div>
          
          {/* 고대비화면 */}
          <div className="accessibility-down-content-div2">
            <div className="flex align-center">
              <Icon name="Contrast" />
              <p>고대비화면</p>
            </div>
            <div className="flex gap-10" ref={sections.AccessibilitySections2} data-tts-text={`고대비 화면, 선택상태, ${getStatusText.highContrast}, 버튼 두 개,`}>
              <ModalToggleButton
                label="끔"
                ttsText={`끔, ${prevAccessibility.isHighContrast ? '선택가능, ' : '선택됨, '}`}
                isPressed={!prevAccessibility.isHighContrast}
                onClick={() => setHighContrast(false)}
                styleClass="accessibility-down-content-div-btn1"
              />
              <ModalToggleButton
                label="켬"
                ttsText={`켬, ${prevAccessibility.isHighContrast ? '선택됨, ' : '선택가능, '}`}
                isPressed={prevAccessibility.isHighContrast}
                onClick={() => setHighContrast(true)}
                styleClass="accessibility-down-content-div-btn1"
              />
            </div>
          </div>
          
          <div className="accessibility-down-content-line"></div>
          
          {/* 소리크기 */}
          <div className="accessibility-down-content-div3">
            <div className="flex align-center">
              <Icon name="Volume" />
              <p>소리크기</p>
            </div>
            <div className="flex gap-10" ref={sections.AccessibilitySections3} data-tts-text={`소리크기, 선택상태, ${getStatusText.volume}, 버튼 네 개, `}>
              {[0, 1, 2, 3].map((vol) => (
                <ModalToggleButton
                  key={vol}
                  label={VOLUME_MAP[vol]}
                  ttsText={`${VOLUME_MAP[vol]}, ${prevAccessibility.volume === vol ? '선택됨, ' : '선택가능, '}`}
                  isPressed={prevAccessibility.volume === vol}
                  onClick={() => setPrevVolume(vol)}
                  styleClass="accessibility-down-content-div-btn2"
                />
              ))}
            </div>
          </div>
          
          <div className="accessibility-down-content-line"></div>
          
          {/* 큰글씨 화면 */}
          <div className="accessibility-down-content-div4">
            <div className="flex align-center">
              <Icon name="Large" />
              <p>큰글씨 화면</p>
            </div>
            <div className="flex gap-10" ref={sections.AccessibilitySections4} data-tts-text={`큰글씨 화면, 선택상태, ${getStatusText.bigSize}, 버튼 두 개, `}>
              <ModalToggleButton
                label="끔"
                ttsText={`끔, ${prevAccessibility.isBigSize ? '선택가능, ' : '선택됨, '}`}
                isPressed={!prevAccessibility.isBigSize}
                onClick={() => setBigSize(false)}
                styleClass="accessibility-down-content-div-btn1"
              />
              <ModalToggleButton
                label="켬"
                ttsText={`켬, ${prevAccessibility.isBigSize ? '선택됨, ' : '선택가능, '}`}
                isPressed={prevAccessibility.isBigSize}
                onClick={() => setBigSize(true)}
                styleClass="accessibility-down-content-div-btn1"
              />
            </div>
          </div>
          
          <div className="accessibility-down-content-line"></div>
          
          {/* 낮은화면 */}
          <div className="accessibility-down-content-div5">
            <div className="flex align-center">
              <Icon name="Lowpos" />
              <p>낮은화면</p>
            </div>
            <div className="flex gap-10" ref={sections.AccessibilitySections5} data-tts-text={`낮은 화면, 선택상태, ${getStatusText.lowScreen}, 버튼 두 개, `}>
              <ModalToggleButton
                label="끔"
                ttsText={`끔, ${prevAccessibility.isLowScreen ? '선택가능, ' : '선택됨, '}`}
                isPressed={!prevAccessibility.isLowScreen}
                onClick={() => setLowScreen(false)}
                styleClass="accessibility-down-content-div-btn1"
              />
              <ModalToggleButton
                label="켬"
                ttsText={`켬, ${prevAccessibility.isLowScreen ? '선택됨, ' : '선택가능, '}`}
                isPressed={prevAccessibility.isLowScreen}
                onClick={() => setLowScreen(true)}
                styleClass="accessibility-down-content-div-btn1"
              />
            </div>
          </div>
          
          {/* 적용 버튼들 */}
          <div className="accessibility-modal-buttons" ref={sections.AccessibilitySections6} data-tts-text="작업 관리, 버튼 두 개, ">
            <Button
              styleClass="accessibility-btn-cancel"
              label="적용안함"
              ttsText="적용안함, "
              onClick={handleCancelPress}
            />
            <Button
              styleClass="accessibility-btn-confirm"
              label="적용하기"
              ttsText="적용하기, "
              onClick={handleApplyPress}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AccessibilityModal;

