// ============================================================================
// 주문 번호 관리 훅
// ============================================================================

import { useState, useCallback } from 'react';
import { safeParseInt, safeLocalStorage } from '../utils/browserCompatibility';
import { STORAGE_KEYS } from '../config/appConfig';

/**
 * 주문 번호를 관리하는 커스텀 훅
 * @returns {Object} { orderNum, updateOrderNumber }
 */
export const useOrderNumber = () => {
  const [orderNum, setOrderNum] = useState(0);

  const updateOrderNumber = useCallback(() => {
    const currentNum = safeParseInt(safeLocalStorage.getItem(STORAGE_KEYS.ORDER_NUM), 0);
    const tmpOrderNum = currentNum + 1;

    safeLocalStorage.setItem(STORAGE_KEYS.ORDER_NUM, tmpOrderNum);
    setOrderNum(tmpOrderNum);

    return tmpOrderNum;
  }, []);

  return { orderNum, updateOrderNumber };
};

