import React, { useContext, useLayoutEffect } from "react";
import { ModalContext, ScreenRouteContext } from "@/contexts";
import { focusWithRefire } from "@/hooks/useDOM";

export const FocusExecutor = () => {
    const modal = useContext(ModalContext);
    const { currentProcess, transitionCount } = useContext(ScreenRouteContext);

    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        if (modal?.isAnyOpen) {
            const mains = document.querySelectorAll('.modal .modal-panel');
            focusWithRefire(mains.length ? mains[mains.length - 1] : null);
            return;
        }
        focusWithRefire(document.querySelector('.process .main'));
    }, [modal?.isAnyOpen, modal?.openOrder, currentProcess, transitionCount]);

    return null;
};
