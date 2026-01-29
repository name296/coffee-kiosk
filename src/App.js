import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";

// Contexts
import {
  TTSDBProvider,
  TTSStateProvider,
  AccessibilityProvider,
  ModalProvider,
  TimeoutProvider,
  OrderProvider,
  RefProvider,
  ButtonStateProvider,
  ButtonGroupProvider,
  ScreenRouteProvider
} from "./contexts";

// Initializers
import {
  ButtonHandlerInitializer,
  ViewportInitializer,
  AppFocusTrapInitializer,
  GlobalTimeoutInitializer
} from "./initializers";

// Components
import Screen from "./Screen";

// ============================================================================
// ?? App ????
// ============================================================================
const App = () => {
  // ?? ??? ?? ?? (????)
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

      console.log('[???] focusin ??? ??', {
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

      console.log('[???] focusout ??? ??', {
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
                          <GlobalTimeoutInitializer />
                          <Screen />
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
ReactDOM.createRoot(document.body).render(<App />);

export default App;
