import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ThirdPage.css";
import { AppContext } from "../App";
import DeleteModal from "../components/DeleteModal";
import DeleteCheckModal from "../components/DeleteCheckModal";
// import { startReturnTimer, updateTimer } from "../assets/timer";
import { useKeyboardNavigation } from "../assets/useKeyboardNavigation";
import { useTextHandler } from "../assets/tts";

const ThirdPage = () => {
  const navigate = useNavigate();
  const {
    sections,
    totalMenuItems,
    isHighContrast,
    isLowScreen,
    quantities,
    handleIncrease,
    handleDecrease,
    filterMenuItems,
    isDeleteModal,
    setisDeleteModal,
    isDeleteCheckModal,
    setisDeleteCheckModal,
    commonScript,
    volume,
    convertToKoreanQuantity
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  // 각 아이템의 수량을 관리

  const ITEMS_PER_PAGE = isLowScreen ? 3 : 6; // 페이지당 항목 수
  const [currentPage, setCurrentPage] = useState(1);
  const [id, setid] = useState(0);

  // 현재 페이지에 해당하는 항목 가져오기
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const priceItems = filterMenuItems(totalMenuItems, quantities);

  const currentItems = priceItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  // 총 페이지 수 계산
  const totalPages =
    priceItems.length === 0 ? 1 : Math.ceil(priceItems.length / ITEMS_PER_PAGE);

  // 페이지 이동 함수
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  function prependRows(existingArray, currentItems) {
    // row1부터 rowN까지 배열 생성
    const newRows = Array.from(
      { length: currentItems },
      (_, index) => `row${index + 1}`
    );

    // 기존 배열의 앞에 새 요소를 추가
    return ["page", ...newRows, ...existingArray];
  }

  const focusableSections = prependRows(
    ["bottom", "footer", "bottomfooter"],
    currentItems.length
  );

  // useKeyboardNavigation
  const { updateFocusableSections } = useKeyboardNavigation({
    initFocusableSections: focusableSections,
    initFirstButtonSection: "row1",
  });

  const handleTouchDecrease = (id) => {
    if (quantities[id] === 1) {
      setid(id);
      if (currentItems.length > 1) {
        setisDeleteModal(true);
      } else {
        setisDeleteCheckModal(true);
      }
    } else {
      handleDecrease(id);
    }
  }

  const handleTouchDelete = (id)=>{
    setid(id);
    if (currentItems.length > 1) {
      setisDeleteModal(true);
    } else {
      setisDeleteCheckModal(true);
    }
  }


  useEffect(()=>{
     // 새로 계산된 focusableSections로 업데이트
     const updatedSections = prependRows(
      ["bottom", "footer", "bottomfooter"],
      currentItems.length
    );
    updateFocusableSections(updatedSections); // 업데이트 호출

  },[currentPage])

  useEffect(() => {
    if (currentItems.length === 0) {
      navigate("/second");
    }
  }, [currentItems]);

  useEffect(() => {
    // 페이지 로드 시 모든 포커스 제거
    const timer = setTimeout(() => {
      if (document.activeElement) {
        const pageTTS = document.activeElement.dataset.text;
        setTimeout(() => {
          handleText(pageTTS);
        }, 500); // "실행" 송출 후에 실행 되도록 0.5초 뒤로 설정
      }
      // startReturnTimer(commonScript.return, handleText, navigate);
    }, 0);

    return () => clearTimeout(timer); // 클린업

    document.querySelectorAll('button').forEach(btn => {
      const { width, height } = btn.getBoundingClientRect();
      const shortSize = Math.min(width, height);
      btn.style.setProperty('--short-size', `${shortSize}px`);
    });
  }, []);



  return (
    <>
      {isDeleteModal ? (
        <DeleteModal
          currentItems={currentItems}
          quantities={quantities}
          id={id}
          handleDecrease={handleDecrease}
        ></DeleteModal>
      ) : (
        ""
      )}
      {isDeleteCheckModal ? (
        <DeleteCheckModal
          currentItems={currentItems}
          quantities={quantities}
          id={id}
          handleDecrease={handleDecrease}
        ></DeleteCheckModal>
      ) : (
        ""
      )}
      <div className="third-content">
        <div className="hidden-div" ref={sections.page}>
          <button
            type="hidden"
            autoFocus
            className="hidden-btn page-btn"
            data-text={"작업 안내, 주문내역 확인 단계, 주문목록에서 상품명, 수량, 가격을 확인합니다, 수량 버튼 및 삭제 버튼으로 주문목록을 수정 할 수 있습니다. 추가하기 버튼으로 이전 단계, " +
          "메뉴선택으로 돌아갈 수 있습니다, 결제하기 버튼으로 다음 단계, 결제선택으로 이동할 수 있습니다,"  + commonScript.replay}
          ></button>
        </div>
        <div className="third-up-content">
          <span
            style={isHighContrast ? { color: "#FFE101" } : { color: "#8C532C" }}
          >
            내역
          </span>
          을 확인하시고&nbsp;
          <span
            style={isHighContrast ? { color: "#FFE101" } : { color: "#8C532C" }}
          >
            결제하기
          </span>
          &nbsp;버튼을 누르세요
        </div>
        <div className="third-middle-content">
          {isLowScreen ? (
            <>
              <p style={{ marginLeft: "-30px" }}>상품명</p>
              <p style={{ marginLeft: "10px" }}>수량</p>
              <p style={{ marginLeft: "-20px" }}>가격</p>
              <p style={{ marginLeft: "-50px" }}>삭제</p>
            </>
          ) : (
            <>
              <p style={{ marginLeft: "110px" }}>상품명</p>
              <p style={{ marginLeft: "110px" }}>수량</p>
              <p style={{ marginLeft: "55px" }}>가격</p>
              <p style={{ marginLeft: "-20px" }}>삭제</p>
            </>
          )}
        </div>
        <div className="third-main-content">
          {currentItems.map((item, i) => {
            const globalIndex = startIndex + i + 1;
            const rowIndex = (i % ITEMS_PER_PAGE) + 1;
            const refKey = `row${rowIndex}`;
            return (
              <div key={item.id}>
                <div className="order-item" ref={sections[refKey]} data-text={`주문목록,${globalIndex}번, ${item.name}, ${convertToKoreanQuantity(quantities[item.id])} 개, ${item.price * quantities[item.id]}원, 버튼 세 개, `}>
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
                      data-text="수량 빼기"
                      className="qty-btn"
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.currentTarget.focus();
                        handleTouchDecrease(item.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleText('실행', false);
                          setTimeout(() => handleTouchDecrease(item.id), 100);
                        }
                      }}
                    >
                      -
                    </button>
                    <span className="qty">{quantities[item.id]}</span>
                    <button
                      data-text="수량 더하기"
                      className="qty-btn"
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.currentTarget.focus();
                        handleIncrease(item.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleText('실행', false);
                          setTimeout(() => handleIncrease(item.id), 100);
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span className="order-price">
                    {Number(item.price * quantities[item.id]).toLocaleString()}원
                  </span>
                  <button
                    data-text="삭제"
                    className="delete-btn"
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.currentTarget.focus();
                      handleTouchDelete(item.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleText('실행', false);
                        setTimeout(() => handleTouchDelete(item.id), 100);
                      }
                    }}
                  >
                    <img src= "/images/trash.png"></img>
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
          data-text={`페이지네이션, 주문목록, ${totalPages}페이지 중 ${currentPage}페이지, 버튼 두 개,`}
        >
          <button data-text=" 이전," onTouchEnd={(e) => { e.preventDefault();e.target.focus(); handlePrevPage(); }}
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
            <span style={{ color: "#707070" }}>{totalPages}</span>
          </span>
          <button data-text=" 다음," 
          onTouchEnd={(e) => { e.preventDefault();e.target.focus(); handleNextPage(); }}
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
    </>
  );
};

export default ThirdPage;
