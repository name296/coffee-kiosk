import React, { useEffect, useContext, useLayoutEffect } from "react";
import { useTextHandler } from "./assets/tts";
import { updateTimer } from "./assets/timer";
import { ButtonStyleGenerator } from "./utils/buttonStyleGenerator";
import { SizeControlManager } from "./utils/sizeControlManager";
import { ButtonEventHandler } from "./utils/buttonEventHandler";
import { AppProvider, AppContext } from "./context/AppContext";
import { getAssetPath } from "./utils/pathUtils";
import FirstPage from "./pages/FirstPage";
import SecondPage from "./pages/SecondPage";
import ThirdPage from "./pages/ThirdPage";
import ForthPage from "./pages/ForthPage";
import { LayoutWithHeaderAndFooter } from "./layouts/Layouts";

// 페이지 렌더링 컴포넌트
const AppContent = () => {
  const { 
    currentPage,
    totalMenuItems,
    setQuantities,
    setisDark,
    setVolume,
    setisLarge,
    setisLow
  } = useContext(AppContext);

  // 앱 초기화 (앱 시작 시 한 번만 실행)
  useLayoutEffect(() => {
    // totalMenuItems가 준비되었을 때만 실행
    if (!totalMenuItems || totalMenuItems.length === 0) return;

    // 수량 초기화
    setQuantities(
      totalMenuItems.reduce(
        (acc, item) => ({ ...acc, [item.id]: 0 }),
        {}
      )
    );
    // 기본 설정 초기화
    setisDark(false);
    setVolume(1);
    setisLarge(false);
    setisLow(false);
  }, [totalMenuItems]); // totalMenuItems가 준비되면 실행


  return (
    <LayoutWithHeaderAndFooter>
      {currentPage === 'first' && <FirstPage />}
      {currentPage === 'second' && <SecondPage />}
      {currentPage === 'third' && <ThirdPage />}
      {currentPage === 'forth' && <ForthPage />}
    </LayoutWithHeaderAndFooter>
  );
};

const App = () => {
  // tts api용 indexedDB 초기화
  const { initDB } = useTextHandler();
  useEffect(() => {
    const initializeDatabase = async () => {
      await initDB();
    };
    initializeDatabase();
  }, [initDB]);

  // 전역적으로 button click에 비프음 추가 (내부 요소에 pointer-events:none 추가하기)
  useEffect(() => {
    // 버튼 스타일 자동 생성 시스템 초기화
    ButtonStyleGenerator.init();
    
    // 크기 조절 시스템 초기화
    SizeControlManager.init();
    
    // 전역 접근 (Footer에서 사용)
    window.ButtonStyleGenerator = ButtonStyleGenerator;
    window.SizeControlManager = SizeControlManager;
    window.BUTTON_CONSTANTS = ButtonStyleGenerator.CONSTANTS;

    // ========================================
    // 27 스타일 버튼 이벤트 처리 시스템
    // ========================================
    
    // 버튼 이벤트 핸들러 초기화 (공통 유틸 - 클릭/사운드 처리 포함)
    ButtonEventHandler.init();
    
    // 뷰포트에 맞춰 줌 배율 조절 (1080x1920 기준)
    function setZoom() {
      const bodyWidth = 1080;
      const bodyHeight = 1920;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // 가로 기준 줌 배율
      const zoomByWidth = vw / bodyWidth;
      // 세로 기준 줌 배율
      const zoomByHeight = vh / bodyHeight;
      
      // 둘 중 작은 값을 선택 (뷰포트에 완전히 들어가도록)
      const zoom = Math.min(zoomByWidth, zoomByHeight);
      
      const body = document.body;
      
      if (body) {
        // body에 scale 적용
        body.style.transform = `scale(${zoom})`;
        body.style.transformOrigin = 'top left';
        
        // 스케일 후 실제 크기 계산
        const scaledWidth = bodyWidth * zoom;
        const scaledHeight = bodyHeight * zoom;
        
        // 중앙 정렬을 위한 위치 조정
        const offsetX = (vw - scaledWidth) / 2;
        const offsetY = (vh - scaledHeight) / 2;
        
        body.style.position = 'fixed';
        body.style.top = `${offsetY}px`;
        body.style.left = `${offsetX}px`;
        body.style.width = `${bodyWidth}px`;
        body.style.height = `${bodyHeight}px`;
      }
    }
    
    // 초기 줌 설정
    setZoom();
    
    // 리사이즈 이벤트 처리
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setZoom, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <AppProvider>
      <audio
        id="audioPlayer"
        src=""
        controls
        className="hidden-audio"
      ></audio>
      <audio
        id="beapSound"
        src={getAssetPath("./public/sound/beap_sound2.mp3")}
        controls
        className="hidden-audio"
      ></audio>
      <AppContent />
    </AppProvider>
  );
};

export default App;
