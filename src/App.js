import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";

// Contexts
import { TTSDBProvider, TTSStateProvider } from "./shared/contexts/TTSContext";
import { AccessibilityProvider } from "./shared/contexts/AccessibilityContext";
import { ModalProvider } from "./shared/contexts/ModalContext";
import { TimeoutProvider } from "./shared/contexts/TimeoutContext";
import { OrderProvider } from "./shared/contexts/OrderContext";
import { RefProvider } from "./shared/contexts/RefContext";
import { ButtonStateProvider, ButtonGroupProvider } from "./shared/contexts/ButtonContext";
import { ScreenRouteProvider } from "./shared/contexts/ScreenRouteContext";

// Initializers
import {
  ButtonHandlerInitializer,
  ViewportInitializer,
  AppFocusTrapInitializer
} from "./shared/initializers/Initializers";

// Components
import Screen from "./shared/ui/Screen";
import { ModalContainer } from "./shared/ui/Modal";

// ============================================================================
// 메인 App 컴포넌트
// ============================================================================
const App = () => {
  // 전역 포커스 이동 추적 (디버깅용)
  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target;
      const targetInfo = target ? {
        tagName: target.tagName,
        className: target.className,
        id: target.id || null,
        isMain: target.classList.contains('main'),
        isModal: target.classList.contains('modal')
      } : null;

      console.log('[포커스] focusin 이벤트 발생', {
        target: targetInfo,
        timestamp: new Date().toISOString()
      });
    };

    const handleFocusOut = (e) => {
      const target = e.target;
      const relatedTarget = e.relatedTarget;
      const targetInfo = target ? {
        tagName: target.tagName,
        className: target.className,
        id: target.id || null
      } : null;
      const relatedInfo = relatedTarget ? {
        tagName: relatedTarget.tagName,
        className: relatedTarget.className,
        id: relatedTarget.id || null
      } : null;

      console.log('[포커스] focusout 이벤트 발생', {
        from: targetInfo,
        to: relatedInfo,
        timestamp: new Date().toISOString()
      });
    };

    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };
  }, []);

  return (
    <>
      <audio id="audioPlayer" src="" />

      <TTSDBProvider>
        <TTSStateProvider>
          <AccessibilityProvider>
            <ModalProvider>
              <TimeoutProvider>
                <OrderProvider>
                  <RefProvider>
                    <ButtonStateProvider>
                      <ButtonGroupProvider>
                        <ScreenRouteProvider>
                          <ButtonHandlerInitializer />
                          <ViewportInitializer />
                          <AppFocusTrapInitializer />
                          <Screen />
                          <ModalContainer />
                        </ScreenRouteProvider>
                      </ButtonGroupProvider>
                    </ButtonStateProvider>
                  </RefProvider>
                </OrderProvider>
              </TimeoutProvider>
            </ModalProvider>
          </AccessibilityProvider>
        </TTSStateProvider>
      </TTSDBProvider>
    </>
  );
};

// ============================================================================
// Root Rendering
// ============================================================================
const rootElement = document.getElementById('root') || document.body;
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

export default App;
