import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import ReturnModal from "./ReturnModal";
import AccessibilityModal from "./AccessibilityModal";
import FocusTrap from "focus-trap-react";
import ResetModal from "./ResetModal";
import CallModal from "./CallModal";
import { useTextHandler } from '../assets/tts';


const Footer = () => {
  const {
    sections,
    isLowScreen,
    isHighContrast,
    totalCount,
    totalSum,
    isReturnModal,
    setisReturnModal,
    isCallModal,
    isAccessibilityModal,
    setisAccessibilityModal,
    isResetModal,
    setisResetModal,
    isCreditPayContent,
    convertToKoreanQuantity,
    volume
  } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/").at(-1);
  const [isDisabledBtn, setisDisabledBtn] = useState(true);
  const { handleText } = useTextHandler(volume);

  useEffect(() => {
    if (totalCount > 0) setisDisabledBtn(false);
    else setisDisabledBtn(true);
  }, [totalCount]);

  return (
    <>
      {isReturnModal ? <ReturnModal></ReturnModal> : ""}
      {isResetModal ? <ResetModal></ResetModal> : ""}
      {isAccessibilityModal ? <AccessibilityModal></AccessibilityModal> : ""}
      {isCallModal ? <CallModal></CallModal> : ""}
      {path === "second" || path === "third" ? (
        <div className="second-up-footer">
          <div className="flex-between" style={{ width: "560px" }}>
            <p style={{ color: "#ffffff", fontWeight: "600" }}>주문수량</p>
            <p className="second-up-footer-text">{totalCount}개</p>
            <div className="short-colline"></div>
            <p style={{ color: "#ffffff", fontWeight: "600" }}>금액</p>
            <p className="second-up-footer-text">
              {totalSum.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div
            className="flex gap2"
            ref={sections.footer}
            data-text={`주문요약, 주문수량, ${convertToKoreanQuantity(totalCount)} 개, 주문금액, ${totalSum.toLocaleString("ko-KR")}원, 버튼 두개,`}
          >
            {path === "second" && (
              <>
                <button
                  data-text="초기화,"
                  className="second-footer-btn"
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
                  <div className={isLowScreen? 'flex' :'flex-centered'}>
                    <img
                      className="footer-btn-icon"
                      src={"/images/ico_reset.png"}
                    ></img>
                    <p>초기화</p>
                  </div>
                </button>
                <button
                  data-text={`주문하기,  ${isDisabledBtn ? "비활성" : ""}`}
                  className={`second-footer-btn2 order-btn ${
                    isDisabledBtn ? "disabled" : ""
                  }`}
                  onClick={(e) => { 
                    e.preventDefault();
                    e.target.focus();
                    if (totalCount > 0) {
                      path === "second"
                        ? navigate("/third")
                        : navigate("/forth");
                    }
                   }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        if (totalCount > 0) {
                        path === "second"
                          ? navigate("/third")
                          : navigate("/forth");
                      }}, 300);
                    }
                  }}
                >
                  <div className={isLowScreen? 'flex' :'flex-centered'}>
                    <img
                      className="footer-btn-icon"
                      src={
                        isHighContrast
                          ? "/images/contrast_ico_order.png"
                          : "/images/ico_order.png"
                      }
                    ></img>
                    <p>주문</p>
                  </div>
                </button>
              </>
            )}

            {path === "third" && (
              <>
                <button
                  data-text="추가하기 ,"
                  className="second-footer-btn"
                  onClick={(e) => { 
                    e.preventDefault();
                    navigate("/second");
                   }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => { navigate("/second");}, 300);
                    }
                  }}
                >
                  <div className={isLowScreen? 'flex' :'flex-centered'}>
                    <img
                      className="footer-btn-icon"
                      src={"/images/ico_add_order.png"}
                    ></img>
                    <p>추가</p>
                  </div>
                </button>
                <button
                  data-text="결제하기, "
                  className="second-footer-btn2"
                  onClick={(e) => { 
                    e.preventDefault();
                    e.target.focus();
                    if (totalCount > 0) {
                      path === "second"
                        ? navigate("/third")
                        : navigate("/forth");
                    }
                   }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleText('실행, ', false);
                      setTimeout(() => {
                        if (totalCount > 0) {
                          path === "second"
                            ? navigate("/third")
                            : navigate("/forth");
                        }}, 300);
                    }
                  }}
                >
                  <div className={isLowScreen? 'flex' :'flex-centered'}>
                    <img
                      className="footer-btn-icon"
                      src={
                        isHighContrast
                          ? "/images/contrast_Mask group.png"
                          : "/images/Mask group.png"
                      }
                    ></img>
                    <p>결제</p>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        ""
      )}

      <div
        data-text={
          path === "" || (path === "forth" &&  [1,2,3].includes(isCreditPayContent)) ? "시스템 설정, 버튼 한개," : "시스템 설정, 버튼 두 개,"
        }
        className="down-footer"
        ref={sections.bottomfooter}
      >
        {path === "" || (path === "forth" &&  [1,2,3].includes(isCreditPayContent)) ? (
          // <img
          //   className="footer-coffeelogo"
          //   src={
          //     isHighContrast
          //       ? "/images/logo_bottom.png"
          //       : "/images/coffeelogo.png"
          //   }
          //   alt="coffee" style=""
          // ></img>
          <div className="footer-coffeelogo"></div>
        ) : (
          <button
            className="flex down-footer-button btn-home"
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
            <div className="div-footer-circle">
              <img
                className="black-circle"
                src="images/home_btn.png"
                alt="home"
              ></img>
            </div>


            <p className="black-circle-text">처음으로</p>
          </button>
        )}

        <button 
          data-text={path === "" ? "접근성," : "접근성,"}
          className="flex down-footer-button"
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
          <div className="div-footer-circle">
            <img
              className="black-circle"
              // src={
              //   isHighContrast
              //     ? "/images/contrast_wheelchair.png"
              //     : "/images/wheelchairbtn.png"
              // }
              src="/images/contrast_ico_low_sc.png"
              alt="wheelchair"
            ></img>

          </div>
          <p className="black-circle-text">접근성</p>
        </button>
      </div>
    </>
  );
};

