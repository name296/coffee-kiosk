import React, { useEffect, useContext, useRef } from "react";
import { PROCESS_NAME } from "@/constants";
import { useInitialTrigger } from "@/hooks/useInitialTrigger";
import { useUserActivityBroadcast } from "@/hooks/useUserActivity";
import { TimeoutContext, ScreenRouteContext, ModalContext } from "@/contexts";

export const InitialExecutor = () => {
    useUserActivityBroadcast(true);
    const { currentProcess, navigateTo } = useContext(ScreenRouteContext);
    const timeout = useContext(TimeoutContext);
    const modal = useContext(ModalContext);

    const { resetApp } = useInitialTrigger((p) => navigateTo(p));
    const resetAppRef = useRef(resetApp);
    const prevProcessRef = useRef(currentProcess);
    const currentProcessRef = useRef(currentProcess);

    useEffect(() => {
        resetAppRef.current = resetApp;
    }, [resetApp]);

    useEffect(() => {
        currentProcessRef.current = currentProcess;
    }, [currentProcess]);

    // TimeoutProvider에 onTimeout 콜백 등록
    useEffect(() => {
        timeout?.registerOnTimeout?.(() => resetAppRef.current());
        return () => timeout?.registerOnTimeout?.(null);
    }, [timeout]);

    // Timeout warning UI 처리: ProcessStart 제외, 타임아웃 모달 오픈
    useEffect(() => {
        timeout?.registerOnWarning?.(() => {
            if (currentProcessRef.current === PROCESS_NAME.START) return;
            if (modal?.openModal) {
                modal.openModal("timeout");
                return;
            }
            modal?.ModalTimeout?.open();
        });
        return () => timeout?.registerOnWarning?.(null);
    }, [timeout, modal]);

    // ProcessStart 전환 시 앱 리셋
    useEffect(() => {
        const didTransitionToStart = prevProcessRef.current !== PROCESS_NAME.START && currentProcess === PROCESS_NAME.START;
        prevProcessRef.current = currentProcess;
        if (didTransitionToStart) {
            resetAppRef.current();
        }
    }, [currentProcess]);

    return null;
};
