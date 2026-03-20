import React, { memo } from "react";

/**
 * 페이지네이션 인디케이터. 정보만 받아서 렌더.
 * 카테고리 등 다른 스타일은 부모에서 CSS로 오버라이드.
 */
const PaginationIndicator = memo(({ pageNumber, totalPages }) => {
    const total = totalPages || 1;
    return (
        <span className="indicator">
            <span className="primary current">{pageNumber}</span>
            <span className="pagination-separator">/</span>
            <span className="total">{total}</span>
        </span>
    );
});
PaginationIndicator.displayName = "PaginationIndicator";

export default PaginationIndicator;
