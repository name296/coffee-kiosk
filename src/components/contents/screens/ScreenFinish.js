import React, { memo, useContext } from "react";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";
import { useAppTimeouts } from "../../../hooks/useAppTimeouts";

const NO_RESET_EVENTS = [];

const ScreenFinish = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);

    const { countdown } = useAppTimeouts({
        setCurrentPage: (p) => navigateTo(p),
        idle: { enabled: false },
        autoFinish: {
            enabled: true,
            initialSeconds: 3,
            resetEvents: NO_RESET_EVENTS,
            onTimeout: () => navigateTo('ScreenStart')
        }
    });

    return (
        <>
            <div className="title">이용해 주셔서 감사합니다</div>
            <div className="end-countdown">
                <span>
                    {countdown <= 0 ? '✓' : countdown}
                </span>
            </div>
        </>
    );
});

ScreenFinish.displayName = 'ScreenFinish';
export default ScreenFinish;
