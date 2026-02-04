import React, { useEffect, useRef, useContext } from "react";
import { ScreenRouteContext } from "../contexts";
import { useAppInitializer } from "../hooks";

/**
 * currentProcess가 ProcessStart로 전환될 때 resetApp 실행.
 * 의존성(currentProcess)에 따라 리셋을 프로세싱.
 */
export const ResetOnProcessStartInitializer = () => {
    const { currentProcess, navigateTo, currentProcessRef } = useContext(ScreenRouteContext);
    const { resetApp } = useAppInitializer((p) => navigateTo(p));
    const resetAppRef = useRef(resetApp);
    const prevProcessRef = useRef(currentProcess);

    useEffect(() => {
        resetAppRef.current = resetApp;
    }, [resetApp]);

    useEffect(() => {
        if (currentProcessRef) currentProcessRef.current = currentProcess;
    }, [currentProcess]);

    useEffect(() => {
        const didTransitionToStart = prevProcessRef.current !== "ProcessStart" && currentProcess === "ProcessStart";
        prevProcessRef.current = currentProcess;
        if (didTransitionToStart) {
            resetAppRef.current();
        }
    }, [currentProcess]);

    return null;
};
