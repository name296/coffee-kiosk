import React, { memo, useMemo } from "react";
import Button from "./Button";
import Icon from "../Icon";

// 이전 버튼 컴포넌트
const PaginationPrevButton = memo(({ label, icon, onClick, className }) => (
    <Button 
        label={label} 
        svg={icon}
        onClick={onClick}
        className={className}
    />
));
PaginationPrevButton.displayName = 'PaginationPrevButton';

// 쪽매김 (페이지 번호) 컴포넌트
const PaginationPageNumber = memo(({ pageNumber, totalPages }) => (
    <span className="pagination-page-number">
        <span className="pagination-page-current">{pageNumber}</span>
        <span className="pagination-separator">&nbsp;/&nbsp;</span>
        <span className="pagination-page-total">{totalPages || 1}</span>
    </span>
));
PaginationPageNumber.displayName = 'PaginationPageNumber';

// 다음 버튼 컴포넌트
const PaginationNextButton = memo(({ label, icon, onClick, className }) => (
    <Button 
        label={label} 
        svg={icon}
        onClick={onClick}
        iconFirst={false}
        className={className}
    />
));
PaginationNextButton.displayName = 'PaginationNextButton';

// 페이지네이션
const Pagination = memo(({
    pageNumber,
    totalPages,
    onPrev,
    onNext,
    isDark,
    ttsPrefix = "메뉴",
    sectionRef,
    style,
    className,
    direction = "horizontal",
    showPageNumber = true,
    prevLabel = "이전",
    nextLabel = "다음",
    prevIcon = <Icon name="ArrowLeft" />,
    nextIcon = <Icon name="ArrowRight" />
}) => {
    const containerStyle = useMemo(() => {
        const baseStyle = style || {};
        const flexDirection = direction === "vertical" ? "column" : "row";
        return {
            ...baseStyle,
            flexFlow: `${flexDirection} nowrap`
        };
    }, [style, direction]);

    const containerClassName = useMemo(() => {
        const classes = ['pagination'];
        if (direction === "vertical") classes.push('pagination-vertical');
        if (className) classes.push(className);
        return classes.join(' ');
    }, [direction, className]);

    return (
        <div
            className={containerClassName}
            style={containerStyle}
            ref={sectionRef}
            data-tts-text={`페이지네이션, ${ttsPrefix}, ${totalPages} 페이지 중 ${pageNumber} 페이지, 버튼 두 개,`}
        >
            <PaginationPrevButton 
                label={prevLabel}
                icon={prevIcon}
                onClick={onPrev}
            />
            {showPageNumber && (
                <PaginationPageNumber 
                    pageNumber={pageNumber}
                    totalPages={totalPages}
                />
            )}
            <PaginationNextButton 
                label={nextLabel}
                icon={nextIcon}
                onClick={onNext}
            />
        </div>
    );
});
Pagination.displayName = 'Pagination';

export default Pagination;
export { PaginationPrevButton, PaginationPageNumber, PaginationNextButton };
