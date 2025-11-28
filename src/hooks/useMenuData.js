// ============================================================================
// 메뉴 데이터 훅
// static import로 메뉴 데이터 제공
// ============================================================================

import { useMemo } from 'react';
import menuData from '../data/menuData.json';

/**
 * 메뉴 데이터를 제공하는 커스텀 훅
 * @returns {Object} { menuData, tabs, totalMenuItems, categoryInfo }
 */
export const useMenuData = () => {
  // tabs: 카테고리 이름 배열
  const tabs = useMemo(() => 
    menuData.categoryInfo?.map(cat => cat.cate_name) || [],
    []
  );

  // totalMenuItems: 메뉴 아이템 배열
  const totalMenuItems = useMemo(() => 
    menuData.menuList || [],
    []
  );

  // categoryInfo: 카테고리 정보 배열 (cate_id로 필터링용)
  const categoryInfo = useMemo(() => 
    menuData.categoryInfo || [],
    []
  );

  return { menuData, tabs, totalMenuItems, categoryInfo };
};
