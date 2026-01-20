// 메뉴 데이터 처리 유틸리티 (도메인: 메뉴판 / 카테고리 / UI 레이아웃)
// ============================================================================

/**
 * 중첩된 카테고리 구조를 평탄화하여 전체 메뉴 목록 생성
 */
export const flattenMenuCategories = (categories = []) => {
    let id = 1;
    return categories
        .map((cat, catIndex) => ({ ...cat, cate_id: catIndex }))
        .filter(cat => cat.cate_id !== 0) // 전체메뉴 제외
        .flatMap(cat =>
            (cat.items || []).map(item => ({
                id: id++,
                cate_id: cat.cate_id,
                ...item
            }))
        );
};

/**
 * 카테고리 정보 추출 (ID와 이름 매핑)
 */
export const getCategoryInfo = (categories = []) =>
    categories.map((cat, index) => ({
        cate_id: index,
        cate_name: cat.name
    }));

/**
 * 가용 탭 이름 목록 추출
 */
export const getTabNames = (categories = []) =>
    categories.map(c => c.name);

/**
 * 카테고리별 메뉴 필터링 (UI 그리드용)
 */
export const categorizeMenu = (items, tabName, categories = [], placeholderMenu) => {
    if (tabName === "전체메뉴") return items;
    const category = categories.find(c => c.cate_name === tabName);
    if (!category) return [placeholderMenu];
    const filtered = items.filter(item => item.cate_id === category.cate_id);
    return filtered.length > 0 ? filtered : [placeholderMenu];
};
