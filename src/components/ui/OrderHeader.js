import React, { memo } from "react";

// 주문 헤더
export const OrderHeader = memo(({ isLow }) => (
    <div className="banner field">
        {isLow ? (
            <>
                <p className="one">상품명</p>
                <p className="one qty">수량</p>
                <p className="one price">가격</p>
                <p className="one delete">삭제</p>
            </>
        ) : (
            <>
                <p className="one-normal">상품명</p>
                <p className="one-qty-normal">수량</p>
                <p className="one-price-normal">가격</p>
                <p className="one-delete-normal">삭제</p>
            </>
        )}
    </div>
));
OrderHeader.displayName = 'OrderHeader';

export default OrderHeader;
