import React, { memo, useContext, useEffect } from "react";
import { Cart, Main, Step, Bottom, Summary } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { AccessibilityContext, OrderContext, ScreenRouteContext } from "@/contexts";
import { processTts } from "@/lib/processTts";

const ProcessDetails = memo(() => {
    const order = useContext(OrderContext);
    const { navigateTo } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);

    useEffect(() => {
        if (!order.orderItems || order.orderItems.length === 0) {
            navigateTo(PROCESS_NAME.MENU);
        }
    }, [order.orderItems, navigateTo]);

    return (
        <div className="process third">
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.DETAILS]}>
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
                <Cart
                    className={accessibility.isLow ? "compact" : ""}
                    showFieldHeader
                />
            </Main>
            <Summary />
            <Bottom />
        </div>
    );
});

ProcessDetails.displayName = "ProcessDetails";
export default ProcessDetails;
