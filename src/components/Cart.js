import React, { memo, useContext } from "react";
import Icon from "@/components/Icon";
import OrderList from "@/components/OrderList";
import Pagination from "@/components/Pagination";
import { OrderContext, AccessibilityContext } from "@/contexts";
import { usePageSlicer } from "@/hooks";

/**
 * 주문 목록 카트(.cart 그리드) + OrderList.
 * ProcessMenu(Summary 아래), ProcessDetails(Main 내) 등에서 사용.
 */
const Cart = memo(({ className = "", paginationDirection, itemsPerPageOverride, showFieldHeader = false, style } = {}) => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const isCompact = className.split(" ").includes("compact") || accessibility.isLow;
    const isCompactPagination = className.split(/\s+/).filter(Boolean).includes("compact");
    const normalItems = itemsPerPageOverride ?? (isCompact ? 3 : 6);
    const {
        pageNumber,
        totalPages,
        currentItems,
        itemsPerPage,
        handlePrevPage,
        handleNextPage
    } = usePageSlicer(
        order.orderItems,
        normalItems,
        3,
        accessibility.isLow
    );

    const rootClassName = [
        "cart",
        "body2",
        className,
        showFieldHeader ? "" : "without-field-header"
    ].filter(Boolean).join(" ");

    const orderListSliceTts = `주문목록 ${pageNumber}페이지 총 버튼 ${order.orderItems.length}개,`;

    return (
        <div className={rootClassName} style={style}>
            {showFieldHeader ? (
                <div className="header body3">
                    <div className="field">
                        <div className="one-num"><span>순서</span></div>
                        <div className="one-normal"><span>상품명</span></div>
                        <div className="one-qty-normal"><span>수량</span></div>
                        <div className="one-price-normal"><span>가격</span></div>
                        <div className="one-delete-normal"><span>삭제</span></div>
                    </div>
                </div>
            ) : null}
            <div className="cart-order-slice" style={{ display: "contents" }} data-tts-text={orderListSliceTts}>
                <OrderList
                    currentItems={currentItems}
                    startIndex={(pageNumber - 1) * itemsPerPage}
                />
            </div>
            <Pagination
                className="details-pagination"
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPrev={(e, target) => handlePrevPage()}
                onNext={(e, target) => handleNextPage()}
                ttsPrefix="주문목록"
                prevLabel={isCompactPagination ? "" : undefined}
                nextLabel={isCompactPagination ? "" : undefined}
                prevIcon={isCompactPagination ? <Icon name="arrow-top" /> : undefined}
                nextIcon={isCompactPagination ? <Icon name="arrow-down" /> : undefined}
            />
        </div>
    );
});

Cart.displayName = "Cart";
export default Cart;
