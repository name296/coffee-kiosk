import { useMemo } from "react";
import menuData from "../../menuData";
import {
    flattenMenuCategories,
    getCategoryInfo,
    getTabNames
} from "../utils";

/**
 * 메뉴 데이터 훅 - menuUtils를 통해 메뉴판 정보를 제공
 */
export const useMenuData = () => {
    const categories = useMemo(() => menuData.categories || [], []);

    // 메뉴 도메인 유틸리티 사용
    const tabs = useMemo(() => getTabNames(categories), [categories]);
    const totalMenuItems = useMemo(() => flattenMenuCategories(categories), [categories]);
    const categoryInfo = useMemo(() => getCategoryInfo(categories), [categories]);

    return {
        menuData,
        categories,
        tabs,
        totalMenuItems,
        categoryInfo
    };
};
