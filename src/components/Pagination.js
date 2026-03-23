import React, { memo, useContext, useMemo, useRef, useEffect, useCallback } from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import { AccessibilityContext } from "@/contexts";
import { useTextHandler } from "@/hooks";

/** 이전 버튼. 정보만 받아서 렌더 */
export const PaginationPrevButton = memo(({ label, icon, onClick, className, disabled, excludeFromFocus }) => (
    <Button
        label={label}
        svg={icon}
        onClick={onClick}
        className={className}
        disabled={disabled}
        excludeFromFocus={excludeFromFocus}
    />
));
PaginationPrevButton.displayName = "PaginationPrevButton";

/** 다음 버튼. 정보만 받아서 렌더 */
export const PaginationNextButton = memo(({ label, icon, onClick, className, disabled, excludeFromFocus }) => (
    <Button
        label={label}
        svg={icon}
        onClick={onClick}
        iconFirst={false}
        className={className}
        disabled={disabled}
        excludeFromFocus={excludeFromFocus}
    />
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
        const accessibility = useContext(AccessibilityContext);
        const { handleText } = useTextHandler(accessibility.volume);
        const containerStyle = useMemo(() => style ?? {}, [style]);
        const current = pageNumber || 1;
        const total = totalPages || 1;
        const isSinglePage = total <= 1;
        /** 섹션 포커스/호버: 총 페이지 포함 */
        const getPaginationTtsSection = (currentPage) =>
            `${ttsPrefix} ${currentPage}페이지 총${total}페이지,`;
        /** 이전·다음 클릭 후: 부모 state 반영 뒤 실제 pageNumber로만 읽음 (순환 페이징·비동기 갱신 대응) */
        const announceAfterNavRef = useRef(false);

        const handlePrevWithTts = useCallback(
            (e, target) => {
                if (isSinglePage) return;
                announceAfterNavRef.current = true;
                onPrev?.(e, target);
            },
            [isSinglePage, onPrev]
        );

        const handleNextWithTts = useCallback(
            (e, target) => {
                if (isSinglePage) return;
                announceAfterNavRef.current = true;
                onNext?.(e, target);
            },
            [isSinglePage, onNext]
        );

        useEffect(() => {
            if (!announceAfterNavRef.current) return;
            announceAfterNavRef.current = false;
            const p = pageNumber || 1;
            handleText(`${ttsPrefix} ${p}페이지,`, false);
        }, [pageNumber, handleText, ttsPrefix]);

        const prevButtonInfo = useMemo(
            () => ({
                label: prevLabel,
                icon: prevIcon,
                onClick: handlePrevWithTts,
                className: undefined,
                disabled: isSinglePage,
                excludeFromFocus: isSinglePage
            }),
            [prevLabel, prevIcon, handlePrevWithTts, isSinglePage]
        );

        const indicatorInfo = useMemo(() => ({ pageNumber, totalPages }), [pageNumber, totalPages]);

        const nextButtonInfo = useMemo(
            () => ({
                label: nextLabel,
                icon: nextIcon,
                onClick: handleNextWithTts,
                className: undefined,
                disabled: isSinglePage,
                excludeFromFocus: isSinglePage
            }),
            [nextLabel, nextIcon, handleNextWithTts, isSinglePage]
        );

        return (
            <div
                className={className ? `pagination ${className}` : "pagination"}
                style={containerStyle}
                ref={sectionRef}
                data-tts-text={getPaginationTtsSection(current)}
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
