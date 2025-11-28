// ============================================================================
// 페이지 및 프레임 컴포넌트 통합 파일
// 모든 페이지/프레임 컴포넌트를 하나의 파일로 관리
// ============================================================================

import React, { useContext, useState, useEffect, useMemo, useCallback, memo } from "react";
import { AppContext } from "../contexts";
import { useIdleTimeoutContext } from "../contexts/IdleTimeoutContext";
import Button from "./Button";
import Icon, { 
  TakeinIcon, TakeoutIcon, DeleteIcon,
  ResetIcon, OrderIcon, AddIcon, PayIcon, LowposIcon, HomeIcon, ExtentionIcon,
  ArrowLeftIcon, ArrowRightIcon
} from "./Icon";
import { 
  usePagination, 
  useSafeDocument, 
  useMultiModalButtonHandler,
  useCategoryLayout,
  usePaymentCountdown,
  useWebViewMessage,
  useOrderNumber,
  usePageScript
} from "../hooks";
import { useTimer } from "../hooks/useSingletonTimer";
import { useTextHandler } from '../hooks/useTTS';
import { commonScript, PAGE_MESSAGES, PAYMENT_MESSAGES } from "../config/messages";
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
import { safeLocalStorage, safeParseInt, formatNumber } from "../utils/browserCompatibility";

// ============================================================================
// 프로세스 1 컴포넌트 (메인 화면)
// ============================================================================

const Process1 = memo(() => {
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

  // Process1 진입 시 TTS 및 타이머 시작
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
      <img src="./images/poster.png" className="poster" alt="" />
      <div
        className="task-manager"
        data-tts-text="취식방식, 버튼 두개,"
        ref={sections.middle}
      >
        <Button
          styleClass="button start"
          ttsText="포장하기"
          svg={<TakeoutIcon />}
          label="포장하기"
          actionType="navigate"
          actionTarget={PAGE_CONFIG.SECOND}
        />
        <Button
          styleClass="button start"
          ttsText="먹고가기"
          svg={<TakeinIcon />}
          label="먹고가기"
          actionType="navigate"
          actionTarget={PAGE_CONFIG.SECOND}
        />
      </div>
    </div>
  );
});

Process1.displayName = 'Process1';

// ============================================================================
// 프로세스 2 컴포넌트 (메뉴 선택 화면)
// ============================================================================

