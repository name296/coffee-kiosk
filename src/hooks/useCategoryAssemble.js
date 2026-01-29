import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePagination } from "./usePagination";

// 카테고리 조립 (가변 너비 버튼 + 페이지네이션 제어)
const ACTUAL_GAP_THRESHOLD = 64;

export const useCategoryAssemble = (items, isLarge = false) => {
    const containerRef = useRef(null);
    const measureRef = useRef(null);
    const [pageBreakpoints, setPageBreakpoints] = useState([0]);
    const [calcTrigger, setCalcTrigger] = useState(0);
    const [isCompact, setIsCompact] = useState(false);
    const [isReady, setIsReady] = useState(items.length === 0);

    const recalculate = useCallback(() => {
        setCalcTrigger(t => t + 1);
    }, []);

    const prevIsLargeRef = useRef(isLarge);
    const lastWidthRef = useRef(0);
    const isCalculatingRef = useRef(false);
    const itemsRef = useRef(items);

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

    useEffect(() => {
        if (prevIsLargeRef.current !== isLarge) {
            prevIsLargeRef.current = isLarge;
            setCalcTrigger(t => t + 1);
            resetPage();
        }
    }, [isLarge, resetPage]);

    useEffect(() => {
        const maxPage = Math.max(1, totalPages);
        if (pageNumber > maxPage) {
            setPageNumber(maxPage);
        }
    }, [totalPages, pageNumber, setPageNumber]);

    const calculate = useCallback(() => {
        if (isCalculatingRef?.current) return;

        const currentItems = itemsRef.current;

        if (!measureRef.current || !containerRef.current) {
            if (currentItems.length === 0) {
                setIsReady(true);
            }
            return;
        }

        isCalculatingRef.current = true;
        setIsReady(false);

        const containerWidth = containerRef.current.clientWidth;
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

    useEffect(() => {
        const currentItems = itemsRef.current;

        if (!measureRef.current) {
            if (currentItems.length > 0) {
                setIsReady(true);
                setPageBreakpoints([0]);
            }
            return;
        }

        const firstButton = measureRef.current.querySelector('.button');
        if (!firstButton) {
            setIsReady(true);
            setPageBreakpoints([0]);
            return;
        }

        const observer = new ResizeObserver((entries) => {
            if (isCalculatingRef.current) return;

            const newWidth = entries[0]?.contentRect.width || 0;
            if (Math.abs(newWidth - lastWidthRef.current) > 1) {
                lastWidthRef.current = newWidth;
                calculate();
            }
        });

        observer.observe(firstButton);

        if (measureRef.current && containerRef.current) {
            calculate();
        }

        window.addEventListener('resize', calculate);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', calculate);
        };
    }, [items.length, calcTrigger, calculate]);

    const pagedItems = useMemo(() => {
        const currentItems = itemsRef.current;
        return pageBreakpoints.map((start, idx) => {
            const end = pageBreakpoints[idx + 1] ?? currentItems.length;
            return currentItems.slice(start, end);
        });
    }, [pageBreakpoints]);

    useEffect(() => {
        const pageIndex = Math.max(0, Math.min(pageNumber - 1, pageBreakpoints.length - 1));
        if (pageBreakpoints.length > 0 && pageIndex >= 0 && pageIndex < pageBreakpoints.length) {
            setIsReady(true);
        }
    }, [pageNumber, pageBreakpoints.length]);

    useEffect(() => {
        if (!isReady || !containerRef.current) return;

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
        currentPage: pageNumber,
        totalPages,
        currentItems,
        pagedItems,
        pageBreakpoints,
        hasPrev: totalPages > 1,
        hasNext: totalPages > 1,
        prevPage: handlePrevPage,
        nextPage: handleNextPage,
        recalculate,
        isCompact,
        isReady
    };
};
