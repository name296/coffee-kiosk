import React, { memo, useContext, useRef } from "react";
import { Button } from "@shared/ui";

import { useFocusableSectionsManager, useAppTimeouts } from "@shared/hooks";
import { ScreenRouteContext } from "@shared/contexts";

const ScreenReceiptPrint = memo(() => {
    const { navigateTo } = useContext(ScreenRouteContext);

    const actionBarRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['actionBar', 'systemControls'], {
        actionBar: actionBarRef,
        systemControls: systemControlsRef
    });

    const { countdown } = useAppTimeouts({
        setCurrentPage: (p) => navigateTo(p),
        idle: { enabled: false },
        autoFinish: {
            enabled: true,
            onTimeout: () => navigateTo('ScreenFinish')
        }
    });

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
