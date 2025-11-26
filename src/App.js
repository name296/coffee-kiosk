// ============================================================================
// 메인 애플리케이션 컴포넌트
// ============================================================================

import React, { useEffect, useContext, useLayoutEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { useTextHandler } from "./utils/tts";
import { ButtonStyleGenerator } from "./utils/buttonStyleGenerator";
import { SizeControlManager } from "./utils/sizeControlManager";
import { useMultiModalButtonHandler } from "./hooks/useMultiModalButtonHandler";
import { useCSSInjector } from "./hooks/useCSSInjector";
import { useReactMount } from "./hooks/useReactMount";
import { AppProvider, AppContext } from "./contexts";
import { getAssetPath } from "./utils/pathUtils";
import { setViewportZoom, setupViewportResize } from "./utils/viewportManager";
import { setupGlobalUtils } from "./utils/globalUtils";
import { FirstPage, SecondPage, ThirdPage, ForthPage } from "./components/Pages";
import { Step, Summary, Bottom } from "./components/Frame";
import { ReturnModal, AccessibilityModal, ResetModal, CallModal, DeleteModal, DeleteCheckModal } from "./components/Modals";
import { LAYOUT_COMPONENTS, LAYOUT_ASSEMBLY_CONTEXT } from "./config";
import ErrorBoundary from "./utils/ErrorBoundary";

// 전역 모달 컴포넌트
const GlobalModals = () => {
  const {
    isReturnModal,
    isAccessibilityModal,
    isResetModal,
    isCallModal,
    isDeleteModal,
    isDeleteCheckModal,
    quantities,
    handleDecrease,
    deleteItemId,
    totalMenuItems,
    filterMenuItems
  } = useContext(AppContext);

  // DeleteModal과 DeleteCheckModal에 필요한 currentItems 계산
  const priceItems = filterMenuItems(totalMenuItems, quantities);
  const currentItems = priceItems; // 전체 아이템 사용 (페이지네이션 제외)

  return (
    <>
      {isReturnModal && <ReturnModal />}
      {isResetModal && <ResetModal />}
      {isAccessibilityModal && <AccessibilityModal />}
      {isCallModal && <CallModal />}
      {isDeleteModal && (
        <DeleteModal
          handleDecrease={handleDecrease}
          id={deleteItemId}
          quantities={quantities}
          currentItems={currentItems}
        />
      )}
      {isDeleteCheckModal && (
        <DeleteCheckModal
          handleDecrease={handleDecrease}
          id={deleteItemId}
          quantities={quantities}
          currentItems={currentItems}
        />
      )}
    </>
  );
};

/**
 * 메인 레이아웃 컴포넌트
 * BOM과 조립 컨텍스트를 기반으로 컴포넌트를 조립
 * 
 * 조립 순서 (ASSEMBLY_ORDER):
 * 1. Step - 진행 단계 표시
 * 2. Content - 페이지 내용 (children)
 * 3. Summary - 주문 요약 (조건부)
 * 4. Bottom - 하단 네비게이션
 * 5. Modals - 전역 모달들
 */
const Layout = ({ children }) => {
  const context = useContext(AppContext);
  
  // 조립 컨텍스트 기반으로 렌더링 여부 결정
  const shouldRender = useMemo(() => {
    return {
      [LAYOUT_COMPONENTS.STEP]: LAYOUT_ASSEMBLY_CONTEXT.conditions[LAYOUT_COMPONENTS.STEP](context),
      [LAYOUT_COMPONENTS.CONTENT]: LAYOUT_ASSEMBLY_CONTEXT.conditions[LAYOUT_COMPONENTS.CONTENT](context),
      [LAYOUT_COMPONENTS.SUMMARY]: LAYOUT_ASSEMBLY_CONTEXT.conditions[LAYOUT_COMPONENTS.SUMMARY](context),
      [LAYOUT_COMPONENTS.BOTTOM]: LAYOUT_ASSEMBLY_CONTEXT.conditions[LAYOUT_COMPONENTS.BOTTOM](context),
      [LAYOUT_COMPONENTS.MODALS]: LAYOUT_ASSEMBLY_CONTEXT.conditions[LAYOUT_COMPONENTS.MODALS](context),
    };
  }, [context.currentPage]); // currentPage 변경 시 재계산
  
  return (
    <div className="frame">
      <div className="black"></div>
      <div className="top"></div>
      
      {/* 조립 순서에 따라 컴포넌트 렌더링 */}
      {shouldRender[LAYOUT_COMPONENTS.STEP] && <Step />}
      {shouldRender[LAYOUT_COMPONENTS.CONTENT] && children}
      {shouldRender[LAYOUT_COMPONENTS.SUMMARY] && <Summary />}
      {shouldRender[LAYOUT_COMPONENTS.BOTTOM] && <Bottom />}
      {shouldRender[LAYOUT_COMPONENTS.MODALS] && <GlobalModals />}
    </div>
  );
};

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
  // CSS 인젝터 훅 사용
  const { inject: injectCSS, remove: removeCSS } = useCSSInjector();
  const { mountComponent } = useReactMount();

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
    // 버튼 스타일 자동 생성 시스템 초기화 (훅 전달)
    ButtonStyleGenerator.init({ injectCSS, mountComponent });
    
    // 크기 조절 시스템 초기화
    SizeControlManager.init();
    
    // 전역 유틸리티 설정 (Footer에서 사용)
    setupGlobalUtils();

    // ============================================================================
    // 27 스타일 버튼 이벤트 처리 시스템
    // ============================================================================
    // 버튼 이벤트 핸들러는 useMultiModalButtonHandler 훅으로 처리됨
    
    // 뷰포트에 맞춰 줌 배율 조절
    setViewportZoom();
    setupViewportResize();
  }, [injectCSS, mountComponent]);

  return (
    <ErrorBoundary>
    <AppProvider>
      <audio
        id="audioPlayer"
        src=""
        controls
        className="hidden-audio"
        />
      <audio
        id="beapSound"
        src={getAssetPath("./public/sound/beap_sound2.mp3")}
        controls
        className="hidden-audio"
        />
        <ErrorBoundary>
      <AppContent />
        </ErrorBoundary>
    </AppProvider>
    </ErrorBoundary>
  );
};

export default App;

// ============================================================================
// 애플리케이션 마운트
// body를 직접 root로 사용
// ============================================================================
ReactDOM.createRoot(document.body).render(React.createElement(App));
