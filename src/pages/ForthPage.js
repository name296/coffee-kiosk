// ============================================================================
// 네 번째 페이지 컴포넌트 (결제 화면)
// ============================================================================

import React, { useContext, useState, useEffect, memo, useCallback, useMemo } from "react";
import { AppContext } from "../context";
import { useMultiModalButtonHandler } from "../hooks/useMultiModalButtonHandler";
import { useSafeDocument } from "../hooks";
import { useTextHandler } from "../assets/tts";
import { TIMER_CONFIG, PAYMENT_STEPS, WEBVIEW_COMMANDS, WEBVIEW_RESPONSE, STORAGE_KEYS, FOCUS_SECTIONS } from "../config/appConfig";
import { safeLocalStorage, safeParseInt } from "../utils/browserCompatibility";
import { getAssetPath } from "../utils/pathUtils";

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

  // setCallWebToApp을 먼저 정의 (다른 함수들이 사용하므로)
  const setCallWebToApp = useCallback((p_cmd, p_val) => {
    var obj_cmd = {
      Command: p_cmd,
      arg: p_val,
    };

    console.log("obj_cmd: " + JSON.stringify(obj_cmd));

    if (window.chrome?.webview) {
      window.chrome.webview.postMessage(JSON.stringify(obj_cmd));
    }
  }, []);

  // 애플리케이션에 주문정보 전달 (메모이제이션)
  const sendOrderDataToApp = useCallback((paymentType) => {
    var arr_order_data = [];
    orderItems.forEach((item) => {
      arr_order_data.push({
        menuName: item.name,
        quantity: item.quantity,
        price: item.price * item.quantity,
      });
    });
    const supplyPrice = (totalSum / 1.1).toFixed(2);
    var cmd_val = {
      orderData: arr_order_data,
      totalPrice: totalSum,
      supplyPrice: supplyPrice,
      tax: (totalSum - supplyPrice).toFixed(2),
      paymentType: paymentType,
      orderNumber: updateOrderNumber(),
    };
    setCallWebToApp(WEBVIEW_COMMANDS.PAY, cmd_val);
  }, [orderItems, totalSum, updateOrderNumber, setCallWebToApp]);

  const sendPrintReceiptToApp = useCallback(() => {
    setCallWebToApp(WEBVIEW_COMMANDS.PRINT, '');
  }, [setCallWebToApp]);

  const sendCancelPayment = useCallback(() => {
    setCallWebToApp(WEBVIEW_COMMANDS.CANCEL, "");
  }, [setCallWebToApp]);

  // // 주문 번호 가져오기
  // const getOrderNumber = () => {
  //   return localStorage.getItem("ordernum");
  // }

  // useKeyboardNavigation
  useMultiModalButtonHandler({
    initFocusableSections: [FOCUS_SECTIONS.PAGE, FOCUS_SECTIONS.MIDDLE, FOCUS_SECTIONS.BOTTOM, FOCUS_SECTIONS.BOTTOM_FOOTER],
    initFirstButtonSection: FOCUS_SECTIONS.PAGE,
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true
  });

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
              <button
                data-tts-text="신용카드,"
                className="button pay"
                onClick={(e) => {
                  e.preventDefault();
                  e.target.focus();
                  sendOrderDataToApp("card");
                  setisCreditPayContent(1);
                }}
              >
                <div className="background dynamic">
                  <span className="content icon" aria-hidden="true">
                    <img
                      style={
                        isLow
                          ? { width: "100px", height: "65px" }
                          : { width: "125px", height: "85px" }
                      }
                      src={getAssetPath("/images/payment-card.svg")}
                      alt="card"
                    />
                  </span>
                  <span className="content label">신용카드</span>
                </div>
              </button>
              <button
                className="button pay"
                data-tts-text="모바일페이,"
                onClick={(e) => {
                  e.preventDefault();
                  e.target.focus();
                  sendOrderDataToApp("mobile");
                  setisCreditPayContent(2);
                }}
              >
                <div className="background dynamic">
                  <span className="content icon" aria-hidden="true">
                    <img
                      style={
                        isLow
                          ? { width: "77px", height: "130px" }
                          : { width: "110px", height: "200px" }
                      }
                      src={getAssetPath("/images/payment-mobile.svg")}
                      alt="mobile"
                    />
                  </span>
                  <span className="content label mobile-pay-label">모바일 페이</span>
                </div>
              </button>
              {/* <div className="pay-type-div">
                <img
                  src={getAssetPath("/images/img_QRpay.png")}
                  alt="qr"
                ></img>
                <p>QR 페이</p>
              </div> */}
            </div>
            <div
              ref={sections.bottom}
              className="task-manager"
              data-tts-text="작업관리. 버튼 한 개,"
            >
              <button
                data-tts-text="취소,"
                className="button no"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage("third");
                }}
              >
                <div className="background dynamic">
                  <span className="content label">취소</span>
                </div>
              </button>
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
          <button
            data-tts-text="취소"
            className="button forth-main-btn2"
            onClick={(e) => {
              e.preventDefault();
              e.target.focus();
              // setisCreditPayContent(3);
              sendCancelPayment();
              setisCreditPayContent(0);
              // navigate("/third");
            }}
          >
            <div className="background dynamic">
              <span className="content label">취소</span>
            </div>
          </button>
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
          <button
            data-tts-text="취소"
            className="button forth-main-btn2"
            onClick={(e) => {
              e.preventDefault();
              e.target.focus();
              // setisCreditPayContent(4)
              sendCancelPayment();
              setisCreditPayContent(0);
              // navigate("/third");
            }}
          >
            <div className="background dynamic">
              <span className="content label">취소</span>
            </div>
          </button>
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
              {/* 를 뽑고&nbsp;
              <span className="highlight-text">확인</span>
              &nbsp;버튼{isLow && isLarge? <br/>: '' }을 누
              {isLow && !isLarge ? <><br></br><div className="flex center">르세요</div> </>: "르세요"} */}

            </div>
          </div>
          <img onClick={() => setisCreditPayContent(4)}
            className="credit-pay-image"
            src={getAssetPath("/images/device-cardReader-remove.svg")}
          ></img>
          {/* <button
            data-tts-text="확인"
            className="forth-main-btn2 btn-confirm"
            onClick={(e) => {
              e.preventDefault();
              e.target.focus();
              handleText('카드를 제거하세요, ')
            }}
          >
            확인
          </button> */}
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
            {/* <span>{orderNum}</span> */}
            <span>100</span>
          </div>
          <div className="forth-main-two-btn">
            <button
              data-tts-text="영수증 출력,"
              className="button forth-main-two-btn1"
              onClick={(e) => {
                e.preventDefault();
                e.target.focus();
                sendPrintReceiptToApp();
                setisCreditPayContent(6);
              }}
            >
              <div className="background dynamic">
                <span className="content label">영수증 출력</span>
              </div>
            </button>
            <button
              data-tts-text="출력 안함,"
              className="button forth-main-two-btn2"
              onClick={(e) => {
                e.preventDefault();
                e.target.focus();
                setisCreditPayContent(7)
              }}
            >
              <div className="background dynamic">
                <span className="content label">출력 안함{countdown}</span>
              </div>
            </button>
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
          <button
            data-tts-text="마무리하기"
            className="button forth-main-btn2 btn-confirm"
            onClick={(e) => {
              e.preventDefault();
              e.target.focus();
              setisCreditPayContent(7)
            }}
          >
            <div className="background dynamic">
              <span className="content label">마무리하기</span>
            </div>
          </button>
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
          {/* <div className="order-num-txt">
            <span>{orderNum}</span>
          </div> */}
          <button
            data-tts-text="마무리하기"
            className="button forth-main-btn2 btn-confirm"
            onClick={(e) => {
              e.preventDefault();
              e.target.focus();
              setisCreditPayContent(7)
            }}
          >
            <div className="background dynamic">
              <span className="content label">마무리{countdown}</span>
            </div>
          </button>
        </div>
      ) : isCreditPayContent === 7 ? (
        <div className="credit-pay-content">
          <div className="credit-pay-text2">
            <div>이용해 주셔서 감사합니다</div>
            {/* <div>
              <span className="highlight-text">
                놓고 가시는 물건
              </span>
              이 없는지 확인{isLow ? <><br></br><div className="flex center">하세요</div> </>: "하세요"}
            </div> */}
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
          {/* <img
            className="end-logo-image"
            src={getAssetPath("/images/logo_grey_big.png")}
          ></img> */}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
});

ForthPage.displayName = 'ForthPage';

export default ForthPage;

// : isCreditPayContent === 4 ? (
//   <div
//     ref={sections.bottom}
//     className={
//       isDark
//         ? "contrast-credit-pay-content"
//         : "credit-pay-content"
//     }
//   >
//     <div className="credit-pay-text">
//       <div>오른쪽 아래의 QR리더기에</div>
//       <div>QR코드를 보여 인식시키세요</div>
//     </div>
//     <img
//       className="credit-pay-image"
//       src={getAssetPath("/images/img_QRpay_big.png")}
//       onClick={() =>
//         setisCreditPayContent(
//           (isCreditPayContent) => isCreditPayContent + 1
//         )
//       }
//     ></img>
//     <button
//       className={
//         isDark ? "contrast-forth-main-btn" : "forth-main-btn"
//       }
//     >
//       취소
//     </button>
//   </div>)
