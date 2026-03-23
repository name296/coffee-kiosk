import { PROCESS_NAME } from "./processFlow";
import ProcessStart from "@/components/processes/ProcessStart";
import ProcessMenu from "@/components/processes/ProcessMenu";
import ProcessDetails from "@/components/processes/ProcessDetails";
import ProcessPayments from "@/components/processes/ProcessPayments";
import ProcessCardInsert from "@/components/processes/ProcessCardInsert";
import ProcessMobilePay from "@/components/processes/ProcessMobilePay";
import ProcessSimplePay from "@/components/processes/ProcessSimplePay";
import ProcessCardRemoval from "@/components/processes/ProcessCardRemoval";
import ProcessOrderComplete from "@/components/processes/ProcessOrderComplete";
import ProcessReceiptPrint from "@/components/processes/ProcessReceiptPrint";
import ProcessFinish from "@/components/processes/ProcessFinish";

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
    [PROCESS_NAME.FINISH]: { Component: ProcessFinish }
};

export default PROCESS_CONFIG;
