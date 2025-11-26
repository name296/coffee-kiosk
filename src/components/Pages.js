// ============================================================================
// 페이지 컴포넌트 통합 파일
// 모든 페이지 컴포넌트를 하나의 파일로 관리
// ============================================================================

import React, { useContext, useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import FocusTrap from "focus-trap-react";
import { AppContext } from "../contexts";
import Button from "./Button";
import { TakeinIcon, TakeoutIcon, DeleteIcon } from "./Icon";
import { usePagination, useSafeDocument, useMultiModalButtonHandler } from "../hooks";
import { useTimer } from "../hooks/useSingletonTimer";
import { useTextHandler } from '../utils/tts';
import { commonScript } from "../config/messages";
import { 
  PAGINATION_CONFIG, 
  FOCUS_SECTIONS, 
  TIMER_CONFIG, 
  PAGE_CONFIG, 
  DEFAULT_SETTINGS, 
  DISABLED_MENU_ID, 
  ERROR_MESSAGES 
} from "../config";
import { 
  PAYMENT_STEPS, 
  WEBVIEW_COMMANDS, 
  WEBVIEW_RESPONSE, 
  STORAGE_KEYS 
} from "../config/appConfig";
import { safeQuerySelector, formatNumber, safeLocalStorage, safeParseInt } from "../utils/browserCompatibility";
import { getAssetPath } from "../utils/pathUtils";

// ============================================================================
// 첫 번째 페이지 컴포넌트 (메인 화면)
// ============================================================================

const FirstPage = memo(() => {
  const {
    sections,
    setCurrentPage,
    volume,
    setisDark,
    setVolume,
    setisLarge,
    setisLow
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { startIntroTimer } = useTimer();

  const { blurActiveElement } = useSafeDocument();

  // useKeyboardNavigation
  useMultiModalButtonHandler({
    initFocusableSections: [FOCUS_SECTIONS.PAGE, FOCUS_SECTIONS.MIDDLE, FOCUS_SECTIONS.BOTTOM_FOOTER],
    initFirstButtonSection: FOCUS_SECTIONS.PAGE,
    enableGlobalHandlers: true,
    handleTextOpt: handleText,
    enableKeyboardNavigation: true
  });

  // 초기화 콜백 (메모이제이션)
  const handleIntroComplete = useCallback(() => {
    setisDark(DEFAULT_SETTINGS.IS_DARK);
    setVolume(DEFAULT_SETTINGS.VOLUME);
    setisLarge(DEFAULT_SETTINGS.IS_LARGE);
    setisLow(DEFAULT_SETTINGS.IS_LOW);
  }, [setisDark, setVolume, setisLarge, setisLow]);

  // 버튼 핸들러는 Button 컴포넌트의 actionType prop으로 자동 처리됨

  // FirstPage 진입 시 TTS 및 타이머 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      blurActiveElement();
      handleText(commonScript.intro);
      startIntroTimer(commonScript.intro, handleText, handleIntroComplete);
    }, TIMER_CONFIG.ACTION_DELAY * 2);

    return () => clearTimeout(timer);
  }, [handleText, handleIntroComplete, blurActiveElement, startIntroTimer]);

  return (
    <div className="main first">
      <img
        src={getAssetPath("/images/poster.svg")}
        alt="coffee"
      />
      <div
        className="task-manager"
        data-tts-text="취식방식, 버튼 두개,"
        ref={sections.middle}
      >
        <Button
          styleClass="button start"
          ttsText="포장하기"
          icon={<TakeoutIcon />}
          label="포장하기"
          actionType="navigate"
          actionTarget={PAGE_CONFIG.SECOND}
        />
        <Button
          styleClass="button start"
          ttsText="먹고가기"
          icon={<TakeinIcon />}
          label="먹고가기"
          actionType="navigate"
          actionTarget={PAGE_CONFIG.SECOND}
        />
      </div>
    </div>
  );
});

FirstPage.displayName = 'FirstPage';

// ============================================================================
// 두 번째 페이지 컴포넌트 (메뉴 선택 화면)
// ============================================================================

