import { useContext, useCallback } from "react";
import { PROCESS_NAME } from "@/constants";
import { MODAL_REGISTRY, OrderContext, AccessibilityContext, ModalContext, TimeoutContext } from "@/contexts";

const closeAllModals = (modal) => {
    if (modal?.closeAllModals) {
        modal.closeAllModals();
        return;
    }
    MODAL_REGISTRY.forEach(({ key, contextName }) => {
        if (modal?.closeModal) {
            modal.closeModal(key);
            return;
        }
        modal?.[contextName]?.close?.();
    });
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
        setCurrentProcess?.(PROCESS_NAME.START);
    }, [accessibility, modal, order, timeout, setCurrentProcess]);

    return { resetApp };
};
