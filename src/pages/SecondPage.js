import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../App";
import "../styles/SecondPage.css";
import { useNavigate } from "react-router-dom";
import FocusTrap from "focus-trap-react";
import { startReturnTimer, updateTimer, stopIntroTimer } from "../assets/timer";
import { useKeyboardNavigation } from "../assets/useKeyboardNavigation";
import { useTextHandler } from "../assets/tts";

const SecondPage = ({ }) => {
  const navigate = useNavigate();
  const {
    sections,
    isLowScreen,
    isHighContrast,
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
    setCurrentPage(1);
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

    document.querySelectorAll('button').forEach(btn => {
      const { width, height } = btn.getBoundingClientRect();
      const shortSize = Math.min(width, height);
      btn.style.setProperty('--short-size', `${shortSize}px`);
    });

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

  const itemsPerPage = isLowScreen ? 3 : 9; // 한 페이지에 표시할 항목 수
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = menuItems.slice(startIndex, startIndex + itemsPerPage);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(menuItems.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
    <div className="second-content">
      <div className="hidden-div" ref={sections.page}>
        <button
          type="hidden"
          autoFocus
          className="hidden-btn page-btn"
          data-text={"작업안내, 메뉴선택 단계, 카테고리에서 메뉴종류를 선택하시고, 메뉴에서 상품을 선택합니다, 초기화 버튼으로 상품을 다시 선택할 수 있습니다, 주문하기 버튼으로 다음 단계, 내역확인으로 이동 할 수 있습니다, " + commonScript.replay}
        ></button>
      </div>
      <div
        className="second-up-content"
        ref={sections.top}
        data-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 버튼 ${isLowScreen ? '일곱' : '열'} 개,`}
      >
        <div className="menu-tabs">
          <div className="menu-tabs-flex-div">
            {isLowScreen && (
              <button data-text="이전"
                style={{
                  marginLeft: "-10px",
                  marginRight: "15px",
                  background: "#252525",
                }}
                className={`tab-button tab-pagination`}
                onTouchEnd={(e) => { 
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
                &lt;&nbsp; 이전
              </button>
            )}
            {["주스", "라떼", "버블티", "에이드", "기타"].includes(
              selectedTab
            ) && isLowScreen ? (
              <>
                <button
                  className={`select-btn tab-button ${selectedTab === "주스" ? "active" : ""
                    }`}
                  data-text={`주스, ${selectedTab === "주스" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { 
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
                  주스
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "라떼" ? "active" : ""
                    }`}
                  data-text={`라떼, ${selectedTab === "라떼" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { 
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
                  라떼
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "버블티" ? "active" : ""
                    }`}
                  data-text={`버블티, ${selectedTab === "버블티" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { 
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
                  버블티
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "에이드" ? "active" : ""
                    }`}
                  data-text={`에이드, ${selectedTab === "에이드" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault();
                    e.target.focus(); setSelectedTab("에이드"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("에이드"), 100);
                    }
                  }}
                >
                  에이드
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "기타" ? "active" : ""
                    }`}
                  data-text={`기타, ${selectedTab === "기타" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault();e.target.focus(); setSelectedTab("기타"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("기타"), 100);
                    }
                  }}
                >
                  기타
                </button>
              </>
            ) : (
              <>
                <button
                  className={`select-btn tab-button ${selectedTab === "전체메뉴" ? "active" : ""
                    }`}
                  data-text={`전체메뉴, ${selectedTab === "전체메뉴" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault();e.target.focus(); setSelectedTab("전체메뉴"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("전체메뉴"), 100);
                    }
                  }}
                >
                  전체메뉴
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button  ${selectedTab === "커피" ? "active" : ""
                    }`}
                  data-text={`커피, ${selectedTab === "커피" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("커피"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("커피"), 100);
                    }
                  }}
                >
                  커피
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "밀크티" ? "active" : ""
                    }`}
                  data-text={`밀크티, ${selectedTab === "밀크티" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("밀크티"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("밀크티"), 100);
                    }
                  }}
                >
                  밀크티
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "스무디" ? "active" : ""
                    }`}
                  data-text={`스무디, ${selectedTab === "스무디" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("스무디"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("스무디"), 100);
                    }
                  }}
                >
                  스무디
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "차" ? "active" : ""
                    }`}
                  data-text={`차, ${selectedTab === "차" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("차"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("차"), 100);
                    }
                  }}
                >
                  차
                </button>
              </>
            )}

            {isLowScreen && (
              <button data-text="다음"
                style={{ marginLeft: "15px", background: "#252525" }}
                className={`tab-button tab-pagination`}
                onTouchEnd={(e) => {e.preventDefault(); e.target.focus(); handleNext(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(handleNext, 100);
                  }
                }}
              >
                다음 &nbsp;&gt;
              </button>
            )}
          </div>
          {!isLowScreen && (
            <>
              <div className="secondpage-long-rowline"></div>
              <div className="menu-tabs-flex-div">
                <button
                  className={`select-btn tab-button ${selectedTab === "주스" ? "active" : ""
                    }`}
                  data-text={`주스, ${selectedTab === "주스" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("주스"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("주스"), 100);
                    }
                  }}
                >
                  주스
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "라떼" ? "active" : ""
                    }`}
                  data-text={`라떼, ${selectedTab === "라떼" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("라떼"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("라떼"), 100);
                    }
                  }}
                >
                  라떼
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "버블티" ? "active" : ""
                    }`}
                  data-text={`버블티, ${selectedTab === "버블티" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("버블티"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("버블티"), 100);
                    }
                  }}
                >
                  버블티
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "에이드" ? "active" : ""
                    }`}
                  data-text={`에이드, ${selectedTab === "에이드" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("에이드"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("에이드"), 100);
                    }
                  }}
                >
                  에이드
                </button>
                <div className="secondpage-short-colline"></div>
                <button
                  className={`select-btn tab-button ${selectedTab === "기타" ? "active" : ""
                    }`}
                  data-text={`기타, ${selectedTab === "기타" ? "선택됨, " : "선택가능, "
                    }`}
                  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); setSelectedTab("기타"); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('선택, ', false);
                      setTimeout(() => setSelectedTab("기타"), 100);
                    }
                  }}
                >
                  기타
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className={`${isLowScreen ? "flex-center" : ""}`}>
        <div className="menu-grid" ref={sections.middle} data-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(currentItems.length)}개,`}>
          {currentItems?.map((item, index) => (
            <button
              data-text={item.id == 13 ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`}
              className={`touch-blocker menu-item ${item.id == 13 ? 'disabled' : ''}`}
              onTouchEnd={(e) => {
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
              <img src={item.img} alt={item.name} />
              <div className="txt-box">
                <p>{item.name}</p>
                <p>{Number(item.price).toLocaleString()}원</p>
              </div>
            </button>
          ))}
        </div>

        <div
          className="pagination"
          ref={sections.bottom}
          data-text={`페이지네이션, 메뉴, ${totalPages} 페이지 중 ${currentPage} 페이지, 버튼 두 개,`}
        >
          <button data-text="이전, "
            onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); handlePrevPage(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleText('실행, ', false);
                setTimeout(handlePrevPage, 100);
              }
            }}>
            &lt;&nbsp; 이전
          </button>
          <span style={{ fontSize: "4rem" }}>
            <span
              style={
                isHighContrast ? { color: "#FFE101" } : { color: "#8C532C" }
              }
            >
              {currentPage}
            </span>
            <span style={{ color: "#707070" }}>&nbsp;/&nbsp;</span>
            <span style={{ color: "#707070" }}>
              {totalPages === 0 ? 1 : totalPages}
            </span>
          </span>
          <button data-text="다음,"  onTouchEnd={(e) => { e.preventDefault(); e.target.focus(); handleNextPage(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleText('실행, ', false);
                setTimeout(handleNextPage, 100);
              }
            }}>
            다음 &nbsp;&gt;
          </button>
        </div>

      </div>
    </div>
  );
};

export default SecondPage;
