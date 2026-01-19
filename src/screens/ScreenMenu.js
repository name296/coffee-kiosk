import React, { memo, useContext, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import Step from "../components/ui/Step";
import Category from "../components/ui/Category";
import MenuGrid from "../components/ui/MenuGrid";
import Pagination from "../components/ui/Pagination";
import Summary from "../components/ui/Summary";
import Bottom from "../components/ui/Bottom";

import { RefContext } from "../contexts/RefContext";
import { AccessibilityContext } from "../contexts/AccessibilityContext";
import { OrderContext } from "../contexts/OrderContext";
import { ScreenRouteContext } from "../contexts/ScreenRouteContext";
import { useTextHandler } from "../hooks/useTTS";
import { useInteractiveTTSHandler } from "../hooks/useTTSInteraction";
import { useDOM } from "../hooks/useDOM";
import { useKeyboardNavigationHandler } from "../hooks/useKeyboardNavigation";
import { useFocusableSectionsManager } from "../hooks/useFocusManagement";
import { usePagination } from "../hooks/usePagination";
import { useCategoryPagination } from "../hooks/useCategoryPagination";
import { convertToKoreanQuantity } from "../utils/format";
import { TTS } from "../constants/constants";

const ScreenMenu = memo(() => {
    // ScreenMenu 전용 TTS 스크립트
    const TTS_SCREEN_MENU = `안내, 선택 단계, 카테고리에서 메뉴종류를 선택하시고, 메뉴에서 상품을 선택합니다, 초기화 버튼으로 상품을 다시 선택할 수 있습니다, 주문하기 버튼으로 다음 단계, 내역확인으로 이동 할 수 있습니다, ${TTS.replay}`;
    const TTS_ERROR_NO_PRODUCT = '없는 상품입니다.';

    // Context에서 값 가져오기
    // Context에서 값 가져오기
    // const refsData = useContext(RefContext); // Removed ref dependency
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);
    const route = useContext(ScreenRouteContext);

    // 페이지네이션 설정
    const PAGINATION_CONFIG = { ITEMS_PER_PAGE_NORMAL: 16, ITEMS_PER_PAGE_LOW: 3 };
    const { handleText } = useTextHandler(accessibility.volume);
    useInteractiveTTSHandler(true, handleText);
    // useDOM destructuring: remove unused vars if any
    // blurActiveElement, getActiveElementText used? getActiveElementText not used here but in App.js example it was destructured.
    // I'll keep blurActiveElement as it might be used or imported for potential use.
    const { blurActiveElement } = useDOM();

    // 기본 탭 설정
    useEffect(() => {
        const t = setTimeout(() => order.setSelectedTab('전체메뉴'), 0);
        return () => clearTimeout(t);
    }, [order.setSelectedTab]);

    const categoryNavRef = useRef(null);
    const mainContentRef = useRef(null);
    const actionBarRef = useRef(null);
    const orderSummaryRef = useRef(null);
    const systemControlsRef = useRef(null);

    useKeyboardNavigationHandler(false, true);
    const { updateFocusableSections } = useFocusableSectionsManager(['categoryNav', 'mainContent', 'actionBar', 'orderSummary', 'systemControls'], {
        categoryNav: categoryNavRef,
        mainContent: mainContentRef,
        actionBar: actionBarRef,
        orderSummary: orderSummaryRef,
        systemControls: systemControlsRef
    });

    const {
        pageNumber, totalPages, currentItems,
        handlePrevPage, handleNextPage, resetPage
    } = usePagination(
        order.menuItems,
        PAGINATION_CONFIG.ITEMS_PER_PAGE_NORMAL,
        PAGINATION_CONFIG.ITEMS_PER_PAGE_LOW,
        accessibility.isLow
    );

    // 탭 변경 시 페이지 리셋
    useEffect(() => {
        const t = setTimeout(() => resetPage(), 0);
        return () => clearTimeout(t);
    }, [order.selectedTab, resetPage]);

    // 가변 너비 카테고리 페이지네이션
    const {
        containerRef: catContainerRef,
        measureRef: catMeasureRef,
        currentPage: catPage,
        totalPages: catTotal,
        currentItems: catItems,
        hasPrev: catHasPrev,
        hasNext: catHasNext,
        prevPage: catPrev,
        nextPage: catNext,
        isCompact: catIsCompact,
        isReady: catIsReady
    } = useCategoryPagination(
        useMemo(() => (order.categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })), [order.categoryInfo]),
        accessibility.isLarge
    );

    // 카테고리 페이지 네비게이션 핸들러 등록
    useLayoutEffect(() => {
        order.setHandleCategoryPageNav?.((dir) => { dir === 'prev' ? catPrev() : catNext(); });
        return () => order.setHandleCategoryPageNav?.(null);
    }, [catPrev, catNext, order.setHandleCategoryPageNav]);

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            <Step />
            <div className="main second" data-tts-text={TTS_SCREEN_MENU} tabIndex={-1}>
                <Category
                    categories={useMemo(() => (order.categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })), [order.categoryInfo])}
                    selectedTab={order.selectedTab}
                    pagination={{ catPage, catTotal, catItems, catHasPrev, catHasNext, catPrev, catNext, isCompact: catIsCompact, isReady: catIsReady }}
                    containerRef={catContainerRef}
                    measureRef={catMeasureRef}
                    convertToKoreanQuantity={convertToKoreanQuantity}
                    categoryNavRef={categoryNavRef}
                />
                <MenuGrid
                    items={currentItems}
                    onItemPress={(e, id) => {
                        e.preventDefault();
                        e.target.focus();
                        if (id !== 0) {
                            order.handleIncrease(id);
                            handleText('담기, ');
                        } else {
                            handleText(TTS_ERROR_NO_PRODUCT);
                        }
                    }}
                    selectedTab={order.selectedTab}
                    convertToKoreanQuantity={convertToKoreanQuantity}
                    mainContentRef={mainContentRef}
                />
                <Pagination
                    pageNumber={pageNumber}
                    totalPages={totalPages}
                    onPrev={(e) => { e.preventDefault(); e.target.focus(); handlePrevPage(); }}
                    onNext={(e) => { e.preventDefault(); e.target.focus(); handleNextPage(); }}
                    isDark={accessibility.isDark}
                    ttsPrefix="메뉴"
                    sectionRef={actionBarRef}
                />
            </div>
            <Summary orderSummaryRef={orderSummaryRef} />
            <Bottom systemControlsRef={systemControlsRef} />
        </>
    );
});
ScreenMenu.displayName = 'ScreenMenu';

export default ScreenMenu;