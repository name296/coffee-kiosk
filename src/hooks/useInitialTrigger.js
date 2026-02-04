import { useContext, useCallback } from "react";
import { OrderContext, AccessibilityContext, ModalContext, TimeoutContext } from "../contexts";
import { formatRemainingTime, IDLE_TIMEOUT_MS } from "../utils/format";

const DEFAULT_GLOBAL_TIMEOUT_LABEL = formatRemainingTime(IDLE_TIMEOUT_MS);

const closeAllModals = (modal) => {
    modal?.ModalRestart?.close();
    modal?.ModalAccessibility?.close();
    modal?.ModalReset?.close();
    modal?.ModalDelete?.close();
    modal?.ModalDeleteCheck?.close();
    modal?.ModalCall?.close();
    modal?.ModalTimeout?.close();
    modal?.ModalPaymentError?.close();
};

const resetOrder = (order) => {
    order?.setQuantities?.({});
};

const resetAccessibility = (accessibility) => {
    accessibility?.setIsDark?.(false);
    accessibility?.setVolume?.(1);
    accessibility?.setIsLarge?.(false);
    accessibility?.setIsLow?.(false);
};

const resetTimeoutDisplay = (timeout) => {
    timeout?.setGlobalRemainingTime?.(IDLE_TIMEOUT_MS);
    timeout?.setGlobalRemainingTimeFormatted?.(DEFAULT_GLOBAL_TIMEOUT_LABEL);
    timeout?.resetIdleTimeout?.();
};

export const useInitialTrigger = (setCurrentProcess) => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);
    const timeout = useContext(TimeoutContext);

    const resetApp = useCallback(() => {
        closeAllModals(modal);
        resetOrder(order);
        resetAccessibility(accessibility);
        resetTimeoutDisplay(timeout);
        setCurrentProcess?.('ProcessStart');
    }, [accessibility, modal, order, timeout, setCurrentProcess]);

    return { resetApp };
};
