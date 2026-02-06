import React, { useContext, useLayoutEffect } from "react";
import { ModalContext, ScreenRouteContext } from "../contexts";
import { focusWithRefire } from "../hooks/useDOM";

export const FocusExecutor = () => {
    const modal = useContext(ModalContext);
    const { currentProcess, transitionCount } = useContext(ScreenRouteContext);

    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        if (modal?.isAnyOpen) {
            focusWithRefire(document.querySelector('.modal .main'));
            return;
        }
        focusWithRefire(document.querySelector('.process .main'));
    }, [modal?.isAnyOpen, currentProcess, transitionCount]);

    return null;
};
