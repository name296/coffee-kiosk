import React, { memo, useContext, useMemo, useEffect, useRef } from "react";
import { Highlight, OrderList, Pagination } from "../components";

import { OrderContext, AccessibilityContext, ModalContext, ScreenRouteContext } from "../contexts";
import { useFocusableSectionsManager, usePagination } from "../hooks";
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
    } = usePagination(
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

    const handleItemDecrease = (itemId, currentItemsLength) => (e) => {
        e.preventDefault(); e.currentTarget.focus();
        if (order.quantities[itemId] === 1) {
            modal.setModalDeleteItemId(itemId);
            (order.orderItems.length > 1) ? modal.ModalDelete.open() : modal.ModalDeleteCheck.open();
        } else {
            order.handleDecrease(itemId);
        }
    };

    const handleItemIncrease = (itemId) => (e) => {
        e.preventDefault(); e.currentTarget.focus();
        order.handleIncrease(itemId);
    };

    const handleItemDelete = (itemId, currentItemsLength) => (e) => {
        e.preventDefault(); e.currentTarget.focus();
        modal.setModalDeleteItemId(itemId);
        (order.orderItems.length > 1) ? modal.ModalDelete.open() : modal.ModalDeleteCheck.open();
    };

    return (
        <>
            <div className="title">
                {accessibility.isLow ? (
                    <span><Highlight>내역</Highlight>을 확인하시고 <Highlight>결제하기</Highlight> 버튼을 누르세요</span>
                ) : (
                    <>
                        <span><Highlight>내역</Highlight>을 확인하시고</span>
                        <span><Highlight>결제하기</Highlight>&nbsp;버튼을 누르세요</span>
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
                    onPrev={(e) => { e.preventDefault(); e.target.focus(); handlePrevPage(); }}
                    onNext={(e) => { e.preventDefault(); e.target.focus(); handleNextPage(); }}
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
