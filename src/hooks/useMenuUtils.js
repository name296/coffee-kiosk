// ============================================================================
// 메뉴 유틸리티 커스텀 훅
// 메뉴 데이터는 useMenuData 훅에서 동적으로 로드
// ============================================================================

import { useCallback } from 'react';

// ============================================================================
// 상수
// ============================================================================

const PLACEHOLDER_MENU_ITEM = {
  id: 0,
  name: "추가예정",
  price: "0",
  img: "item-americano.png",
};

// ============================================================================
// 메뉴 유틸리티 훅
// ============================================================================

/**
 * 메뉴 관련 유틸리티 함수들을 제공하는 커스텀 훅
 */
export const useMenuUtils = () => {
  /**
   * 메뉴를 카테고리별로 분류 (JSON cate_id 기반)
   * @param {Array} totalMenuItems - 전체 메뉴 아이템
   * @param {string} selectedTab - 선택된 탭 이름
   * @param {Array} categoryInfo - 카테고리 정보 배열
   */
  const categorizeMenu = useCallback((totalMenuItems, selectedTab, categoryInfo = []) => {
    // 전체메뉴면 모든 메뉴 반환
    if (selectedTab === "전체메뉴") {
      return totalMenuItems;
    }

    // 선택된 탭의 cate_id 찾기
    const category = categoryInfo.find(cat => cat.cate_name === selectedTab);
    
    if (!category) {
      // 카테고리를 찾지 못하면 placeholder 반환
      return [PLACEHOLDER_MENU_ITEM];
    }

    // cate_id로 메뉴 필터링
    const filteredItems = totalMenuItems.filter(item => item.cate_id === category.cate_id);
    
    // 필터링된 메뉴가 없으면 placeholder 반환
    return filteredItems.length > 0 ? filteredItems : [PLACEHOLDER_MENU_ITEM];
  }, []);

  /**
   * 수량의 총합 계산
   */
  const calculateSum = useCallback((quantities) => {
    return Number(
      Object.values(quantities).reduce((sum, value) => sum + value, 0)
    );
  }, []);

  /**
   * 총 금액 계산
   */
  const calculateTotal = useCallback((quantities, menuItems) => {
    return Object.entries(quantities)
      .filter(([key, value]) => value !== 0)
      .reduce((sum, [key, value]) => {
        const priceObj = menuItems[key - 1];
        const price = priceObj ? priceObj.price : 0;
        return Number(sum) + Number(value) * Number(price);
      }, 0);
  }, []);

  /**
   * 수량이 0이 아닌 메뉴 아이템 필터링
   */
  const filterMenuItems = useCallback((menuItems, quantities) => {
    return menuItems.filter((item) => quantities[item.id] !== 0);
  }, []);

  /**
   * 주문 아이템 생성 (수량 포함)
   */
  const createOrderItems = useCallback((menuItems, quantities) => {
    return menuItems
      .filter((item) => quantities[item.id] !== 0)
      .map((item) => ({
        ...item,
        quantity: quantities[item.id],
      }));
  }, []);

  return {
    categorizeMenu,
    calculateSum,
    calculateTotal,
    filterMenuItems,
    createOrderItems,
  };
};

