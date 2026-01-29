import React, { memo, useMemo } from "react";
import Button from "./Button";

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

const Category = memo(({ categories, selectedTab, onSelectTab, pagination, containerRef, measureRef, convertToKoreanQuantity, categoryNavRef }) => {
    const { catPage, catTotal, catItems, catHasPrev, catHasNext, catPrev, catNext, isCompact, isReady } = pagination;

    const categoryClassName = useMemo(() => `category${isCompact ? ' compact' : ''}`, [isCompact]);

    return (
        <div className="category-full" ref={categoryNavRef} data-tts-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 총 버튼 ${convertToKoreanQuantity(catItems.length)}개,`}>
            <div ref={measureRef} className="category measure" aria-hidden="true" inert="true">
                {categories.map((tab, idx) => (
                    <React.Fragment key={tab.id}>
                        <Button toggle label={tab.name} tabIndex={-1} />
                        {idx < categories.length - 1 && <CategorySeparator />}
                    </React.Fragment>
                ))}
            </div>
            <Button toggle label="이전" className="w113h076 secondary1" disabled={!catHasPrev} onClick={catPrev} ttsText="이전" />
            <div
                className={categoryClassName}
                ref={containerRef}
                style={{ visibility: isReady ? 'visible' : 'hidden' }}
            >
                {catItems.map((tab, idx) => (
                    <React.Fragment key={tab.id}>
                        <CategoryTab tab={tab} isSelected={selectedTab === tab.name} onSelect={onSelectTab} />
                        {idx < catItems.length - 1 && <CategorySeparator />}
                    </React.Fragment>
                ))}
            </div>
            <Button toggle label="다음" className="w113h076 secondary1" disabled={!catHasNext} onClick={catNext} ttsText="다음" />
        </div>
    );
});
Category.displayName = 'Category';

export default Category;
