import React, { memo, useContext } from "react";
import { ScreenRouteContext } from "../contexts";
import { useTimeoutCountdown } from "../hooks";

const ProcessFinish = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);

    const { remainingSeconds: countdown } = useTimeoutCountdown({
        durationMs: 4000,
        enabled: true,
        onTimeout: () => navigateTo('ProcessStart'),
        resetOnUserActivity: false
    });

    return (
        <>
            <div className="title">이용해 주셔서 감사합니다</div>
            <div className="end-countdown">
                <span>
                    {countdown <= 1 ? '✓' : countdown - 1}
                </span>
            </div>
        </>
    );
});

ProcessFinish.displayName = 'ProcessFinish';
export default ProcessFinish;
