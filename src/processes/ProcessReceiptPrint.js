import React, { memo, useContext, useRef } from "react";
import { Button } from "../components";

import { useFocusableSectionsManager, useTimeoutCountdown } from "../hooks";
import { ScreenRouteContext } from "../contexts";

const ProcessReceiptPrint = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    const { remainingSeconds: countdown } = useTimeoutCountdown({
        durationMs: 60000,
        enabled: true,
        onTimeout: () => navigateTo('ProcessFinish'),
        resetOnUserActivity: true
    });

    return (
        <>{/* Screen component handles the frame */}
            <div className="title">
                <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">영수증</span>을</div>
                <div>받으시고 <span className="primary">마무리</span>&nbsp;버튼을 누르세요</div>
            </div>
            <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
            <div className="task-manager" ref={actionBarRef} data-tts-text="마무리 버튼 한 개,">
                <Button navigate="ProcessFinish" label={`마무리${countdown}`} ttsText="마무리하기" />
            </div>
        </>
    );
});
ProcessReceiptPrint.displayName = 'ProcessReceiptPrint';

export default ProcessReceiptPrint;
