/**
 * 애플리케이션 설정 상수
 * 하드코딩된 값들을 중앙에서 관리
 */

// 화면 크기 설정
export const SCREEN_CONFIG = {
  BASE_WIDTH: 1080,
  BASE_HEIGHT: 1920,
  ZOOM_RESIZE_DELAY: 100, // ms
};

// 타이머 설정
export const TIMER_CONFIG = {
  AUTO_FINISH_DELAY: 60, // 초 - 영수증 미출력 시 자동 마무리
  FINAL_PAGE_DELAY: 4, // 초 - 마무리 단계 후 첫 화면 이동
  TTS_DELAY: 500, // ms - TTS 송출 후 실행 딜레이
  ACTION_DELAY: 100, // ms - 버튼 클릭 후 실행 딜레이
  INTERVAL_DELAY: 1000, // ms - setInterval 간격
};

// 페이지 설정
export const PAGE_CONFIG = {
  FIRST: 'first',
  SECOND: 'second',
  THIRD: 'third',
  FOURTH: 'forth',
};

// 결제 단계 설정
export const PAYMENT_STEPS = {
  SELECT_METHOD: 0,
  CARD_INSERT: 1,
  MOBILE_PAY: 2,
  CARD_REMOVE: 3,
  PRINT_SELECT: 4,
  ORDER_PRINT: 5,
  RECEIPT_PRINT: 6,
  FINISH: 7,
};

// 메뉴 페이지네이션 설정
export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE_NORMAL: 9,
  ITEMS_PER_PAGE_LOW: 3,
};

// 웹뷰 명령어
export const WEBVIEW_COMMANDS = {
  PAY: 'PAY',
  PRINT: 'PRINT',
  CANCEL: 'CANCEL',
};

// 웹뷰 응답 상태
export const WEBVIEW_RESPONSE = {
  SUCCESS: 'SUCCESS',
};

// 로컬스토리지 키
export const STORAGE_KEYS = {
  ORDER_NUM: 'ordernum',
};

// 포커스 섹션 설정
export const FOCUS_SECTIONS = {
  PAGE: 'page',
  TOP: 'top',
  MIDDLE: 'middle',
  BOTTOM: 'bottom',
  FOOTER: 'footer',
  BOTTOM_FOOTER: 'bottomfooter',
  MODAL_PAGE: 'modalPage',
  CONFIRM_SECTIONS: 'confirmSections',
  ACCESSIBILITY_1: 'AccessibilitySections1',
  ACCESSIBILITY_2: 'AccessibilitySections2',
  ACCESSIBILITY_3: 'AccessibilitySections3',
  ACCESSIBILITY_4: 'AccessibilitySections4',
  ACCESSIBILITY_5: 'AccessibilitySections5',
  ACCESSIBILITY_6: 'AccessibilitySections6',
};

// 기본 설정값
export const DEFAULT_SETTINGS = {
  VOLUME: 1,
  IS_DARK: false,
  IS_LARGE: false,
  IS_LOW: false,
  SELECTED_TAB: '전체메뉴',
  CURRENT_PAGE: PAGE_CONFIG.FIRST,
  CREDIT_PAY_CONTENT: PAYMENT_STEPS.SELECT_METHOD,
};

// 숫자 포맷 설정
export const NUMBER_FORMAT = {
  LOCALE: 'ko-KR',
  DEFAULT_VALUE: 0,
};

// 비활성화된 메뉴 ID
export const DISABLED_MENU_ID = 13;

