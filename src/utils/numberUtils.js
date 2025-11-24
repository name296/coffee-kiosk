export const convertToKoreanQuantity = (num) => {
  let number = parseInt(num);
  if (number < 1 || number > 999) return number;

  const units = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
  const tens = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
  const hundreds = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];

  if (number <= 9) {
    return units[number];
  }

  let numStr = number.toString();
  let result = "";

  if (numStr.length === 3) {
    let hundred = parseInt(numStr[0]);
    result += hundreds[hundred]; // 백의 자리 고유 표현 사용
    numStr = numStr.substring(1);
  }

  if (numStr.length === 2) {
    let ten = parseInt(numStr[0]);
    if (ten > 0) {
      result += tens[ten];
    }
    numStr = numStr.substring(1);
  }

  let one = parseInt(numStr[0]);
  if (one > 0) {
    result += units[one];
  }

  return result;
};

