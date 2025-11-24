import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import FocusTrap from "focus-trap-react";
import { startReturnTimer, updateTimer, stopIntroTimer } from "../assets/timer";
import { useKeyboardNavigation } from "../assets/useKeyboardNavigation";
import { useTextHandler } from "../assets/tts";

const SecondPage = ({ }) => {
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
    convertToKoreanQuantity
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);

  useEffect(() => {
    setSelectedTab("전체메뉴");

  }, []);

  useEffect(() => {
    setPageNumber(1);
  }, [selectedTab]);

  useEffect(() => {
    stopIntroTimer();
    // 페이지 로드 시 모든 포커스 제거
    const timer = setTimeout(() => {
      if (document.activeElement) {
        const pageTTS = document.activeElement.dataset.text;
        setTimeout(() => {
          handleText(pageTTS);
        }, 500); // "실행" 송출 후에 실행 되도록 딜레이
      }
      startReturnTimer(commonScript.return, handleText, navigate);
    }, 0);

    // 버튼 스타일은 ButtonStyleGenerator.calculateButtonSizes()가 처리

    return () => clearTimeout(timer); // 클린업
  }, []);

  // useKeyboardNavigation
  useKeyboardNavigation({
    initFocusableSections: [
      "page",
      "top",
      "middle",
      "bottom",
      "footer",
      "bottomfooter",
    ],
    initFirstButtonSection: "top",
  });

  const itemsPerPage = isLow ? 3 : 9; // 한 페이지에 표시할 항목 수
  const [pageNumber, setPageNumber] = useState(1);
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const currentItems = menuItems.slice(startIndex, startIndex + itemsPerPage);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(menuItems.length / itemsPerPage);

  const handlePrevPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) setPageNumber(pageNumber + 1);
  };

  const handlePrevious = () => {
    const currentIndex = tabs.indexOf(selectedTab);
    const previousIndex = (currentIndex - 1 + tabs.length) % tabs.length; // 왼쪽으로 이동
    setSelectedTab(tabs[previousIndex]);
  };

  const handleNext = () => {
    const currentIndex = tabs.indexOf(selectedTab);
    const nextIndex = (currentIndex + 1) % tabs.length; // 오른쪽으로 이동
    setSelectedTab(tabs[nextIndex]);
  };

  const handleTouchEndWrapper = (e, id) => {
    if (id !== 13) {
      handleIncrease(id);
      handleText('담기, ');
    } else {
      handleText('없는 상품입니다.');
    }
  }
  return (
    <div className="main second">
      <div className="hidden-div" ref={sections.page}>
        <button
          type="hidden"
          autoFocus
          className="hidden-btn page-btn"
          data-text={"작업안내, 메뉴선택 단계, 카테고리에서 메뉴종류를 선택하시고, 메뉴에서 상품을 선택합니다, 초기화 버튼으로 상품을 다시 선택할 수 있습니다, 주문하기 버튼으로 다음 단계, 내역확인으로 이동 할 수 있습니다, " + commonScript.replay}
        ></button>
      </div>
      <div
        className="title"
        ref={sections.top}
        data-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 버튼 ${isLow ? '일곱' : '열'} 개,`}
      >
        <div className="menu-tabs">
          <div className="menu-tabs-flex-div">
            {isLow && (
              <button data-text="이전"
                className={`button toggle tab-pagination tab-button-prev`}
                onClick={(e) => { 
                  e.preventDefault();
                  e.target.focus(); 
                  handlePrevious(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(handlePrevious, 100);
                  }
                }}
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
                  className={`button toggle ${selectedTab === "주스" ? "active" : ""
                    }`}
                  data-text={`주스, ${selectedTab === "주스" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { 
                    e.preventDefault();
                    e.target.focus(); 
                    setSelectedTab("주스") }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("주스"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">주스</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "라떼" ? "active" : ""
                    }`}
                  data-text={`라떼, ${selectedTab === "라떼" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { 
                    e.preventDefault();
                    e.target.focus(); 
                    setSelectedTab("라떼"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("라떼"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">라떼</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "버블티" ? "active" : ""
                    }`}
                  data-text={`버블티, ${selectedTab === "버블티" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { 
                    e.preventDefault();
                    e.target.focus(); 
                    setSelectedTab("버블티"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("버블티"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">버블티</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "에이드" ? "active" : ""
                    }`}
                  data-text={`에이드, ${selectedTab === "에이드" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault();
                    e.target.focus(); setSelectedTab("에이드"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("에이드"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">에이드</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "기타" ? "active" : ""
                    }`}
                  data-text={`기타, ${selectedTab === "기타" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault();e.target.focus(); setSelectedTab("기타"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("기타"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">기타</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`button toggle ${selectedTab === "전체메뉴" ? "active" : ""
                    }`}
                  data-text={`전체메뉴, ${selectedTab === "전체메뉴" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault();e.target.focus(); setSelectedTab("전체메뉴"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("전체메뉴"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">전체메뉴</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle  ${selectedTab === "커피" ? "active" : ""
                    }`}
                  data-text={`커피, ${selectedTab === "커피" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("커피"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("커피"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">커피</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "밀크티" ? "active" : ""
                    }`}
                  data-text={`밀크티, ${selectedTab === "밀크티" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("밀크티"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("밀크티"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">밀크티</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "스무디" ? "active" : ""
                    }`}
                  data-text={`스무디, ${selectedTab === "스무디" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("스무디"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("스무디"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">스무디</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "차" ? "active" : ""
                    }`}
                  data-text={`차, ${selectedTab === "차" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("차"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("차"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">차</span>
                  </div>
                </button>
              </>
            )}

            {isLow && (
              <button data-text="다음"
                className={`button toggle tab-pagination tab-button-prev`}
                onClick={(e) => {e.preventDefault(); e.target.focus(); handleNext(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(handleNext, 100);
                  }
                }}
              >
                <div className="background dynamic">
                  <span className="content label">다음 &nbsp;&gt;</span>
                </div>
              </button>
            )}
          </div>
          {!isLow && (
            <>
              <div className="secondpage-long-rowline"></div>
              <div className="menu-tabs-flex-div">
                <button
                  className={`button toggle ${selectedTab === "주스" ? "active" : ""
                    }`}
                  data-text={`주스, ${selectedTab === "주스" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("주스"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("주스"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">주스</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "라떼" ? "active" : ""
                    }`}
                  data-text={`라떼, ${selectedTab === "라떼" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("라떼"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("라떼"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">라떼</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "버블티" ? "active" : ""
                    }`}
                  data-text={`버블티, ${selectedTab === "버블티" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("버블티"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("버블티"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">버블티</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "에이드" ? "active" : ""
                    }`}
                  data-text={`에이드, ${selectedTab === "에이드" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("에이드"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("에이드"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">에이드</span>
                  </div>
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`button toggle ${selectedTab === "기타" ? "active" : ""
                    }`}
                  data-text={`기타, ${selectedTab === "기타" ? "선택됨, " : "선택가능, "
                    }`}
                  onClick={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("기타"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("기타"), 100);
                    }
                  }}
                >
                  <div className="background dynamic">
                    <span className="content label">기타</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="menu-grid" ref={sections.middle} data-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(currentItems.length)}개,`}>
          {currentItems?.map((item, index) => (
            <button
              data-text={item.id == 13 ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`}
              className={`button touch-blocker menu-item ${item.id == 13 ? 'disabled' : ''}`}
              aria-disabled={item.id == 13}
              onClick={(e) => {
                e.preventDefault();
                e.target.focus();
                handleTouchEndWrapper(e, item.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTouchEndWrapper(e, item.id);
                }
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
        data-text={`페이지네이션, 메뉴, ${totalPages} 페이지 중 ${pageNumber} 페이지, 버튼 두 개,`}
      >
          <button data-text="이전, " className="button"
            onClick={(e) => { e.preventDefault(); e.target.focus(); handlePrevPage(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleText('실행, ', false);
                setTimeout(handlePrevPage, 100);
              }
            }}>
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
          <button data-text="다음," className="button" onClick={(e) => { e.preventDefault(); e.target.focus(); handleNextPage(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleText('실행, ', false);
                setTimeout(handleNextPage, 100);
              }
            }}>
            <div className="background dynamic">
              <span className="content label">다음 &nbsp;&gt;</span>
            </div>
          </button>
      </div>
    </div>
  );
};

export default SecondPage;
