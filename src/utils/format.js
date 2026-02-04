export const IDLE_TIMEOUT_MS = 120000;

export const formatRemainingTime = (ms) => {
    const s = Math.ceil(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const UNITS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
const TENS = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
const HUNDREDS = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];

export const safeParseInt = (v, d = 0) => {
    if (v == null || v === '') return d;
    const p = parseInt(v, 10);
    return isNaN(p) ? d : p;
};

export const safeParseFloat = (v, d = 0) => {
    if (v == null || v === '') return d;
    const p = parseFloat(v);
    return isNaN(p) ? d : p;
};

export const formatNumber = (n, l = 'ko-KR', o = {}) => {
    if (n == null || isNaN(n)) return '0';
    const num = typeof n === 'string' ? parseFloat(n) : n;
    if (isNaN(num)) return '0';
    try {
        return num.toLocaleString(l, { minimumFractionDigits: 0, maximumFractionDigits: 0, ...o });
    } catch {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
};

export const convertToKoreanQuantity = (num) => {
    const n = typeof num === 'string' ? parseInt(num, 10) : Math.floor(Number(num));
    if (isNaN(n) || n < 1 || n > 999) return n;
    if (n <= 9) return UNITS[n];
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    let r = '';
    if (h > 0) r += HUNDREDS[h];
    if (t > 0) r += TENS[t];
    if (o > 0) r += UNITS[o];
    return r || n;
};