const Process2 = memo(() => {
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
    setHandleCategoryPageNav,
    categoryInfo  // Context에서 categoryInfo 가져오기
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { stopIntroTimer } = useTimer();

  const { blurActiveElement, getActiveElementText } = useSafeDocument();

  // 초기 탭 설정 (마운트 시 한 번만)
  useEffect(() => {
    // setTimeout으로 다음 tick에서 실행하여 렌더링 충돌 방지
    const timer = setTimeout(() => {
      setSelectedTab(DEFAULT_SETTINGS.SELECTED_TAB);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 페이지 로드 시 TTS 시작 (타이머는 useAppIdleTimeout이 전역 처리)
  useEffect(() => {
    stopIntroTimer();
    blurActiveElement();
    
    const timer = setTimeout(() => {
      // useSafeDocument 훅을 통한 안전한 DOM 접근
      const pageTTS = getActiveElementText();
      if (pageTTS) {
        setTimeout(() => {
          handleText(pageTTS);
        }, TIMER_CONFIG.TTS_DELAY);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [handleText, blurActiveElement, getActiveElementText, stopIntroTimer]);

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

  // selectedTab 변경 시 페이지 리셋 (렌더링 충돌 방지)
  useEffect(() => {
    const timer = setTimeout(() => {
      resetOnChange();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

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

  // 모든 카테고리 탭 (Context에서 가져온 categoryInfo 사용)
  const allTabs = useMemo(() => 
    (categoryInfo || []).map(cat => ({
      id: cat.cate_id,
      name: cat.cate_name
    })),
    [categoryInfo]
  );

  // 카테고리 레이아웃 계산
  const { categoryContainerRef, categoryLayout } = useCategoryLayout(allTabs.length);


  // 동적 페이지네이션 - 한 줄(row) 단위로 이동
  const {
    pageNumber: categoryPageNumber,
    totalPages: categoryTotalPages,
    currentItems: currentCategoryItems,
    handlePrevPage: handlePrevCategoryPage,
    handleNextPage: handleNextCategoryPage,
    goToPage: goToCategoryPage,
    resetPage: resetCategoryPage,
  } = usePagination(
    allTabs,
    categoryLayout.itemsPerRow, // 한 줄에 들어가는 개수만큼 이동
    categoryLayout.itemsPerRow, // 한 줄에 들어가는 개수만큼 이동
    false
  );

  // 레이아웃 변경 시 selectedTab이 있는 페이지로 이동 (렌더링 충돌 방지)
  useEffect(() => {
    // 레이아웃이 초기값(999)이면 스킵
    if (categoryLayout.itemsPerRow >= 999) return;
    if (!selectedTab || allTabs.length === 0) return;
    
    // 다음 렌더링 사이클에서 실행
    const timer = setTimeout(() => {
      const tabIndex = allTabs.findIndex(tab => tab.name === selectedTab);
      if (tabIndex === -1) return;
      
      const targetPage = Math.floor(tabIndex / categoryLayout.itemsPerRow) + 1;
      goToCategoryPage(targetPage);
    }, 50); // 약간의 지연 추가
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryLayout.itemsPerRow]); // selectedTab 의존성 제거

  // 카테고리 페이지네이션 핸들러
  const handleCategoryPageNav = useCallback((direction) => {
    if (direction === 'prev') {
      handlePrevCategoryPage();
    } else {
      handleNextCategoryPage();
    }
  }, [handlePrevCategoryPage, handleNextCategoryPage]);

  // AppContext에 카테고리 페이지네이션 핸들러 등록 (렌더링 충돌 방지)
  useEffect(() => {
    if (!setHandleCategoryPageNav) return;
    
    const timer = setTimeout(() => {
      setHandleCategoryPageNav(handleCategoryPageNav);
    }, 0);
    
    return () => {
      clearTimeout(timer);
      if (setHandleCategoryPageNav) {
        setHandleCategoryPageNav(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleCategoryPageNav]);

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
            <Button
              key={item.id}
              styleClass={`menu-item ${item.id === DISABLED_MENU_ID ? 'disabled' : ''}`}
              ttsText={item.id === DISABLED_MENU_ID ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`}
              disabled={item.id === DISABLED_MENU_ID}
              onClick={(e) => handleMenuItemPress(e, item.id)}
            >
              <span className="content icon" aria-hidden="true">
                <img src={`/images/${item.img}`} alt={item.name} />
              </span>
              <span className="content label">
                <div className="txt-box">
                  <p>{item.name}</p>
                  <p>{Number(item.price).toLocaleString()}원</p>
                </div>
              </span>
            </Button>
          ))}
      </div>

      <div
        className="pagination"
        ref={sections.bottom}
        data-tts-text={`페이지네이션, 메뉴, ${totalPages} 페이지 중 ${pageNumber} 페이지, 버튼 두 개,`}
      >
        <Button
          ttsText="이전, "
          svg={<ArrowLeftIcon />}
          label="이전"
          onClick={(e) => handlePaginationPress(e, 'prev')}
        />
        <span className="pagination-page-number">
          <span className={isDark ? "pagination-page-number-highlight" : "pagination-page-number-default"}>
            {pageNumber}
          </span>
          <span className="pagination-separator">&nbsp;/&nbsp;</span>
          <span className="pagination-separator">
            {totalPages === 0 ? 1 : totalPages}
          </span>
        </span>
        <Button
          ttsText="다음,"
          svg={<ArrowRightIcon />}
          label="다음"
          onClick={(e) => handlePaginationPress(e, 'next')}
        />
      </div>
    </div>
  );
});

Process2.displayName = 'Process2';

// ============================================================================
// 프로세스 3 컴포넌트 (주문 확인 화면)
// ============================================================================

const Process3 = memo(() => {
  const {
    sections,
    totalMenuItems,
    isDark,
    isLow,
    quantities,
    handleIncrease,
    handleDecrease,
    filterMenuItems,
    ModalDelete,
    ModalDeleteCheck,
    setModalDeleteItemId,
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

  // 페이지네이션 훅 사용 (Process3는 다른 페이지 크기 사용)
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
      setModalDeleteItemId(id);
      if (currentItems.length > 1) {
        ModalDelete.open();
      } else {
        ModalDeleteCheck.open();
      }
    } else {
      handleDecrease(id);
    }
  }, [quantities, currentItems.length, setModalDeleteItemId, ModalDelete, ModalDeleteCheck, handleDecrease]);

  // 삭제 핸들러 (메모이제이션)
  const handleTouchDelete = useCallback((id) => {
    setModalDeleteItemId(id);
    if (currentItems.length > 1) {
      ModalDelete.open();
    } else {
      ModalDeleteCheck.open();
    }
  }, [currentItems.length, setModalDeleteItemId, ModalDelete, ModalDeleteCheck]);

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

  // 아이템이 없으면 이전 페이지로 (렌더링 충돌 방지)
  useEffect(() => {
    if (currentItems.length === 0) {
      const timer = setTimeout(() => {
        setCurrentPage(PAGE_CONFIG.SECOND);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItems.length]);

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
      <div className="main third">
        <div className="title">
        <div className="sentence">
          <span className={isDark ? "text-highlight-dark" : "text-highlight-light"}>내역</span>을 확인하시고&nbsp;
        </div>
        <div className="sentence">
          <span className={isDark ? "text-highlight-dark" : "text-highlight-light"}>결제하기</span>&nbsp;버튼을 누르세요
        </div>
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
                    <img src={`/images/${item.img}`} alt={item.name} className="order-image" />
                  </div>

                  <p className="order-name">{item.name}</p>
                  <div className="order-quantity">
                    <Button
                      styleClass="qty-btn"
                      ttsText="수량 빼기"
                      label="-"
                      onClick={(e) => handleQuantityPress(e, item.id, 'decrease')}
                    />
                    <span className="qty">{quantities[item.id]}</span>
                    <Button
                      styleClass="qty-btn"
                      ttsText="수량 더하기"
                      label="+"
                      onClick={(e) => handleQuantityPress(e, item.id, 'increase')}
                    />
                  </div>
                  <span className="order-price">
                    {formatNumber(Number(item.price * quantities[item.id]))}원
                  </span>
                  <Button
                    styleClass="delete-btn"
                    ttsText="삭제"
                    svg={<DeleteIcon />}
                    onClick={(e) => handleDeletePress(e, item.id)}
                  />
                </div>

                <div className="row-line"></div>
              </div>
            );
          })}
        </div>
        <div
          className="pagination"
          ref={sections.bottom}
          data-tts-text={`페이지네이션, 주문목록, ${totalPages}페이지 중 ${pageNumber}페이지, 버튼 두 개,`}
        >
          <Button
            ttsText="이전,"
            svg={<ArrowLeftIcon />}
            label="이전"
            onClick={(e) => handlePaginationPress(e, 'prev')}
          />
          <span className="pagination-page-number">
            <span className={isDark ? "pagination-page-number-highlight" : "pagination-page-number-default"}>
              {pageNumber}
            </span>
            <span className="pagination-separator">&nbsp;/&nbsp;</span>
            <span className="pagination-separator">{totalPages}</span>
          </span>
          <Button
            ttsText="다음,"
            svg={<ArrowRightIcon />}
            label="다음"
            onClick={(e) => handlePaginationPress(e, 'next')}
          />
        </div>
      </div>
  );
});

Process3.displayName = 'Process3';

// ============================================================================
// 프로세스 4 컴포넌트 (결제 화면)
// ============================================================================

const Process4 = memo(() => {
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
    ModalReturn,
    ModalAccessibility,
    setCurrentPage
  } = useContext(AppContext);
  // orderItems 메모이제이션
  const orderItems = useMemo(
    () => createOrderItems(totalMenuItems, quantities),
    [totalMenuItems, quantities, createOrderItems]
  );
  const { handleText } = useTextHandler(volume);
  
  // 주문 번호 관리
  const { orderNum, updateOrderNumber } = useOrderNumber();

  // 결제 카운트다운
  const countdown = usePaymentCountdown({
    isCreditPayContent,
    setisCreditPayContent,
    ModalReturn,
    ModalAccessibility,
    setQuantities,
    totalMenuItems,
    setisDark,
    setVolume,
    setisLarge,
    setisLow,
    setCurrentPage
  });

  // 웹뷰 메시지 리스너
  useWebViewMessage(setisCreditPayContent);

  // Process4 마운트 시 결제 단계 초기화 (한 번만 실행)
  useEffect(() => {
      setisCreditPayContent(PAYMENT_STEPS.SELECT_METHOD);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [isCreditPayContent, querySelector, getActiveElementText, handleText]);

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

  // 페이지 스크립트 생성
  const pageScript = usePageScript(isCreditPayContent, totalSum, orderNum);

  return (
    <div className="main forth">
      {isCreditPayContent === 0 ? (
        <>
          <div className="title">
            <div className="sentence">
              <span className="highlight-text"> 결제방법</span>&nbsp;을 선택하세요
            </div>
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
                img="/images/payment-card.png"
                imgAlt="card"
                label="신용카드"
              />
              <Button
                ttsText="모바일페이,"
                styleClass="pay"
                actionType="payment"
                actionMethod="mobile"
                img="/images/payment-mobile.png"
                imgAlt="mobile"
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
          <div className="title">
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
          <img 
            src="./images/device-cardReader-insert.png"
            alt=""
            className="credit-pay-image" 
            onClick={() => setisCreditPayContent(3)}
          />
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
          <div className="title">
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
          <img 
            src="./images/device-cardReader-mobile.png"
            alt=""
            className="credit-pay-image" 
            onClick={() => setisCreditPayContent(4)}
          />
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
          <div className="title">
            <div>
              <span className="highlight-text">
                신용카드
              </span>
              를 뽑으세요.
            </div>
          </div>
          <img 
            src="./images/device-cardReader-remove.png"
            alt=""
            className="credit-pay-image" 
            onClick={() => setisCreditPayContent(4)}
          />
        </div>
      ) : isCreditPayContent === 4 ? (
        <div
          data-tts-text="인쇄 서택, 버튼 두 개,"
          ref={sections.bottom}
          className="credit-pay-content"
        >
          <div className="title">
            <div className="sentence">
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
              <span className={isDark ? "text-highlight-dark" : "text-highlight-light"}>
                영수증 출력
              </span>
              을 선택하세요
            </div>
          </div>
          <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
          <div className="order-num-txt">
            <span>100</span>
          </div>
          <div className="task-manager">
            <Button
              ttsText="영수증 출력,"
              styleClass=""
              actionType="receipt"
              actionTarget="print"
              label="영수증 출력"
            />
            <Button
              ttsText="출력 안함,"
              styleClass=""
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
          <div className="title">
            <div>
              왼쪽 아래의{" "}
              <span className={isDark ? "text-highlight-dark" : "text-highlight-light"}>
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
              <span className={isDark ? "text-highlight-dark" : "text-highlight-light"}>
                끝나고
              </span>
              &nbsp;받으세요
            </div>
          </div>
          <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
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
          <div className="title">
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
          <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
          <Button
            ttsText="마무리하기"
            styleClass="forth-main-btn2 btn-confirm"
            actionType="finish"
            label={`마무리${countdown}`}
          />
        </div>
      ) : isCreditPayContent === 7 ? (
        <div className="credit-pay-content">
          <div className="title">
            이용해 주셔서 감사합니다
          </div>
          <div className="end-checked-image">
            <span className="return-num-txt">{countdown <= 0 ? '✓' : countdown}</span>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
});

Process4.displayName = 'Process4';

// ============================================================================
// 프레임 컴포넌트 (상단/하단 네비게이션)
// ============================================================================

export const Top = memo(() => {
  const {
    isDark,
    setisDark,
    isLow,
    setisLow,
    isCreditPayContent,
    currentPage,
    sections,
    totalSum
  } = useContext(AppContext);
  
  const path = currentPage;

  // getPageText 함수를 useMemo로 메모이제이션
  const pageText = useMemo(() => {
    switch (currentPage) {
      case 'first':
        return PAGE_MESSAGES.FIRST.FULL();
      case 'second':
        return PAGE_MESSAGES.SECOND.FULL();
      case 'third':
        return PAGE_MESSAGES.THIRD.FULL();
      case 'forth': {
        // Process4는 isCreditPayContent에 따라 다른 텍스트
        const orderNum = safeParseInt(safeLocalStorage.getItem("ordernum"), 0);
        switch (isCreditPayContent) {
          case PAYMENT_STEPS.SELECT_METHOD:
            return PAYMENT_MESSAGES.SELECT_METHOD(totalSum, formatNumber);
          case PAYMENT_STEPS.CARD_INSERT:
            return PAYMENT_MESSAGES.CARD_INSERT;
          case PAYMENT_STEPS.MOBILE_PAY:
            return PAYMENT_MESSAGES.MOBILE_PAY;
          case PAYMENT_STEPS.CARD_REMOVE:
            return PAYMENT_MESSAGES.CARD_REMOVE;
          case PAYMENT_STEPS.PRINT_SELECT:
            return PAYMENT_MESSAGES.PRINT_SELECT(orderNum);
          case PAYMENT_STEPS.ORDER_PRINT:
            return PAYMENT_MESSAGES.ORDER_PRINT(orderNum);
          case PAYMENT_STEPS.RECEIPT_PRINT:
            return PAYMENT_MESSAGES.RECEIPT_PRINT;
          case PAYMENT_STEPS.FINISH:
            return PAYMENT_MESSAGES.FINISH;
          default:
          return "";
        }
        }
      default:
        return "";
    }
  }, [currentPage, isCreditPayContent, totalSum]);

  const getPageText = () => pageText;

  return (
    <div className="top">
      <div className="hidden-div" ref={sections.page}>
        <button
          type="hidden"
          className="hidden-btn page-btn"
          autoFocus={currentPage !== 'first'}
          data-tts-text={getPageText()}
        />
      </div>
    </div>
  );
});

Top.displayName = 'Top';

export const Step = memo(() => {
  const {
    isCreditPayContent,
    currentPage
  } = useContext(AppContext);
  
  const path = currentPage;

  return (
    <>
      {path === "second" && (
        <div className="step">
          <ol className="step-progress">
            <li className="step">
              <div className="border-circle">1</div>
              <span className="">메뉴선택</span>
              <span className="active step-separator">›</span>
            </li>
            <li className="step">
              <div className="header-black-circle">2</div>
              <span className="">내역확인</span>
              <span className="step-separator">›</span>
            </li>
            <li className="step">
              <div className="header-black-circle">3</div>
              <span className="">결제</span>
              <span className="step-separator">›</span>
            </li>
            <li className="step">
              <div className="header-black-circle">4</div>
              <span className="">완료</span>
            </li>
          </ol>
        </div>
      )}
      {path === "third" && (
        <div className="step">
          <ol className="step-progress">
            <li className="step">
              <div className="checked-circle"></div>
              <span className="">메뉴선택</span>
              <span className="active step-separator">›</span>
            </li>
            <li className="step">
              <div className="border-circle">2</div>
              <span className="">내역확인</span>
              <span className="step-separator">›</span>
            </li>
            <li className="step">
              <div className="header-black-circle">3</div>
              <span className="">결제</span>
              <span className="step-separator">›</span>
            </li>
            <li className="step">
              <div className="header-black-circle">4</div>
              <span className="">완료</span>
            </li>
          </ol>
        </div>
      )}
      {path === "forth" &&
        (isCreditPayContent < 3 ? (
          <div className="step">
            <ol className="step-progress">
              <li className="step">
                <div className="checked-circle"></div>
                <span className="">메뉴선택</span>
                <span className="active step-separator">›</span>
              </li>
              <li className="step">
                <div className="checked-circle"></div>
                <span className="">내역확인</span>
                <span className="step-separator">›</span>
              </li>
              <li className="step">
                <div className="border-circle">3</div>
                <span className="">결제</span>
                <span className="step-separator">›</span>
              </li>
              <li className="step">
                <div className="header-black-circle">4</div>
                <span className="">완료</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="step">
            <ol className="step-progress">
              <li className="step">
                <div className="checked-circle"></div>
                <span className="">메뉴선택</span>
                <span className="active step-separator">›</span>
              </li>
              <li className="step">
                <div className="checked-circle"></div>
                <span className="">내역확인</span>
                <span className="step-separator">›</span>
              </li>
              <li className="step">
                <div className="checked-circle"></div>
                <span className="">결제</span>
                <span className="step-separator">›</span>
              </li>
              {isCreditPayContent !== 7 ? (
                <li className="step">
                  <div className="border-circle">4</div>
                  <span className="">완료</span>
                </li>
              ) : (
                <li className="step">
                  <div className="checked-circle"></div>
                  <span className="">완료</span>
                </li>
              )}
            </ol>
          </div>
        ))}
    </>
  );
});

Step.displayName = 'Step';

export const Summary = memo(() => {
  const {
    sections,
    totalCount,
    totalSum,
    convertToKoreanQuantity,
    currentPage
  } = useContext(AppContext);
  const path = currentPage;
  const [isDisabledBtn, setisDisabledBtn] = useState(true);

  useEffect(() => {
    if (totalCount > 0) setisDisabledBtn(false);
    else setisDisabledBtn(true);
  }, [totalCount]);


  if (path !== "second" && path !== "third") {
    return null;
  }

  return (
    <div className="summary">
        <div className="task-manager">
          <p className="summary-label">수량</p>
          <p className="summary-text">{totalCount}개</p>
          <div className="short-colline"></div>
          <p className="summary-label">금액</p>
          <p className="summary-text">
            {formatNumber(totalSum)}원
          </p>
        </div>
        <div
          className="flex"
          ref={sections.footer}
          data-tts-text={`주문요약, 주문수량, ${convertToKoreanQuantity(totalCount)} 개, 주문금액, ${formatNumber(totalSum)}원, 버튼 두개,`}
        >
          {path === "second" && (
            <>
              <Button
                styleClass="summary-btn"
                ttsText="초기화,"
                svg={<ResetIcon className="summary-btn-icon" />}
                label="초기화"
                actionType="modal"
                actionTarget="Reset"
              />
              <Button
                styleClass={`summary-btn ${isDisabledBtn ? "disabled" : ""}`}
                ttsText={`주문하기, ${isDisabledBtn ? "비활성" : ""}`}
                svg={<OrderIcon className="summary-btn-icon" />}
                label="주문"
                disabled={isDisabledBtn}
                actionType="navigate"
                actionTarget="third"
              />
            </>
          )}

          {path === "third" && (
            <>
              <Button
                styleClass="summary-btn"
                ttsText="추가하기,"
                svg={<AddIcon className="summary-btn-icon" />}
                label="추가"
                actionType="navigate"
                actionTarget="second"
              />
              <Button
                styleClass="summary-btn"
                ttsText="결제하기,"
                svg={<PayIcon className="summary-btn-icon" />}
                label="결제"
                actionType="navigate"
                actionTarget="forth"
              />
            </>
          )}
        </div>
      </div>
  );
});

Summary.displayName = 'Summary';

export const Bottom = memo(() => {
  const {
    sections,
    isCreditPayContent,
    currentPage
  } = useContext(AppContext);
  const { remainingTimeFormatted, isActive } = useIdleTimeoutContext();
  const path = currentPage;

  return (
    <div
      className="bottom"
        data-tts-text={
          path === "" || (path === "forth" &&  [1,2,3].includes(isCreditPayContent)) ? "시스템 설정, 버튼 한개," : "시스템 설정, 버튼 두 개,"
        }
        ref={sections.bottomfooter}
      >
        {path === "" || (path === "forth" &&  [1,2,3].includes(isCreditPayContent)) ? (
          <div className="footer-coffeelogo"></div>
        ) : (
          <Button
            styleClass="down-footer-button btn-home"
            ttsText="처음으로,"
            svg={<HomeIcon />}
            label="처음으로"
            actionType="modal"
            actionTarget="Return"
          />
        )}

        {/* 타임아웃 카운트다운 표시 */}
        {isActive && (
          <div className="countdown">
            <span>{remainingTimeFormatted}</span>
          </div>
        )}

        <Button
          styleClass="down-footer-button"
          ttsText={path === "" ? "접근성," : "접근성,"}
          svg={<ExtentionIcon />}
          label="접근성"
          actionType="modal"
          actionTarget="Accessibility"
        />
      </div>
  );
});

Bottom.displayName = 'Bottom';

// ============================================================================
// Export
// ============================================================================

export default Process1;
export { Process1, Process2, Process3, Process4 };

