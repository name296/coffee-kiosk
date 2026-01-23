import { useState, useMemo, useCallback } from "react";

export const usePagination = (items, itemsPerPageNormal, itemsPerPageLow, isLow, breakpoints) => {
    const useBreakpoints = Array.isArray(breakpoints) && breakpoints.length > 0;
    const normalizedBreakpoints = useMemo(() => {
        if (!useBreakpoints) return null;
        if (breakpoints[0] === 0) return breakpoints;
        return [0, ...breakpoints];
    }, [useBreakpoints, breakpoints]);

    const itemsPerPage = useBreakpoints ? null : (isLow ? itemsPerPageLow : itemsPerPageNormal);
    const [pageNumber, setPageNumber] = useState(1);

    const totalPages = useMemo(() =>
        useBreakpoints
            ? Math.max(1, normalizedBreakpoints.length)
            : (!items || items.length === 0) ? 1 : Math.ceil(items.length / itemsPerPage),
        [items, itemsPerPage, useBreakpoints, normalizedBreakpoints]
    );

    const currentItems = useMemo(() => {
        if (!items || items.length === 0) return [];
        if (useBreakpoints) {
            const start = normalizedBreakpoints[pageNumber - 1] ?? 0;
            const end = normalizedBreakpoints[pageNumber] ?? items.length;
            return items.slice(start, end);
        }
        const s = (pageNumber - 1) * itemsPerPage;
        return items.slice(s, s + itemsPerPage);
    }, [items, pageNumber, itemsPerPage, useBreakpoints, normalizedBreakpoints]);

    const pageSize = useMemo(() => (
        useBreakpoints ? currentItems.length : itemsPerPage
    ), [useBreakpoints, currentItems.length, itemsPerPage]);

    const handlePrevPage = useCallback(() => setPageNumber(p => p > 1 ? p - 1 : totalPages), [totalPages]);
    const handleNextPage = useCallback(() => setPageNumber(p => p < totalPages ? p + 1 : 1), [totalPages]);
    const goToPage = useCallback((p) => { if (p >= 1 && p <= totalPages) setPageNumber(p); }, [totalPages]);
    const resetPage = useCallback(() => setPageNumber(1), []);

    return {
        pageNumber,
        totalPages,
        currentItems,
        itemsPerPage: pageSize,
        handlePrevPage,
        handleNextPage,
        goToPage,
        resetPage,
        setPageNumber
    };
};
