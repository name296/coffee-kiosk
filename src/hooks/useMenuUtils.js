// ============================================================================
// 메뉴 유틸리티 커스텀 훅
// ============================================================================

import { useCallback, useMemo } from 'react';
import { getAssetPath } from '../utils/pathUtils';
import menuData from '../../public/menu_data.json';

// ============================================================================
// 상수
// ============================================================================

// JSON에서 카테고리 정보를 가져와서 탭 배열 생성
export const MENU_TABS = menuData.categoryInfo.map(category => category.cate_name);

export const DEFAULT_MENU_ITEMS = [
  {
    id: 1,
    name: "아메리카노 (아이스)",
    price: "2500",
    img: getAssetPath("/images/item-아메리카노.svg"),
  },
  {
    id: 2,
    name: "바닐라라떼 (아이스)",
    price: "2500",
    img: getAssetPath("/images/item-바닐라라떼.svg"),
  },
  {
    id: 3,
    name: "콜드브루 디카페인",
    price: "2900",
    img: getAssetPath("/images/item-콜드브루.svg"),
  },
  { 
    id: 4, 
    name: "흑당라떼", 
    price: "2500", 
    img: getAssetPath("/images/item-흑당라떼.svg") 
  },
  { 
    id: 5, 
    name: "딸기라떼", 
    price: "2500", 
    img: getAssetPath("/images/item-딸기라떼.svg") 
  },
  {
    id: 6,
    name: "미숫가루 달고나라떼",
    price: "2500",
    img: getAssetPath("/images/item-달고나라떼.svg"),
  },
  {
    id: 7,
    name: "콜드브루 (아이스)",
    price: "2500",
    img: getAssetPath("/images/item-콜드브루.svg"),
  },
  {
    id: 8,
    name: "바닐라라떼 (아이스)",
    price: "2500",
    img: getAssetPath("/images/item-바닐라라떼.svg"),
  },
  {
    id: 9,
    name: "딸기라떼 (아이스)",
    price: "2500",
    img: getAssetPath("/images/item-딸기라떼.svg"),
  },
  {
    id: 10,
    name: "카라멜 마끼아또",
    price: "3000",
    img: getAssetPath("/images/item-바닐라라떼.svg"),
  },
  {
    id: 11,
    name: "녹차라떼",
    price: "2800",
    img: getAssetPath("/images/item-달고나라떼.svg"),
  },
  {
    id: 12,
    name: "헤이즐넛라떼",
    price: "2900",
    img: getAssetPath("/images/item-콜드브루.svg"),
  },
];

const PLACEHOLDER_MENU_ITEM = {
  id: 13,
  name: "추가예정",
  price: "0",
  img: getAssetPath("/images/item-아메리카노.svg"),
};

// ============================================================================
// 메뉴 유틸리티 훅
// ============================================================================

/**
 * 메뉴 관련 유틸리티 함수들을 제공하는 커스텀 훅
 */
export const useMenuUtils = () => {
  /**
   * 메뉴를 카테고리별로 분류
   */
  const categorizeMenu = useCallback((totalMenuItems, selectedTab) => {
    const categorizedMenu = {
      전체메뉴: totalMenuItems,
      커피: totalMenuItems.filter(
        (item) =>
          item.name.includes("아메리카노") ||
          item.name.includes("콜드브루") ||
          item.name.includes("마끼아또")
      ),
      라떼: totalMenuItems.filter((item) => item.name.includes("라떼")),
    };

    if (selectedTab === "전체메뉴") {
      return categorizedMenu.전체메뉴;
    } else if (selectedTab === "커피") {
      return categorizedMenu.커피;
    } else if (selectedTab === "라떼") {
      return categorizedMenu.라떼;
    } else {
      return [PLACEHOLDER_MENU_ITEM];
    }
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

// ============================================================================
// 상수 export
// ============================================================================

export const tabs = MENU_TABS;
export const totalMenuItems = DEFAULT_MENU_ITEMS;

