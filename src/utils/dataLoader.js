/**
 * 데이터 로더 유틸리티
 * JSON 파일이나 API에서 데이터를 로드하는 헬퍼 함수
 */

import { getAssetPath } from './pathUtils';

/**
 * JSON 파일에서 메뉴 데이터 로드
 * @param {string} path - JSON 파일 경로
 * @returns {Promise<Object>} 메뉴 데이터
 */
export const loadMenuData = async (path = '/data/menu-data.json') => {
  try {
    const response = await fetch(getAssetPath(path));
    if (!response.ok) {
      throw new Error(`Failed to load menu data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading menu data:', error);
    // 폴백: 기본 데이터 반환
    return getDefaultMenuData();
  }
};

/**
 * 기본 메뉴 데이터 (폴백용)
 * @returns {Object} 기본 메뉴 데이터
 */
const getDefaultMenuData = () => {
  // 기존 menuUtils.js의 데이터를 여기로 이동 가능
  return {
    tabs: ["전체메뉴", "커피", "라떼"],
    menuItems: [],
    categoryFilters: {},
    disabledMenuId: 13,
    placeholderMenu: {
      id: 13,
      name: "추가예정",
      price: "0",
      img: getAssetPath("./public/images/item-아메리카노.svg")
    }
  };
};

/**
 * API에서 데이터 로드 (향후 확장용)
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const loadDataFromAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading data from API:', error);
    throw error;
  }
};

/**
 * 로컬스토리지에서 데이터 로드
 * @param {string} key - 스토리지 키
 * @param {*} defaultValue - 기본값
 * @returns {*} 저장된 데이터 또는 기본값
 */
export const loadDataFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading data from storage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * 로컬스토리지에 데이터 저장
 * @param {string} key - 스토리지 키
 * @param {*} data - 저장할 데이터
 * @returns {boolean} 저장 성공 여부
 */
export const saveDataToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to storage (${key}):`, error);
    return false;
  }
};

