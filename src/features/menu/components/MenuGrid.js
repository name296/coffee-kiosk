import React, { memo } from "react";
import Button from "../../../shared/ui/Button";

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
const MenuGrid = memo(({ items, onItemPress, selectedTab, convertToKoreanQuantity, mainContentRef }) => {
    return (
        <div className="menu" ref={mainContentRef} data-tts-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(items.length)}개,`}>
            {items.map(item => (
                <MenuItem
                    key={item.id}
                    item={item}
                    disabled={item.id === 0}
                    onPress={(e) => onItemPress(e, item.id)}
                />
            ))}
        </div>
    );
});
MenuGrid.displayName = 'MenuGrid';

export default MenuGrid;
