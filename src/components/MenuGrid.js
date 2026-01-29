import React, { memo } from "react";
import Button from "./Button";
import Pagination from "./Pagination";

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
const MenuGrid = memo(({ 
    items, 
    onItemPress, 
    selectedTab, 
    convertToKoreanQuantity, 
    mainContentRef,
    isLow = false,
    paginationProps
}) => {
    // 4*4 그리드이므로 최대 15개 아이템만 표시하고 마지막 칸에 페이지네이션
    // .low 모드에서는 3개 아이템만 표시하고 4번째 칸에 페이지네이션
    const maxItems = isLow ? 3 : 15;
    const displayItems = items.slice(0, maxItems);
    const hasPagination = paginationProps !== undefined && paginationProps !== null;

    return (
        <div className="menu" ref={mainContentRef} data-tts-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(items.length)}개,`}>
            {displayItems.map(item => (
                <MenuItem
                    key={item.id}
                    item={item}
                    disabled={item.id === 0}
                    onPress={(e) => onItemPress(e, item.id)}
                />
            ))}
            {hasPagination && (
                <div 
                    className="menu-pagination"
                    style={{ 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center", 
                        width: "100%", 
                        height: "100%",
                        gridColumn: "4",
                        gridRow: isLow ? "1" : "4"
                    }}
                >
                    <Pagination
                        direction="vertical"
                        {...paginationProps}
                    />
                </div>
            )}
        </div>
    );
});
MenuGrid.displayName = 'MenuGrid';

export default MenuGrid;
