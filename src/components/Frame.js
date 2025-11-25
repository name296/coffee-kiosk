import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useTextHandler } from '../assets/tts';
import { commonScript } from "../constants/commonScript";

export const Top = () => {
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

  const getPageText = () => {
    switch (currentPage) {
      case 'first':
        return "작업 안내, 시작화면 단계, 음식을 포장할지 먹고갈지 선택합니다." + commonScript.replay;
      case 'second':
        return "작업 안내, 메뉴선택 단계, 카테고리에서 메뉴종류를 선택하시고, 메뉴에서 상품을 선택합니다, 초기화 버튼으로 상품을 다시 선택할 수 있습니다, 주문하기 버튼으로 다음 단계, 내역확인으로 이동 할 수 있습니다, " + commonScript.replay;
      case 'third':
        return "작업 안내, 내역확인 단계, 주문목록에서 상품명, 수량, 가격을 확인합니다, 수량 버튼 및 삭제 버튼으로 주문목록을 수정 할 수 있습니다. 추가하기 버튼으로 이전 단계, 메뉴선택으로 돌아갈 수 있습니다, 결제하기 버튼으로 다음 단계, 결제선택으로 이동할 수 있습니다," + commonScript.replay;
      case 'forth':
        // ForthPage는 isCreditPayContent에 따라 다른 텍스트
        const orderNum = parseInt(localStorage.getItem("ordernum") || "0");
        if (isCreditPayContent === 0) {
          return `작업 안내, 결제 선택 단계. 결제 금액, ${totalSum.toLocaleString("ko-KR")}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ` + commonScript.replay;
        } else if (isCreditPayContent === 1) {
          return `작업 안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ` + commonScript.replay;
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
          return `작업 안내, 사용종료, 이용해주셔서 감사합니다,`;
        } else {
          return "";
        }
      default:
        return "";
    }
  };

  return (
    <div className="top">
      <div className="hidden-div" ref={sections.page}>
        <button
          type="hidden"
          className="hidden-btn page-btn"
          autoFocus={currentPage !== 'first'}
          data-text={getPageText()}
        />
      </div>
    </div>
  );
};

export const Step = () => {
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
};

export const Summary = () => {
  const {
    sections,
    isDark,
    totalCount,
    totalSum,
    isResetModal,
    setisResetModal,
    convertToKoreanQuantity,
    volume,
    currentPage,
    setCurrentPage
  } = useContext(AppContext);
  const path = currentPage;
  const [isDisabledBtn, setisDisabledBtn] = useState(true);
  const { handleText } = useTextHandler(volume);

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
            {totalSum.toLocaleString("ko-KR")}원
          </p>
        </div>
        <div
          className="flex"
          ref={sections.footer}
          data-text={`주문요약, 주문수량, ${convertToKoreanQuantity(totalCount)} 개, 주문금액, ${totalSum.toLocaleString("ko-KR")}원, 버튼 두개,`}
        >
          {path === "second" && (
            <>
              <button
                data-text="초기화,"
                className="button summary-btn"
                onClick={(e) => { 
                  e.preventDefault();
                  setisResetModal(true);
                 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(() => {setisResetModal(true);}, 100);
                  }
                }}
              >
                <div className="background dynamic">
                  <span className="content icon" aria-hidden="true">
                    <img
                      className="summary-btn-icon"
                      src={"/images/ico_reset.png"}
                      alt="초기화"
                    />
                  </span>
                  <span className="content label">초기화</span>
                </div>
              </button>
              <button
                data-text={`주문하기,  ${isDisabledBtn ? "비활성" : ""}`}
                className={`button summary-btn ${
                  isDisabledBtn ? "disabled" : ""
                }`}
                aria-disabled={isDisabledBtn}
                onClick={(e) => { 
                  e.preventDefault();
                  e.target.focus();
                  if (totalCount > 0) {
                    path === "second"
                      ? setCurrentPage("third")
                      : setCurrentPage("forth");
                  }
                 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(() => {
                      if (totalCount > 0) {
                      path === "second"
                        ? setCurrentPage("third")
                        : setCurrentPage("forth");
                    }}, 300);
                  }
                }}
              >
                <div className="background dynamic">
                  <span className="content icon" aria-hidden="true">
                    <img
                      className="summary-btn-icon"
                      src={
                        isDark
                          ? "/images/contrast_ico_order.png"
                          : "/images/ico_order.png"
                      }
                      alt="주문"
                    />
                  </span>
                  <span className="content label">주문</span>
                </div>
              </button>
            </>
          )}

          {path === "third" && (
            <>
              <button
                data-text="추가하기 ,"
                className="button summary-btn"
                onClick={(e) => { 
                  e.preventDefault();
                  setCurrentPage("second");
                 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(() => { setCurrentPage("second");}, 300);
                  }
                }}
              >
                <div className="background dynamic">
                  <span className="content icon" aria-hidden="true">
                    <img
                      className="summary-btn-icon"
                      src={"/images/ico_add_order.png"}
                      alt="추가"
                    />
                  </span>
                  <span className="content label">추가</span>
                </div>
              </button>
              <button
                data-text="결제하기, "
                className="button summary-btn"
                onClick={(e) => { 
                  e.preventDefault();
                  e.target.focus();
                  if (totalCount > 0) {
                    path === "second"
                      ? setCurrentPage("third")
                      : setCurrentPage("forth");
                  }
                 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleText('실행, ', false);
                    setTimeout(() => {
                      if (totalCount > 0) {
                        path === "second"
                          ? setCurrentPage("third")
                          : setCurrentPage("forth");
                      }}, 300);
                  }
                }}
              >
                <div className="background dynamic">
                  <span className="content icon" aria-hidden="true">
                    <img
                      className="summary-btn-icon"
                      src={
                        isDark
                          ? "/images/contrast_Mask group.png"
                          : "/images/Mask group.png"
                      }
                      alt="결제"
                    />
                  </span>
                  <span className="content label">결제</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
  );
};

