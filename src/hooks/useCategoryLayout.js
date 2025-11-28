// ============================================================================
// 카테고리 레이아웃 계산 훅
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 카테고리 컨테이너의 레이아웃을 계산하는 커스텀 훅
 * @param {number} tabsCount - 탭 개수
 * @returns {Object} { categoryContainerRef, categoryLayout }
 */
export const useCategoryLayout = (tabsCount) => {
  const categoryContainerRef = useRef(null);
  const lastWidthRef = useRef(0); // 마지막 컨테이너 너비 저장
  const isInitializedRef = useRef(false); // 초기화 완료 여부
  // 초기값: 충분히 큰 값 (계산 전까지 모두 표시)
  const [categoryLayout, setCategoryLayout] = useState({
    itemsPerRow: 999,
    rowsPerPage: 1,
    itemsPerPage: 999
  });

  const calculateLayout = useCallback(() => {
    if (!categoryContainerRef.current) return;

    const container = categoryContainerRef.current;
    const containerWidth = container.clientWidth;
    
    // 컨테이너 너비가 0이면 스킵
    if (containerWidth === 0) return;
    
    // 컨테이너 너비가 변경되지 않았으면 스킵 (무한 루프 방지)
    if (isInitializedRef.current && Math.abs(containerWidth - lastWidthRef.current) < 10) {
      return;
    }
    
    const firstButton = container.querySelector('.button');
    
    // 버튼이 없거나 렌더링되지 않은 경우 - 기본값 사용
    const buttonWidth = firstButton?.offsetWidth || 80; // 기본 버튼 너비 80px
    const gap = 4; // gap: 4px
    
    // 한 줄에 들어갈 수 있는 버튼 개수 계산
    const itemsPerRow = Math.max(1, Math.floor((containerWidth + gap) / (buttonWidth + gap)));
    
    // 한 줄만 표시하도록 설정
    const rowsPerPage = 1;
    const itemsPerPage = itemsPerRow * rowsPerPage;
    
    lastWidthRef.current = containerWidth;
    isInitializedRef.current = true;
    
    // 렌더링 충돌 방지를 위해 다음 tick에서 실행
    setTimeout(() => {
      setCategoryLayout(prev => {
        // 값이 변경된 경우에만 업데이트
        if (prev.itemsPerRow !== itemsPerRow) {
          console.log(`📐 [CategoryLayout] ${itemsPerRow}개/줄 (컨테이너: ${containerWidth}px, 버튼: ${buttonWidth}px)`);
          return {
            itemsPerRow,
            rowsPerPage,
            itemsPerPage
          };
        }
        return prev;
      });
    }, 0);
  }, []);

  useEffect(() => {
    // 초기화 상태 리셋
    isInitializedRef.current = false;
    lastWidthRef.current = 0;

    // 초기 계산 (렌더링 완료 후)
    const timer = setTimeout(calculateLayout, 100);

    // 윈도우 리사이즈만 감지 (ResizeObserver 대신)
    const handleResize = () => {
      requestAnimationFrame(calculateLayout);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [tabsCount, calculateLayout]);

  return { categoryContainerRef, categoryLayout };
};

