import { useState, useMemo, useCallback } from 'react';

/**
 * 페이지네이션 로직을 관리하는 커스텀 훅
 * @param {Array} items - 페이지네이션할 아이템 배열
 * @param {number} itemsPerPageNormal - 일반 모드에서 페이지당 아이템 수
 * @param {number} itemsPerPageLow - 저시력 모드에서 페이지당 아이템 수
 * @param {boolean} isLow - 저시력 모드 여부
 * @returns {Object} 페이지네이션 관련 상태와 함수
 */
export const usePagination = (items, itemsPerPageNormal, itemsPerPageLow, isLow) => {
  const itemsPerPage = isLow ? itemsPerPageLow : itemsPerPageNormal;
  const [pageNumber, setPageNumber] = useState(1);

  // 총 페이지 수 계산 (메모이제이션)
  const totalPages = useMemo(() => {
    if (!items || items.length === 0) return 1;
    return Math.ceil(items.length / itemsPerPage);
  }, [items, itemsPerPage]);

  // 현재 페이지의 아이템들 (메모이제이션)
  const currentItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const startIndex = (pageNumber - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, pageNumber, itemsPerPage]);

  // 이전 페이지로 이동
  const handlePrevPage = useCallback(() => {
    setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  // 다음 페이지로 이동
  const handleNextPage = useCallback(() => {
    setPageNumber((prev) => (prev < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  // 특정 페이지로 이동
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setPageNumber(page);
    }
  }, [totalPages]);

  // 첫 페이지로 리셋
  const resetPage = useCallback(() => {
    setPageNumber(1);
  }, []);

  // selectedTab이나 items가 변경되면 첫 페이지로 리셋
  const resetOnChange = useCallback(() => {
    setPageNumber(1);
  }, []);

  return {
    pageNumber,
    totalPages,
    currentItems,
    itemsPerPage,
    handlePrevPage,
    handleNextPage,
    goToPage,
    resetPage,
    resetOnChange,
    setPageNumber,
  };
};

