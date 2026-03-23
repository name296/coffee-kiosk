import React, { memo, useMemo } from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

/** 이전 버튼. 정보만 받아서 렌더 */
export const PaginationPrevButton = memo(({ label, icon, onClick, className }) => (
    <Button label={label} svg={icon} onClick={onClick} className={className} />
));
PaginationPrevButton.displayName = "PaginationPrevButton";

/** 다음 버튼. 정보만 받아서 렌더 */
export const PaginationNextButton = memo(({ label, icon, onClick, className }) => (
    <Button label={label} svg={icon} onClick={onClick} iconFirst={false} className={className} />
));
PaginationNextButton.displayName = "PaginationNextButton";

/**
 * 페이지네이션 인디케이터. 정보만 받아서 렌더.
 * 카테고리 등 다른 스타일은 부모에서 CSS로 오버라이드.
 */
export const PaginationIndicator = memo(({ pageNumber, totalPages }) => {
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

/**
 * 페이지네이션 컨테이너.
 * 구성: 레프트버튼 · 인디케이터 · 라이트버튼.
 * props를 정보 단위로 나누어 개별 컴포넌트에 전달해 재조립.
 */
const Pagination = memo(
    ({
        pageNumber,
        totalPages,
        onPrev,
        onNext,
        ttsPrefix = "메뉴",
        sectionRef,
        style,
        className,
        showPageNumber = true,
        prevLabel = "이전",
        nextLabel = "다음",
        prevIcon = <Icon name="ArrowLeft" />,
        nextIcon = <Icon name="ArrowRight" />
    }) => {
        const containerStyle = useMemo(() => style ?? {}, [style]);

        const prevButtonInfo = useMemo(
            () => ({
                label: prevLabel,
                icon: prevIcon,
                onClick: onPrev,
                className: undefined
            }),
            [prevLabel, prevIcon, onPrev]
        );

        const indicatorInfo = useMemo(() => ({ pageNumber, totalPages }), [pageNumber, totalPages]);

        const nextButtonInfo = useMemo(
            () => ({
                label: nextLabel,
                icon: nextIcon,
                onClick: onNext,
                className: undefined
            }),
            [nextLabel, nextIcon, onNext]
        );

        return (
            <div
                className={className ? `pagination ${className}` : "pagination"}
                style={containerStyle}
                ref={sectionRef}
                data-tts-text={`${ttsPrefix}, ${totalPages} 페이지 중 ${pageNumber} 페이지,`}
            >
                <PaginationPrevButton {...prevButtonInfo} />
                {showPageNumber && <PaginationIndicator {...indicatorInfo} />}
                <PaginationNextButton {...nextButtonInfo} />
            </div>
        );
    }
);
Pagination.displayName = "Pagination";

export default Pagination;
