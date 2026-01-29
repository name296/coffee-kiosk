import React, { memo, useContext } from "react";
import { ScreenRouteContext } from "../contexts";
import { useAppTimeouts } from "../hooks";

const NO_RESET_EVENTS = [];

const ProcessFinish = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);

    const { countdown } = useAppTimeouts({
        setCurrentPage: (p) => navigateTo(p),
        idle: { enabled: false },
        autoFinish: {
            enabled: true,
            initialSeconds: 4,
            resetEvents: NO_RESET_EVENTS,
            onTimeout: () => navigateTo('ProcessStart')
        }
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
