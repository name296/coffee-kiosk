import React, { memo, useContext, useMemo, useEffect, useRef } from "react";
import { Highlight } from "@shared/ui";
import { OrderList, Pagination } from "../components";

import { OrderContext, AccessibilityContext, ModalContext, ScreenRouteContext } from "@shared/contexts";
import { useFocusableSectionsManager, usePagination } from "@shared/hooks";
import { convertToKoreanQuantity } from "@shared/utils";

const ScreenDetails = memo(({ accessibility: accessibilityProp }) => {
    const order = useContext(OrderContext);
    const contextAccessibility = useContext(AccessibilityContext);
    const accessibility = accessibilityProp ?? contextAccessibility;
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

    // 아이템 없으면 메뉴선택으로 이동
    useEffect(() => {
        if (!order.orderItems || order.orderItems.length === 0) {
            navigateTo('ScreenMenu');
        }
    }, [order.orderItems, navigateTo]);

    // 주문 아이템 이벤트 핸들러
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


            {accessibility.isLow ? (
                <div className="banner field">
                    <div className="one-num"><span>순서</span></div>
                    <span className="one-normal">상품명</span>
                    <span className="one-qty-normal">수량</span>
                    <span className="one-price-normal">가격</span>
                    <span className="one-delete-normal">삭제</span>
                    <span className="one-pagination-normal">이동</span>
                </div>
            ) : (
                <div className="banner field">
                    <span className="one-num">순서</span>
                    <span className="one-normal">상품명</span>
                    <span className="one-qty-normal">수량</span>
                    <span className="one-price-normal">가격</span>
                    <span className="one-delete-normal">삭제</span>
                </div>
            )}

            {accessibility.isLow ? (
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
                        direction="vertical"
                        ttsPrefix="주문목록"
                        sectionRef={actionBarRef}
                    />
                </div>
            ) : (
                <>
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
                        direction="horizontal"
                        ttsPrefix="주문목록"
                        sectionRef={actionBarRef}
                    />
                </>
            )}
        </>
    );
});

ScreenDetails.displayName = 'ScreenDetails';
export default ScreenDetails;
