import React, { memo, useContext, useLayoutEffect } from "react";
import { Button, Main, Step, Bottom } from "@/components";
import { PROCESS_NAME } from "@/constants";
import { AccessibilityContext, OrderContext } from "@/contexts";
import { processTts } from "@/lib/processTts";

/** `order.orderNumber` 미배정 시에만 사용 (주문완료 진입 시 `updateOrderNumber`로 배정) */
const ORDER_NUMBER_FALLBACK = 100;

const ProcessOrderComplete = memo(() => {
    const order = useContext(OrderContext);
    const { isLow } = useContext(AccessibilityContext);

    useLayoutEffect(() => {
        order.updateOrderNumber();
    }, [order.updateOrderNumber]);

    const displayOrderNumber = order.orderNumber ?? ORDER_NUMBER_FALLBACK;

    return (
        <div className="process fifth">
            <div className="black" />
            <div className="top body1" />
            <Step />
            <Main ttsText={processTts[PROCESS_NAME.ORDER_COMPLETE]}>
                {isLow ? (
                    <>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src="images/device-printer-order.png" alt="" />
                                <div className="order-num">
                                    <span>주문</span>
                                    <span>{displayOrderNumber}</span>
                                </div>
                            </div>
                        </div>
                        <div className="content-control">
                            <div className="title">
                                <span>
                                    왼쪽 아래의 <span className="primary">프린터</span>에서{" "}
                                    <span className="primary">주문표</span>를 받으시고{" "}
                                    <span className="primary">영수증 출력</span>을 선택합니다
                                </span>
                            </div>
                            <div className="task-manager" data-tts-text="작업관리,">
                                <Button
                                    className="skel-inline skin-secondary"
                                    onClick={() => order.sendPrintReceiptToApp()}
                                    navigate={PROCESS_NAME.RECEIPT_PRINT}
                                    label={
                                        <>
                                            <span>영수증</span>
                                            <span>출력</span>
                                        </>
                                    }
                                />
                                <Button
                                    className="skel-inline skin-primary"
                                    ttsText="출력 안함,"
                                    navigate={PROCESS_NAME.FINISH}
                                    label="출력 안함"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="title">
                            <>
                                <div>
                                    왼쪽 아래의 <span className="primary">프린터</span>에서{" "}
                                    <span className="primary">주문표</span>를
                                </div>
                                <div>
                                    받으시고 <span className="primary">영수증 출력</span>을 선택합니다
                                </div>
                            </>
                        </div>
                        <div className="content-container">
                            <div className="device-guide">
                                <img src="images/device-printer-order.png" alt="" />
                                <div className="order-num">
                                    <span>주문</span>
                                    <span>{displayOrderNumber}</span>
                                </div>
                            </div>
                        </div>
                        <div className="task-manager" data-tts-text="작업관리,">
                            <Button
                                className="skel-inline skin-secondary"
                                onClick={() => order.sendPrintReceiptToApp()}
                                navigate={PROCESS_NAME.RECEIPT_PRINT}
                                label="영수증 출력"
                            />
                            <Button
                                className="skel-inline skin-primary"
                                ttsText="출력 안함,"
                                navigate={PROCESS_NAME.FINISH}
                                label="출력 안함"
                            />
                        </div>
                    </>
                )}
            </Main>
            <Bottom />
        </div>
    );
});

ProcessOrderComplete.displayName = "ProcessOrderComplete";
export default ProcessOrderComplete;
