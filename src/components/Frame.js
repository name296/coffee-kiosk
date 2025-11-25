import React, { useContext, useEffect, useState, useMemo, memo } from "react";
import { AppContext } from "../context";
import { useTextHandler } from '../assets/tts';
import { safeLocalStorage, safeParseInt, formatNumber } from "../utils/browserCompatibility";
import { PAGE_MESSAGES, PAYMENT_MESSAGES, PAYMENT_STEPS } from "../config";
import { getAssetPath } from "../utils/pathUtils";
import { ResetIcon, OrderIcon, AddIcon, PayIcon, LowposIcon, HomeIcon, ExtentionIcon } from "../components/icons";

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
        // ForthPage는 isCreditPayContent에 따라 다른 텍스트
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

export const Summary = memo(() => {
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
              <button
                data-tts-text="초기화,"
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
                    <ResetIcon className="summary-btn-icon" />
                  </span>
                  <span className="content label">초기화</span>
                </div>
              </button>
              <button
                data-tts-text={`주문하기,  ${isDisabledBtn ? "비활성" : ""}`}
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
                    <OrderIcon className="summary-btn-icon" />
                  </span>
                  <span className="content label">주문</span>
                </div>
              </button>
            </>
          )}

          {path === "third" && (
            <>
              <button
                data-tts-text="추가하기 ,"
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
                    <AddIcon className="summary-btn-icon" />
                  </span>
                  <span className="content label">추가</span>
                </div>
              </button>
              <button
                data-tts-text="결제하기, "
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
                    <PayIcon className="summary-btn-icon" />
                  </span>
                  <span className="content label">결제</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
  );
});

export const Bottom = memo(() => {
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
        data-tts-text={
          path === "" || (path === "forth" &&  [1,2,3].includes(isCreditPayContent)) ? "시스템 설정, 버튼 한개," : "시스템 설정, 버튼 두 개,"
        }
        ref={sections.bottomfooter}
      >
        {path === "" || (path === "forth" &&  [1,2,3].includes(isCreditPayContent)) ? (
          <div className="footer-coffeelogo"></div>
        ) : (
          <button
            className="button down-footer-button btn-home"
            data-tts-text="처음으로,"
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
                  <HomeIcon className="black-circle" />
                </div>
              </span>
              <span className="content label">처음으로</span>
            </div>
          </button>
        )}

        <button 
          data-tts-text={path === "" ? "접근성," : "접근성,"}
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
                <ExtentionIcon className="black-circle" />
              </div>
            </span>
            <span className="content label">접근성</span>
          </div>
        </button>
      </div>
  );
});

