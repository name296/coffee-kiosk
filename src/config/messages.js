/**
 * 애플리케이션 메시지/텍스트 상수
 * TTS 및 화면 표시용 텍스트를 중앙에서 관리
 */

import { commonScript } from '../constants/commonScript';

// 페이지별 안내 메시지
export const PAGE_MESSAGES = {
  FIRST: {
    TEXT: "작업 안내, 시작화면 단계, 음식을 포장할지 먹고갈지 선택합니다.",
    FULL: () => `${PAGE_MESSAGES.FIRST.TEXT}${commonScript.replay}`,
  },
  SECOND: {
    TEXT: "작업 안내, 메뉴선택 단계, 카테고리에서 메뉴종류를 선택하시고, 메뉴에서 상품을 선택합니다, 초기화 버튼으로 상품을 다시 선택할 수 있습니다, 주문하기 버튼으로 다음 단계, 내역확인으로 이동 할 수 있습니다, ",
    FULL: () => `${PAGE_MESSAGES.SECOND.TEXT}${commonScript.replay}`,
  },
  THIRD: {
    TEXT: "작업 안내, 내역확인 단계, 주문목록에서 상품명, 수량, 가격을 확인합니다, 수량 버튼 및 삭제 버튼으로 주문목록을 수정 할 수 있습니다. 추가하기 버튼으로 이전 단계, 메뉴선택으로 돌아갈 수 있습니다, 결제하기 버튼으로 다음 단계, 결제선택으로 이동할 수 있습니다,",
    FULL: () => `${PAGE_MESSAGES.THIRD.TEXT}${commonScript.replay}`,
  },
};

// 결제 단계별 메시지
export const PAYMENT_MESSAGES = {
  SELECT_METHOD: (totalSum, formatNumber) => 
    `작업 안내, 결제 선택 단계. 결제 금액, ${formatNumber(totalSum)}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ${commonScript.replay}`,
  
  CARD_INSERT: 
    `작업 안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ${commonScript.replay}`,
  
  MOBILE_PAY: 
    `작업 안내, 모바일페이 단계, 가운데 아래에 있는 카드리더기에 휴대전화의 모바일페이를 켜고 접근시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ${commonScript.replay}`,
  
  CARD_REMOVE: 
    `작업 안내, 신용카드 제거, 신용카드를 뽑습니다, 정상적으로 결제되고 나서 카드가 제거되면, 자동으로 다음 작업, 인쇄 선택으로 이동합니다, 확인 버튼을 눌러 결제 상황을 확인합니다, ${commonScript.replay}`,
  
  PRINT_SELECT: (orderNum) => 
    `작업 안내, 인쇄 선택, 결제되었습니다, 주문번호 ${orderNum}번, 왼쪽 아래의 프린터에서 주문표를 받으시고, 영수증 출력 여부를 선택합니다, 육십초 동안 조작이 없을 경우, 출력 안함으로 자동 선택됩니다, 화면 터치 또는 키패드 입력이 확인되면 사용 시간이 다시 육십초로 연장됩니다,${commonScript.replay}`,
  
  ORDER_PRINT: (orderNum) => 
    `작업 안내, 주문표단계, 주문번호, ${orderNum}, 왼쪽 아래의 프린터에서 주문표가 출력됩니다. 인쇄가 완전히 끝나고 받습니다. 마무리하기 버튼으로 서비스 이용을 종료할 수 있습니다. ${commonScript.replay}`,
  
  RECEIPT_PRINT: 
    `작업 안내, 영수증 출력, 왼쪽 아래의 프린터에서 영수증을 받습니다, 마무리하기 버튼으로 사용을 종료할 수 있습니다, 육십초 동안 조작이 없을 경우, 마무리하기로 자동 선택됩니다, 화면 터치 또는 키패드 입력이 확인되면 사용 시간이 다시 육십초로 연장됩니다,${commonScript.replay}`,
  
  FINISH: 
    `작업안내, 사용종료, 이용해주셔서 감사합니다,`,
};

// 버튼 텍스트
export const BUTTON_MESSAGES = {
  RESET: '초기화,',
  ORDER: '주문하기,',
  ADD: '추가하기 ,',
  PAY: '결제하기, ',
  CANCEL: '취소,',
  HOME: '처음으로,',
  ACCESSIBILITY: '접근성,',
  EXECUTE: '실행, ',
};

// 요약 텍스트
export const SUMMARY_MESSAGES = {
  ORDER_SUMMARY: (totalCount, totalSum, convertToKoreanQuantity, formatNumber) =>
    `주문요약, 주문수량, ${convertToKoreanQuantity(totalCount)} 개, 주문금액, ${formatNumber(totalSum)}원, 버튼 두개,`,
  
  BUTTONS_TWO: '버튼 두개,',
  BUTTONS_ONE: '버튼 한개,',
};

// 시스템 설정 텍스트
export const SYSTEM_MESSAGES = {
  SETTINGS_TWO_BUTTONS: '시스템 설정, 버튼 두 개,',
  SETTINGS_ONE_BUTTON: '시스템 설정, 버튼 한개,',
};

// 작업 관리 텍스트
export const TASK_MESSAGES = {
  TASK_MANAGER_ONE: '작업 관리, 버튼 한 개,',
  TASK_MANAGER_TWO: '작업관리. 버튼 한 개,',
  PAYMENT_SELECT: '결제 선택. 버튼 두 개, ',
};

// 메뉴 관련 텍스트
export const MENU_MESSAGES = {
  MENU_GRID: (selectedTab, convertToKoreanQuantity, currentItemsLength) =>
    `메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(currentItemsLength)}개,`,
};

// 에러 메시지
export const ERROR_MESSAGES = {
  NO_PRODUCT: '없는 상품입니다.',
  GENERAL_ERROR: '문제가 발생했습니다',
  RETRY: '다시 시도',
};

