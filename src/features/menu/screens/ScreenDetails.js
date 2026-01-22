import React, { memo, useContext, useMemo, useEffect, useRef } from "react";
import Highlight from "../../../shared/ui/Highlight";
import OrderList from "../components/OrderList";
import Pagination from "../components/Pagination";

import { OrderContext } from "../../../shared/contexts/OrderContext";
import { AccessibilityContext } from "../../../shared/contexts/AccessibilityContext";
import { ModalContext } from "../../../shared/contexts/ModalContext";
import { ScreenRouteContext } from "../../../shared/contexts/ScreenRouteContext";
import { useFocusableSectionsManager } from "../../../shared/hooks/useFocusManagement";
import { usePagination } from "../../../shared/hooks/usePagination";
import { convertToKoreanQuantity } from "../../../shared/utils/format";

const ScreenDetails = memo(() => {
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
                <span><Highlight>내역</Highlight>을 확인하시고</span>
                <span><Highlight>결제하기</Highlight>&nbsp;버튼을 누르세요</span>
            </div>
            <div className="banner field">
                <p className="one-num">순서</p>
                <p className="one-normal">상품명</p>
                <p className="one-qty-normal">수량</p>
                <p className="one-price-normal">가격</p>
                <p className="one-delete-normal">삭제</p>
            </div>
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
            />
            <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPrev={(e) => { e.preventDefault(); e.target.focus(); handlePrevPage(); }}
                onNext={(e) => { e.preventDefault(); e.target.focus(); handleNextPage(); }}
                isDark={accessibility.isDark}
                ttsPrefix="주문목록"
                sectionRef={actionBarRef}
            />
        </>
    );
});

ScreenDetails.displayName = 'ScreenDetails';
export default ScreenDetails;
