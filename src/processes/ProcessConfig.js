import { TTS } from "../constants";
import ProcessStart from "./ProcessStart";
import ProcessMenu from "./ProcessMenu";
import ProcessDetails from "./ProcessDetails";
import ProcessPayments from "./ProcessPayments";
import ProcessCardInsert from "./ProcessCardInsert";
import ProcessMobilePay from "./ProcessMobilePay";
import ProcessSimplePay from "./ProcessSimplePay";
import ProcessCardRemoval from "./ProcessCardRemoval";
import ProcessOrderComplete from "./ProcessOrderComplete";
import ProcessReceiptPrint from "./ProcessReceiptPrint";
import ProcessFinish from "./ProcessFinish";

/**
 * 프로세스 콘피그: ProcessName → [레이아웃 + 콘텐츠] 로 스크린 구성.
 * - layoutType: first | second | third | forth → div.process 클래스 (Step/Summary 표시 여부는 CSS .first 등으로 제어)
 * - Component: 해당 프로세스 콘텐츠 컴포넌트
 * - className: Main 보조 클래스 (필요 시)
 */
const PROCESS_CONFIG = {
    ProcessStart: {
        layoutType: "first",
        Component: ProcessStart,
        ttsText: `안녕하세요, 장애인, 비장애인 모두 사용 가능한 무인주문기입니다, 시각 장애인을 위한 음성 안내와 키패드를 제공합니다, 키패드는 손을 아래로 뻗으면 닿는 조작부 영역에 있으며, 돌출된 점자 및 테두리로 자세한 위치를 파악할 수 있습니다, 키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다, 안내, 시작 단계, 음식을 포장할지 먹고갈지 선택합니다.${TTS.replay}`
    },
    ProcessMenu: {
        layoutType: "second",
        Component: ProcessMenu,
        ttsText: `메뉴 선택 단계입니다, 원하시는 메뉴를 선택해 주세요.`
    },
    ProcessDetails: {
        layoutType: "third",
        Component: ProcessDetails,
        ttsText: `내역 확인 단계입니다, 수량과 옵션을 확인해 주세요.`
    },
    ProcessPayments: {
        layoutType: "forth",
        Component: ProcessPayments,
        ttsText: `결제 수단 선택 단계입니다.`
    },
    ProcessCardInsert: {
        layoutType: "forth",
        Component: ProcessCardInsert,
        ttsText: `카드를 투입구에 끝까지 넣으세요.`
    },
    ProcessMobilePay: {
        layoutType: "forth",
        Component: ProcessMobilePay,
        ttsText: `휴대폰을 카드결제기에 접촉시키세요.`
    },
    ProcessSimplePay: {
        layoutType: "forth",
        Component: ProcessSimplePay,
        ttsText: `QR코드나 바코드를 인식시키세요`
    },
    ProcessCardRemoval: {
        layoutType: "forth",
        Component: ProcessCardRemoval,
        showStep: true,
        className: "card-remove",
        ttsText: `카드를 뽑으세요.`
    },
    ProcessOrderComplete: {
        layoutType: "forth",
        Component: ProcessOrderComplete,
        ttsText: `주문이 성공적으로 접수되었습니다.`
    },
    ProcessReceiptPrint: {
        layoutType: "forth",
        Component: ProcessReceiptPrint,
        ttsText: `영수증을 출력하고 있습니다.`
    },
    ProcessFinish: {
        layoutType: "forth",
        Component: ProcessFinish,
        ttsText: `이용해 주셔서 감사합니다, 안녕히 가십시오.`
    }
};

export default PROCESS_CONFIG;
