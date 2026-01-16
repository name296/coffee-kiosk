import React, { memo } from "react";
import Button from "./Button";

// 페이지네이션
const Pagination = memo(({ pageNumber, totalPages, onPrev, onNext, isDark, ttsPrefix = "메뉴", sectionRef }) => (
    <div className="pagination" ref={sectionRef} data-tts-text={`페이지네이션, ${ttsPrefix}, ${totalPages} 페이지 중 ${pageNumber} 페이지, 버튼 두 개,`}>
        <Button label="◀ 이전" onClick={onPrev} />
        <span className="pagination-page-number">
            <span className="pagination-page-current">{pageNumber}</span>
            <span className="pagination-separator">&nbsp;/&nbsp;</span>
            <span className="pagination-page-total">{totalPages || 1}</span>
        </span>
        <Button label="다음 ▶" onClick={onNext} />
    </div>
));
Pagination.displayName = 'Pagination';
export default Pagination;
