import React, { memo, useContext, useEffect, useRef } from "react";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { formatNumber, convertToKoreanQuantity } from "@/lib";
import { OrderContext, AccessibilityContext } from "@/contexts";
import { usePageSlicer, useTextHandler } from "@/hooks";

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
            <img src={`images/${item.img}`} alt={item.name} />
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
    const { handleText } = useTextHandler(accessibility.volume);
    /** 메뉴 탭에서 연타 시에도 주문요약과 동일한 총수량·총금액 기준으로 TTS */
    const totalsRef = useRef({
        count: order.totalCount || 0,
        sum: order.totalSum || 0
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

    useEffect(() => {
        totalsRef.current = {
            count: order.totalCount || 0,
            sum: order.totalSum || 0
        };
    }, [order.totalCount, order.totalSum]);

    const handleItemPress = (e, item, target) => {
        if (item.id === 0) return;
        const price = Number(item.price);
        const nextCount = totalsRef.current.count + 1;
        const nextSum = totalsRef.current.sum + price;
        totalsRef.current = { count: nextCount, sum: nextSum };
        order.handleIncrease(item.id);
        handleText(`${convertToKoreanQuantity(nextCount)} 개, ${formatNumber(nextSum)}원,`, false);
    };

    /** {탭명}메뉴 N페이지 총 버튼 {탭소속버튼갯수}개, */
    const menuSliceTts = `${order.selectedTab}메뉴 ${pageNumber}페이지 총 버튼 ${order.menuItems.length}개,`;

    return (
        <div className="menu">
            <div className="menu-page-slice" style={{ display: "contents" }} data-tts-text={menuSliceTts}>
                {currentItems.map(item => (
                    <MenuItem
                        key={item.id}
                        item={item}
                        disabled={item.id === 0}
                        onPress={(e, target) => handleItemPress(e, item, target)}
                    />
                ))}
            </div>
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
