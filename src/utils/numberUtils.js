// ============================================================================
// 숫자 유틸리티
// ============================================================================

// ============================================================================
// 상수
// ============================================================================

const UNITS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
const TENS = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
const HUNDREDS = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];

const MIN_NUMBER = 1;
const MAX_NUMBER = 999;

// ============================================================================
// 함수
// ============================================================================

/**
 * 숫자를 한국어 수량 표현으로 변환
 * @param {number|string} num - 변환할 숫자
 * @returns {string|number} 한국어 수량 표현 (범위 밖이면 원본 숫자 반환)
 */
export const convertToKoreanQuantity = (num) => {
  // 타입 변환 및 유효성 검사
  const number = typeof num === 'string' ? parseInt(num, 10) : Math.floor(Number(num));
  
  // NaN 체크 및 범위 검사
  if (isNaN(number) || number < MIN_NUMBER || number > MAX_NUMBER) {
    return number;
  }

  // 1-9는 직접 반환
  if (number <= 9) {
    return UNITS[number];
  }

  // 각 자릿수 추출
  const hundred = Math.floor(number / 100);
  const ten = Math.floor((number % 100) / 10);
  const one = number % 10;

  let result = '';

  // 백의 자리 처리
  if (hundred > 0) {
    result += HUNDREDS[hundred];
  }

  // 십의 자리 처리
  if (ten > 0) {
    result += TENS[ten];
  }

  // 일의 자리 처리
  if (one > 0) {
    result += UNITS[one];
  }

  return result || number; // 빈 문자열이면 원본 숫자 반환
};
