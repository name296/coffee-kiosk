import React, { memo, useContext } from "react";
import Step from "./Step";
import Main from "./Main";
import Bottom from "./Bottom";
import Summary from "./Summary";
import { AccessibilityContext } from "../../contexts/AccessibilityContext";
import { ScreenRouteContext } from "../../contexts/ScreenRouteContext";
import { useTextHandler } from "../../hooks/useTTS";
import { useInteractiveTTSHandler } from "../../hooks/useTTSInteraction";
import { useKeyboardNavigationHandler } from "../../hooks/useKeyboardNavigation";
import { TTS } from "../../constants/constants";

// Screen Components
import ScreenStart from "../contents/screens/ScreenStart";
import ScreenMenu from "../contents/screens/ScreenMenu";
import ScreenDetails from "../contents/screens/ScreenDetails";
import ScreenPayments from "../contents/screens/ScreenPayments";
import ScreenCardInsert from "../contents/screens/ScreenCardInsert";
import ScreenMobilePay from "../contents/screens/ScreenMobilePay";
import ScreenSimplePay from "../contents/screens/ScreenSimplePay";
import ScreenCardRemoval from "../contents/screens/ScreenCardRemoval";
import ScreenOrderComplete from "../contents/screens/ScreenOrderComplete";
import ScreenReceiptPrint from "../contents/screens/ScreenReceiptPrint";
import ScreenFinish from "../contents/screens/ScreenFinish";

/**
 * 전역 스크린 레지스트리
 * - 각 페이지별 레이아웃 설정 및 컴포넌트를 정의함.
 */
const SCREEN_REGISTRY = {
    ScreenStart: {
        Component: ScreenStart,
        showStep: false,
        className: "first",
        ttsText: `안녕하세요, 장애인, 비장애인 모두 사용 가능한 무인주문기입니다, 시각 장애인을 위한 음성 안내와 키패드를 제공합니다, 키패드는 손을 아래로 뻗으면 닿는 조작부 영역에 있으며, 돌출된 점자 및 테두리로 자세한 위치를 파악할 수 있습니다, 키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다, 안내, 시작 단계, 음식을 포장할지 먹고갈지 선택합니다.${TTS.replay}`
    },
    ScreenMenu: {
        Component: ScreenMenu,
        className: "second",
        ttsText: `메뉴 선택 단계입니다, 원하시는 메뉴를 선택해 주세요.`,
        showSummary: true
    },
    ScreenDetails: {
        Component: ScreenDetails,
        className: "third",
        ttsText: `내역 확인 단계입니다, 수량과 옵션을 확인해 주세요.`,
        showSummary: true
    },
    ScreenPayments: {
        Component: ScreenPayments,
        className: "forth",
        ttsText: `결제 수단 선택 단계입니다.`
    },
    ScreenCardInsert: {
        Component: ScreenCardInsert,
        className: "forth",
        ttsText: `카드를 투입구에 끝까지 넣으세요.`
    },
    ScreenMobilePay: {
        Component: ScreenMobilePay,
        className: "forth",
        ttsText: `휴대폰을 카드결제기에 접촉시키세요.`
    },
    ScreenSimplePay: {
        Component: ScreenSimplePay,
        className: "forth",
        ttsText: `QR코드나 바코드를 인식시키세요`
    },
    ScreenCardRemoval: {
        Component: ScreenCardRemoval,
        className: "forth card-remove",
        ttsText: `카드를 뽑으세요.`
    },
    ScreenOrderComplete: {
        Component: ScreenOrderComplete,
        className: "forth",
        ttsText: `주문이 성공적으로 접수되었습니다.`
    },
    ScreenReceiptPrint: {
        Component: ScreenReceiptPrint,
        className: "forth",
        ttsText: `영수증을 출력하고 있습니다.`
    },
    ScreenFinish: {
        Component: ScreenFinish,
        className: "forth",
        ttsText: `이용해 주셔서 감사합니다, 안녕히 가십시오.`
    }
};

/**
 * 전역 스크린 컴포넌트 (Temporal Frame)
 * - 현재 페이지에 맞는 껍데기(Layout)와 알맹이(Content)를 조립함.
 */
const Screen = memo(() => {
    const { currentPage } = useContext(ScreenRouteContext);
    const accessibility = useContext(AccessibilityContext);
    const { handleText } = useTextHandler(accessibility.volume);

    const config = SCREEN_REGISTRY[currentPage];
    if (!config) return null;

    const { Component, showStep = true, showSummary = false, className = "", ttsText = "", ...rest } = config;

    // 공통 접근성 훅 설정
    useInteractiveTTSHandler(true, handleText);
    useKeyboardNavigationHandler(false, true);

    return (
        <>
            <div className="black"></div>
            <div className="top"></div>
            {showStep && <Step />}
            <Main
                className={className}
                ttsText={ttsText}
                Component="div"
                {...rest}
            >
                <Component />
            </Main>
            {showSummary && <Summary />}
            <Bottom />
        </>
    );
});

Screen.displayName = 'Screen';
export default Screen;