export const Bottom = () => {
  const {
    sections,
    isDark,
    isReturnModal,
    setisReturnModal,
    isAccessibilityModal,
    setisAccessibilityModal,
    isCreditPayContent,
    volume,
    currentPage
  } = useContext(AppContext);
  const path = currentPage;
  const { handleText } = useTextHandler(volume);

  return (
    <div
      className="bottom"
        data-text={
          path === "" || (path === "forth" &&  [1,2,3].includes(isCreditPayContent)) ? "시스템 설정, 버튼 한개," : "시스템 설정, 버튼 두 개,"
        }
        ref={sections.bottomfooter}
      >
        {path === "" || (path === "forth" &&  [1,2,3].includes(isCreditPayContent)) ? (
          <div className="footer-coffeelogo"></div>
        ) : (
          <button
            className="button down-footer-button btn-home"
            data-text="처음으로,"
            onClick={(e) => { 
              e.preventDefault();
              setisReturnModal(true);
              document.activeElement.blur();
             }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleText('실행, ', false);
                setTimeout(() => {
                  setisReturnModal(true);
                  document.activeElement.blur();
                  }, 300);
              }
            }}
          >
            <div className="background dynamic">
              <span className="content icon" aria-hidden="true">
                <div className="div-footer-circle">
                  <img
                    className="black-circle"
                    src="images/home_btn.png"
                    alt="home"
                  />
                </div>
              </span>
              <span className="content label">처음으로</span>
            </div>
          </button>
        )}

        <button 
          data-text={path === "" ? "접근성," : "접근성,"}
          className="button down-footer-button"
          onClick={(e) => { 
            e.preventDefault();
            setisAccessibilityModal(true)
           }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleText('실행, ', false);
              setTimeout(() => {
                setisAccessibilityModal(true)
                }, 300);
            }
          }}
        >
          <div className="background dynamic">
            <span className="content icon" aria-hidden="true">
              <div className="div-footer-circle">
                <img
                  className="black-circle"
                  src="/images/contrast_ico_low_sc.png"
                  alt="wheelchair"
                />
              </div>
            </span>
            <span className="content label">접근성</span>
          </div>
        </button>
      </div>
  );
};

