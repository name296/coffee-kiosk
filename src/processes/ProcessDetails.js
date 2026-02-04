import React, { memo, useContext, useMemo, useEffect, useRef } from "react";
import { OrderList, Pagination } from "../components";

import { OrderContext, AccessibilityContext, ModalContext, ScreenRouteContext } from "../contexts";
import { useFocusableSectionsManager, usePageSlicer } from "../hooks";
import { convertToKoreanQuantity } from "../utils";

const ProcessDetails = memo(() => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const modal = useContext(ModalContext);
    const { navigateTo } = useContext(ScreenRouteContext);

    const actionBarRef = useRef(null);
    const orderSummaryRef = useRef(null);
    const systemControlsRef = useRef(null);

    const row1Ref = useRef(null);
    const row2Ref = useRef(null);
    const row3Ref = useRef(null);
    const row4Ref = useRef(null);
    const row5Ref = useRef(null);
    const row6Ref = useRef(null);

    const rowRefs = useMemo(() => [
        row1Ref, row2Ref, row3Ref, row4Ref, row5Ref, row6Ref
    ], []);

    const {
        pageNumber, totalPages, currentItems,
        handlePrevPage, handleNextPage, itemsPerPage
    } = usePageSlicer(
        order.orderItems,
        accessibility.isLow ? 3 : 6,
        3,
        accessibility.isLow
    );

    useFocusableSectionsManager(
        [
            ...Array.from({ length: currentItems?.length ?? 0 }, (_, i) => `row${i + 1}`),
            'actionBar', 'orderSummary', 'systemControls'
        ],
        {
            actionBar: actionBarRef,
            orderSummary: orderSummaryRef,
            systemControls: systemControlsRef,
            row1: rowRefs[0], row2: rowRefs[1], row3: rowRefs[2],
            row4: rowRefs[3], row5: rowRefs[4], row6: rowRefs[5]
        }
    );

    useEffect(() => {
        if (!order.orderItems || order.orderItems.length === 0) {
            navigateTo('ProcessMenu');
        }
    }, [order.orderItems, navigateTo]);

    const handleItemDecrease = (itemId, currentItemsLength) => (e, target) => {
        target?.focus?.();
        if (order.quantities[itemId] === 1) {
            modal.setModalDeleteItemId(itemId);
            (order.orderItems.length > 1) ? modal.ModalDelete.open() : modal.ModalDeleteCheck.open();
        } else {
            order.handleDecrease(itemId);
        }
    };

    const handleItemIncrease = (itemId) => (e, target) => {
        target?.focus?.();
        order.handleIncrease(itemId);
    };

    const handleItemDelete = (itemId, currentItemsLength) => (e, target) => {
        target?.focus?.();
        modal.setModalDeleteItemId(itemId);
        (order.orderItems.length > 1) ? modal.ModalDelete.open() : modal.ModalDeleteCheck.open();
    };

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
                {accessibility.isLow && (
                    <div className="one-pagination-normal"><span>이동</span></div>
                )}
            </div>

            <div className="details-content">
                <OrderList
                    currentItems={currentItems}
                    pageNumber={pageNumber}
                    itemsPerPage={itemsPerPage}
                    rowRefs={rowRefs}
                    quantities={order.quantities}
                    onDecrease={handleItemDecrease}
                    onIncrease={handleItemIncrease}
                    onDelete={handleItemDelete}
                    convertToKoreanQuantity={convertToKoreanQuantity}
                    accessibility={accessibility}
                />
                <Pagination
                    pageNumber={pageNumber}
                    totalPages={totalPages}
                    onPrev={(e, target) => { target?.focus?.(); handlePrevPage(); }}
                    onNext={(e, target) => { target?.focus?.(); handleNextPage(); }}
                    direction={accessibility.isLow ? "vertical" : "horizontal"}
                    ttsPrefix="주문목록"
                    sectionRef={actionBarRef}
                />
            </div>
        </>
    );
});

ProcessDetails.displayName = 'ProcessDetails';
export default ProcessDetails;