export default Footer;

{
  /* {path === "third" && (
        <div className="third-up-footer">
          <div style={{ width: "512px" }}>
            <div className="flex-between">
              <p
                style={{
                  color: "#8b8b8b",
                  fontWeight: "600",
                  marginTop: "15px",
                }}
              >
                구매수량
              </p>
              <p>{totalCount}</p>
            </div>
            <div className="flex-between">
              <p
                style={{
                  color: "#8b8b8b",
                  fontWeight: "600",
                  marginTop: "15px",
                }}
              >
                구매금액
              </p>
              <p>{totalSum.toLocaleString("ko-KR")}원</p>
            </div>
            <div className="flex-between">
              <p
                style={{
                  color: "#8b8b8b",
                  fontWeight: "600",
                  marginTop: "15px",
                }}
              >
                할인금액
              </p>
              <p>0원</p>
            </div>
            <div className="orange-line" style={{ marginTop: "15px" }}></div>
            <div className="flex-between">
              <p
                style={{
                  color: "#C4895F",
                  fontWeight: "600",
                  marginTop: "15px",
                }}
              >
                결제금액
              </p>
              <p
                style={{
                  color: "#C4895F",
                  fontSize: "5rem",
                  marginTop: "15px",
                }}
              >
                {totalSum.toLocaleString("ko-KR")}원
              </p>
            </div>
          </div>
          <div className="flex gap2">
            <button className="third-footer-btn" onClick={() => navigate("/second")}>
              <AddOrderIcon></AddOrderIcon>
              <p>추가하기</p>
            </button>
            <button
              className="third-footer-btn"
              style={{ backgroundColor: "#A4693F" }}
              disabled={totalCount === 0}
            >
              <CardIcon></CardIcon>
              <p>결제</p>
            </button>
          </div>
        </div>
      )} */
}
