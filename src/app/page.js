'use client';

import React, { useEffect } from "react";

// Contexts
import {
  TTSDBProvider,
  TTSStateProvider,
  AccessibilityProvider,
  ModalProvider,
  TimeoutProvider,
  OrderProvider,
  RefProvider,
  ScreenRouteProvider
} from "@/contexts";

// Screens
import {
  ViewportInitializer,
  InitialExecutor,
  FocusExecutor,
  ButtonCountInjector
} from "@/components/screens";

// Hooks (TickProvider: 모든 카운트가 동시에 갱신되도록)
import { TickProvider } from "@/hooks/useInitialCountdown";

// Components
import Screen from "@/components/screens/Screen";

// ============================================================================
// 앱 루트 (Next.js App Router)
// ============================================================================
export default function HomePage() {
  // 포커스 디버그 로그 (개발용)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return undefined;
    }

    const handleFocusIn = (e) => {
      const target = e.target;
      const targetInfo = target ? {
        tagName: target.tagName,
        className: target.className,
        id: target.id || null,
        isMain: target.classList.contains('main'),
        isModal: target.classList.contains('modal')
      } : null;

      console.log('[포커스] focusin 이벤트', {
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

      console.log('[포커스] focusout 이벤트', {
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
      <audio id="audioPlayer" src={null} />
      <TTSDBProvider>
        <TTSStateProvider>
          <AccessibilityProvider>
            <ModalProvider>
              <OrderProvider>
                <RefProvider>
                  <ScreenRouteProvider>
                    <TickProvider>
                      <TimeoutProvider>
                        <ViewportInitializer />
                        <InitialExecutor />
                        <FocusExecutor />
                        <ButtonCountInjector />
                        <Screen />
                      </TimeoutProvider>
                    </TickProvider>
                  </ScreenRouteProvider>
                </RefProvider>
              </OrderProvider>
            </ModalProvider>
          </AccessibilityProvider>
        </TTSStateProvider>
      </TTSDBProvider>
    </>
  );
}
