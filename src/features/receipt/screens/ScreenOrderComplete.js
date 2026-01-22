import React, { memo, useContext, useRef } from "react";
import Button from "../../../shared/ui/Button";

import { OrderContext } from "../../../shared/contexts/OrderContext";
import { useFocusableSectionsManager } from "../../../shared/hooks/useFocusManagement";
import { useAppTimeouts } from "../../../shared/hooks/useAppTimeouts";
import { ScreenRouteContext } from "../../../shared/contexts/ScreenRouteContext";

const ScreenOrderComplete = memo(() => {
    const order = useContext(OrderContext);
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
        <>
            <div className="title">
                <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">주문표</span>를</div>
                <div>받으시고 <span className="primary">영수증 출력</span>을 선택합니다</div>
            </div>
            <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
            <div className="order-num">
                <p>주문번호</p>
                <h1>{order.orderNumber || 100}</h1>
            </div>
            <div className="task-manager" ref={actionBarRef}>
                <Button className="w371h120" onClick={() => { if (order.sendPrintReceiptToApp) order.sendPrintReceiptToApp();}} navigate="ScreenReceiptPrint" label="영수증 출력" />
                <Button ttsText="출력 안함," className="w371h120" navigate="ScreenFinish" label={`출력 안함${countdown}`} />
            </div>
        </>
    );
});

ScreenOrderComplete.displayName = 'ScreenOrderComplete';
export default ScreenOrderComplete;
