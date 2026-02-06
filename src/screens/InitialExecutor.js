import React, { useEffect, useContext, useRef } from "react";
import { useInitialTrigger } from "../hooks/useInitialTrigger";
import { useUserActivityBroadcast } from "../hooks/useUserActivity";
import { TimeoutContext, ScreenRouteContext } from "../contexts";

export const InitialExecutor = () => {
    useUserActivityBroadcast(true);
    const { currentProcess, navigateTo } = useContext(ScreenRouteContext);
    const timeout = useContext(TimeoutContext);

    const { resetApp } = useInitialTrigger((p) => navigateTo(p));
    const resetAppRef = useRef(resetApp);
    const prevProcessRef = useRef(currentProcess);

    useEffect(() => {
        resetAppRef.current = resetApp;
    }, [resetApp]);

    // TimeoutProvider에 onTimeout 콜백 등록
    useEffect(() => {
        timeout?.registerOnTimeout?.(() => resetAppRef.current());
        return () => timeout?.registerOnTimeout?.(null);
    }, [timeout]);

    // ProcessStart 전환 시 앱 리셋
    useEffect(() => {
        const didTransitionToStart = prevProcessRef.current !== "ProcessStart" && currentProcess === "ProcessStart";
        prevProcessRef.current = currentProcess;
        if (didTransitionToStart) {
            resetAppRef.current();
        }
    }, [currentProcess]);

    return null;
};
