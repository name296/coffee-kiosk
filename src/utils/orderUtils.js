// 메뉴 유틸리티 함수 (단일책임원칙: 각 함수는 하나의 책임만)
// ============================================================================

// 카테고리별 메뉴 필터링 (단일책임: 카테고리 필터링만)
// placeholderMenu 파라미터는 ScreenMenu에서 전달됨
export const categorizeMenu = (items, tabName, categories = [], placeholderMenu) => {
    if (tabName === "전체메뉴") return items;
    const category = categories.find(c => c.cate_name === tabName);
    if (!category) return [placeholderMenu];
    const filtered = items.filter(item => item.cate_id === category.cate_id);
    return filtered.length > 0 ? filtered : [placeholderMenu];
};

// 수량 합계 계산 (단일책임: 수량 합계만)
export const calculateSum = (quantities) =>
    Number(Object.values(quantities).reduce((sum, val) => sum + val, 0));

// 총 금액 계산 (단일책임: 금액 계산만)
export const calculateTotal = (quantities, items) => {
    const itemMap = new Map(items.map(item => [item.id, item]));
    return Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .reduce((sum, [id, qty]) => {
            const item = itemMap.get(Number(id));
            return sum + (item ? Number(item.price) * qty : 0);
        }, 0);
};

// 선택된 메뉴만 필터링 (단일책임: 필터링만)
export const filterMenuItems = (items, quantities) =>
    items.filter(item => quantities[item.id] > 0);

// 주문 아이템 생성 (단일책임: 주문 아이템 생성만)
export const createOrderItems = (items, quantities) =>
    items
        .filter(item => quantities[item.id] > 0)
        .map(item => ({ ...item, quantity: quantities[item.id] }));
