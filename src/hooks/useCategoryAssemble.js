import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { useBreakpointsPageSlicer } from "./usePageSlicer";

/** getBoundingClientRect() 기준이므로 스케일 적용된 화면 픽셀. 이 값보다 갭이 크면 isCompact */
const ACTUAL_GAP_THRESHOLD = 128;
/** ResizeObserver에서 폭 변화로 재계산 트리거할 최소 픽셀 차이. 미세한 float 변화 무시 */
const WIDTH_CHANGE_THRESHOLD = 1;

/**
 * 카테고리 조립: 가변 너비 버튼 + 페이지네이션 제어.
 * 측정용(measureRef)·시각화용(containerRef) 컨테이너 폭을 감시해 breakpoints를 계산하고,
 * useBreakpointsPageSlicer로 currentItems(현재 페이지 구간)를 제공.
 * @param {Array<{id, name}>} items - 카테고리 탭 목록
 * @param {boolean} [isLarge=false] - 큰글씨 등 레이아웃 모드
 * @param {string|null} [selectedItemName=null] - 현재 선택된 탭 name. 브레이크포인트 변경 시 해당 로우로 이동
 * @returns {{ containerRef, measureRef, currentPage, totalPages, currentItems, hasPrev, hasNext, prevPage, nextPage, isCompact, isReady }}
 */
