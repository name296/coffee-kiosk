// 주문 처리 유틸리티 (도메인: 장바구니 / 계산 / 결제 데이터)
// ============================================================================

/**
 * 수량 합계 계산 (장바구니 총 수량)
 */
export const calculateSum = (quantities) =>
    Number(Object.values(quantities).reduce((sum, val) => sum + val, 0));

/**
 * 총 금액 계산 (전체 합계 금액)
 */
export const calculateTotal = (quantities, items) => {
    const itemMap = new Map(items.map(item => [item.id, item]));
    return Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .reduce((sum, [id, qty]) => {
            const item = itemMap.get(Number(id));
            return sum + (item ? Number(item.price) * qty : 0);
        }, 0);
};

/**
 * 선택된 메뉴만 필터링 (장바구니 노출용)
 */
export const filterMenuItems = (items, quantities) =>
    items.filter(item => quantities[item.id] > 0);

/**
 * 주문 아이템 생성 (결제/출력용 데이터 변환)
 */
export const createOrderItems = (items, quantities) =>
    items
        .filter(item => quantities[item.id] > 0)
        .map(item => ({ ...item, quantity: quantities[item.id] }));
