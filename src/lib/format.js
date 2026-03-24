export const IDLE_TIMEOUT_MS = 120000;
/** 경고 모달 직전 남은 시간(밀리초). `useTimeoutCountdown`·ModalTimeout 폴백과 동일해야 함 */
export const IDLE_WARNING_THRESHOLD_MS = 20000;

export const formatRemainingTime = (ms) => {
    const s = Math.ceil(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const formatRemainingTimeTTS = (ms) => {
    const safeMs = Number.isFinite(ms) ? ms : 0;
    const s = Math.max(0, Math.ceil(safeMs / 1000));
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes}분 ${seconds}초`;
};

const UNITS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
const TENS = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
const HUNDREDS = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];
const SINO_ONES = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const SINO_TENS = ["", "십", "이십", "삼십", "사십", "오십", "육십", "칠십", "팔십", "구십"];
const SINO_HUNDREDS = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];

export const safeParseInt = (v, d = 0) => {
    if (v == null || v === '') return d;
    const p = parseInt(v, 10);
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
    if (n <= 10) {
        if (n === 10) return "열";
        return UNITS[n];
    }
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    let r = '';
    if (h > 0) r += SINO_HUNDREDS[h];
    if (t > 0) r += SINO_TENS[t];
    if (o > 0) r += SINO_ONES[o];
    return r || n;
};

export const convertToKoreanOrdinal = (num) => {
    const n = typeof num === 'string' ? parseInt(num, 10) : Math.floor(Number(num));
    if (isNaN(n) || n < 1 || n > 999) return n;
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    let r = '';
    if (h > 0) r += SINO_HUNDREDS[h];
    if (t > 0) r += SINO_TENS[t];
    if (o > 0) r += SINO_ONES[o];
    return r || n;
};

/**
 * 컨테이너 직계 자식 `.button` 개수.
 * `ButtonCountInjector`·페이지네이션 TTS와 동일 기준.
 */
export function countDirectChildButtons(el) {
    if (!el || typeof el.querySelectorAll !== "function") return 0;
    return el.querySelectorAll(":scope > .button").length;
}
