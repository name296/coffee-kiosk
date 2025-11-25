import React, { useContext, useState, useEffect, useMemo, useCallback, memo } from "react";
import { AppContext } from "../context";
// import { startReturnTimer, updateTimer } from "../assets/timer";
import { useMultiModalButtonHandler } from "../hooks/useMultiModalButtonHandler";
import { useTextHandler } from "../assets/tts";
import { usePagination, useSafeDocument } from "../hooks";
import { PAGINATION_CONFIG, FOCUS_SECTIONS, TIMER_CONFIG, PAGE_CONFIG } from "../config";
import { safeQuerySelector, formatNumber } from "../utils/browserCompatibility";
import { getAssetPath } from "../utils/pathUtils";
import { DeleteIcon } from "../components/icons";

const ThirdPage = memo(() => {
  const {
    sections,
    totalMenuItems,
    isDark,
    isLow,
    quantities,
    handleIncrease,
    handleDecrease,
    filterMenuItems,
    isDeleteModal,
    setisDeleteModal,
    isDeleteCheckModal,
    setisDeleteCheckModal,
    setDeleteItemId,
    commonScript,
    volume,
    convertToKoreanQuantity,
    setCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  // 각 아이템의 수량을 관리

  // 필터링된 아이템들 (메모이제이션)
  const priceItems = useMemo(
    () => filterMenuItems(totalMenuItems, quantities),
    [totalMenuItems, quantities]
  );

  // 페이지네이션 훅 사용 (ThirdPage는 다른 페이지 크기 사용)
  const ITEMS_PER_PAGE_NORMAL = 6;
  const ITEMS_PER_PAGE_LOW = 3;
  const ITEMS_PER_PAGE = isLow ? ITEMS_PER_PAGE_LOW : ITEMS_PER_PAGE_NORMAL;
  
  const {
    pageNumber,
    totalPages,
    currentItems,
    handlePrevPage,
    handleNextPage,
    itemsPerPage,
  } = usePagination(
    priceItems,
    ITEMS_PER_PAGE_NORMAL,
    ITEMS_PER_PAGE_LOW,
    isLow
  );

  // 현재 페이지의 시작 인덱스 계산 (메모이제이션)
  const startIndex = useMemo(
    () => (pageNumber - 1) * itemsPerPage,
    [pageNumber, itemsPerPage]
  );

  // 포커스 섹션 생성 함수 (메모이제이션)
  const prependRows = useCallback((existingArray, itemCount) => {
    const newRows = Array.from(
      { length: itemCount },
      (_, index) => `row${index + 1}`
    );
    return [FOCUS_SECTIONS.PAGE, ...newRows, ...existingArray];
  }, []);

  // 포커스 섹션 (메모이제이션)
  const focusableSections = useMemo(
    () => prependRows(
      [FOCUS_SECTIONS.BOTTOM, FOCUS_SECTIONS.FOOTER, FOCUS_SECTIONS.BOTTOM_FOOTER],
      currentItems.length
    ),
    [currentItems.length, prependRows]
  );

  // useKeyboardNavigation
  const { updateFocusableSections } = useMultiModalButtonHandler({
    initFocusableSections: focusableSections,
    initFirstButtonSection: "row1",
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true
  });

  // 수량 감소 핸들러 (메모이제이션)
  const handleTouchDecrease = useCallback((id) => {
    if (quantities[id] === 1) {
      setDeleteItemId(id);
      if (currentItems.length > 1) {
        setisDeleteModal(true);
      } else {
        setisDeleteCheckModal(true);
      }
    } else {
      handleDecrease(id);
    }
  }, [quantities, currentItems.length, setDeleteItemId, setisDeleteModal, setisDeleteCheckModal, handleDecrease]);

  // 삭제 핸들러 (메모이제이션)
  const handleTouchDelete = useCallback((id) => {
    setDeleteItemId(id);
    if (currentItems.length > 1) {
      setisDeleteModal(true);
    } else {
      setisDeleteCheckModal(true);
    }
  }, [currentItems.length, setDeleteItemId, setisDeleteModal, setisDeleteCheckModal]);

  // 페이지 변경 시 포커스 섹션 업데이트
  useEffect(() => {
    updateFocusableSections(focusableSections);
  }, [pageNumber, focusableSections, updateFocusableSections]);

  // 아이템이 없으면 이전 페이지로
  useEffect(() => {
    if (currentItems.length === 0) {
      setCurrentPage(PAGE_CONFIG.SECOND);
    }
  }, [currentItems.length, setCurrentPage]);

  const { blurActiveElement, getActiveElementText } = useSafeDocument();

  // 페이지 로드 시 TTS
  useEffect(() => {
    blurActiveElement();
    const timer = setTimeout(() => {
      const pageTTS = getActiveElementText();
      if (pageTTS) {
        setTimeout(() => {
          handleText(pageTTS);
        }, TIMER_CONFIG.TTS_DELAY);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [handleText, blurActiveElement, getActiveElementText]);



  return (
    <>
      <div className="main third">
        <div className="title">
          <span
            style={isDark ? { color: "#FFE101" } : { color: "#8C532C" }}
          >
            내역
          </span>
          을 확인하시고&nbsp;
          <span
            style={isDark ? { color: "#FFE101" } : { color: "#8C532C" }}
          >
            결제하기
          </span>
          &nbsp;버튼을 누르세요
        </div>
        <div className="third-middle-content">
          {isLow ? (
            <>
              <p className="third-middle-content-header">상품명</p>
              <p className="third-middle-content-header-qty">수량</p>
              <p className="third-middle-content-header-price">가격</p>
              <p className="third-middle-content-header-delete">삭제</p>
            </>
          ) : (
            <>
              <p className="third-middle-content-header-normal">상품명</p>
              <p className="third-middle-content-header-qty-normal">수량</p>
              <p className="third-middle-content-header-price-normal">가격</p>
              <p className="third-middle-content-header-delete-normal">삭제</p>
            </>
          )}
        </div>
        <div className="third-main-content">
          {currentItems.map((item, i) => {
            const globalIndex = startIndex + i + 1;
            const rowIndex = (i % itemsPerPage) + 1;
            const refKey = `row${rowIndex}`;
            return (
              <div key={item.id}>
                <div className="order-item" ref={sections[refKey]} data-tts-text={`주문목록,${globalIndex}번, ${item.name}, ${convertToKoreanQuantity(quantities[item.id])} 개, ${item.price * quantities[item.id]}원, 버튼 세 개, `}>
                  <div
                    className="order-image-div"
                  >
                    <div className="order-index">{globalIndex}</div>
                    <img
                      src={item.img}
                      alt={item.name}
                      className="order-image"
                    />
                  </div>

                  <p className="order-name">{item.name}</p>
                  <div className="order-quantity">
                    <button
                      data-tts-text="수량 빼기"
                      className="button qty-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.currentTarget.focus();
                        handleTouchDecrease(item.id);
                      }}
                    >
                      <div className="background dynamic">
                        <span className="content label">-</span>
                      </div>
                    </button>
                    <span className="qty">{quantities[item.id]}</span>
                    <button
                      data-tts-text="수량 더하기"
                      className="button qty-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.currentTarget.focus();
                        handleIncrease(item.id);
                      }}
                    >
                      <div className="background dynamic">
                        <span className="content label">+</span>
                      </div>
                    </button>
                  </div>
                  <span className="order-price">
                    {formatNumber(Number(item.price * quantities[item.id]))}원
                  </span>
                  <button
                    data-tts-text="삭제"
                    className="button delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.currentTarget.focus();
                      handleTouchDelete(item.id);
                    }}
                  >
                    <div className="background dynamic">
                      <span className="content icon" aria-hidden="true">
                        <DeleteIcon />
                      </span>
                    </div>
                  </button>
                </div>

                <div className="row-line"></div>
              </div>
            );
          })}
        </div>
        <div
          className="pagination2"
          ref={sections.bottom}
          data-tts-text={`페이지네이션, 주문목록, ${totalPages}페이지 중 ${pageNumber}페이지, 버튼 두 개,`}
        >
          <button data-tts-text=" 이전," className="button" onClick={(e) => { e.preventDefault();e.target.focus(); handlePrevPage(); }}
>
            <div className="background dynamic">
              <span className="content label">&lt;&nbsp; 이전</span>
            </div>
          </button>
          <span className="pagination-page-number">
            <span
              className={isDark ? "pagination-page-number-highlight" : "pagination-page-number-default"}
            >
              {pageNumber}
            </span>
            <span className="pagination-separator">&nbsp;/&nbsp;</span>
            <span className="pagination-separator">{totalPages}</span>
          </span>
          <button data-tts-text=" 다음," className="button"
          onClick={(e) => { e.preventDefault();e.target.focus(); handleNextPage(); }}
          >
            <div className="background dynamic">
              <span className="content label">다음 &nbsp;&gt;</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
});

ThirdPage.displayName = 'ThirdPage';

export default ThirdPage;
