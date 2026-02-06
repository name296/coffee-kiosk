import React, { memo, useContext, useEffect } from "react";
import Button from "./Button";
import Pagination from "./Pagination";
import { OrderContext, AccessibilityContext } from "../contexts";
import { usePageSlicer } from "../hooks";

const PAGINATION_CONFIG = { ITEMS_PER_PAGE_NORMAL: 15, ITEMS_PER_PAGE_LOW: 3 };

// 메뉴 아이템
const MenuItem = memo(({ item, disabled, onPress }) => (
    <Button
        className="primary3"
        ttsText={disabled ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`}
        disabled={disabled}
        onClick={onPress}
    >
        <span className="icon" aria-hidden="true">
            <img src={`./images/${item.img}`} alt={item.name} />
        </span>
        <div className="label">
            <p>{item.name}</p>
            <p>{Number(item.price).toLocaleString()}원</p>
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
        target?.focus?.();
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
            <div
                className="menu-pagination"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    gridColumn: "4",
                    gridRow: accessibility.isLow ? "1" : "4"
                }}
            >
                <Pagination
                    direction="vertical"
                    pageNumber={pageNumber}
                    totalPages={totalPages}
                    onPrev={(e, target) => { target?.focus?.(); handlePrevPage(); }}
                    onNext={(e, target) => { target?.focus?.(); handleNextPage(); }}
                    ttsPrefix="메뉴"
                />
            </div>
        </div>
    );
});
MenuGrid.displayName = 'MenuGrid';

export default MenuGrid;
