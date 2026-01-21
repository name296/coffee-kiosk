import React, { memo, useContext, useEffect, useRef } from "react";
import Button from "../../ui/Button";

import { RefContext } from "../../../contexts/RefContext";
import { AccessibilityContext } from "../../../contexts/AccessibilityContext";
import { OrderContext } from "../../../contexts/OrderContext";
import { useFocusableSectionsManager } from "../../../hooks/useFocusManagement";
import { useAppTimeouts } from "../../../hooks/useAppTimeouts";
import { ScreenRouteContext } from "../../../contexts/ScreenRouteContext";
import { TTS } from "../../../constants/constants";

const ScreenReceiptPrint = memo(() => {
    const TTS_SCREEN_RECEIPT_PRINT = `안내, 영수증출력, 왼쪽 아래의 프린터에서 영수증을 받으시고 마무리 버튼을 누르세요,${TTS.replay}`;

    const { navigateTo } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    const { autoFinishCountdown } = useAppTimeouts({
        setCurrentPage: (p) => navigateTo(p),
        idle: { enabled: false },
        autoFinish: {
            enabled: true,
            onTimeout: () => navigateTo('ScreenFinish')
        }
    });

    const { countdown } = autoFinishCountdown;

    return (
        <>{/* Screen component handles the frame */}
            <div className="title">
                <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">영수증</span>을</div>
                <div>받으시고 <span className="primary">마무리</span>&nbsp;버튼을 누르세요</div>
            </div>
            <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
            <Button className="w500h120" navigate="ScreenFinish" label={`마무리${countdown}`} ttsText="마무리하기" />
        </>
    );
});
ScreenReceiptPrint.displayName = 'ScreenReceiptPrint';

export default ScreenReceiptPrint;
