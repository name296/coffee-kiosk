import React, { memo, useContext } from "react";
import { Main, Step, Bottom } from "../components";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext, ScreenRouteContext } from "../contexts";
import { useTimeoutCountdown } from "../hooks";
import { processTts } from "./processTts";

const ProcessFinish = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);
    const { isLow } = useContext(AccessibilityContext);

    const { remainingSeconds: countdown } = useTimeoutCountdown({
        durationMs: 4000,
        enabled: true,
        onTimeout: () => navigateTo(PROCESS_NAME.START),
        resetOnUserActivity: false
    });

    return (
        <div className="process fifth" tabIndex={-1}>
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.FINISH]}>
                {isLow ? (
                    <>
                        <div className="content-container">
                            <div className="end-countdown">
                                <span>{countdown <= 1 ? "✓" : countdown - 1}</span>
                            </div>
                        </div>
                        <div className="content-control">
                            <div className="title">
                                <span>이용해 주셔서 감사합니다</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="title">
                            <span>이용해 주셔서 감사합니다</span>
                        </div>
                        <div className="content-container">
                            <div className="end-countdown">
                                <span>{countdown <= 1 ? "✓" : countdown - 1}</span>
                            </div>
                        </div>
                    </>
                )}
            </Main>
            <Bottom />
        </div>
    );
});

ProcessFinish.displayName = "ProcessFinish";
export default ProcessFinish;
