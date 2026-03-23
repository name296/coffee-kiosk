import React, { memo, useContext, useMemo, useRef, useEffect, useCallback } from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import { PaginationIndicator } from "@/components/Pagination";
import { OrderContext, AccessibilityContext } from "@/contexts";
import { useCategoryAssemble, useTextHandler } from "@/hooks";

// 카테고리 탭 버튼
const CategoryTab = memo(({ tab, isSelected, onSelect }) => (
    <Button
        toggle
        pressed={isSelected}
        onClick={() => onSelect(tab.name)}
        label={tab.name}
    />
));
CategoryTab.displayName = 'CategoryTab';

const CategorySeparator = () => <span className="category-separator" aria-hidden="true" />;

const Category = memo(() => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);

    const categories = useMemo(
        () => (order.categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })),
        [order.categoryInfo]
    );

    // 레이아웃 측정·브레이크포인트는 훅 내부 useLayoutEffect (Category에 중복 넣지 않음)
    const {
        containerRef: catContainerRef,
        measureRef: catMeasureRef,
        currentPage: catCurrentPage,
        totalPages: catTotalPages,
        currentItems: catItems,
        hasPrev: catHasPrev,
        hasNext: catHasNext,
        prevPage: catPrev,
        nextPage: catNext,
        isCompact: catIsCompact,
        isReady: catIsReady
    } = useCategoryAssemble(categories, accessibility.isLarge, order.selectedTab);

    const categoryClassName = useMemo(() => `category${catIsCompact ? ' compact' : ''}`, [catIsCompact]);

    const catTotal = catTotalPages || 1;
    const getCategoryPaginationTtsSection = () =>
        `카테고리 ${catCurrentPage}페이지 총${catTotal}페이지,`;

    const announceAfterCatNavRef = useRef(false);

    const handleCatPrev = useCallback(() => {
        if (!catHasPrev) return;
        announceAfterCatNavRef.current = true;
        catPrev();
    }, [catHasPrev, catPrev]);

    const handleCatNext = useCallback(() => {
        if (!catHasNext) return;
        announceAfterCatNavRef.current = true;
        catNext();
    }, [catHasNext, catNext]);

    useEffect(() => {
        if (!announceAfterCatNavRef.current) return;
        announceAfterCatNavRef.current = false;
        const p = catCurrentPage || 1;
        handleText(`카테고리 ${p}페이지,`, false);
    }, [catCurrentPage, handleText]);

    return (
        <div
            className="category-full"
            data-tts-text={`메뉴 카테고리, 현재상태, ${order.selectedTab},`}
        >
            <div ref={catMeasureRef} className="category measure" aria-hidden="true" inert={true}>
                {categories.map((tab, idx) => (
                    <React.Fragment key={tab.id}>
                        <Button toggle label={tab.name} tabIndex={0} />
                        {idx < categories.length - 1 && <CategorySeparator />}
                    </React.Fragment>
                ))}
            </div>
            <div
                className={categoryClassName}
                ref={catContainerRef}
                style={{ visibility: catIsReady ? 'visible' : 'hidden' }}
            >
                {catItems.map((tab, idx) => (
                    <React.Fragment key={tab.id}>
                        <CategoryTab tab={tab} isSelected={order.selectedTab === tab.name} onSelect={order.setSelectedTab} />
                        {idx < catItems.length - 1 && <CategorySeparator />}
                    </React.Fragment>
                ))}
            </div>
            <div
                className="pagination"
                data-tts-text={getCategoryPaginationTtsSection()}
            >
                <Button toggle svg={<Icon name="ArrowLeft" />} disabled={!catHasPrev} onClick={handleCatPrev} ttsText="이전" />
                <PaginationIndicator pageNumber={catCurrentPage} totalPages={catTotalPages} />
                <Button toggle svg={<Icon name="ArrowRight" />} disabled={!catHasNext} onClick={handleCatNext} ttsText="다음" />
            </div>
        </div>
    );
});
Category.displayName = 'Category';

export default Category;
