import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePageSlicer } from "./usePageSlicer";

// 카테고리 조립 (가변 너비 버튼 + 페이지네이션 제어)
const ACTUAL_GAP_THRESHOLD = 96;

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
    const lastWidthRef = useRef(null);
    const lastContainerWidthRef = useRef(0);
    const isCalculatingRef = useRef(false);
    const itemsRef = useRef(items);

    useEffect(() => {
        const currentItems = itemsRef.current;
        const changed = items.length !== currentItems.length ||
            items.some((item, idx) => !currentItems[idx] || item.id !== currentItems[idx].id || item.name !== currentItems[idx].name);
        if (changed) {
            itemsRef.current = items;
            setCalcTrigger(t => t + 1);
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
    } = usePageSlicer(items, 1, 1, false, pageBreakpoints);

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
        if (containerWidth <= 0) {
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

    useEffect(() => {
        const currentItems = itemsRef.current;

        if (!measureRef.current) {
            if (currentItems.length > 0) {
                setIsReady(true);
                setPageBreakpoints([0]);
            }
            return;
        }

        const buttons = measureRef.current.querySelectorAll('.button');
        if (!buttons.length) {
            setIsReady(true);
            setPageBreakpoints([0]);
            return;
        }

        const observer = new ResizeObserver((entries) => {
            if (isCalculatingRef.current) return;

            const observedWidths = lastWidthRef.current;
            let shouldRecalc = false;

            for (const entry of entries) {
                const newWidth = entry?.contentRect?.width ?? 0;
                const target = entry?.target;

                if (target === containerRef.current) {
                    if (Math.abs(newWidth - lastContainerWidthRef.current) > 1) {
                        lastContainerWidthRef.current = newWidth;
                        shouldRecalc = true;
                    }
                    continue;
                }

                if (!observedWidths) continue;
                const key = target?.dataset?.observeKey ?? Array.from(buttons).indexOf(target);
                if (key === -1) continue;
                const prev = observedWidths[key];
                if (prev === undefined || Math.abs(newWidth - prev) > 1) {
                    observedWidths[key] = newWidth;
                    shouldRecalc = true;
                }
            }
            if (shouldRecalc) calculate();
        });

        const observedWidths = {};
        buttons.forEach((btn, i) => {
            btn.dataset.observeKey = String(i);
            observedWidths[i] = btn.offsetWidth;
            observer.observe(btn);
        });
        lastWidthRef.current = observedWidths;

        if (containerRef.current) {
            lastContainerWidthRef.current = containerRef.current.clientWidth;
            observer.observe(containerRef.current);
        }

        const handleResize = () => requestAnimationFrame(calculate);
        window.addEventListener('resize', handleResize);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
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
