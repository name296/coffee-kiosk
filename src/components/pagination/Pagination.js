import React, { memo, useMemo } from "react";
import Icon from "../../Icon";
import PaginationPrevButton from "./PaginationPrevButton";
import PaginationIndicator from "./PaginationIndicator";
import PaginationNextButton from "./PaginationNextButton";

/**
 * 페이지네이션 컨테이너.
 * 구성: 레프트버튼 · 인디케이터 · 라이트버튼.
 * props를 정보 단위로 나누어 개별 컴포넌트에 전달해 재조립.
 */
const Pagination = memo(({
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

    const prevButtonInfo = useMemo(() => ({
        label: prevLabel,
        icon: prevIcon,
        onClick: onPrev,
        className: undefined
    }), [prevLabel, prevIcon, onPrev]);

    const indicatorInfo = useMemo(() => ({
        pageNumber,
        totalPages
    }), [pageNumber, totalPages]);

    const nextButtonInfo = useMemo(() => ({
        label: nextLabel,
        icon: nextIcon,
        onClick: onNext,
        className: undefined
    }), [nextLabel, nextIcon, onNext]);

    return (
        <div
            className={className ? `pagination ${className}` : "pagination"}
            style={containerStyle}
            ref={sectionRef}
            data-tts-text={`${ttsPrefix}, ${totalPages} 페이지 중 ${pageNumber} 페이지,`}
        >
            {/* 레프트버튼 */}
            <PaginationPrevButton {...prevButtonInfo} />
            {/* 인디케이터 */}
            {showPageNumber && <PaginationIndicator {...indicatorInfo} />}
            {/* 라이트버튼 */}
            <PaginationNextButton {...nextButtonInfo} />
        </div>
    );
});
Pagination.displayName = "Pagination";

export default Pagination;
