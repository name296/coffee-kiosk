import { PROCESS_NAME, TTS } from "../constants";

/** 화면별 Main data-tts-text (각 Process* 의 Main ttsText) */
export const processTts = {
    [PROCESS_NAME.START]: `장애인, 비장애인 모두 사용 가능한 무인주문기입니다, 시각 장애인을 위한 음성 안내와 키패드를 제공합니다, 키패드는 손을 아래로 뻗으면 닿는 조작부 영역에 있으며, 돌출된 점자 및 테두리로 자세한 위치를 파악할 수 있습니다, 키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다, 안내, 시작 단계, 음식을 포장할지 먹고갈지 선택합니다.${TTS.replay}`,
    [PROCESS_NAME.MENU]: `메뉴 선택 단계입니다, 원하시는 메뉴를 선택합니다.`,
    [PROCESS_NAME.DETAILS]: `내역 확인 단계입니다, 수량과 옵션을 확인합니다.`,
    [PROCESS_NAME.PAYMENTS]: `결제 수단 선택 단계입니다.`,
    [PROCESS_NAME.CARD_INSERT]: `카드를 투입구에 끝까지 넣습니다.`,
    [PROCESS_NAME.MOBILE_PAY]: `휴대폰을 카드결제기에 접촉시킵니다.`,
    [PROCESS_NAME.SIMPLE_PAY]: `QR코드나 바코드를 인식시킵니다.`,
    [PROCESS_NAME.CARD_REMOVAL]: `카드를 뽑습니다.`,
    [PROCESS_NAME.ORDER_COMPLETE]: `주문번호 100번, 주문이 성공적으로 접수되었습니다.`,
    [PROCESS_NAME.RECEIPT_PRINT]: `영수증이 출력됩니다.`,
    [PROCESS_NAME.FINISH]: `이용해 주셔서 감사합니다.`,
};
