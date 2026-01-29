import React from "react";
import {
    useToggleButtonClickHandler,
    useDisabledButtonBlocker,
    usePressStateHandler,
    useUserActivityBroadcast
} from "../hooks";

/** 버튼 핸들러 초기화 (전역) */
export const ButtonHandlerInitializer = () => {
    useToggleButtonClickHandler(true);
    useDisabledButtonBlocker(true);
    usePressStateHandler(true);
    useUserActivityBroadcast(true);
    return null;
};