const SecondPage = memo(() => {
  const {
    sections,
    isLow,
    isDark,
    tabs,
    menuItems,
    selectedTab,
    setSelectedTab,
    handleIncrease,
    commonScript,
    volume,
    quantities,
    convertToKoreanQuantity,
    setCurrentPage,
    setHandleCategoryPageNav
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { startReturnTimer, stopIntroTimer } = useTimer();

  const { blurActiveElement } = useSafeDocument();

  // menu_data.json 동적 로드
  const [menuData, setMenuData] = useState({ categoryInfo: [] });
  
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const response = await fetch('/menu_data.json');
        const data = await response.json();
        setMenuData(data);
      } catch (error) {
        console.error('Failed to load menu_data.json:', error);
      }
    };
    loadMenuData();
  }, []);

  // 초기 탭 설정
  useEffect(() => {
    setSelectedTab(DEFAULT_SETTINGS.SELECTED_TAB);
  }, [setSelectedTab]);

  // 페이지 로드 시 TTS 및 타이머 시작
  useEffect(() => {
    stopIntroTimer();
    blurActiveElement();
    
    const timer = setTimeout(() => {
      if (typeof document !== 'undefined' && document.activeElement) {
        const pageTTS = document.activeElement.dataset.ttsText;
        if (pageTTS) {
          setTimeout(() => {
            handleText(pageTTS);
          }, TIMER_CONFIG.TTS_DELAY);
        }
      }
      startReturnTimer(commonScript.return, handleText, setCurrentPage);
      
      // 페이지 로드 후 toggle 버튼 아이콘 마운트 확인
      if (window.ButtonStyleGenerator) {
        setTimeout(() => {
          window.ButtonStyleGenerator.setupIconInjection();
        }, 100);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [handleText, setCurrentPage, blurActiveElement, startReturnTimer, stopIntroTimer]);

  // useKeyboardNavigation
  useMultiModalButtonHandler({
    initFocusableSections: [
      FOCUS_SECTIONS.PAGE,
      FOCUS_SECTIONS.TOP,
      FOCUS_SECTIONS.MIDDLE,
      FOCUS_SECTIONS.BOTTOM,
      FOCUS_SECTIONS.FOOTER,
      FOCUS_SECTIONS.BOTTOM_FOOTER,
    ],
    initFirstButtonSection: FOCUS_SECTIONS.TOP,
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true
  });

  // 페이지네이션 훅 사용
  const {
    pageNumber,
    totalPages,
    currentItems,
    handlePrevPage,
    handleNextPage,
    resetOnChange,
  } = usePagination(
    menuItems,
    PAGINATION_CONFIG.ITEMS_PER_PAGE_NORMAL,
    PAGINATION_CONFIG.ITEMS_PER_PAGE_LOW,
    isLow
  );

  // selectedTab 변경 시 페이지 리셋
  useEffect(() => {
    resetOnChange();
  }, [selectedTab, resetOnChange]);

  // 메뉴 아이템 클릭 핸들러 (메모이제이션)
  const handleTouchEndWrapper = useCallback((e, id) => {
    if (id !== DISABLED_MENU_ID) {
      handleIncrease(id);
      handleText('담기, ');
    } else {
      handleText(ERROR_MESSAGES.NO_PRODUCT);
    }
  }, [handleIncrease, handleText]);

  // 버튼 핸들러는 Button 컴포넌트의 actionType prop으로 자동 처리됨

  // 페이지네이션 버튼 핸들러 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handlePaginationPress = useCallback((e, direction) => {
    e.preventDefault();
    e.target.focus();
    if (direction === 'prev') {
      handlePrevPage();
    } else {
      handleNextPage();
    }
  }, [handlePrevPage, handleNextPage]);

  // 메뉴 아이템 버튼 핸들러 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handleMenuItemPress = useCallback((e, id) => {
    e.preventDefault();
    e.target.focus();
    handleTouchEndWrapper(e, id);
  }, [handleTouchEndWrapper]);

  // 모든 카테고리 탭 (JSON 데이터 기반) - cate_id와 cate_name을 함께 저장
  const allTabs = useMemo(() => 
    menuData.categoryInfo.map(cat => ({
      id: cat.cate_id,
      name: cat.cate_name
    })),
    [menuData.categoryInfo]
  );

  // 카테고리 컨테이너 및 버튼 크기 측정을 위한 ref
  const categoryContainerRef = useRef(null);
  const [categoryLayout, setCategoryLayout] = useState({
    itemsPerRow: 7,
    rowsPerPage: 1,
    itemsPerPage: 7
  });

  // 카테고리 레이아웃 계산 (실시간) - 한 줄 기준으로 계산
  useEffect(() => {
    const calculateLayout = () => {
      if (!categoryContainerRef.current) return;

      const container = categoryContainerRef.current;
      const firstButton = container.querySelector('.button');
      
      if (!firstButton) return;
      
      const containerWidth = container.clientWidth;
      const buttonWidth = firstButton.offsetWidth;
      const gap = 4; // gap: 4px
      
      // 한 줄에 들어갈 수 있는 버튼 개수 계산
      const itemsPerRow = Math.max(1, Math.floor((containerWidth + gap) / (buttonWidth + gap)));
      
      // 한 줄만 표시하도록 설정
      const rowsPerPage = 1;
      const itemsPerPage = itemsPerRow * rowsPerPage;
      
      if (itemsPerRow > 0 && itemsPerPage > 0) {
        setCategoryLayout(prev => {
          // 한 줄 개수가 변경된 경우에만 업데이트 (순환 참조 방지)
          if (prev.itemsPerRow !== itemsPerRow) {
            return {
              itemsPerRow,
              rowsPerPage,
              itemsPerPage
            };
          }
          return prev;
        });
      }
    };

    // 초기 계산 (렌더링 완료 후)
    const timer = setTimeout(calculateLayout, 100);

    // ResizeObserver로 실시간 감지
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateLayout);
    });

    if (categoryContainerRef.current) {
      resizeObserver.observe(categoryContainerRef.current);
    }

    // 윈도우 리사이즈도 감지
    window.addEventListener('resize', calculateLayout);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateLayout);
    };
  }, [allTabs.length]);


  // 동적 페이지네이션 - 한 줄(row) 단위로 이동
  const {
    pageNumber: categoryPageNumber,
    totalPages: categoryTotalPages,
    currentItems: currentCategoryItems,
    handlePrevPage: handlePrevCategoryPage,
    handleNextPage: handleNextCategoryPage,
    resetOnChange: resetCategoryOnChange,
  } = usePagination(
    allTabs,
    categoryLayout.itemsPerRow, // 한 줄에 들어가는 개수만큼 이동
    categoryLayout.itemsPerRow, // 한 줄에 들어가는 개수만큼 이동
    false
  );

  // selectedTab 또는 레이아웃 변경 시 카테고리 페이지 리셋
  useEffect(() => {
    resetCategoryOnChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, categoryLayout.itemsPerRow]);

  // 카테고리 페이지네이션 핸들러
  const handleCategoryPageNav = useCallback((direction) => {
    if (direction === 'prev') {
      handlePrevCategoryPage();
    } else {
      handleNextCategoryPage();
    }
  }, [handlePrevCategoryPage, handleNextCategoryPage]);

  // AppContext에 카테고리 페이지네이션 핸들러 등록
  useEffect(() => {
    if (setHandleCategoryPageNav) {
      setHandleCategoryPageNav(handleCategoryPageNav);
    }
    return () => {
      if (setHandleCategoryPageNav) {
        setHandleCategoryPageNav(null);
      }
    };
  }, [handleCategoryPageNav, setHandleCategoryPageNav]);

  // 탭 버튼 렌더링 헬퍼 함수
  const renderTabButton = useCallback((tab, index, isLast) => (
    <React.Fragment>
      <Button
        styleClass={`toggle ${selectedTab === tab.name ? "pressed" : ""}`}
        ttsText={`${tab.name}, ${selectedTab === tab.name ? "선택됨, " : "선택가능, "}`}
        actionType="selectTab"
        actionTarget={tab.name}
        label={tab.name}
      />
      {!isLast && <div className="secondpage-short-colline"></div>}
    </React.Fragment>
  ), [selectedTab]);

  return (
    <div className="main second">
      <div className="category-full" ref={sections.top} data-tts-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 한 줄에 버튼 ${categoryLayout.itemsPerRow}개, ${categoryLayout.rowsPerPage}줄, 총 버튼 ${convertToKoreanQuantity(currentCategoryItems.length)}개,`}>
        <Button
          styleClass="toggle"
          ttsText="이전"
          label="이전"
          disabled={categoryPageNumber === 1}
          actionType="categoryNav"
          actionTarget="prev"
        />
        <div className="category" ref={categoryContainerRef}>
          {currentCategoryItems.map((tab, index) => (
            <React.Fragment key={tab.id}>
              {renderTabButton(tab, index, index === currentCategoryItems.length - 1)}
            </React.Fragment>
          ))}
                </div>
        <Button
          styleClass="toggle"
          ttsText="다음"
          label="다음"
          disabled={categoryPageNumber === categoryTotalPages}
          actionType="categoryNav"
          actionTarget="next"
        />
                  </div>
      <div className="menu" ref={sections.middle} data-tts-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(currentItems.length)}개,`}>
          {currentItems?.map((item, index) => (
            <button
              data-tts-text={item.id === DISABLED_MENU_ID ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`}
              className={`button menu-item ${item.id === DISABLED_MENU_ID ? 'disabled' : ''}`}
              aria-disabled={item.id === DISABLED_MENU_ID}
              onClick={(e) => handleMenuItemPress(e, item.id)}
              key={item.id}
            >
              <div className="background dynamic">
                <span className="content icon" aria-hidden="true">
                  <img src={item.img} alt={item.name} onError={(e) => { console.error('Image load error:', item.img, e.target.src); }} />
                </span>
                <span className="content label">
                  <div className="txt-box">
                    <p>{item.name}</p>
                    <p>{Number(item.price).toLocaleString()}원</p>
                  </div>
                </span>
              </div>
            </button>
          ))}
      </div>

      <div
        className="pagination"
        ref={sections.bottom}
        data-tts-text={`페이지네이션, 메뉴, ${totalPages} 페이지 중 ${pageNumber} 페이지, 버튼 두 개,`}
      >
        <button
          data-tts-text="이전, "
          className="button"
            onClick={(e) => handlePaginationPress(e, 'prev')}
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
            <span className="pagination-separator">
              {totalPages === 0 ? 1 : totalPages}
            </span>
          </span>
        <button
          data-tts-text="다음,"
          className="button"
          onClick={(e) => handlePaginationPress(e, 'next')}
          >
            <div className="background dynamic">
              <span className="content label">다음 &nbsp;&gt;</span>
            </div>
          </button>
      </div>
    </div>
  );
});

SecondPage.displayName = 'SecondPage';

// ============================================================================
// 세 번째 페이지 컴포넌트 (주문 확인 화면)
// ============================================================================

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

  // 수량 버튼 핸들러 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handleQuantityPress = useCallback((e, id, action) => {
    e.preventDefault();
    e.currentTarget.focus();
    if (action === 'decrease') {
      handleTouchDecrease(id);
    } else {
      handleIncrease(id);
    }
  }, [handleTouchDecrease, handleIncrease]);

  // 삭제 버튼 핸들러 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handleDeletePress = useCallback((e, id) => {
    e.preventDefault();
    e.currentTarget.focus();
    handleTouchDelete(id);
  }, [handleTouchDelete]);

  // 페이지네이션 버튼 핸들러 (메모이제이션)
  // ttsText가 있으므로 전역 핸들러가 TTS를 자동 처리
  const handlePaginationPress = useCallback((e, direction) => {
    e.preventDefault();
    e.target.focus();
    if (direction === 'prev') {
      handlePrevPage();
    } else {
      handleNextPage();
    }
  }, [handlePrevPage, handleNextPage]);

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
                      onClick={(e) => handleQuantityPress(e, item.id, 'decrease')}
                    >
                      <div className="background dynamic">
                        <span className="content label">-</span>
                      </div>
                    </button>
                    <span className="qty">{quantities[item.id]}</span>
                    <button
                      data-tts-text="수량 더하기"
                      className="button qty-btn"
                      onClick={(e) => handleQuantityPress(e, item.id, 'increase')}
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
                    onClick={(e) => handleDeletePress(e, item.id)}
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
          <button data-tts-text=" 이전," className="button" onClick={(e) => handlePaginationPress(e, 'prev')}>
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
            onClick={(e) => handlePaginationPress(e, 'next')}
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

// ============================================================================
// 네 번째 페이지 컴포넌트 (결제 화면)
// ============================================================================

const ForthPage = memo(() => {
  const {
    sections,
    totalSum,
    isLow,
    setisLow,
    isDark,
    setisDark,
    isCreditPayContent,
    setisCreditPayContent,
    commonScript,
    totalMenuItems,
    quantities,
    setQuantities,
    createOrderItems,
    volume,
    setVolume,
    isLarge,
    setisLarge,
    setisReturnModal,
    setisAccessibilityModal,
    setCurrentPage
  } = useContext(AppContext);
  // orderItems 메모이제이션
  const orderItems = useMemo(
    () => createOrderItems(totalMenuItems, quantities),
    [totalMenuItems, quantities, createOrderItems]
  );
  const { handleText } = useTextHandler(volume);
  const [countdown, setCountdown] = useState(60);
  const [orderNum, setOrderNum] = useState(0);

  useEffect(() => {
    if (isCreditPayContent !== PAYMENT_STEPS.SELECT_METHOD) {
      setisCreditPayContent(PAYMENT_STEPS.SELECT_METHOD);
    }
  }, []);

  const { querySelector, getActiveElementText } = useSafeDocument();

  useEffect(() => {
    const hiddenBtn = querySelector('.hidden-btn.page-btn');
    if (hiddenBtn) {
      hiddenBtn.focus();
      const pageTTS = getActiveElementText();
      if (pageTTS) {
        setTimeout(() => {
          handleText(pageTTS);
        }, TIMER_CONFIG.TTS_DELAY);
      }
    }
    // startReturnTimer(commonScript.return, handleText, navigate);

    // 타이머 설정 : 영수증 미출력 시 자동 마무리 단계
    if (isCreditPayContent === PAYMENT_STEPS.PRINT_SELECT || isCreditPayContent === PAYMENT_STEPS.RECEIPT_PRINT) {
      const resetCountdown = () => setCountdown(TIMER_CONFIG.AUTO_FINISH_DELAY); // 카운트다운 초기화 함수

      // 카운트다운 설정
      setCountdown(TIMER_CONFIG.AUTO_FINISH_DELAY);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(timer);
            setTimeout(() => {
              setisCreditPayContent(PAYMENT_STEPS.FINISH);
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, TIMER_CONFIG.INTERVAL_DELAY);

      // keydown 및 click 이벤트 추가
      const handleReset = () => resetCountdown();
      window.addEventListener('keydown', handleReset);
      window.addEventListener('click', handleReset);

      return () => {
        // 이벤트 리스너 제거 및 타이머 정리
        window.removeEventListener('keydown', handleReset);
        window.removeEventListener('click', handleReset);
        clearInterval(timer);
      };
    }

    // 타이머 설정 : 마무리 단계 후 첫화면으로 이동

    if (isCreditPayContent === PAYMENT_STEPS.FINISH) {
      setCountdown(TIMER_CONFIG.FINAL_PAGE_DELAY);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(timer);
            setTimeout(() => {
              // 모달창 끄기
              setisReturnModal(false);
              setisAccessibilityModal(false);
              setQuantities(
                totalMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
              );

              // 초기설정
              setisDark(false);
              setVolume(1);
              setisLarge(false);
              setisLow(false);
              setCurrentPage("first");
              return 0;
            }, 0);
          }
          return prev - 1;
        });
        }, TIMER_CONFIG.INTERVAL_DELAY);

      return () => clearInterval(timer);
    }
    // 버튼 스타일은 ButtonStyleGenerator.calculateButtonSizes()가 처리
    if (window.ButtonStyleGenerator) {
      window.ButtonStyleGenerator.calculateButtonSizes();
    }
  }, [isCreditPayContent]);

  useEffect(() => {
    if (window.chrome?.webview) {
      window.chrome.webview.addEventListener("message", (event) => {
        let resData = event.data;
        // 결과값 받으면
        // 카드 :  뽑기-> 영수증 출력 여부 : setisCreditPayContent(3) -> setisCreditPayContent(4)
        // 모바일 : 영수증 출력 여부 : setisCreditPayContent(4)
        if (resData.arg.result === WEBVIEW_RESPONSE.SUCCESS) {
          if (resData.Command === WEBVIEW_COMMANDS.PAY) {
            setisCreditPayContent(PAYMENT_STEPS.CARD_REMOVE); // 카드 뽑는 화면 넘어가기
          }
          if (resData.Command === WEBVIEW_COMMANDS.PRINT) {
            setisCreditPayContent(PAYMENT_STEPS.PRINT_SELECT); // 주문번호 출력 페이지
          }
        } else {
          console.log(resData.arg.errorMessage);
        }
      });
    }
  });

  // 주문 정보 전달할 때 업데이트 (메모이제이션) - 먼저 정의
  const updateOrderNumber = useCallback(() => {
    const currentNum = safeParseInt(safeLocalStorage.getItem(STORAGE_KEYS.ORDER_NUM), 0);
    const tmpOrderNum = currentNum + 1;

    safeLocalStorage.setItem(STORAGE_KEYS.ORDER_NUM, tmpOrderNum);
    setOrderNum(tmpOrderNum);

    return tmpOrderNum;
  }, []);

  // 결제 처리 함수들은 OrderContext에서 제공됨 (Button 컴포넌트가 자동으로 사용)

  // useKeyboardNavigation
  useMultiModalButtonHandler({
    initFocusableSections: [FOCUS_SECTIONS.PAGE, FOCUS_SECTIONS.MIDDLE, FOCUS_SECTIONS.BOTTOM, FOCUS_SECTIONS.BOTTOM_FOOTER],
    initFirstButtonSection: FOCUS_SECTIONS.PAGE,
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true
  });

  // 버튼 핸들러들은 Button 컴포넌트의 actionType prop으로 자동 처리됨

  //isCreditPayContent
  // 0: 결제 방법 선택 페이지
  // 1: 신용카드 결제 (꽂기)-> (취소가능)
  // 2: 모바일 결제-> (취소가능)
  // 3: 신용카드 결제 (뽑기)
  // 4: 영수증 출력 여부 선택 (주문번호 자동 출력)
  // 5: 주문번호 출력 (미사용)
  // 6: 영수증 출력
  // 7: 마지막 멘트

  const getPageScript = () => {
    if (isCreditPayContent === 0) {
      return `작업 안내, 결제 선택 단계. 결제 금액, ${totalSum.toLocaleString(
        "ko-KR"
      )}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ` + commonScript.replay;
    } else if (isCreditPayContent === 1) {
      return `작업안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ` + commonScript.replay;
    } else if (isCreditPayContent === 2) {
      return `작업 안내, 모바일페이 단계, 가운데 아래에 있는 카드리더기에 휴대전화의 모바일페이를 켜고 접근시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ` + commonScript.replay;
    } else if (isCreditPayContent === 3) {
      return `작업 안내, 신용카드 제거, 신용카드를 뽑습니다, 정상적으로 결제되고 나서 카드가 제거되면, 자동으로 다음 작업, 인쇄 선택으로 이동합니다, 확인 버튼을 눌러 결제 상황을 확인합니다, ` + commonScript.replay;
    } else if (isCreditPayContent === 4) {
      return `작업 안내, 인쇄 선택, 결제되었습니다, 주문번호 ${orderNum}번, 왼쪽 아래의 프린터에서 주문표를 받으시고, 영수증 출력 여부를 선택합니다, 육십초 동안 조작이 없을 경우, 출력 안함으로 자동 선택됩니다, 화면 터치 또는 키패드 입력이 확인되면 사용 시간이 다시 육십초로 연장됩니다,` + commonScript.replay;
    } else if (isCreditPayContent === 5) {
      return `작업 안내, 주문표단계, 주문번호, ${orderNum}, 왼쪽 아래의 프린터에서 주문표가 출력됩니다. 인쇄가 완전히 끝나고 받습니다. 마무리하기 버튼으로 서비스 이용을 종료할 수 있습니다. ` + commonScript.replay;
    } else if (isCreditPayContent === 6) {
      return `작업 안내, 영수증 출력, 왼쪽 아래의 프린터에서 영수증을 받습니다, 마무리하기 버튼으로 사용을 종료할 수 있습니다, 육십초 동안 조작이 없을 경우, 마무리하기로 자동 선택됩니다, 화면 터치 또는 키패드 입력이 확인되면 사용 시간이 다시 육십초로 연장됩니다,` + commonScript.replay;
    } else if (isCreditPayContent === 7) {
      return `작업안내, 사용종료, 이용해주셔서 감사합니다,`;
    } else {
      return "";
    }
  };

  return (
    <div className="main forth">
      {isCreditPayContent === 0 ? (
        <>
          <div className="title">
            <span className="highlight-text">
              결제방법
            </span>
            을 선택하세요
          </div>
          <div
            className="forth-middle-content"
            onClick={(e) => {
              e.preventDefault();
              e.target.focus();
              updateOrderNumber();
              setisCreditPayContent(4);
            }}
          >
            <span>결제금액</span>
            <span className="payment-amount-large">
              {totalSum.toLocaleString("ko-KR")}원
            </span>
          </div>
          <div
            className="wrap-horizontal"
            ref={sections.middle}
            data-tts-text="결제 선택. 버튼 두 개, "
          >
              <Button
                ttsText="신용카드,"
                styleClass="pay"
              actionType="payment"
              actionMethod="card"
                icon={
                  <img
                    style={
                      isLow
                        ? { width: "100px", height: "65px" }
                        : { width: "125px", height: "85px" }
                    }
                    src={getAssetPath("/images/payment-card.svg")}
                    alt="card"
                  />
                }
                label="신용카드"
              />
              <Button
                ttsText="모바일페이,"
                styleClass="pay"
              actionType="payment"
              actionMethod="mobile"
                icon={
                  <img
                    style={
                      isLow
                        ? { width: "77px", height: "130px" }
                        : { width: "110px", height: "200px" }
                    }
                    src={getAssetPath("/images/payment-mobile.svg")}
                    alt="mobile"
                  />
                }
                label="모바일 페이"
              />
            </div>
            <div
              ref={sections.bottom}
              className="task-manager"
              data-tts-text="작업관리. 버튼 한 개,"
            >
              <Button
                ttsText="취소,"
                styleClass="no"
              actionType="cancel"
              actionTarget="third"
                label="취소"
              />
            </div>
        </>
      ) : isCreditPayContent === 1 ? (
        <div
          data-tts-text="작업 관리, 버튼 한 개,"
          ref={sections.bottom}
          className="credit-pay-content"
        >
          <div className="credit-pay-text">
            <div>
              가운데 아래에 있는{" "}
              <span className="highlight-text">카드리{isLow && isLarge ? <br /> : ''}더기</span>
              {isLow && !isLarge ? (
                <>
                  <br />
                  <div className="flex center">에</div>
                </>
              ) : (
                "에"
              )}
            </div>
            <div>
              <span className="highlight-text">
                신용카드
              </span>
              를 끝까지 넣으세요
            </div>
          </div>
          <img onClick={() => setisCreditPayContent(3)}
            className="credit-pay-image"
            src={getAssetPath("/images/device-cardReader-insert.svg")}
          ></img>
          <Button
            ttsText="취소"
            styleClass="forth-main-btn2"
            actionType="cancel"
            label="취소"
          />
        </div>
      ) : isCreditPayContent === 2 ? (
        <div
          data-tts-text="작업 관리, 버튼 한 개,"
          ref={sections.bottom}
          className="credit-pay-content"
        >
          <div className="credit-pay-text">
            <div>
              가운데 아래에 있는{" "}
              <span className="highlight-text">카드리{isLow && isLarge ? <br /> : ''}더기</span>
              {isLow && !isLarge ? (
                <>
                  <br></br>
                  <div className="flex center">에</div>
                </>
              ) : (
                "에"
              )}
            </div>
            <div>
              휴대전화의{" "}
              <span className="highlight-text" >
                모바일페이
              </span>
              를{isLow && isLarge ? <br /> : ''} 켜고 {isLow && !isLarge ? <><br></br><div className="flex center">접근시키세요</div> </> : "접근시키세요"}
            </div>
          </div>
          <img onClick={() => setisCreditPayContent(4)}
            className="credit-pay-image"
            src={getAssetPath("/images/device-cardReader-mobile.svg")}
          ></img>
          <Button
            ttsText="취소"
            styleClass="forth-main-btn2"
            actionType="cancel"
            label="취소"
          />
        </div>
      ) : isCreditPayContent === 3 ? (
        <div
          data-tts-text="작업 관리, 버튼 한 개,"
          ref={sections.bottom}
          className="credit-pay-content"
        >
          <div className="credit-pay-text">
            <div>
              <span className="highlight-text">
                신용카드
              </span>
              를 뽑으세요.
            </div>
          </div>
          <img onClick={() => setisCreditPayContent(4)}
            className="credit-pay-image"
            src={getAssetPath("/images/device-cardReader-remove.svg")}
          ></img>
        </div>
      ) : isCreditPayContent === 4 ? (
        <div
          data-tts-text="인쇄 서택, 버튼 두 개,"
          ref={sections.bottom}
          className="credit-pay-content"
        >
          <div className="credit-pay-text">
            <div>
              <span className="highlight-text">
                결제되었습니다
              </span>
            </div>
            <div>
              왼쪽 아래의 프린터에서{" "}
              <span className="highlight-text">
                주{isLow && isLarge ? <br /> : ''}문표
              </span>
              {isLow && !isLarge ? <br /> : ""}를 받으시고
            </div>
            <div>
              <span
                style={
                  isDark ? { color: "#FFE101" } : { color: "#8C532C" }
                }
              >
                영수증 출력
              </span>
              을 선택하세요
            </div>
          </div>
          <img
            className="credit-pay-image"
            src={getAssetPath("/images/device-printer-order.svg")}
          ></img>
          <div className="order-num-txt">
            <span>100</span>
          </div>
          <div className="forth-main-two-btn">
            <Button
              ttsText="영수증 출력,"
              styleClass="forth-main-two-btn1"
              actionType="receipt"
              actionTarget="print"
              label="영수증 출력"
            />
            <Button
              ttsText="출력 안함,"
              styleClass="forth-main-two-btn2"
              actionType="receipt"
              actionTarget="skip"
              label={`출력 안함${countdown}`}
            />
          </div>
        </div>
      ) : isCreditPayContent === 5 ? (  // 사용 안함
        <div
          data-tts-text="작업 관리, 버튼 한 개,"
          ref={sections.bottom}
          className="credit-pay-content"
        >
          <div className="credit-pay-text">
            <div>
              왼쪽 아래의{" "}
              <span
                style={
                  isDark ? { color: "#FFE101" } : { color: "#8C532C" }
                }
              >
                프린터
              </span>
              에서{" "}
              <span className="highlight-text">
                주문표
              </span>
              가 출력됩니다
            </div>
            <div>
              인쇄가 완전히{" "}
              <span
                style={
                  isDark ? { color: "#FFE101" } : { color: "#8C532C" }
                }
              >
                끝나고
              </span>
              &nbsp;받으세요
            </div>
          </div>
          <img
            className="credit-pay-image"
            src={getAssetPath("/images/device-printer-order.svg")}
          ></img>
          <div className="order-num-txt">
            <span>{orderNum}</span>
          </div>
          <Button
            ttsText="마무리하기"
            styleClass="forth-main-btn2 btn-confirm"
            actionType="finish"
            label="마무리하기"
          />
        </div>
      ) : isCreditPayContent === 6 ? (
        <div
          data-tts-text="작업 관리, 버튼 한 개,"
          className="credit-pay-content"
          ref={sections.bottom}
        >
          <div className="credit-pay-text">
            <div>
              왼쪽 아래의{" "}
              <span className="highlight-text">
                프린터
              </span>
              에서{" "}
              <span className="highlight-text">
                영{isLow && isLarge ? <br /> : ''}수증
              </span>
              을{isLow && !isLarge ? <br /> : ''} 받으시고
            </div>
            <div>
              <span className="highlight-text">
                마무리하기
              </span>
              &nbsp;버튼을 누르세{isLow && isLarge ? <br /> : ''}요.
            </div>
          </div>
          <img
            className="credit-pay-image"
            src={getAssetPath("/images/device-printer-receipt.svg")}
          ></img>
          <Button
            ttsText="마무리하기"
            styleClass="forth-main-btn2 btn-confirm"
            actionType="finish"
            label={`마무리${countdown}`}
          />
        </div>
      ) : isCreditPayContent === 7 ? (
        <div className="credit-pay-content">
          <div className="credit-pay-text2">
            <div>이용해 주셔서 감사합니다</div>
          </div>
          <img
            className="end-checked-image"
            src={
              isDark
                ? getAssetPath("/images/contrast_ico_end.png")
                : getAssetPath("/images/ico_end.png")
            }
          ></img>
          <div className="return-num-txt">
            <span>{countdown <= 0 ? '✓' : countdown}</span>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
});

ForthPage.displayName = 'ForthPage';

// ============================================================================
// Export
// ============================================================================

export default FirstPage;
export { FirstPage, SecondPage, ThirdPage, ForthPage };