export const useCategoryAssemble = (items, isLarge = false, selectedItemName = null) => {
    const safeItems = useMemo(() => items ?? [], [items]);

    const containerRef = useRef(null);
    const measureRef = useRef(null);
    const [pageBreakpoints, setPageBreakpoints] = useState([0]);
    const [calcTrigger, setCalcTrigger] = useState(0);
    const [isCompact, setIsCompact] = useState(false);
    const [isReady, setIsReady] = useState(safeItems.length === 0);

    const prevIsLargeRef = useRef(isLarge);
    const resetPageRef = useRef(null);
    const lastMeasureWidthRef = useRef(0);
    const lastContainerWidthRef = useRef(0);
    const isCalculatingRef = useRef(false);
    const itemsRef = useRef(safeItems);

    // items 변경 시 breakpoint 재계산 트리거. 비교는 id/name만 사용(목록 교체·이름 변경 감지).
    // 다른 필드만 바뀌면 감지 안 됨. 필요 시 비교 필드 확대 또는 상위에서 items 참조 안정화.
    useEffect(() => {
        const currentItems = itemsRef.current;
        const changed = safeItems.length !== currentItems.length ||
            safeItems.some((item, idx) => !currentItems[idx] || item.id !== currentItems[idx].id || item.name !== currentItems[idx].name);
        if (changed) {
            itemsRef.current = safeItems;
            setCalcTrigger(t => t + 1);
        }
    }, [safeItems]);

    const {
        pageNumber,
        totalPages,
        currentItems,
        handlePrevPage,
        handleNextPage,
        resetPage,
        setPageNumber
    } = useBreakpointsPageSlicer(safeItems, pageBreakpoints);
    resetPageRef.current = resetPage;

    useEffect(() => {
        if (prevIsLargeRef.current !== isLarge) {
            prevIsLargeRef.current = isLarge;
            setCalcTrigger(t => t + 1);
            resetPageRef.current?.();
        }
    }, [isLarge]);

    // 브레이크포인트가 바뀌면 totalPages/currentItems는 useBreakpointsPageSlicer에서 자동 반영. 페이지는 유효 범위로 보정.
    useEffect(() => {
        const maxPage = Math.max(1, totalPages);
        if (pageNumber > maxPage) {
            setPageNumber(maxPage);
        }
    }, [totalPages, pageNumber, setPageNumber]);

    // 브레이크포인트 변경 시 현재 선택된 탭이 있는 로우(페이지)로 이동
    useEffect(() => {
        const selectedIndex = selectedItemName != null
            ? safeItems.findIndex((item) => item.name === selectedItemName)
            : -1;
        if (selectedIndex < 0) {
            setPageNumber(1);
            return;
        }
        for (let p = 0; p < pageBreakpoints.length; p++) {
            const start = pageBreakpoints[p];
            const end = pageBreakpoints[p + 1] ?? safeItems.length;
            if (selectedIndex >= start && selectedIndex < end) {
                setPageNumber(p + 1);
                return;
            }
        }
        const maxPage = Math.max(1, pageBreakpoints.length);
        setPageNumber(maxPage);
    }, [pageBreakpoints, safeItems, selectedItemName, setPageNumber]);

    const calculate = useCallback(() => {
        if (isCalculatingRef?.current) return;

        const currentItems = itemsRef.current;

        if (!measureRef.current || !containerRef.current) {
            if (currentItems.length === 0) setIsReady(true);
            else setIsReady(false);
            isCalculatingRef.current = false;
            return;
        }

        isCalculatingRef.current = true;
        // 재계산 중에는 이전 내용 유지(visibility 유지). setIsReady(false) 시 번쩍임 발생.

        const containerWidth = containerRef.current.clientWidth;
        if (containerWidth <= 0) {
            setIsReady(false);
            isCalculatingRef.current = false;
            return;
        }

        const gap = parseFloat(getComputedStyle(containerRef.current).gap) || 0;

        const buttons = measureRef.current.querySelectorAll('.button');
        if (!buttons.length) {
            setPageBreakpoints([0]);
            setIsReady(true);
            isCalculatingRef.current = false;
            return;
        }

        const separator = measureRef.current.querySelector('.category-separator');
        const separatorWidth = separator ? separator.offsetWidth : 0;

        const breakpoints = [0];
        let accumulatedWidth = 0;
        let lineButtonCount = 0;

        for (let i = 0; i < buttons.length; i++) {
            const btnWidth = buttons[i].offsetWidth;
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

        setPageBreakpoints(breakpoints);
        setIsReady(true);
        isCalculatingRef.current = false;
    }, []);

    // DOM 측정·브레이크포인트: 페인트 전에 맞춰 visibility 전환 시 깜빡임 완화
    useLayoutEffect(() => {
        const currentItems = itemsRef.current;
        const measureEl = measureRef.current;
        const containerEl = containerRef.current;

        if (!measureEl) {
            if (currentItems.length > 0) {
                setIsReady(true);
                setPageBreakpoints([0]);
            }
            return;
        }

        const buttons = measureEl.querySelectorAll('.button');
        if (!buttons.length) {
            setIsReady(true);
            setPageBreakpoints([0]);
            return;
        }

        // 폭 변화 시 동기 재계산(rAF 없음). isCalculatingRef로 콜백 재진입 시 스킵.
        const observer = new ResizeObserver((entries) => {
            if (isCalculatingRef.current) return;
            let shouldRecalc = false;
            for (const entry of entries) {
                const newWidth = entry?.contentRect?.width ?? 0;
                const target = entry?.target;
                if (target === measureEl && Math.abs(newWidth - lastMeasureWidthRef.current) > WIDTH_CHANGE_THRESHOLD) {
                    lastMeasureWidthRef.current = newWidth;
                    shouldRecalc = true;
                }
                if (target === containerEl && Math.abs(newWidth - lastContainerWidthRef.current) > WIDTH_CHANGE_THRESHOLD) {
                    lastContainerWidthRef.current = newWidth;
                    shouldRecalc = true;
                }
            }
            if (shouldRecalc) {
                calculate();
            }
        });

        lastMeasureWidthRef.current = measureEl.clientWidth;
        observer.observe(measureEl);
        if (containerEl) {
            lastContainerWidthRef.current = containerEl.clientWidth;
            observer.observe(containerEl);
        }

        calculate();

        return () => {
            observer.disconnect();
        };
    }, [safeItems.length, calcTrigger, calculate]);

    // 실제 렌더된 탭 간격으로 compact 판정 — 레이아웃 직후 측정
    useLayoutEffect(() => {
        if (!isReady || !containerRef.current) return;

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
    }, [isReady, currentItems]);

    return {
        containerRef,
        measureRef,
        currentPage: pageNumber,
        totalPages,
        currentItems,
        hasPrev: totalPages > 1,
        hasNext: totalPages > 1,
        prevPage: handlePrevPage,
        nextPage: handleNextPage,
        isCompact,
        isReady
    };
};
