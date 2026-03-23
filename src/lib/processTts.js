import { PROCESS_NAME } from "@/constants";

/** 화면별 Main data-tts-text (각 Process* 의 Main ttsText). 시작 화면은 ProcessStart에서 `.title` 문구로 조합. */
export const processTts = {
    [PROCESS_NAME.MENU]: `메뉴 선택 단계입니다, 원하시는 메뉴를 선택합니다.`,
    [PROCESS_NAME.DETAILS]: `내역 확인 단계입니다, 수량과 옵션을 확인합니다.`,
    [PROCESS_NAME.PAYMENTS]: `결제 수단 선택 단계입니다.`,
    [PROCESS_NAME.CARD_INSERT]: `카드를 투입구에 끝까지 넣습니다.`,
    [PROCESS_NAME.MOBILE_PAY]: `휴대폰을 카드결제기에 접촉시킵니다.`,
    [PROCESS_NAME.SIMPLE_PAY]: `QR코드나 바코드를 인식시킵니다.`,
    [PROCESS_NAME.CARD_REMOVAL]: `카드를 뽑습니다.`,
    [PROCESS_NAME.ORDER_COMPLETE]: `주문이 성공적으로 접수되었습니다.`,
    [PROCESS_NAME.RECEIPT_PRINT]: `영수증이 출력됩니다.`,
    [PROCESS_NAME.FINISH]: `이용해 주셔서 감사합니다.`,
};
