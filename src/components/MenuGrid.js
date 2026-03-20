import React, { memo, useContext, useEffect } from "react";
import Button from "@/components/Button";
import Pagination from "@/components/pagination";
import { OrderContext, AccessibilityContext } from "@/contexts";
import { usePageSlicer } from "@/hooks";
import { publicAsset } from "@/lib/publicPath";

const PAGINATION_CONFIG = { ITEMS_PER_PAGE_NORMAL: 11, ITEMS_PER_PAGE_LOW: 3 };

// 메뉴 아이템
const MenuItem = memo(({ item, disabled, onPress }) => (
    <Button
        className="skel-stacked skin-menu"
        ttsText={disabled ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`}
        disabled={disabled}
        onClick={onPress}
    >
        <span className="icon" aria-hidden="true">
            <img src={publicAsset(`/images/${item.img}`)} alt={item.name} />
        </span>
        <div className="label">
            <span>{item.name}</span>
            <span className="primary">{Number(item.price).toLocaleString()}원</span>
        </div>
    </Button>
));
MenuItem.displayName = 'MenuItem';

// 메뉴 그리드
const MenuGrid = memo(() => {
    const order = useContext(OrderContext);
    const accessibility = useContext(AccessibilityContext);

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

    const handleItemPress = (e, id, target) => {
        if (id !== 0) {
            order.handleIncrease(id);
        }
    };

    return (
        <div
            className="menu"
            data-tts-text={`메뉴, ${order.selectedTab},`}
        >
            {currentItems.map(item => (
                <MenuItem
                    key={item.id}
                    item={item}
                    disabled={item.id === 0}
                    onPress={(e, target) => handleItemPress(e, item.id, target)}
                />
            ))}
            <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPrev={(e, target) => handlePrevPage()}
                onNext={(e, target) => handleNextPage()}
                ttsPrefix="메뉴"
            />
        </div>
    );
});
MenuGrid.displayName = 'MenuGrid';

export default MenuGrid;
