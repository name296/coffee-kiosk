// ============================================================================
// 메인 애플리케이션 컴포넌트
// ============================================================================

import React, { useContext, useLayoutEffect, useMemo, useCallback } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { useAppIdleTimeout } from "./hooks";
import { AppContext } from "./contexts";
import { InitializationProvider } from "./contexts/InitializationContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { OrderProvider } from "./contexts/OrderContext";
import { UIProvider } from "./contexts/UIContext";
import { ModalProvider } from "./contexts/ModalContext";
import { ButtonStyleProvider } from "./contexts/ButtonStyleContext";
import { IdleTimeoutProvider } from "./contexts/IdleTimeoutContext";
import { AppContextProvider } from "./contexts/AppContext";
import { Process1, Process2, Process3, Process4 } from "./components/Pages";
import { Step, Summary, Bottom } from "./components/Pages";
import { ReturnModal, ResetModal, CallModal, DeleteModal, DeleteCheckModal } from "./components/CommonModals";
import AccessibilityModal from "./components/AccessibilityModal";
import { LAYOUT_COMPONENTS, LAYOUT_ASSEMBLY_CONTEXT } from "./config";
import ErrorBoundary from "./utils/ErrorBoundary";

// 전역 모달 컴포넌트
const GlobalModals = () => {
  const {
    ModalReturn,
    ModalAccessibility,
    ModalReset,
    ModalCall,
    ModalDelete,
    ModalDeleteCheck,
    ModalDeleteItemId,
    quantities,
    handleDecrease,
    totalMenuItems,
    filterMenuItems
  } = useContext(AppContext);

  // DeleteModal과 DeleteCheckModal에 필요한 currentItems 계산
  const priceItems = filterMenuItems(totalMenuItems, quantities);
  const currentItems = priceItems; // 전체 아이템 사용 (페이지네이션 제외)

  return (
    <>
      {ModalReturn.isOpen && <ReturnModal />}
      {ModalReset.isOpen && <ResetModal />}
      {ModalAccessibility.isOpen && <AccessibilityModal />}
      {ModalCall.isOpen && <CallModal />}
      {ModalDelete.isOpen && (
        <DeleteModal
          handleDecrease={handleDecrease}
          id={ModalDeleteItemId}
          quantities={quantities}
          currentItems={currentItems}
        />
      )}
      {ModalDeleteCheck.isOpen && (
        <DeleteCheckModal
          handleDecrease={handleDecrease}
          id={ModalDeleteItemId}
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
    <>
      <div className="black"></div>
      <div className="top"></div>
      
      {/* 조립 순서에 따라 컴포넌트 렌더링 */}
      {shouldRender[LAYOUT_COMPONENTS.STEP] && <Step />}
      {shouldRender[LAYOUT_COMPONENTS.CONTENT] && children}
      {shouldRender[LAYOUT_COMPONENTS.SUMMARY] && <Summary />}
      {shouldRender[LAYOUT_COMPONENTS.BOTTOM] && <Bottom />}
      {shouldRender[LAYOUT_COMPONENTS.MODALS] && <GlobalModals />}
    </>
  );
};

// 페이지 렌더링 컴포넌트
const AppContent = () => {
  const { 
    currentPage,
    setCurrentPage,
    totalMenuItems,
    setQuantities,
    setisDark,
    setVolume,
    setisLarge,
    setisLow
  } = useContext(AppContext);

  // 주문 초기화 함수
  const resetOrder = useCallback(() => {
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
  }, [totalMenuItems, setQuantities, setisDark, setVolume, setisLarge, setisLow]);

  // 전역 비활성 타임아웃 (5분)
  const idleTimeout = useAppIdleTimeout(currentPage, setCurrentPage, resetOrder);

  // 앱 초기화 (앱 시작 시 한 번만 실행)
  useLayoutEffect(() => {
    resetOrder();
  }, [totalMenuItems]); // totalMenuItems가 준비되면 실행

  return (
    <IdleTimeoutProvider value={idleTimeout}>
      <Layout>
        {currentPage === 'first' && <Process1 />}
        {currentPage === 'second' && <Process2 />}
        {currentPage === 'third' && <Process3 />}
        {currentPage === 'forth' && <Process4 />}
      </Layout>
    </IdleTimeoutProvider>
  );
};

/**
 * 메인 App 컴포넌트
 * 
 * Provider 초기화 순서 (외부 → 내부):
 * 1. ErrorBoundary - 에러 처리
 * 2. InitializationProvider - 시스템 초기화 (버튼스타일, TTS, 뷰포트)
 * 3. AccessibilityProvider - 접근성 설정 (볼륨, 다크모드)
 * 4. OrderProvider - 주문 관리 (메뉴, 수량)
 * 5. UIProvider - UI 상태 (페이지)
 * 6. ModalProvider - 모달 상태
 * 7. ButtonStyleProvider - 버튼 스타일
 * 8. AppContextProvider - 통합 (모든 Context 합침)
 */
const App = () => {
  return (
    <ErrorBoundary>
      {/* 1️⃣ 시스템 초기화 */}
      <InitializationProvider>
        {/* 2️⃣ 접근성 설정 */}
        <AccessibilityProvider>
          {/* 3️⃣ 주문 관리 */}
          <OrderProvider>
            {/* 4️⃣ UI 상태 (페이지) */}
            <UIProvider>
              {/* 5️⃣ 모달 상태 */}
              <ModalProvider>
                {/* 6️⃣ 버튼 스타일 */}
                <ButtonStyleProvider>
                  {/* 7️⃣ Context 통합 */}
                  <AppContextProvider>
                    {/* 오디오 요소 */}
                    <audio
                      id="audioPlayer"
                      src=""
                      controls
                      className="hidden-audio"
                    />
                    {/* 앱 콘텐츠 */}
                    <ErrorBoundary>
                      <AppContent />
                    </ErrorBoundary>
                  </AppContextProvider>
                </ButtonStyleProvider>
              </ModalProvider>
            </UIProvider>
          </OrderProvider>
        </AccessibilityProvider>
      </InitializationProvider>
    </ErrorBoundary>
  );
};

export default App;

// ============================================================================
// 애플리케이션 마운트
// body를 직접 root로 사용
// ============================================================================
ReactDOM.createRoot(document.body).render(React.createElement(App));
