import { useCallback } from "react";
import { useAppInitializer } from "./useAppInitializer";
import { useIdleTimeout } from "./useIdleTimeout";
import { useAutoFinishCountdown } from "./useAutoFinishCountdown";

const DEFAULT_IDLE_TIMEOUT_MS = 120000;
const DEFAULT_AUTO_FINISH_SECONDS = 60;

// 앱 전역 타임아웃/카운트다운을 한 곳에서 묶어 제공
export const useAppTimeouts = ({
    setCurrentPage,
    idle = {},
    autoFinish = {}
} = {}) => {
    const { resetApp } = useAppInitializer(setCurrentPage);

    const {
        timeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
        enabled: idleEnabled = true,
        checkTimeoutModal = null,
        onTimeout: onIdleTimeout
    } = idle;

    const idleTimeoutHandler = useCallback(() => {
        if (typeof onIdleTimeout === 'function') {
            onIdleTimeout({ resetApp });
            return;
        }
        resetApp();
    }, [onIdleTimeout, resetApp]);

    const idleTimeout = useIdleTimeout(
        idleTimeoutHandler,
        timeoutMs,
        idleEnabled,
        checkTimeoutModal
    );

    const {
        enabled: autoFinishEnabled = false,
        onTimeout: onAutoFinishTimeout,
        initialSeconds = DEFAULT_AUTO_FINISH_SECONDS,
        resetEvents
    } = autoFinish;

    const autoFinishCountdown = useAutoFinishCountdown({
        onTimeout: onAutoFinishTimeout,
        enabled: autoFinishEnabled,
        initialSeconds,
        resetEvents
    });

    return { resetApp, idleTimeout, autoFinishCountdown };
};
