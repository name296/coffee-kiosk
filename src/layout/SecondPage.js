// ============================================================================
// 두 번째 페이지 컴포넌트 (메뉴 선택 화면)
// ============================================================================

import React, { useContext, useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import FocusTrap from "focus-trap-react";
import { AppContext } from "../context";
import { usePagination, useSafeDocument, useMultiModalButtonHandler } from "../hooks";
import { useTimer } from "../hooks/useSingletonTimer";
import { useTextHandler } from "../assets/tts";
import { PAGINATION_CONFIG, FOCUS_SECTIONS, TIMER_CONFIG, DEFAULT_SETTINGS, DISABLED_MENU_ID, ERROR_MESSAGES } from "../config";
import { safeQuerySelector } from "../utils/browserCompatibility";
import Button from "../components/Button";
import menuData from "../../public/menu_data.json";

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
    setCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { startReturnTimer, stopIntroTimer } = useTimer();

  const { blurActiveElement } = useSafeDocument();

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

  // 탭 그룹 분리 (JSON 데이터 기반)
  const firstTabGroup = useMemo(() => 
    menuData.categoryInfo.filter(cat => cat.cate_id >= 0 && cat.cate_id <= 4).map(cat => cat.cate_name),
    []
  );
  const secondTabGroup = useMemo(() => 
    menuData.categoryInfo.filter(cat => cat.cate_id >= 5 && cat.cate_id <= 9).map(cat => cat.cate_name),
    []
  );

  // 현재 표시할 탭 그룹 결정
  const currentTabGroup = useMemo(() => {
    if (isLow) {
      // isLow일 때: secondTabGroup에 속하면 secondTabGroup, 아니면 firstTabGroup
      return secondTabGroup.includes(selectedTab) ? secondTabGroup : firstTabGroup;
    } else {
      // !isLow일 때: firstTabGroup에 속하면 firstTabGroup, 아니면 secondTabGroup
      return firstTabGroup.includes(selectedTab) ? firstTabGroup : secondTabGroup;
    }
  }, [isLow, selectedTab, firstTabGroup, secondTabGroup]);

  // 탭 버튼 렌더링 헬퍼 함수
  const renderTabButton = useCallback((tabName, index, isLast) => (
    <React.Fragment key={tabName}>
      <Button
        styleClass={`toggle ${selectedTab === tabName ? "pressed" : ""}`}
        ttsText={`${tabName}, ${selectedTab === tabName ? "선택됨, " : "선택가능, "}`}
        actionType="selectTab"
        actionTarget={tabName}
        label={tabName}
      />
      {!isLast && <div className="secondpage-short-colline"></div>}
    </React.Fragment>
  ), [selectedTab]);

  return (
    <div className="main second">      
      <div className="category-full" ref={sections.top} data-tts-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 버튼 일곱 개,`}>
        <Button
          styleClass="toggle"
          ttsText="이전"
          label="이전"
          actionType="tabNav"
          actionTarget="prev"
        />
        <div className="category">
          {currentTabGroup.map((tabName, index) => 
            renderTabButton(tabName, index, index === currentTabGroup.length - 1)
          )}
        </div>
        <Button
          styleClass="toggle"
          ttsText="다음"
          label="다음"
          actionType="tabNav"
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
                <img src={item.img} alt={item.name} />
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

export default SecondPage;
