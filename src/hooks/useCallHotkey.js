import { useEffect, useContext } from "react";
import { ModalContext, ScreenRouteContext } from "@/contexts";
import { PROCESS_NAME, PROCESS_PREV_BY_CURRENT } from "@/constants";

const BACKSPACE_SHOWS_RESTART = [PROCESS_NAME.CARD_REMOVAL, PROCESS_NAME.ORDER_COMPLETE, PROCESS_NAME.RECEIPT_PRINT, PROCESS_NAME.FINISH];

/** H: 호출 모달, Home: 처음으로 모달, Backspace: 프로세스 역행 */
export const useCallHotkey = (enabled = true) => {
    const modal = useContext(ModalContext);
    const { currentProcess, navigateTo } = useContext(ScreenRouteContext);

    useEffect(() => {
        if (!enabled || !modal) return;

        const handleKeyDown = (e) => {
            if (e.key === "h" || e.key === "H") {
                e.preventDefault();
                modal.ModalCall.open();
            } else if (e.key === "Home") {
                e.preventDefault();
                modal.ModalRestart.open();
            } else if (e.key === "Backspace") {
                e.preventDefault();
                if (modal.isAnyOpen && modal.openOrder?.length) {
                    modal.closeModal(modal.openOrder[modal.openOrder.length - 1]);
                } else if (BACKSPACE_SHOWS_RESTART.includes(currentProcess)) {
                    modal.ModalRestart.open();
                } else {
                    const prev = PROCESS_PREV_BY_CURRENT[currentProcess];
                    if (prev) navigateTo(prev);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown, true);
        return () => document.removeEventListener("keydown", handleKeyDown, true);
    }, [enabled, modal, currentProcess, navigateTo]);
};
