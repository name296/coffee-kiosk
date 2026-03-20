import { PROCESS_NAME } from "@/constants";
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

/** 프로세스명 → 화면 컴포넌트(셸 포함 전체 트리) */
const PROCESS_CONFIG = {
    [PROCESS_NAME.START]: { Component: ProcessStart },
    [PROCESS_NAME.MENU]: { Component: ProcessMenu },
    [PROCESS_NAME.DETAILS]: { Component: ProcessDetails },
    [PROCESS_NAME.PAYMENTS]: { Component: ProcessPayments },
    [PROCESS_NAME.CARD_INSERT]: { Component: ProcessCardInsert },
    [PROCESS_NAME.MOBILE_PAY]: { Component: ProcessMobilePay },
    [PROCESS_NAME.SIMPLE_PAY]: { Component: ProcessSimplePay },
    [PROCESS_NAME.CARD_REMOVAL]: { Component: ProcessCardRemoval },
    [PROCESS_NAME.ORDER_COMPLETE]: { Component: ProcessOrderComplete },
    [PROCESS_NAME.RECEIPT_PRINT]: { Component: ProcessReceiptPrint },
    [PROCESS_NAME.FINISH]: { Component: ProcessFinish },
};

export default PROCESS_CONFIG;
