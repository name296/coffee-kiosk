import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../App";

const Header = () => {
  const location = useLocation();
  const path = location.pathname.split("/").at(-1);

  const {
    isHighContrast,
    setisHighContrast,
    isLowScreen,
    setisLowScreen,
    isCreditPayContent,
  } = useContext(AppContext);

  return (
    <div>
      <div className="black-screen"></div>
      <div className="up-header">
        <img className="header-coffeelogo"
          src={
            isHighContrast
              ? "/images/logo_bottom.png"
              : "/images/coffeelogo.png"
          }
          alt="coffee"
        ></img>
      </div>

      {path === "second" && (
        <div
          className="down-header"
        >
          <ol
            className="step-progress"
          >
            <li className="step">
              <div
                className="border-circle"
              >
                1
              </div>
              <span className="">메뉴선택</span>
              <span className="active" style={{ margin: " 0 20px" }}>
                ›
              </span>
            </li>
            <li className="step">
              <div
                className= "header-black-circle"
              >
                2
              </div>
              <span className="">내역확인</span>
              <span className="" style={{ margin: " 0 20px" }}>
                ›
              </span>
            </li>
            <li className="step">
              <div
                className="header-black-circle"
              >
                3
              </div>
              <span className="">결제</span>
              <span className="" style={{ margin: " 0 20px" }}>
                ›
              </span>
            </li>
            <li className="step">
              <div
                className="header-black-circle"
              >
                4
              </div>
              <span className="">완료</span>
            </li>
          </ol>
        </div>
      )}
      {path === "third" && (
        <div
          className="down-header"
        >
          <ol
            className="step-progress"
          >
            <li className="step">
              <div
                className="checked-circle"
              ></div>
              <span className="">메뉴선택</span>
              <span className="active" style={{ margin: " 0 20px" }}>
                ›
              </span>
            </li>
            <li className="step">
              <div
                className="border-circle"
              >
                2
              </div>
              <span className="">내역확인</span>
              <span className="" style={{ margin: " 0 20px" }}>
                ›
              </span>
            </li>
            <li className="step">
              <div
                className="header-black-circle"
              >
                3
              </div>
              <span className="">결제</span>
              <span className="" style={{ margin: " 0 20px" }}>
                ›
              </span>
            </li>
            <li className="step">
              <div
                className="header-black-circle"
              >
                4
              </div>
              <span className="">완료</span>
            </li>
          </ol>
        </div>
      )}
      {path === "forth" &&
        (isCreditPayContent < 3 ? (
          <div
            className="down-header"
          >
            <ol
              className="step-progress"
            >
              <li className="step">
                <div
                  className="checked-circle"
                ></div>
                <span className="">메뉴선택</span>
                <span className="active" style={{ margin: " 0 20px" }}>
                  ›
                </span>
              </li>
              <li className="step">
                <div
                  className="checked-circle"
                ></div>
                <span className="">내역확인</span>
                <span className="" style={{ margin: " 0 20px" }}>
                  ›
                </span>
              </li>
              <li className="step">
                <div
                  className="border-circle"
                >
                  3
                </div>
                <span className="">결제</span>
                <span className="" style={{ margin: " 0 20px" }}>
                  ›
                </span>
              </li>
              <li className="step">
                <div
                  className="header-black-circle"
                >
                  4
                </div>
                <span className="">완료</span>
              </li>
            </ol>
          </div>
        ) : (
          <div
            className="down-header"
          >
            <ol
              className="step-progress"
            >
              <li className="step">
                <div
                  className="checked-circle"
                ></div>
                <span className="">메뉴선택</span>
                <span className="active" style={{ margin: " 0 20px" }}>
                  ›
                </span>
              </li>
              <li className="step">
                <div
                  className="checked-circle"
                ></div>
                <span className="">내역확인</span>
                <span className="" style={{ margin: " 0 20px" }}>
                  ›
                </span>
              </li>
              <li className="step">
                <div
                  className="checked-circle"
                ></div>
                <span className="">결제</span>
                <span className="" style={{ margin: " 0 20px" }}>
                  ›
                </span>
              </li>
              {isCreditPayContent !== 7 ? (
                <li className="step">
                  <div
                    className="border-circle"
                  >
                    4
                  </div>
                  <span className="">완료</span>
                </li>
              ) : (
                <li className="step">
                  <div
                    className="checked-circle"
                  ></div>
                  <span className="">완료</span>
                </li>
              )}
            </ol>
          </div>
        ))}
    </div>
  );
};

export default Header;
