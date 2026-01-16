import React, { memo, useMemo } from "react";
import Button from "./Button";

// 카테고리 탭 버튼
const CategoryTab = memo(({ tab, isSelected }) => (
    <Button
        toggle
        pressed={isSelected}
        actionType="selectTab"
        actionTarget={tab.name}
        label={tab.name}
    />
));
CategoryTab.displayName = 'CategoryTab';

// 카테고리 네비게이션
const CategorySeparator = () => <span className="category-separator" aria-hidden="true" />;

const CategoryNav = memo(({ categories, selectedTab, pagination, containerRef, measureRef, convertToKoreanQuantity, categoryNavRef }) => {
    const { catPage, catTotal, catItems, catHasPrev, catHasNext, isCompact, isReady } = pagination;

    // category 클래스 메모이제이션 (isCompact 변경 시에만 재계산)
    const categoryClassName = useMemo(() => `category${isCompact ? ' compact' : ''}`, [isCompact]);

    return (
        <div
            className="category-full"
            ref={categoryNavRef}
            data-tts-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 총 버튼 ${convertToKoreanQuantity(catItems.length)}개,`}
        >
            {/* 숨겨진 측정용 컨테이너 (실제 구조와 동일하게 구분선 포함) */}
            <div ref={measureRef} className="category measure" aria-hidden="true" inert="true">
                {categories.map((tab, idx) => (
                    <React.Fragment key={tab.id}>
                        <Button toggle label={tab.name} tabIndex={-1} />
                        {idx < categories.length - 1 && <CategorySeparator />}
                    </React.Fragment>
                ))}
            </div>
            <Button toggle label="이전" className="w113h076 secondary1" disabled={!catHasPrev} actionType="categoryNav" actionTarget="prev" ttsText="이전" />
            <div
                className={categoryClassName}
                ref={containerRef}
                style={{ visibility: isReady ? 'visible' : 'hidden' }}
            >
                {catItems.map((tab, idx) => (
                    <React.Fragment key={tab.id}>
                        <CategoryTab tab={tab} isSelected={selectedTab === tab.name} />
                        {idx < catItems.length - 1 && <CategorySeparator />}
                    </React.Fragment>
                ))}
            </div>
            <Button toggle label="다음" className="w113h076 secondary1" disabled={!catHasNext} actionType="categoryNav" actionTarget="next" ttsText="다음" />
        </div>
    );
});
CategoryNav.displayName = 'CategoryNav';

export default CategoryNav;
