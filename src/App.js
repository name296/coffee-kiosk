import React, { useEffect, useContext, useLayoutEffect, useMemo } from "react";
import { useTextHandler } from "./assets/tts";
import { updateTimer } from "./assets/timer";
import { ButtonStyleGenerator } from "./utils/buttonStyleGenerator";
import { SizeControlManager } from "./utils/sizeControlManager";
import { useMultiModalButtonHandler } from "./hooks/useMultiModalButtonHandler";
import { AppProvider, AppContext } from "./context";
import { getAssetPath } from "./utils/pathUtils";
import FirstPage from "./pages/FirstPage";
import SecondPage from "./pages/SecondPage";
import ThirdPage from "./pages/ThirdPage";
import ForthPage from "./pages/ForthPage";
import { Layout } from "./layouts/Layouts";
import ErrorBoundary from "./components/ErrorBoundary";
import { SCREEN_CONFIG, TIMER_CONFIG } from "./config/appConfig";

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
    <Layout>
      {currentPage === 'first' && <FirstPage />}
      {currentPage === 'second' && <SecondPage />}
      {currentPage === 'third' && <ThirdPage />}
      {currentPage === 'forth' && <ForthPage />}
    </Layout>
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

  // 전역 버튼 이벤트 핸들러 (React 훅으로 통합)
  useMultiModalButtonHandler({
    enableGlobalHandlers: true,
    enableKeyboardNavigation: false
  });

  // 전역적으로 button click에 비프음 추가 (내부 요소에 pointer-events:none 추가하기)
  // useLayoutEffect를 사용하여 DOM이 업데이트된 직후에 실행 (버튼 렌더링 보장)
  useLayoutEffect(() => {
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
    // 버튼 이벤트 핸들러는 useMultiModalButtonHandler 훅으로 처리됨
    
    // 뷰포트에 맞춰 줌 배율 조절
    function setZoom() {
      const { BASE_WIDTH: bodyWidth, BASE_HEIGHT: bodyHeight } = SCREEN_CONFIG;
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
      resizeTimer = setTimeout(setZoom, SCREEN_CONFIG.ZOOM_RESIZE_DELAY);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
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
        <ErrorBoundary>
      <AppContent />
        </ErrorBoundary>
    </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
