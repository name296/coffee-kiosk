import { useMemo } from "react";
import menuData from "../menuData";

// 메뉴 데이터 훅 - 네스티드 구조 기반
export const useMenuData = () => {
    // 네스티드 categories 구조 사용
    const categories = useMemo(() => menuData.categories || [], []);

    // 탭 이름 목록 (카테고리 이름들)
    const tabs = useMemo(() => categories.map(c => c.name), [categories]);

    // 전체 메뉴 아이템 (ID 자동 부여)
    const totalMenuItems = useMemo(() => {
        let id = 1;
        return categories
            .map((cat, catIndex) => ({ ...cat, cate_id: catIndex }))
            .filter(cat => cat.cate_id !== 0) // 전체메뉴 제외
            .flatMap(cat => cat.items.map(item => ({ id: id++, cate_id: cat.cate_id, ...item })));
    }, [categories]);

    // 카테고리 정보 (호환용)
    const categoryInfo = useMemo(() =>
        categories.map((cat, index) => ({ cate_id: index, cate_name: cat.name })),
        [categories]
    );

    return { menuData, categories, tabs, totalMenuItems, categoryInfo };
};
