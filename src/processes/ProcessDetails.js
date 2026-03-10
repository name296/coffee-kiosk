import React, { memo, useContext, useEffect } from "react";
import { DetailsContent } from "../components";
import { PROCESS_NAME } from "../constants";
import { AccessibilityContext, OrderContext, ScreenRouteContext } from "../contexts";

const ProcessDetails = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    useEffect(() => {
        if (!order.orderItems || order.orderItems.length === 0) {
            navigateTo(PROCESS_NAME.MENU);
        }
    }, [order.orderItems, navigateTo]);

    return (
        <>
            <div className="title">
                {accessibility.isLow ? (
                    <span><span className="primary">내역</span>을 확인하시고 <span className="primary">결제하기</span> 버튼을 누릅니다</span>
                ) : (
                    <>
                        <span><span className="primary">내역</span>을 확인하시고</span>
                        <span><span className="primary">결제하기</span>&nbsp;버튼을 누릅니다</span>
                    </>
                )}
            </div>

            <DetailsContent className={accessibility.isLow ? "compact" : ""} showFieldHeader />
        </>
    );
});

ProcessDetails.displayName = 'ProcessDetails';
export default ProcessDetails;
