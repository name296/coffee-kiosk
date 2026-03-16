import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePageSlicer } from "./usePageSlicer";

// 카테고리 조립 (가변 너비 버튼 + 페이지네이션 제어)
/** getBoundingClientRect() 기준이므로 스케일 적용된 화면 픽셀. 이 값보다 갭이 크면 isCompact */
const ACTUAL_GAP_THRESHOLD = 128;

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
    const resetPageRef = useRef(null);
    const lastWidthRef = useRef(null);
    const lastContainerWidthRef = useRef(0);
    const lastGapRef = useRef(0);
    const lastSeparatorWidthRef = useRef(0);
    const isCalculatingRef = useRef(false);
    const rafCalculateRef = useRef(null);
    const itemsRef = useRef(items);

    // items 변경 시 breakpoint 재계산 트리거. 비교는 id/name만 사용(목록 교체·이름 변경 감지).
    // 다른 필드만 바뀌면 감지 안 됨. 필요 시 비교 필드 확대 또는 상위에서 items 참조 안정화.
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
    resetPageRef.current = resetPage;

    useEffect(() => {
        if (prevIsLargeRef.current !== isLarge) {
            prevIsLargeRef.current = isLarge;
            setCalcTrigger(t => t + 1);
            resetPageRef.current?.();
        }
    }, [isLarge]);

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
            if (currentItems.length === 0) setIsReady(true);
            isCalculatingRef.current = false;
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

        const separator = measureRef.current.querySelector('.category-separator');

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

                if (target === separator) {
                    if (Math.abs(newWidth - lastSeparatorWidthRef.current) > 1) {
                        lastSeparatorWidthRef.current = newWidth;
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

            if (containerRef.current) {
                const gap = parseFloat(getComputedStyle(containerRef.current).gap) || 0;
                if (Math.abs(gap - lastGapRef.current) > 1) {
                    lastGapRef.current = gap;
                    shouldRecalc = true;
                }
            }

            if (shouldRecalc) {
                if (rafCalculateRef.current != null) cancelAnimationFrame(rafCalculateRef.current);
                rafCalculateRef.current = requestAnimationFrame(() => {
                    rafCalculateRef.current = null;
                    calculate();
                });
            }
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
            lastGapRef.current = parseFloat(getComputedStyle(containerRef.current).gap) || 0;
            observer.observe(containerRef.current);
        }

        if (separator) {
            lastSeparatorWidthRef.current = separator.offsetWidth;
            observer.observe(separator);
        }

        // calcTrigger/items.length가 바뀌었을 때는 ResizeObserver만 믿지 않고 한 번은 반드시 재계산
        const rafId = requestAnimationFrame(() => {
            calculate();
        });

        return () => {
            cancelAnimationFrame(rafId);
            if (rafCalculateRef.current != null) cancelAnimationFrame(rafCalculateRef.current);
            observer.disconnect();
        };
    }, [items.length, calcTrigger, calculate]);

    // 현재 미사용(반환값은 usePageSlicer의 currentItems). 사용할 경우 deps에 items 포함해 stale 방지.
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
        hasPrev: totalPages > 1,
        hasNext: totalPages > 1,
        prevPage: handlePrevPage,
        nextPage: handleNextPage,
        isCompact,
        isReady
    };
};
