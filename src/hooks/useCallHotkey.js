import { useEffect, useContext } from "react";
import { AccessibilityContext, HistoryContext, ModalContext, ScreenRouteContext } from "@/contexts";
import { PROCESS_NAME, PROCESS_PREV_BY_CURRENT } from "@/constants";
import { useTextHandler } from "@/hooks";

const BACKSPACE_SHOWS_RESTART = [PROCESS_NAME.CARD_REMOVAL, PROCESS_NAME.ORDER_COMPLETE, PROCESS_NAME.RECEIPT_PRINT, PROCESS_NAME.FINISH];
const isUndoKey = (e) => (e.key === "0" || e.code === "Numpad0") && !e.ctrlKey && !e.altKey && !e.metaKey;
const isHelpStarKey = (e) =>
    (e.key === "*" || e.code === "NumpadMultiply" || (e.key === "8" && e.shiftKey)) &&
    !e.ctrlKey && !e.altKey && !e.metaKey;

const KEYPAD_HELP_TTS = [
    "키패드 사용법,",
    "상 하 버튼으로 탐색 영역을 이동할 수 있습니다,",
    "좌 우 버튼으로 초점을 이동할 수 있습니다,",
    "동그라미 버튼으로 초점을 실행할 수 있습니다,",
    "홈 버튼으로 모든 선택을 취소하고 시작단계로 돌아올 수 있습니다,",
    "뒤로 버튼으로 작업 단계를 뒤로 이동할 수 있습니다,",
    "별 버튼으로 키패드 사용법을 재생할 수 있습니다,",
    "샵 버튼으로 직전 안내를 다시 들을 수 있습니다,",
    "영 버튼으로 직전 실행을 취소 할 수 있습니다,"
].join(" ");

/** H: 호출 모달, Home: 처음으로 모달, Backspace: 프로세스 역행 */
export const useCallHotkey = (enabled = true) => {
    const modal = useContext(ModalContext);
    const history = useContext(HistoryContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility?.volume);
    const { currentProcess, navigateTo } = useContext(ScreenRouteContext);

    useEffect(() => {
        if (!enabled || !modal) return;

        const applyPressFeedback = (el) => {
            if (!el?.classList?.contains("button")) return;
            el.classList.add("state-pressing");
            setTimeout(() => el.classList.remove("state-pressing"), 120);
        };

        const handleKeyDown = (e) => {
            if (isHelpStarKey(e)) {
                if (e.repeat) return;
                e.preventDefault();
                handleText(KEYPAD_HELP_TTS);
                return;
            }

            if (isUndoKey(e)) {
                // Enter-like 실행 키와 동일하게 "누르면 1회 실행"만 허용 (키 반복 방지)
                if (e.repeat) return;
                e.preventDefault();
                const ae = document.activeElement;
                applyPressFeedback(ae);

                if (modal.isAnyOpen && modal.openOrder?.length) {
                    modal.closeModal(modal.openOrder[modal.openOrder.length - 1], { returnToOpener: true });
                    handleText("닫기,", false);
                    return;
                }

                const undoLabel = history?.undoHistory?.();
                if (undoLabel) {
                    handleText(typeof undoLabel === "string" ? undoLabel : "실행 취소,", false);
                    return;
                }

                handleText("취소할 작업이 없습니다,", false);
                return;
            }

            if (e.key === "h" || e.key === "H") {
                e.preventDefault();
                const ae = document.activeElement;
                modal.ModalCall.open(ae && ae !== document.body ? ae : null);
            } else if (e.key === "Home") {
                e.preventDefault();
                const ae = document.activeElement;
                modal.ModalRestart.open(ae && ae !== document.body ? ae : null);
            } else if (e.key === "Backspace") {
                e.preventDefault();
                if (modal.isAnyOpen && modal.openOrder?.length) {
                    modal.closeModal(modal.openOrder[modal.openOrder.length - 1], { returnToOpener: true });
                } else if (BACKSPACE_SHOWS_RESTART.includes(currentProcess)) {
                    handleText("뒤로 갈 작업이 없습니다,", false);
                } else {
                    const prev = PROCESS_PREV_BY_CURRENT[currentProcess];
                    if (prev) navigateTo(prev);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown, true);
        return () => document.removeEventListener("keydown", handleKeyDown, true);
    }, [enabled, modal, history, handleText, currentProcess, navigateTo]);
};
