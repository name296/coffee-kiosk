/**
 * 프로세스: 업무 프로세스 + 콘텐츠
 * - 프로세스 ID·맵: `@/constants/processFlow`, 컴포넌트 매핑: `@/constants/processRegistry` (`PROCESS_CONFIG`)
 * - 프로세스 콘텐츠는 processes/ 단일 레벨에 배치
 */
export { default as Process } from "./Process";
export { PROCESS_CONFIG } from "@/constants";
export { default as ProcessStart, ProcessStartPoster } from "./ProcessStart";
export { default as ProcessMenu } from "./ProcessMenu";
export { default as ProcessDetails } from "./ProcessDetails";
export { default as ProcessPayments } from "./ProcessPayments";
export { default as ProcessCardInsert } from "./ProcessCardInsert";
export { default as ProcessCardRemoval } from "./ProcessCardRemoval";
export { default as ProcessMobilePay } from "./ProcessMobilePay";
export { default as ProcessSimplePay } from "./ProcessSimplePay";
export { default as ProcessOrderComplete } from "./ProcessOrderComplete";
export { default as ProcessReceiptPrint } from "./ProcessReceiptPrint";
export { default as ProcessFinish } from "./ProcessFinish";
