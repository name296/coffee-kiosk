import { useState, useMemo, useCallback } from "react";

export const usePagination = (items, itemsPerPageNormal, itemsPerPageLow, isLow) => {
    const itemsPerPage = isLow ? itemsPerPageLow : itemsPerPageNormal;
    const [pageNumber, setPageNumber] = useState(1);

    const totalPages = useMemo(() =>
        (!items || items.length === 0) ? 1 : Math.ceil(items.length / itemsPerPage),
        [items, itemsPerPage]
    );

    const currentItems = useMemo(() => {
        if (!items || items.length === 0) return [];
        const s = (pageNumber - 1) * itemsPerPage;
        return items.slice(s, s + itemsPerPage);
    }, [items, pageNumber, itemsPerPage]);

    const handlePrevPage = useCallback(() => setPageNumber(p => p > 1 ? p - 1 : totalPages), [totalPages]);
    const handleNextPage = useCallback(() => setPageNumber(p => p < totalPages ? p + 1 : 1), [totalPages]);
    const goToPage = useCallback((p) => { if (p >= 1 && p <= totalPages) setPageNumber(p); }, [totalPages]);
    const resetPage = useCallback(() => setPageNumber(1), []);

    return {
        pageNumber, totalPages, currentItems, itemsPerPage,
        handlePrevPage, handleNextPage, goToPage, resetPage, setPageNumber
    };
};
