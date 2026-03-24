import React, { useContext, useLayoutEffect, useRef } from "react";
import { ModalContext, ScreenRouteContext } from "@/contexts";
import { focusWithRefire } from "@/hooks/useDOM";

export const FocusExecutor = () => {
    const modal = useContext(ModalContext);
    const { currentProcess, transitionCount } = useContext(ScreenRouteContext);
    /** layout effect가 연속 실행될 때 둘째 번에 .main이 앞서가는 것 방지 */
    const openerRestoreScheduledRef = useRef(false);

    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        if (modal?.isAnyOpen) {
            openerRestoreScheduledRef.current = false;
            const mains = document.querySelectorAll('.modal .modal-panel');
            focusWithRefire(mains.length ? mains[mains.length - 1] : null);
            return;
        }
        const pendingRef = modal?.pendingReturnFocusRef;
        const pending = pendingRef?.current;
        if (pending && typeof pending.focus === 'function' && pending.isConnected) {
            pendingRef.current = null;
            openerRestoreScheduledRef.current = true;
            const el = pending;
            queueMicrotask(() => {
                openerRestoreScheduledRef.current = false;
                if (el.isConnected) focusWithRefire(el);
            });
            return;
        }
        if (openerRestoreScheduledRef.current) return;
        focusWithRefire(document.querySelector('.process .main'));
    }, [modal?.isAnyOpen, modal?.openOrder, modal?.pendingReturnFocusRef, currentProcess, transitionCount]);

    return null;
};
