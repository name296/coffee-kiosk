import React, { memo, useContext, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { Category, MenuGrid, Pagination } from "../components";

import { AccessibilityContext, OrderContext } from "../contexts";
import {
    usePageSlicer,
    useCategoryAssemble,
    useFocusableSectionsManager
} from "../hooks";
import { convertToKoreanQuantity } from "../utils";

const ProcessMenu = memo(() => {
    const accessibility = useContext(AccessibilityContext);
    const order = useContext(OrderContext);

    const PAGINATION_CONFIG = { ITEMS_PER_PAGE_NORMAL: 16, ITEMS_PER_PAGE_LOW: 3 };

    // ?? ?? ?? ? ?? ?? ? ?(????)?? ??
    useEffect(() => {
        const firstTab = order.tabs?.[0] ?? '????';
        order.setSelectedTab(firstTab);
    }, []);

    const categoryNavRef = useRef(null);
    const mainContentRef = useRef(null);
    const actionBarRef = useRef(null);
    const orderSummaryRef = useRef(null);
    const systemControlsRef = useRef(null);

    useFocusableSectionsManager(['categoryNav', 'mainContent', 'actionBar', 'orderSummary', 'systemControls'], {
        categoryNav: categoryNavRef,
        mainContent: mainContentRef,
        actionBar: actionBarRef,
        orderSummary: orderSummaryRef,
        systemControls: systemControlsRef
    });

    const {
        pageNumber, totalPages, currentItems,
        handlePrevPage, handleNextPage, resetPage
    } = usePageSlicer(
        order.menuItems,
        PAGINATION_CONFIG.ITEMS_PER_PAGE_NORMAL,
        PAGINATION_CONFIG.ITEMS_PER_PAGE_LOW,
        accessibility.isLow
    );

    useEffect(() => {
        const t = setTimeout(() => resetPage(), 0);
        return () => clearTimeout(t);
    }, [order.selectedTab, resetPage]);

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
    } = useCategoryAssemble(
        useMemo(() => (order.categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })), [order.categoryInfo]),
        accessibility.isLarge
    );

    useLayoutEffect(() => {
        order.setHandleCategoryPageNav?.((dir) => { dir === 'prev' ? catPrev() : catNext(); });
        return () => order.setHandleCategoryPageNav?.(null);
    }, [catPrev, catNext, order.setHandleCategoryPageNav]);

    return (
        <>
            <Category
                categories={useMemo(() => (order.categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })), [order.categoryInfo])}
                selectedTab={order.selectedTab}
                onSelectTab={order.setSelectedTab}
                pagination={{ catPage, catTotal, catItems, catHasPrev, catHasNext, catPrev, catNext, isCompact: catIsCompact, isReady: catIsReady }}
                containerRef={catContainerRef}
                measureRef={catMeasureRef}
                convertToKoreanQuantity={convertToKoreanQuantity}
                categoryNavRef={categoryNavRef}
            />
            <MenuGrid
                items={currentItems}
                onItemPress={(e, id, target) => {
                    target?.focus?.();
                    if (id !== 0) {
                        order.handleIncrease(id);
                    }
                }}
                selectedTab={order.selectedTab}
                convertToKoreanQuantity={convertToKoreanQuantity}
                mainContentRef={mainContentRef}
                isLow={accessibility.isLow}
                paginationProps={{
                    pageNumber,
                    totalPages,
                    onPrev: (e, target) => { target?.focus?.(); handlePrevPage(); },
                    onNext: (e, target) => { target?.focus?.(); handleNextPage(); },
                    isDark: accessibility.isDark,
                    ttsPrefix: "??"
                }}
            />
        </>
    );
});

ProcessMenu.displayName = 'ProcessMenu';
export default ProcessMenu;
