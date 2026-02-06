import React, { memo, useContext, useEffect } from "react";
import { OrderList } from "../components";
import { AccessibilityContext, OrderContext, ScreenRouteContext } from "../contexts";

const ProcessDetails = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    useEffect(() => {
        if (!order.orderItems || order.orderItems.length === 0) {
            navigateTo('ProcessMenu');
        }
    }, [order.orderItems, navigateTo]);

    return (
        <>
            <div className="title">
                {accessibility.isLow ? (
                    <span><span className="primary">내역</span>을 확인하시고 <span className="primary">결제하기</span> 버튼을 누르세요</span>
                ) : (
                    <>
                        <span><span className="primary">내역</span>을 확인하시고</span>
                        <span><span className="primary">결제하기</span>&nbsp;버튼을 누르세요</span>
                    </>
                )}
            </div>

            <div className="banner field">
                <div className="one-num"><span>순서</span></div>
                <div className="one-normal"><span>상품명</span></div>
                <div className="one-qty-normal"><span>수량</span></div>
                <div className="one-price-normal"><span>가격</span></div>
                <div className="one-delete-normal"><span>삭제</span></div>
                {accessibility.isLow ? (
                    <div className="one-pagination-normal"><span>이동</span></div>
                ) : null}
            </div>

            <div className="details-content">
                <OrderList />
            </div>
        </>
    );
});

ProcessDetails.displayName = 'ProcessDetails';
export default ProcessDetails;
