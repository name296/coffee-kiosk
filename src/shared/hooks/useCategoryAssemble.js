import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePagination } from "./usePagination";

// ============================================================================
// 카테고리 조립 (가변 너비 버튼 + 페이지네이션 제어)
// ============================================================================
//
// [중요] 이 훅은 가변 너비 버튼의 페이지네이션을 처리합니다.
//
const ACTUAL_GAP_THRESHOLD = 128; // 실제 렌더링 간격이 이 값 초과하면 compact 모드

export const useCategoryAssemble = (items, isLarge = false) => {
    const containerRef = useRef(null);  // 실제 표시 컨테이너
    const measureRef = useRef(null);    // 숨겨진 측정용 컨테이너
    const [pageBreakpoints, setPageBreakpoints] = useState([0]); // 페이지별 시작 인덱스
    const [calcTrigger, setCalcTrigger] = useState(0); // 재계산 트리거
    const [isCompact, setIsCompact] = useState(false); // compact 모드
    const [isReady, setIsReady] = useState(items.length === 0); // 최종 표시 준비 (빈 배열이면 바로 표시)

    // 재계산 함수
    const recalculate = useCallback(() => {
        setCalcTrigger(t => t + 1);
    }, []);

    // 로컬 ref로 전환 (RefContext 의존성 제거)
    const prevIsLargeRef = useRef(isLarge);
    const lastWidthRef = useRef(0);
    const isCalculatingRef = useRef(false);
    const itemsRef = useRef(items);

    // items 변경 감지 (내용 비교)
    useEffect(() => {
        const currentItems = itemsRef.current;
        if (items.length !== currentItems.length ||
            items.some((item, idx) => !currentItems[idx] || item.id !== currentItems[idx].id || item.name !== currentItems[idx].name)) {
            itemsRef.current = items;
        }
    }, [items]);

    const {
        pageNumber,
        totalPages,
        currentItems,
        handlePrevPage,
        handleNextPage,
        resetPage,
        setPageNumber
    } = usePagination(items, 1, 1, false, pageBreakpoints);

    // isLarge 변경 감지
    useEffect(() => {
        if (prevIsLargeRef.current !== isLarge) {
            prevIsLargeRef.current = isLarge;
            setCalcTrigger(t => t + 1);
            resetPage();
        }
    }, [isLarge, resetPage]);

    // 페이지 수가 줄어들면 마지막 페이지로 보정
    useEffect(() => {
        const maxPage = Math.max(1, totalPages);
        if (pageNumber > maxPage) {
            setPageNumber(maxPage);
        }
    }, [totalPages, pageNumber, setPageNumber]);

    const calculate = useCallback(() => {
        // 계산 중이면 무시 (무한루프 방지)
        if (isCalculatingRef?.current) return;

        const currentItems = itemsRef.current;

        if (!measureRef.current || !containerRef.current) {
            // ref가 없으면 일단 isReady를 true로 설정 (나중에 재계산됨)
            if (currentItems.length === 0) {
                setIsReady(true);
            }
            return;
        }

        // 계산 중 플래그 설정
        isCalculatingRef.current = true;

        // 새 계산 시작 - 숨기기만 (compact는 실제 측정 후 결정)
        setIsReady(false);

        const containerWidth = containerRef.current.clientWidth;
        const gap = parseFloat(getComputedStyle(containerRef.current).gap) || 0;

        const buttons = measureRef.current.querySelectorAll('.button');
        if (!buttons.length) {
            // 버튼이 없으면 빈 페이지로 설정하고 표시
            setPageBreakpoints([0]);
            setIsReady(true);
            return;
        }

        const separator = measureRef.current.querySelector('.category-separator');
        const separatorWidth = separator ? separator.offsetWidth : 0;

        const breakpoints = [0];
        let accumulatedWidth = 0;
        let lineButtonCount = 0;

        const btnWidths = [];
        for (let i = 0; i < buttons.length; i++) {
            const btnWidth = buttons[i].offsetWidth;
            btnWidths.push(btnWidth);
            const isLast = i === buttons.length - 1;
            const toNextBtnStart = isLast ? btnWidth : btnWidth + gap + separatorWidth + gap;
            const willOverflow = accumulatedWidth + toNextBtnStart > containerWidth && lineButtonCount > 0;

            if (willOverflow) {
                breakpoints.push(i);
                accumulatedWidth = toNextBtnStart;
                lineButtonCount = 1;
            } else {
                accumulatedWidth += toNextBtnStart;
                lineButtonCount++;
            }
        }

        // 상태 일괄 업데이트 (동기적)
        // compact 계산은 렌더링 완료 후 실제 containerRef의 버튼 간격을 측정
        setPageBreakpoints(breakpoints);
        setIsReady(true);

        // 계산 완료 후 플래그 해제
        isCalculatingRef.current = false;
    }, []);

    // ResizeObserver로 버튼 크기 변경 감지
    useEffect(() => {
        const currentItems = itemsRef.current;

        if (!measureRef.current) {
            // measureRef가 없으면 일단 표시 (나중에 연결되면 계산됨)
            if (currentItems.length > 0) {
                setIsReady(true);
                setPageBreakpoints([0]);
            }
            return;
        }

        const firstButton = measureRef.current.querySelector('.button');
        if (!firstButton) {
            // 버튼이 없어도 초기에는 isReady를 true로 설정 (빈 상태라도 표시)
            setIsReady(true);
            setPageBreakpoints([0]);
            return;
        }

        const observer = new ResizeObserver((entries) => {
            // 계산 중이면 무시 (무한루프 방지)
            if (isCalculatingRef.current) return;

            const newWidth = entries[0]?.contentRect.width || 0;
            // 폭이 변경되었을 때만 재계산
            if (Math.abs(newWidth - lastWidthRef.current) > 1) {
                lastWidthRef.current = newWidth;
                calculate();
            }
        });

        observer.observe(firstButton);

        // 초기 계산 - ref가 연결되면 즉시 계산 (동기식)
        if (measureRef.current && containerRef.current) {
            calculate();
        }

        // 윈도우 리사이즈도 감지 (동기식)
        window.addEventListener('resize', calculate);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', calculate);
        };
    }, [items.length, calcTrigger, calculate]);

    // ---------------------------------------------------------------
    // 페이지별 아이템 슬라이싱 (pagedItems)
    // pagedItems[n] = n번째 페이지에 표시될 아이템 배열
    // calculate 함수와 동일하게 itemsRef.current 사용 (일관성 유지)
    // ---------------------------------------------------------------
    const pagedItems = useMemo(() => {
        const currentItems = itemsRef.current;
        return pageBreakpoints.map((start, idx) => {
            const end = pageBreakpoints[idx + 1] ?? currentItems.length;
            return currentItems.slice(start, end);
        });
    }, [pageBreakpoints]); // items는 itemsRef를 통해 접근하므로 의존성 불필요

    // 페이지 변경 시 isReady 복원 (이미 계산된 pageBreakpoints 사용)
    useEffect(() => {
        // pageBreakpoints가 설정되어 있고, currentPage가 유효한 범위 내에 있으면 즉시 표시
        const pageIndex = Math.max(0, Math.min(pageNumber - 1, pageBreakpoints.length - 1));
        if (pageBreakpoints.length > 0 && pageIndex >= 0 && pageIndex < pageBreakpoints.length) {
            setIsReady(true);
        }
    }, [pageNumber, pageBreakpoints.length]);

    // compact 계산: 페이징 후 실제 렌더링된 containerRef의 각 페이지 내부 버튼들 사이 간격 측정
    // 간격이 ACTUAL_GAP_THRESHOLD를 초과하면 compact 모드 활성화 (좌측 정렬)
    useEffect(() => {
        if (!isReady || !containerRef.current) return;

        // requestAnimationFrame으로 다음 프레임에 측정 (렌더링 완료 보장)
        const frameId = requestAnimationFrame(() => {
            const renderedButtons = containerRef.current.querySelectorAll('.button');
            if (renderedButtons.length > 1) {
                let maxGap = 0;
                for (let i = 0; i < renderedButtons.length - 1; i++) {
                    const rect1 = renderedButtons[i].getBoundingClientRect();
                    const rect2 = renderedButtons[i + 1].getBoundingClientRect();
                    const actualGap = rect2.left - rect1.right;
                    maxGap = Math.max(maxGap, actualGap);
                }
                setIsCompact(maxGap > ACTUAL_GAP_THRESHOLD);
            } else {
                setIsCompact(false);
            }
        });

        return () => cancelAnimationFrame(frameId);
    }, [isReady, currentItems]);

    return {
        containerRef,
        measureRef,
        currentPage: pageNumber, // 1-based (UI 표시용)
        totalPages,
        currentItems,        // 현재 페이지 아이템
        pagedItems,          // 모든 페이지별 아이템 배열
        pageBreakpoints,     // 페이지별 시작 인덱스
        hasPrev: totalPages > 1,
        hasNext: totalPages > 1,
        prevPage: handlePrevPage,
        nextPage: handleNextPage,
        recalculate,
        isCompact,           // compact 모드 여부
        isReady              // 계산 완료 후 표시 준비됨
    };
};
