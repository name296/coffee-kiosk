import React, { memo, useContext } from "react";
import OrderList from "./OrderList";
import Pagination from "./Pagination";
import { OrderContext, AccessibilityContext } from "../contexts";
import { usePageSlicer } from "../hooks";

/**
 * cart 래퍼 + OrderList.
 * ProcessMenu(Summary 아래), ProcessDetails(Main 내) 공통 사용.
 */
const DetailsContent = memo(({ className = "", paginationDirection, itemsPerPageOverride, showFieldHeader = false, style } = {}) => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const isCompact = className.split(" ").includes("compact") || accessibility.isLow;
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

    const detailsContentClassName = [
        "cart",
        className,
        showFieldHeader ? "" : "without-field-header"
    ].filter(Boolean).join(" ");

    return (
        <div className={detailsContentClassName} style={style}>
            {showFieldHeader ? (
                <div className="banner field">
                    <div className="one-num"><span>순서</span></div>
                    <div className="one-normal"><span>상품명</span></div>
                    <div className="one-qty-normal"><span>수량</span></div>
                    <div className="one-price-normal"><span>가격</span></div>
                    <div className="one-delete-normal"><span>삭제</span></div>
                    {isCompact && accessibility.isLow ? (
                        <div className="one-pagination-normal"><span>이동</span></div>
                    ) : null}
                </div>
            ) : null}
            <OrderList
                currentItems={currentItems}
                startIndex={(pageNumber - 1) * itemsPerPage}
            />
            <Pagination
                className="details-pagination"
                direction={paginationDirection ?? (isCompact ? "vertical" : "horizontal")}
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPrev={(e, target) => handlePrevPage()}
                onNext={(e, target) => handleNextPage()}
                ttsPrefix="주문목록"
            />
        </div>
    );
});

DetailsContent.displayName = "DetailsContent";
export default DetailsContent;
