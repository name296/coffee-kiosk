import React, { memo, useContext, useMemo, useEffect, useRef } from "react";
import Step from "../components/ui/Step";

import Highlight from "../components/ui/Highlight";
import OrderList from "../components/ui/OrderList";
import Pagination from "../components/ui/Pagination";
import Summary from "../components/ui/Summary";
import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { OrderContext } from "../contexts/OrderContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useDOM } from "../hooks/useDOM"; // useDOM should be imported
import { usePagination } from "../hooks/usePagination";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { convertToKoreanQuantity } from "../utils/format";
import { TTS } from "../constants/constants";

const ScreenDetails = memo(() => {
    // ScreenDetails 전용 TTS 스크립트
    const TTS_SCREEN_DETAILS = `안내, 내역 확인, 주문목록에서 상품명, 수량, 가격을 확인합니다, 수량 버튼 및 삭제 버튼으로 주문목록을 수정 할 수 있습니다. 추가하기 버튼으로 이전 단계, 메뉴선택으로 돌아갈 수 있습니다, 결제하기 버튼으로 다음 단계, 결제선택으로 이동할 수 있습니다,${TTS.replay}`;

    // 개별 Context에서 값 가져오기
    // 개별 Context에서 값 가져오기
    // const refsData = useContext(RefContext); // Removed ref dependency
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const route = useContext(ScreenRouteContext);
    const { handleText } = useTextHandler(accessibility.volume);
    useInteractiveTTSHandler(true, handleText);

    const actionBarRef = useRef(null);
    const orderSummaryRef = useRef(null);
    const systemControlsRef = useRef(null);

    const row1Ref = useRef(null);
    const row2Ref = useRef(null);
    const row3Ref = useRef(null);
    const row4Ref = useRef(null);
    const row5Ref = useRef(null);
    const row6Ref = useRef(null);

    // rowRefs를 useMemo로 메모이제이션
    const rowRefs = useMemo(() => [
        row1Ref, row2Ref, row3Ref, row4Ref, row5Ref, row6Ref
    ], []);

    const {
        pageNumber, totalPages, currentItems,
        handlePrevPage, handleNextPage, itemsPerPage
    } = usePagination(order.filterMenuItems(order.totalMenuItems, order.quantities), 6, 3, accessibility.isLow);

    useKeyboardNavigationHandler(false, true);
    const { updateFocusableSections } = useFocusableSectionsManager(
        [
            'hiddenPageButton',
            ...Array.from({ length: (currentItems && currentItems.length) ? currentItems.length : 0 }, (_, i) => `row${i + 1}`),
            'actionBar', 'orderSummary', 'systemControls'
        ],
        {
            actionBar: actionBarRef,
            orderSummary: orderSummaryRef,
            systemControls: systemControlsRef,
            rows: rowRefs,
            row1: rowRefs[0], row2: rowRefs[1], row3: rowRefs[2],
            row4: rowRefs[3], row5: rowRefs[4], row6: rowRefs[5]
        }
    );

    const currentItemsLength = currentItems?.length ?? 0;

    useEffect(() => {
        updateFocusableSections(
            [
                'hiddenPageButton',
                ...Array.from({ length: currentItemsLength }, (_, i) => `row${i + 1}`),
                'actionBar', 'orderSummary', 'systemControls'
            ],
            {
                actionBar: actionBarRef,
                orderSummary: orderSummaryRef,
                systemControls: systemControlsRef,
                rows: rowRefs,
                row1: rowRefs[0], row2: rowRefs[1], row3: rowRefs[2],
                row4: rowRefs[3], row5: rowRefs[4], row6: rowRefs[5]
            }
        );
    }, [pageNumber, currentItemsLength, rowRefs, updateFocusableSections]);

    // 아이템 없으면 메뉴선택으로 이동
    useEffect(() => {
        if (!currentItems || currentItems.length === 0) {
            const t = setTimeout(() => route.setCurrentPage('ScreenMenu'), 0);
            return () => clearTimeout(t);
        }
    }, [currentItems, route]);

    const { blurActiveElement } = useDOM();

    // 페이지 진입 시 blur만 설정
    useEffect(() => {
        blurActiveElement();
    }, [route.currentPage]);

    // 주문 아이템 이벤트 핸들러 정의
    const handleItemDecrease = (itemId, currentItemsLength) => (e) => {
        e.preventDefault();
        e.currentTarget.focus();
        if (order.quantities[itemId] === 1) {
            accessibility.setModalDeleteItemId(itemId);
            (currentItemsLength > 1) ? accessibility.ModalDelete.open() : accessibility.ModalDeleteCheck.open();
        } else {
            order.handleDecrease(itemId);
        }
    };

    const handleItemIncrease = (itemId) => (e) => {
        e.preventDefault();
        e.currentTarget.focus();
        order.handleIncrease(itemId);
    };

    const handleItemDelete = (itemId, currentItemsLength) => (e) => {
        e.preventDefault();
        e.currentTarget.focus();
        accessibility.setModalDeleteItemId(itemId);
        (currentItemsLength > 1) ? accessibility.ModalDelete.open() : accessibility.ModalDeleteCheck.open();
    };

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <Step />
            <div className="main third" data-tts-text={TTS_SCREEN_DETAILS} tabIndex={-1}>
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
            </div>
            <Summary orderSummaryRef={orderSummaryRef} />
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenDetails.displayName = 'ScreenDetails';

export default ScreenDetails;
