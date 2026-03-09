import React, { memo, useContext } from "react";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext, ScreenRouteContext } from "../contexts";
import { useTimeoutCountdown } from "../hooks";

const ProcessFinish = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);
    const { isLow } = useContext(AccessibilityContext);

    const { remainingSeconds: countdown } = useTimeoutCountdown({
        durationMs: 4000,
        enabled: true,
        onTimeout: () => navigateTo(PROCESS_NAME.START),
        resetOnUserActivity: false
    });

    const countdownContent = (
        <span>
            {countdown <= 1 ? '✓' : countdown - 1}
        </span>
    );

    return isLow ? (
        <>
            <div className="content-container">
                <div className="end-countdown">
                    {countdownContent}
                </div>
            </div>
            <div className="content-control">
                <div className="title"><span>이용해 주셔서 감사합니다</span></div>
            </div>
        </>
    ) : (
        <>
            <div className="title"><span>이용해 주셔서 감사합니다</span></div>
            <div className="end-countdown">
                {countdownContent}
            </div>
        </>
    );
});

ProcessFinish.displayName = 'ProcessFinish';
export default ProcessFinish;
