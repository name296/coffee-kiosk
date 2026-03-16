import React, { memo, useContext, useMemo } from "react";
import Button from "./Button";
import { PaginationPageNumber } from "./Pagination";
import { OrderContext, AccessibilityContext } from "../contexts";
import { useCategoryAssemble } from "../hooks";

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

    const categories = useMemo(
        () => (order.categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })),
        [order.categoryInfo]
    );

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
    } = useCategoryAssemble(categories, accessibility.isLarge);

    const categoryClassName = useMemo(() => `category${catIsCompact ? ' compact' : ''}`, [catIsCompact]);

    return (
        <div
            className="category-full"
            data-tts-text={`메뉴 카테고리, 현재상태, ${order.selectedTab},`}
        >
            <div ref={catMeasureRef} className="category measure" aria-hidden="true" inert="true">
                {categories.map((tab, idx) => (
                    <React.Fragment key={tab.id}>
                        <Button toggle label={tab.name} tabIndex={-1} />
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
                data-tts-text={`페이지네이션, 메뉴 카테고리, ${catTotalPages} 탭 중 ${catCurrentPage} 탭,`}
            >
                <Button toggle label="◀" className="secondary1" disabled={!catHasPrev} onClick={catPrev} ttsText="이전" />
                <PaginationPageNumber pageNumber={catCurrentPage} totalPages={catTotalPages} textOnly />
                <Button toggle label="▶" className="secondary1" disabled={!catHasNext} onClick={catNext} ttsText="다음" />
            </div>
        </div>
    );
});
Category.displayName = 'Category';

export default Category;
