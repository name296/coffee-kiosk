import React, { useContext, useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { AppContext } from "../context";
import FocusTrap from "focus-trap-react";
import { startReturnTimer, updateTimer, stopIntroTimer } from "../assets/timer";
import { useTextHandler } from "../assets/tts";
import { usePagination, useSafeDocument, useMultiModalButtonHandler } from "../hooks";
import { PAGINATION_CONFIG, FOCUS_SECTIONS, TIMER_CONFIG, DEFAULT_SETTINGS, DISABLED_MENU_ID, ERROR_MESSAGES } from "../config";
import { safeQuerySelector } from "../utils/browserCompatibility";

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
  }, [handleText, setCurrentPage, blurActiveElement]);

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

  // 탭 네비게이션 함수들 (메모이제이션)
  const handlePrevious = useCallback(() => {
    const currentIndex = tabs.indexOf(selectedTab);
    const previousIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setSelectedTab(tabs[previousIndex]);
  }, [tabs, selectedTab, setSelectedTab]);

  const handleNext = useCallback(() => {
    const currentIndex = tabs.indexOf(selectedTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setSelectedTab(tabs[nextIndex]);
  }, [tabs, selectedTab, setSelectedTab]);

  // 메뉴 아이템 클릭 핸들러 (메모이제이션)
  const handleTouchEndWrapper = useCallback((e, id) => {
    if (id !== DISABLED_MENU_ID) {
      handleIncrease(id);
      handleText('담기, ');
    } else {
      handleText(ERROR_MESSAGES.NO_PRODUCT);
    }
  }, [handleIncrease, handleText]);

  // 토글 그룹 핸들러 (메모이제이션)
  const handleTabToggle = useCallback((tabName) => {
    setSelectedTab(tabName);
  }, [setSelectedTab]);

  // 멀티모달 버튼 핸들러 (TTS + 토글 그룹 스위칭 통합)
  const handleButtonClick = useMultiModalButtonHandler(
    handleText,
    '.menu-tabs',
    handleTabToggle,
    '선택, '
  );
  return (
    <div className="main second">
      <div className="menu-tabs" ref={sections.top} data-tts-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 버튼 ${isLow ? '일곱' : '열'} 개,`}>
            {isLow && (
              <button data-tts-text="이전"
                className={`button toggle tab-pagination tab-button-prev`}
                onClick={(e) => { 
                  e.preventDefault();
                  e.target.focus(); 
                  handlePrevious(); }}
              >
                <div className="background dynamic">
                  <span className="content label">&lt;&nbsp; 이전</span>
                </div>
              </button>
            )}
            {["주스", "라떼", "버블티", "에이드", "기타"].includes(
              selectedTab
            ) && isLow ? (
              <>
                <button
                  className={`button toggle ${selectedTab === "주스" ? "pressed" : ""
                    }`}
                  data-tts-text={`주스, ${selectedTab === "주스" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { 
                    e.preventDefault();
                    // 같은 그룹 내 다른 버튼의 pressed 제거
                    const group = e.target.closest('.menu-tabs');
                    if (group) {
                      group.querySelectorAll('.button.toggle').forEach(btn => {
                        if (btn !== e.target.closest('.button')) {
                          btn.classList.remove('pressed');
                        }
                      });
                    }
                    setSelectedTab("주스");
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">주스</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "라떼" ? "pressed" : ""
                    }`}
                  data-tts-text={`라떼, ${selectedTab === "라떼" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { 
                    e.preventDefault();
                    // 같은 그룹 내 다른 버튼의 pressed 제거
                    const group = e.target.closest('.menu-tabs');
                    if (group) {
                      group.querySelectorAll('.button.toggle').forEach(btn => {
                        if (btn !== e.target.closest('.button')) {
                          btn.classList.remove('pressed');
                        }
                      });
                    }
                    setSelectedTab("라떼");
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">라떼</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "버블티" ? "pressed" : ""
                    }`}
                  data-tts-text={`버블티, ${selectedTab === "버블티" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { 
                    e.preventDefault();
                    // 같은 그룹 내 다른 버튼의 pressed 제거
                    const group = e.target.closest('.menu-tabs');
                    if (group) {
                      group.querySelectorAll('.button.toggle').forEach(btn => {
                        if (btn !== e.target.closest('.button')) {
                          btn.classList.remove('pressed');
                        }
                      });
                    }
                    setSelectedTab("버블티");
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">버블티</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "에이드" ? "pressed" : ""
                    }`}
                  data-tts-text={`에이드, ${selectedTab === "에이드" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { 
                    e.preventDefault();
                    // 같은 그룹 내 다른 버튼의 pressed 제거
                    const group = e.target.closest('.menu-tabs');
                    if (group) {
                      group.querySelectorAll('.button.toggle').forEach(btn => {
                        if (btn !== e.target.closest('.button')) {
                          btn.classList.remove('pressed');
                        }
                      });
                    }
                    setSelectedTab("에이드");
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">에이드</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "기타" ? "pressed" : ""
                    }`}
                  data-tts-text={`기타, ${selectedTab === "기타" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "기타")}
                >
                  <div className="background dynamic">
                    <span className="content label">기타</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`button toggle ${selectedTab === "전체메뉴" ? "pressed" : ""
                    }`}
                  data-tts-text={`전체메뉴, ${selectedTab === "전체메뉴" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "전체메뉴")}
                >
                  <div className="background dynamic">
                    <span className="content label">전체메뉴</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "커피" ? "pressed" : ""
                    }`}
                  data-tts-text={`커피, ${selectedTab === "커피" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "커피")}
                >
                  <div className="background dynamic">
                    <span className="content label">커피</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "밀크티" ? "pressed" : ""
                    }`}
                  data-tts-text={`밀크티, ${selectedTab === "밀크티" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "밀크티")}
                >
                  <div className="background dynamic">
                    <span className="content label">밀크티</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "스무디" ? "pressed" : ""
                    }`}
                  data-tts-text={`스무디, ${selectedTab === "스무디" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "스무디")}
                >
                  <div className="background dynamic">
                    <span className="content label">스무디</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "차" ? "pressed" : ""
                    }`}
                  data-tts-text={`차, ${selectedTab === "차" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "차")}
                >
                  <div className="background dynamic">
                    <span className="content label">차</span>
                  </div>
                </button>
              </>
            )}

            {isLow && (
              <button data-tts-text="다음"
                className={`button toggle tab-pagination tab-button-prev`}
                onClick={(e) => {e.preventDefault(); e.target.focus(); handleNext(); }}
              >
                <div className="background dynamic">
                  <span className="content label">다음 &nbsp;&gt;</span>
                </div>
              </button>
            )}
          {!isLow && (
            <>
                <button
                  className={`button toggle ${selectedTab === "주스" ? "pressed" : ""
                    }`}
                  data-tts-text={`주스, ${selectedTab === "주스" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "주스")}
                >
                  <div className="background dynamic">
                    <span className="content label">주스</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "라떼" ? "pressed" : ""
                    }`}
                  data-tts-text={`라떼, ${selectedTab === "라떼" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "라떼")}
                >
                  <div className="background dynamic">
                    <span className="content label">라떼</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "버블티" ? "pressed" : ""
                    }`}
                  data-tts-text={`버블티, ${selectedTab === "버블티" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "버블티")}
                >
                  <div className="background dynamic">
                    <span className="content label">버블티</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "에이드" ? "pressed" : ""
                    }`}
                  data-tts-text={`에이드, ${selectedTab === "에이드" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "에이드")}
                >
                  <div className="background dynamic">
                    <span className="content label">에이드</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "기타" ? "pressed" : ""
                    }`}
                  data-tts-text={`기타, ${selectedTab === "기타" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => handleButtonClick(e, "기타")}
                >
                  <div className="background dynamic">
                    <span className="content label">기타</span>
                  </div>
                </button>
            </>
          )}
        </div>

      {/* 컨텐츠 */}
      <div className="menu-grid" ref={sections.middle} data-tts-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(currentItems.length)}개,`}>
          {currentItems?.map((item, index) => (
            <button
              data-tts-text={item.id === DISABLED_MENU_ID ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`}
              className={`button menu-item ${item.id === DISABLED_MENU_ID ? 'disabled' : ''}`}
              aria-disabled={item.id === DISABLED_MENU_ID}
              onClick={(e) => {
                e.preventDefault();
                e.target.focus();
                handleTouchEndWrapper(e, item.id);
              }}
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
          <button data-tts-text="이전, " className="button"
            onClick={(e) => { e.preventDefault(); e.target.focus(); handlePrevPage(); }}
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
          <button data-tts-text="다음," className="button" onClick={(e) => { e.preventDefault(); e.target.focus(); handleNextPage(); }}
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
