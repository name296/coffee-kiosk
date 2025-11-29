// ============================================================================
// 커피 키오스크 - 단일 파일 애플리케이션
// ============================================================================
//
// [구조 순서 - 서비스 구성 절차]
// 1. 유틸리티 (38행~)       - 헬퍼 함수, 포맷터, 스토리지
// 2. 상수 (48행~)           - CFG, PAY, TTS, VOLUME 등
// 3. Hooks (83행~)          - 상태/로직 훅 (메뉴, 사운드, TTS, 타이머 등)
// 4. Button/Modal (218행~)  - 핵심 UI 컴포넌트
// 5. Contexts (387행~)      - 상태 관리 Provider
// 6. UI 컴포넌트 (472행~)   - CategoryNav, MenuGrid, Pagination 등
//
// [사용 흐름 - Process 순서]
// Process1 (636행) → 시작화면 (포장/매장 선택)
// Process2 (682행) → 메뉴선택 (카테고리, 메뉴그리드)
// Process3 (762행) → 주문확인 (수량조절, 삭제)
// Process4 (826행) → 결제 (카드/모바일, 영수증)
//
// [레이아웃]
// Top/Step/Summary/Bottom (940행~) - 공통 프레임
// AccessibilityModal (1018행~) - 접근성 설정
// Layout/App (1172행~) - 메인 조립
// ============================================================================

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, createContext, useContext, memo } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import menuData from "./menuData";

// Components
import Icon, { TakeinIcon, TakeoutIcon, DeleteIcon, ResetIcon, OrderIcon, AddIcon, PayIcon, HomeIcon, LowposIcon, ToggleIcon } from "./Icon";

// ============================================================================
// 유틸리티
// ============================================================================

export const safeLocalStorage = {
  getItem: (key, defaultValue = null) => { try { if (typeof window === 'undefined' || !window.localStorage) return defaultValue; const v = window.localStorage.getItem(key); return v !== null ? v : defaultValue; } catch { return defaultValue; } },
  setItem: (key, value) => { try { if (typeof window === 'undefined' || !window.localStorage) return false; window.localStorage.setItem(key, String(value)); return true; } catch { return false; } },
  removeItem: (key) => { try { if (typeof window === 'undefined' || !window.localStorage) return false; window.localStorage.removeItem(key); return true; } catch { return false; } }
};
export const safeParseInt = (v, d = 0) => { if (v == null || v === '') return d; const p = parseInt(v, 10); return isNaN(p) ? d : p; };
export const safeParseFloat = (v, d = 0) => { if (v == null || v === '') return d; const p = parseFloat(v); return isNaN(p) ? d : p; };
export const formatNumber = (n, l = 'ko-KR', o = {}) => { if (n == null || isNaN(n)) return '0'; const num = typeof n === 'string' ? parseFloat(n) : n; if (isNaN(num)) return '0'; try { return num.toLocaleString(l, { minimumFractionDigits: 0, maximumFractionDigits: 0, ...o }); } catch { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); } };
export const safeQuerySelector = (s, c = null) => { try { if (typeof document === 'undefined') return null; return (c || document).querySelector(s); } catch { return null; } };

const UNITS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
const TENS = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
const HUNDREDS = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];
export const convertToKoreanQuantity = (num) => { const n = typeof num === 'string' ? parseInt(num, 10) : Math.floor(Number(num)); if (isNaN(n) || n < 1 || n > 999) return n; if (n <= 9) return UNITS[n]; const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10; let r = ''; if (h > 0) r += HUNDREDS[h]; if (t > 0) r += TENS[t]; if (o > 0) r += UNITS[o]; return r || n; };

export const SizeControlManager = { DEFAULT_WIDTH_SCALE: 1.0, DEFAULT_HEIGHT_SCALE: 1.0, MIN_SCALE: 0.5, MAX_SCALE: 2.0, currentWidthScale: 1.0, currentHeightScale: 1.0, init() { this.currentWidthScale = this.DEFAULT_WIDTH_SCALE; this.currentHeightScale = this.DEFAULT_HEIGHT_SCALE; this.applyScaleToButtons(); }, setWidthScale(s) { this.currentWidthScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, s)); this.applyScaleToButtons(); }, setHeightScale(s) { this.currentHeightScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, s)); this.applyScaleToButtons(); }, applyScaleToButtons() { document.documentElement.style.setProperty('--button-width-scale', this.currentWidthScale); document.documentElement.style.setProperty('--button-height-scale', this.currentHeightScale); }, reset() { this.setWidthScale(this.DEFAULT_WIDTH_SCALE); this.setHeightScale(this.DEFAULT_HEIGHT_SCALE); }, getScales() { return { width: this.currentWidthScale, height: this.currentHeightScale }; } };

const SCREEN = { WIDTH: 1080, HEIGHT: 1920 };
export function setViewportZoom() { const { WIDTH: bw, HEIGHT: bh } = SCREEN; const vw = window.innerWidth, vh = window.innerHeight; const zoom = Math.min(vw / bw, vh / bh); const html = document.documentElement; if (html) { html.style.transform = `scale(${zoom})`; html.style.transformOrigin = 'top left'; const sw = bw * zoom, sh = bh * zoom; html.style.position = 'fixed'; html.style.top = `${(vh - sh) / 2}px`; html.style.left = `${(vw - sw) / 2}px`; html.style.width = `${bw}px`; html.style.height = `${bh}px`; } }
export function setupViewportResize() { const h = () => setViewportZoom(); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }

// ============================================================================
// 내부 상수 (Hooks/Contexts용)
// ============================================================================

// 공통 상수 (단일 정의)
const REPLAY = "키패드 사용법 안내는 키패드의 별 버튼을, 직전 안내 다시 듣기는 샵 버튼을 누릅니다,";
export const VOLUME_MAP = { 0: '끔', 1: '약', 2: '중', 3: '강' };
export const VOLUME_VALUES = { 0: 0, 1: 0.5, 2: 0.75, 3: 1 };
export const DEFAULT_ACCESSIBILITY = { isHighContrast: false, isLowScreen: false, isBigSize: false, volume: 1 };

const CFG = {
  TTS_DELAY: 500,
  IDLE_TIMEOUT: 300000,
  INTRO_TTS_TIME: 180,
  PAGE_FIRST: 'process1',
  SOUNDS: { onPressed: './sounds/onPressed.mp3', note: './sounds/note.wav' },
  WEBVIEW_SUCCESS: 'SUCCESS',
  FOCUSABLE: ['button:not([disabled])', 'a[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'].join(', '),
  TIME: { AUTO_FINISH: 60, FINAL_PAGE: 4, INTERVAL: 1000 },
};

const PAY = { CARD_OUT: 3, PRINT_SELECT: 4, RECEIPT: 6, FINISH: 7 };
const WEBVIEW = { PAY: 'PAY', PRINT: 'PRINT', CANCEL: 'CANCEL' };
const STORAGE = { ORDER_NUM: 'orderNumber' };
const PLACEHOLDER_MENU = { id: 0, name: "추가예정", price: "0", img: "item-americano.png" };

// TTS 스크립트
export const TTS = {
  intro: "안녕하세요,장애인, 비장애인 모두 사용 가능한 무인주문기입니다,시각 장애인을 위한 음성 안내와 키패드를 제공합니다,키패드는 손을 아래로 뻗으면 닿는 조작부 영역에 있으며, 돌출된 점자 및 테두리로 자세한 위치를 파악할 수 있습니다,키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다,",
  replay: REPLAY,
  return: "초기화면으로 돌아갑니다.",
  page1: () => `안내, 시작 단계, 음식을 포장할지 먹고갈지 선택합니다.${REPLAY}`,
  page2: () => `안내, 선택 단계, 카테고리에서 메뉴종류를 선택하시고, 메뉴에서 상품을 선택합니다, 초기화 버튼으로 상품을 다시 선택할 수 있습니다, 주문하기 버튼으로 다음 단계, 내역확인으로 이동 할 수 있습니다, ${REPLAY}`,
  page3: () => `안내, 내역확인 단계, 주문목록에서 상품명, 수량, 가격을 확인합니다, 수량 버튼 및 삭제 버튼으로 주문목록을 수정 할 수 있습니다. 추가하기 버튼으로 이전 단계, 메뉴선택으로 돌아갈 수 있습니다, 결제하기 버튼으로 다음 단계, 결제선택으로 이동할 수 있습니다,${REPLAY}`,
  paySelect: (sum, fmt) => `작업 안내, 결제 단계. 결제 금액, ${fmt(sum)}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ${REPLAY}`,
  cardIn: `안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ${REPLAY}`,
  mobile: `안내, 모바일페이, 가운데 아래에 있는 카드리더기에 휴대전화의 모바일페이를 켜고 접근시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ${REPLAY}`,
  cardOut: `안내, 신용카드 제거, 신용카드를 뽑습니다, 정상적으로 결제되고 나서 카드가 제거되면, 자동으로 다음 작업, 인쇄 선택으로 이동합니다, 확인 버튼을 눌러 결제 상황을 확인합니다, ${REPLAY}`,
  printSelect: (n) => `작업 안내, 인쇄 선택, 결제되었습니다, 주문번호 ${n}번, 왼쪽 아래의 프린터에서 주문표를 받으시고, 영수증 출력 여부를 선택합니다, 육십초 동안 조작이 없을 경우, 출력 안함으로 자동 선택됩니다,${REPLAY}`,
  orderPrint: (n) => `작업 안내, 주문표, 주문번호, ${n}, 왼쪽 아래의 프린터에서 주문표가 출력됩니다. 인쇄가 완전히 끝나고 받습니다. 마무리하기 버튼으로 서비스 이용을 종료할 수 있습니다. ${REPLAY}`,
  receipt: `안내, 영수증 출력, 왼쪽 아래의 프린터에서 영수증을 받습니다, 마무리하기 버튼으로 사용을 종료할 수 있습니다,${REPLAY}`,
  finish: `안내, 사용종료, 이용해주셔서 감사합니다,`,
};

// ============================================================================
// Hooks
// ============================================================================

export const useBodyClass = (className, condition) => { useEffect(() => { if (typeof document === 'undefined') return; if (condition) document.body.classList.add(className); else document.body.classList.remove(className); return () => document.body.classList.remove(className); }, [className, condition]); };

export const usePagination = (items, itemsPerPageNormal, itemsPerPageLow, isLow) => { const itemsPerPage = isLow ? itemsPerPageLow : itemsPerPageNormal; const [pageNumber, setPageNumber] = useState(1); const totalPages = useMemo(() => (!items || items.length === 0) ? 1 : Math.ceil(items.length / itemsPerPage), [items, itemsPerPage]); const currentItems = useMemo(() => { if (!items || items.length === 0) return []; const s = (pageNumber - 1) * itemsPerPage; return items.slice(s, s + itemsPerPage); }, [items, pageNumber, itemsPerPage]); const handlePrevPage = useCallback(() => setPageNumber(p => p > 1 ? p - 1 : p), []); const handleNextPage = useCallback(() => setPageNumber(p => p < totalPages ? p + 1 : p), [totalPages]); const goToPage = useCallback((p) => { if (p >= 1 && p <= totalPages) setPageNumber(p); }, [totalPages]); const resetPage = useCallback(() => setPageNumber(1), []); const resetOnChange = useCallback(() => setPageNumber(1), []); return { pageNumber, totalPages, currentItems, itemsPerPage, handlePrevPage, handleNextPage, goToPage, resetPage, resetOnChange, setPageNumber }; };

export const useSafeDocument = () => { const querySelector = useCallback((s) => safeQuerySelector(s), []); const getElementById = useCallback((id) => typeof document !== 'undefined' ? document.getElementById(id) : null, []); const toggleBodyClass = useCallback((c, cond) => { if (typeof document === 'undefined') return; if (cond) document.body.classList.add(c); else document.body.classList.remove(c); }, []); const blurActiveElement = useCallback(() => { if (typeof document !== 'undefined' && document.activeElement) document.activeElement.blur(); }, []); const getActiveElementText = useCallback(() => typeof document !== 'undefined' && document.activeElement ? document.activeElement.dataset.ttsText || null : null, []); const setAudioVolume = useCallback((audioId, vol) => { if (typeof document === 'undefined') return; const a = document.getElementById(audioId); if (a) a.volume = vol; }, []); return { querySelector, getElementById, toggleBodyClass, blurActiveElement, getActiveElementText, setAudioVolume }; };

// 메뉴 데이터 훅 - 네스티드 구조 기반
export const useMenuData = () => {
  // 네스티드 categories 구조 사용
  const categories = useMemo(() => menuData.categories || [], []);
  
  // 탭 이름 목록 (카테고리 이름들)
  const tabs = useMemo(() => categories.map(c => c.name), [categories]);
  
  // 전체 메뉴 아이템 (ID 자동 부여)
  const totalMenuItems = useMemo(() => {
    let id = 1;
    return categories
      .map((cat, catIndex) => ({ ...cat, cate_id: catIndex }))
      .filter(cat => cat.cate_id !== 0) // 전체메뉴 제외
      .flatMap(cat => cat.items.map(item => ({ id: id++, cate_id: cat.cate_id, ...item })));
  }, [categories]);
  
  // 카테고리 정보 (호환용)
  const categoryInfo = useMemo(() => 
    categories.map((cat, index) => ({ cate_id: index, cate_name: cat.name })), 
    [categories]
  );
  
  return { menuData, categories, tabs, totalMenuItems, categoryInfo };
};

// 메뉴 유틸리티 훅 - 네스티드 구조 기반
export const useMenuUtils = () => {
  // 카테고리별 메뉴 필터링 (네스티드 구조 직접 사용)
  const categorizeMenu = useCallback((items, tabName, categories = []) => {
    if (tabName === "전체메뉴") return items;
    const category = categories.find(c => c.cate_name === tabName);
    if (!category) return [PLACEHOLDER_MENU];
    const filtered = items.filter(item => item.cate_id === category.cate_id);
    return filtered.length > 0 ? filtered : [PLACEHOLDER_MENU];
  }, []);
  
  // 수량 합계
  const calculateSum = useCallback((quantities) => 
    Number(Object.values(quantities).reduce((sum, val) => sum + val, 0)), 
    []
  );
  
  // 총 금액 계산
  const calculateTotal = useCallback((quantities, items) => {
    const itemMap = new Map(items.map(item => [item.id, item]));
    return Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .reduce((sum, [id, qty]) => {
        const item = itemMap.get(Number(id));
        return sum + (item ? Number(item.price) * qty : 0);
      }, 0);
  }, []);
  
  // 선택된 메뉴만 필터링
  const filterMenuItems = useCallback((items, quantities) => 
    items.filter(item => quantities[item.id] > 0), 
    []
  );
  
  // 주문 아이템 생성
  const createOrderItems = useCallback((items, quantities) => 
    items
      .filter(item => quantities[item.id] > 0)
      .map(item => ({ ...item, quantity: quantities[item.id] })), 
    []
  );
  
  return { categorizeMenu, calculateSum, calculateTotal, filterMenuItems, createOrderItems };
};

export const useOrderNumber = () => { const [orderNum, setOrderNum] = useState(0); const updateOrderNumber = useCallback(() => { const c = safeParseInt(safeLocalStorage.getItem('ordernum'), 0); const n = c + 1; safeLocalStorage.setItem('ordernum', n); setOrderNum(n); return n; }, []); return { orderNum, updateOrderNumber }; };

export const useSound = () => { const audioRefs = useRef({}); const volumeRef = useRef(0.5); const play = useCallback((name) => { const src = CFG.SOUNDS[name]; if (!src) return; if (!audioRefs.current[name]) audioRefs.current[name] = new Audio(src); const a = audioRefs.current[name]; a.volume = volumeRef.current; a.currentTime = 0; a.play().catch(() => {}); }, []); const setVolume = useCallback((v) => { volumeRef.current = Math.max(0, Math.min(1, v)); }, []); return { play, setVolume }; };

let db; const dbName = 'TTSDatabase'; const storeName = 'TTSStore'; let isPlaying = false; let replayText = '';
export function useTextHandler(volume) { const initDB = () => new Promise((res, rej) => { const r = indexedDB.open(dbName, 1); r.onerror = (e) => rej(e.target.errorCode); r.onsuccess = (e) => { db = e.target.result; res(db); }; r.onupgradeneeded = (e) => { db = e.target.result; db.createObjectStore(storeName, { keyPath: 'key' }); }; }); const handleText = (txt, flag = true, newVol = -1) => { if (!txt) return; if (flag) replayText = txt; const v = newVol !== -1 ? VOLUME_VALUES[newVol] : VOLUME_VALUES[volume]; playText(txt, 1, v); }; const handleReplayText = () => { if (replayText) handleText(replayText, false); }; return { initDB, handleText, handleReplayText }; }
async function playText(text, speed, vol) { const ap = document.getElementById('audioPlayer'); if (!ap) return; const k = `audio_${text}`; const s = await getFromDB(k); if (s) { ap.src = s; ap.playbackRate = speed; ap.volume = vol; ap.play().catch(() => {}); return; } if (isPlaying) return; isPlaying = true; try { const r = await fetch('http://gtts.tovair.com:5000/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }); if (r.status === 201) { const d = await r.json(); const fr = await fetch(`http://gtts.tovair.com:5000/api/download/${d.filename}`); const b = await fr.blob(); const u = URL.createObjectURL(b); ap.src = u; ap.playbackRate = speed; ap.volume = vol; ap.play(); const rd = new FileReader(); rd.readAsDataURL(b); rd.onloadend = async () => { await saveToDB(k, rd.result); isPlaying = false; }; } else { useBrowserTTS(text, speed, vol); isPlaying = false; } } catch { useBrowserTTS(text, speed, vol); isPlaying = false; } }
function useBrowserTTS(t, s, v) { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; u.rate = s; u.volume = v; window.speechSynthesis.speak(u); } }
async function getFromDB(k) { const d = await getDB(); return new Promise((r) => { const t = d.transaction([storeName], 'readonly'); const req = t.objectStore(storeName).get(k); req.onsuccess = (e) => r(e.target.result?.data || null); req.onerror = () => r(null); }); }
async function saveToDB(k, d) { const db2 = await getDB(); return new Promise((r) => { const t = db2.transaction([storeName], 'readwrite'); t.objectStore(storeName).put({ key: k, data: d }); t.oncomplete = r; }); }
async function getDB() { if (!db) { await new Promise((r) => { const req = indexedDB.open(dbName, 1); req.onsuccess = () => { db = req.result; r(); }; req.onupgradeneeded = (e) => { db = e.target.result; db.createObjectStore(storeName, { keyPath: 'key' }); }; }); } return db; }

export const useActiveElementTTS = (handleText, delay = CFG.TTS_DELAY, condition = true, shouldBlur = false) => { useEffect(() => { if (!condition) return; if (shouldBlur && typeof document !== 'undefined' && document.activeElement?.blur) document.activeElement.blur(); const t = setTimeout(() => { if (typeof document !== 'undefined' && document.activeElement?.dataset?.ttsText) handleText(document.activeElement.dataset.ttsText); }, delay); return () => clearTimeout(t); }, [handleText, delay, condition, shouldBlur]); };

export const formatRemainingTime = (ms) => { if (ms <= 0) return "00:00"; const s = Math.ceil(ms / 1000); const m = Math.floor(s / 60); const sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; };
export const useIdleTimeout = (onTimeout, timeout = CFG.IDLE_TIMEOUT, enabled = true) => { const timerRef = useRef(null); const intervalRef = useRef(null); const lastActivityRef = useRef(Date.now()); const onTimeoutRef = useRef(onTimeout); const timeoutRef = useRef(timeout); const [remainingTime, setRemainingTime] = useState(timeout); useEffect(() => { onTimeoutRef.current = onTimeout; timeoutRef.current = timeout; }, [onTimeout, timeout]); const resetTimer = useCallback(() => { lastActivityRef.current = Date.now(); setRemainingTime(timeoutRef.current); if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = setTimeout(() => { if (onTimeoutRef.current) onTimeoutRef.current(); }, timeoutRef.current); }, []); useEffect(() => { if (!enabled) { setRemainingTime(timeout); return; } intervalRef.current = setInterval(() => { setRemainingTime(Math.max(0, timeout - (Date.now() - lastActivityRef.current))); }, 1000); return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, [enabled, timeout]); useEffect(() => { if (!enabled) { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } return; } const events = ['mousedown', 'keydown', 'touchstart', 'click']; events.forEach(e => document.addEventListener(e, resetTimer, { passive: true })); resetTimer(); return () => { if (timerRef.current) clearTimeout(timerRef.current); events.forEach(e => document.removeEventListener(e, resetTimer)); }; }, [enabled, resetTimer]); return { resetTimer, remainingTime, remainingTimeFormatted: formatRemainingTime(remainingTime) }; };
export const useAppIdleTimeout = (currentPage, setCurrentPage, resetOrder) => { const handleTimeout = useCallback(() => { if (resetOrder) resetOrder(); setCurrentPage(CFG.PAGE_FIRST); }, [setCurrentPage, resetOrder]); const { remainingTime, remainingTimeFormatted, resetTimer } = useIdleTimeout(handleTimeout, CFG.IDLE_TIMEOUT, true); return { remainingTime, remainingTimeFormatted, isActive: true, resetTimer }; };

export const usePaymentCountdown = ({ isCreditPayContent, setisCreditPayContent, ModalReturn, ModalAccessibility, setQuantities, totalMenuItems, setisDark, setVolume, setisLarge, setisLow, setCurrentPage }) => { const [countdown, setCountdown] = useState(60); useEffect(() => { if (isCreditPayContent === PAY.PRINT_SELECT || isCreditPayContent === PAY.RECEIPT) { const rc = () => setCountdown(CFG.TIME.AUTO_FINISH); setCountdown(CFG.TIME.AUTO_FINISH); const t = setInterval(() => { setCountdown(p => { if (p === 0) { clearInterval(t); setTimeout(() => setisCreditPayContent(PAY.FINISH), 0); return 0; } return p - 1; }); }, CFG.TIME.INTERVAL); const h = () => rc(); window.addEventListener('keydown', h); window.addEventListener('click', h); return () => { window.removeEventListener('keydown', h); window.removeEventListener('click', h); clearInterval(t); }; } if (isCreditPayContent === PAY.FINISH) { setCountdown(CFG.TIME.FINAL_PAGE); const t = setInterval(() => { setCountdown(p => { if (p === 0) { clearInterval(t); setTimeout(() => { ModalReturn.close(); ModalAccessibility.close(); setQuantities(totalMenuItems.reduce((a, i) => ({ ...a, [i.id]: 0 }), {})); setisDark(false); setVolume(1); setisLarge(false); setisLow(false); setCurrentPage(CFG.PAGE_FIRST); }, 0); return 0; } return p - 1; }); }, CFG.TIME.INTERVAL); return () => clearInterval(t); } }, [isCreditPayContent, setisCreditPayContent, ModalReturn, ModalAccessibility, setQuantities, totalMenuItems, setisDark, setVolume, setisLarge, setisLow, setCurrentPage]); return countdown; };

// 카테고리 레이아웃 동적 계산 (컨테이너 너비 기반, 한 줄씩 표시)
export const useCategoryLayout = () => {
  const containerRef = useRef(null);
  const [itemsPerRow, setItemsPerRow] = useState(999);
  
  useEffect(() => {
    const calculate = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const btn = container.querySelector('.button');
      if (!btn) return;
      const containerWidth = container.clientWidth;
      const btnWidth = btn.offsetWidth;
      const gap = 8;
      const perRow = Math.max(1, Math.floor((containerWidth + gap) / (btnWidth + gap)));
      setItemsPerRow(perRow);
    };
    const t = setTimeout(calculate, 100);
    window.addEventListener('resize', calculate);
    return () => { clearTimeout(t); window.removeEventListener('resize', calculate); };
  }, []);
  
  return { containerRef, itemsPerRow };
};

export const useFocusTrap = (isActive, options = {}) => { const { autoFocus = true, restoreFocus = true } = options; const containerRef = useRef(null); const previousActiveElement = useRef(null); const getFocusableElements = useCallback(() => { if (!containerRef.current) return []; return Array.from(containerRef.current.querySelectorAll(CFG.FOCUSABLE)).filter(el => { const st = window.getComputedStyle(el); return st.display !== 'none' && st.visibility !== 'hidden'; }); }, []); const focusFirst = useCallback(() => { const els = getFocusableElements(); if (els.length > 0) els[0].focus(); }, [getFocusableElements]); const focusLast = useCallback(() => { const els = getFocusableElements(); if (els.length > 0) els[els.length - 1].focus(); }, [getFocusableElements]); useEffect(() => { if (!isActive) return; const hkd = (e) => { if (e.key !== 'Tab') return; const els = getFocusableElements(); if (els.length === 0) return; const first = els[0], last = els[els.length - 1], active = document.activeElement; if (e.shiftKey) { if (active === first || !containerRef.current?.contains(active)) { e.preventDefault(); focusLast(); } } else { if (active === last || !containerRef.current?.contains(active)) { e.preventDefault(); focusFirst(); } } }; const hesc = (e) => { if (e.key === 'Escape' && containerRef.current?.contains(document.activeElement)) focusFirst(); }; document.addEventListener('keydown', hkd); document.addEventListener('keydown', hesc); return () => { document.removeEventListener('keydown', hkd); document.removeEventListener('keydown', hesc); }; }, [isActive, getFocusableElements, focusFirst, focusLast]); useEffect(() => { if (isActive) { previousActiveElement.current = document.activeElement; if (autoFocus) { const t = setTimeout(() => focusFirst(), 50); return () => clearTimeout(t); } } else { if (restoreFocus && previousActiveElement.current) { previousActiveElement.current.focus(); previousActiveElement.current = null; } } }, [isActive, autoFocus, restoreFocus, focusFirst]); useEffect(() => { if (!isActive) return; const hfo = (e) => { if (containerRef.current && !containerRef.current.contains(e.relatedTarget) && e.relatedTarget !== null) { e.preventDefault(); focusFirst(); } }; containerRef.current?.addEventListener('focusout', hfo); return () => containerRef.current?.removeEventListener('focusout', hfo); }, [isActive, focusFirst]); return { containerRef, focusFirst, focusLast, getFocusableElements }; };

export const useAccessibilitySettings = (initialSettings = DEFAULT_ACCESSIBILITY) => { const [settings, setSettings] = useState(initialSettings); const setHighContrast = useCallback((v) => setSettings(p => ({ ...p, isHighContrast: v })), []); const setLowScreen = useCallback((v) => setSettings(p => ({ ...p, isLowScreen: v })), []); const setBigSize = useCallback((v) => setSettings(p => ({ ...p, isBigSize: v })), []); const setVolumeVal = useCallback((v) => setSettings(p => ({ ...p, volume: v })), []); const resetToDefault = useCallback(() => setSettings(DEFAULT_ACCESSIBILITY), []); const updateAll = useCallback((ns) => setSettings(ns), []); const getStatusText = useMemo(() => ({ highContrast: settings.isHighContrast ? '켬' : '끔', lowScreen: settings.isLowScreen ? '켬' : '끔', bigSize: settings.isBigSize ? '켬' : '끔', volume: VOLUME_MAP[settings.volume] }), [settings]); return { settings, setHighContrast, setLowScreen, setBigSize, setVolume: setVolumeVal, resetToDefault, updateAll, getStatusText }; };

class IntroTimerSingleton { #intervalId = null; #intervalTime = 0; startIntroTimer(scriptText, handleText, onInitSetting) { this.cleanup(); this.#intervalId = setInterval(() => { this.#intervalTime++; if (this.#intervalTime >= CFG.INTRO_TTS_TIME) { handleText(scriptText); this.#intervalTime = 0; if (onInitSetting) onInitSetting(); } }, 1000); } stopIntroTimer() { this.cleanup(); } cleanup() { if (this.#intervalId) { clearInterval(this.#intervalId); this.#intervalId = null; } this.#intervalTime = 0; } }
let timerInstance = null; const getTimerSingleton = () => { if (!timerInstance) timerInstance = new IntroTimerSingleton(); return timerInstance; };
export const useTimer = () => { const t = getTimerSingleton(); return { startIntroTimer: (s, h, o) => t.startIntroTimer(s, h, o), stopIntroTimer: () => t.stopIntroTimer() }; };

export const applyButtonMinSide = (btn) => { const w = btn.offsetWidth, h = btn.offsetHeight, m = Math.min(w, h); if (m > 0) btn.style.setProperty('--min-side', `${m}px`); };
const isButtonDisabled = (b) => b.classList.contains('disabled') || b.getAttribute('aria-disabled') === 'true' || b.disabled === true;
const isToggleButton = (b) => b.classList.contains('toggle');

// ============================================================================
// Button 컴포넌트 (최적화)
// ============================================================================

// 버튼 액션 핸들러 (컨텍스트 의존성 분리)
const useButtonAction = (actionType, actionTarget, actionMethod, disabled) => {
  const ctxRef = useRef(null);
  const modalRef = useRef(null);
  ctxRef.current = useContext(AppContext);
  modalRef.current = useModal();

  return useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    const c = ctxRef.current || {};
    const m = modalRef.current;
    const actions = {
      navigate: () => actionTarget && c.setCurrentPage?.(actionTarget),
      selectTab: () => actionTarget && c.selectedTab !== actionTarget && c.setSelectedTab?.(actionTarget),
      payment: () => actionMethod && (c.sendOrderDataToApp?.(actionMethod), c.setisCreditPayContent?.(actionMethod === "card" ? 1 : 2)),
      cancel: () => actionTarget ? c.setCurrentPage?.(actionTarget) : (c.sendCancelPayment?.(), c.setisCreditPayContent?.(0)),
      receipt: () => actionTarget === 'print' ? (c.sendPrintReceiptToApp?.(), c.setisCreditPayContent?.(6)) : c.setisCreditPayContent?.(7),
      finish: () => c.setisCreditPayContent?.(7),
      tabNav: () => actionTarget === 'prev' ? c.handlePreviousTab?.() : c.handleNextTab?.(),
      categoryNav: () => typeof c.handleCategoryPageNav === 'function' && c.handleCategoryPageNav(actionTarget),
      modal: () => actionTarget && m?.[`Modal${actionTarget}`]?.open?.(),
    };
    actions[actionType]?.();
  }, [disabled, actionType, actionTarget, actionMethod]);
};

// 키 검증 유틸
const isActionKey = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'NumpadEnter';

const Button = memo(({ className = '', style = {}, svg = null, img, imgAlt = '', imgStyle = {}, label, children, disabled = false, pressed = false, toggle = false, actionType, actionTarget, actionMethod, onClick, ttsText, ...rest }) => {
  const btnRef = useRef(null);
  const [isPressing, setIsPressing] = useState(false);
  const { playOnPressedSound } = useButtonStyle();
  const handleAction = useButtonAction(actionType, actionTarget, actionMethod, disabled);

  useLayoutEffect(() => { if (btnRef.current) applyButtonMinSide(btnRef.current); }, []);

  const cls = useMemo(() => {
    const c = ['button'];
    if (!/primary[123]|secondary[123]/.test(className)) c.push('primary2');
    if (toggle) c.push('toggle');
    if (pressed || (isPressing && !toggle)) c.push('pressed');
    if (className) c.push(className);
    return c.join(' ');
  }, [className, toggle, pressed, isPressing]);

  const onStart = useCallback((e) => {
    if (disabled || (e.type === 'keydown' && !isActionKey(e))) return;
    if (e.type === 'keydown') e.preventDefault();
    playOnPressedSound();
    if (!toggle) setIsPressing(true);
  }, [disabled, toggle, playOnPressedSound]);

  const onEnd = useCallback((e) => {
    if (disabled || (e.type === 'keyup' && !isActionKey(e))) return;
    if (e.type === 'keyup' || e.type === 'touchend') e.preventDefault();
    if (!toggle) setIsPressing(false);
    actionType ? handleAction(e) : onClick?.(e);
  }, [disabled, toggle, actionType, handleAction, onClick]);

  return (
    <button ref={btnRef} className={cls} style={style} data-tts-text={ttsText} data-react-handler="true" disabled={disabled} aria-disabled={disabled} aria-pressed={toggle ? pressed : undefined} onMouseDown={onStart} onMouseUp={onEnd} onMouseLeave={() => setIsPressing(false)} onTouchStart={onStart} onTouchEnd={onEnd} onKeyDown={onStart} onKeyUp={onEnd} {...rest}>
      <div className="background dynamic">
        {(svg || img) && <span className="content icon" aria-hidden="true">{svg || <img src={img} alt={imgAlt} style={imgStyle} />}</span>}
        {label && <span className="content label">{label}</span>}
        {children}
        {toggle && <span className="content icon pressed" aria-hidden="true"><ToggleIcon /></span>}
      </div>
    </button>
  );
});
Button.displayName = 'Button';

// ============================================================================
// Modal 컴포넌트 (최적화 - 팩토리 패턴)
// ============================================================================

const H = memo(({ children }) => <span className="return-highlight">{children}</span>); // ModalHighlight 축약
H.displayName = 'H';

// 공통 모달 TTS/설정
const MODAL_TTS = {
  deleteCheck: "오버레이, 알림, 내역이 없으면 메뉴선택으로 돌아갑니다, 계속 진행하시려면 확인 버튼을 누릅니다, ",
  delete: "오버레이, 알림, 상품삭제, 주문 상품을 삭제합니다, 계속 진행하시려면 삭제 버튼을 누릅니다, ",
  reset: "오버레이, 알림, 초기화, 주문 내역을 초기화합니다, 계속 진행하시려면 초기화 버튼을 누릅니다, ",
  return: "오버레이, 알림, 시작화면, 시작화면으로 이동합니다, 계속 진행하시려면 시작화면 버튼을 누릅니다,",
  call: "오버레이, 알림, 직원 호출, 직원을 호출합니다, 계속 진행하시려면 호출 버튼을 누릅니다,",
};

// 공통 모달 베이스
const BaseModal = memo(({ isOpen, ttsKey, icon = "GraphicWarning", onCancel, onConfirm, children, cancelLabel = "취소", confirmLabel = "확인" }) => {
  const { sections, volume, commonScript } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(isOpen);
  useActiveElementTTS(handleText, 500, isOpen);
  if (!isOpen) return null;
  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}><button type="hidden" autoFocus className="hidden-btn" data-tts-text={MODAL_TTS[ttsKey] + commonScript.replay} /></div>
      <div className="return-modal-overlay" />
      <div className="return-modal-content" ref={containerRef}>
        <Icon name={icon} className="return-modal-image" />
        <div className="return-modal-message">{children}</div>
        <div data-tts-text="작업관리, 버튼 두 개," ref={sections.confirmSections} className="return-modal-buttons">
          <Button className="w242h090 return-btn-cancel" svg={<Icon name="Cancel" />} label={cancelLabel} ttsText={`${cancelLabel},`} onClick={onCancel} />
          <Button className="w242h090 return-btn-confirm" svg={<Icon name="Ok" />} label={confirmLabel} ttsText={`${confirmLabel},`} onClick={onConfirm} />
        </div>
      </div>
    </>
  );
});
BaseModal.displayName = 'BaseModal';

// 수량 리셋 유틸
const useResetQuantities = () => {
  const { totalMenuItems, setQuantities } = useContext(AppContext);
  return useCallback(() => {
    const reset = {};
    totalMenuItems.forEach(i => { reset[i.id] = 0; });
    setQuantities(reset);
  }, [totalMenuItems, setQuantities]);
};

// 개별 모달들
const DeleteCheckModal = ({ handleDecrease, id, quantities }) => {
  const { ModalDeleteCheck, readCurrentPage, setCurrentPage } = useContext(AppContext);
  const close = useCallback(() => { ModalDeleteCheck.close(); readCurrentPage(); }, [ModalDeleteCheck, readCurrentPage]);
  const confirm = useCallback(() => { quantities[id] !== 1 ? (quantities[id] = 0) : handleDecrease(id); ModalDeleteCheck.close(); setCurrentPage('process3'); }, [quantities, id, handleDecrease, ModalDeleteCheck, setCurrentPage]);
  return <BaseModal isOpen={ModalDeleteCheck.isOpen} ttsKey="deleteCheck" icon="GraphicWarning" onCancel={close} onConfirm={confirm}><p>내역이 없으면 <H>메뉴선택</H>으로 돌아갑니다</p><p>계속 진행하시려면 <H>확인</H> 버튼을 누르세요</p></BaseModal>;
};

const DeleteModal = ({ handleDecrease, id, quantities }) => {
  const { ModalDelete, readCurrentPage } = useContext(AppContext);
  const close = useCallback(() => { ModalDelete.close(); readCurrentPage(); }, [ModalDelete, readCurrentPage]);
  const confirm = useCallback(() => { quantities[id] !== 1 ? (quantities[id] = 0) : handleDecrease(id); ModalDelete.close(); readCurrentPage(); }, [quantities, id, handleDecrease, ModalDelete, readCurrentPage]);
  return <BaseModal isOpen={ModalDelete.isOpen} ttsKey="delete" icon="GraphicTrash" onCancel={close} onConfirm={confirm} confirmLabel="삭제"><p>주문 상품을 <H>삭제</H>합니다</p><p>계속 진행하시려면 <H>삭제</H> 버튼을 누릅니다</p></BaseModal>;
};

const ResetModal = () => {
  const { ModalReset, readCurrentPage, setCurrentPage } = useContext(AppContext);
  const resetQty = useResetQuantities();
  const close = useCallback(() => { ModalReset.close(); readCurrentPage(); }, [ModalReset, readCurrentPage]);
  const confirm = useCallback(() => { resetQty(); ModalReset.close(); setCurrentPage('process2'); readCurrentPage(); }, [resetQty, ModalReset, setCurrentPage, readCurrentPage]);
  return <BaseModal isOpen={ModalReset.isOpen} ttsKey="reset" icon="GraphicReset" onCancel={close} onConfirm={confirm} confirmLabel="초기화"><p>주문 내역을 <H>초기화</H>합니다</p><p>계속 진행하시려면 <H>초기화</H> 버튼을 누릅니다</p></BaseModal>;
};

const ReturnModal = () => {
  const { ModalReturn, readCurrentPage, setCurrentPage } = useContext(AppContext);
  const resetQty = useResetQuantities();
  const close = useCallback(() => { ModalReturn.close(); readCurrentPage(); }, [ModalReturn, readCurrentPage]);
  const confirm = useCallback(() => { resetQty(); ModalReturn.close(); setCurrentPage('process1'); }, [resetQty, ModalReturn, setCurrentPage]);
  return <BaseModal isOpen={ModalReturn.isOpen} ttsKey="return" icon="GraphicHome" onCancel={close} onConfirm={confirm} confirmLabel="시작화면"><p><H>시작화면</H>으로 이동합니다</p><p>계속 진행하시려면 <H>시작화면</H> 버튼을 누릅니다</p></BaseModal>;
};

const CallModal = () => {
  const { ModalCall, readCurrentPage } = useContext(AppContext);
  const close = useCallback(() => { ModalCall.close(); readCurrentPage(); }, [ModalCall, readCurrentPage]);
  return <BaseModal isOpen={ModalCall.isOpen} ttsKey="call" icon="GraphicBell" onCancel={close} onConfirm={close} confirmLabel="호출"><p>직원을 <H>호출</H>합니다</p><p>계속 진행하시려면 <H>호출</H> 버튼을 누릅니다</p></BaseModal>;
};

export const useMultiModalButtonHandler = (options = {}) => { const { initFocusableSections = [], initFirstButtonSection = null, enableGlobalHandlers = true, handleTextOpt = null, prefixOpt = '', enableKeyboardNavigation = false } = options; const [, setFocusableSections] = useState(initFocusableSections); const handlersRef = useRef({}); const keyboardNavState = useRef({ currentSectionIndex: 0, currentButtonIndex: 0, sections: initFocusableSections, firstButtonSection: initFirstButtonSection }); const updateFocusableSections = useCallback((ns) => { setFocusableSections(ns); keyboardNavState.current.sections = ns; }, []); const finalHandleText = useCallback((t) => { if (handleTextOpt && typeof handleTextOpt === 'function') handleTextOpt(t); }, [handleTextOpt]); const handleButtonClick = useCallback((e) => { const b = e.target?.closest?.('.button'); if (!b || isButtonDisabled(b)) return; if (b.dataset.reactHandler === 'true') return; const tts = b.dataset.ttsText; if (tts && finalHandleText) finalHandleText(prefixOpt ? `${prefixOpt}${tts}` : tts); }, [finalHandleText, prefixOpt]); useEffect(() => { if (!enableGlobalHandlers) return; const htc = (e) => { const b = e.target?.closest?.('.button'); if (!b || isButtonDisabled(b) || !isToggleButton(b)) return; if (b.dataset.reactHandler === 'true') return; }; document.addEventListener('click', htc, false); handlersRef.current.toggleClickHandler = htc; return () => document.removeEventListener('click', htc, false); }, [enableGlobalHandlers]); useEffect(() => { if (!enableGlobalHandlers) return; const bdb = (e) => { const b = e.target?.closest?.('.button'); if (b && isButtonDisabled(b)) { e.preventDefault(); e.stopPropagation(); } }; document.addEventListener('click', bdb, true); return () => document.removeEventListener('click', bdb, true); }, [enableGlobalHandlers]); useEffect(() => { if (!enableGlobalHandlers || !enableKeyboardNavigation) return; const hkd = (e) => { const { key } = e; if ([KEYBOARD.ARROW_UP, KEYBOARD.ARROW_DOWN, KEYBOARD.ARROW_LEFT, KEYBOARD.ARROW_RIGHT].includes(key)) { e.preventDefault(); const ae = document.activeElement; if (!ae) return; const cs = ae.closest('[data-tts-text]'); if (!cs) return; const btns = cs.querySelectorAll('.button:not([aria-disabled="true"])'); const ci = Array.from(btns).indexOf(ae); let ni = ci; if (key === KEYBOARD.ARROW_RIGHT || key === KEYBOARD.ARROW_DOWN) ni = (ci + 1) % btns.length; else if (key === KEYBOARD.ARROW_LEFT || key === KEYBOARD.ARROW_UP) ni = (ci - 1 + btns.length) % btns.length; if (btns[ni]) btns[ni].focus(); } if (key === KEYBOARD.TAB) { const secs = keyboardNavState.current.sections; if (secs.length === 0) return; e.preventDefault(); const csi = keyboardNavState.current.currentSectionIndex; const nsi = e.shiftKey ? (csi - 1 + secs.length) % secs.length : (csi + 1) % secs.length; const ns = secs[nsi]?.current; if (ns) { const fb = ns.querySelector('.button:not([aria-disabled="true"])'); if (fb) { fb.focus(); keyboardNavState.current.currentSectionIndex = nsi; } } } if (key === KEYBOARD.ENTER || key === KEYBOARD.SPACE) { const ae = document.activeElement; if (ae?.classList?.contains('button')) { e.preventDefault(); ae.click(); } } }; document.addEventListener('keydown', hkd, true); return () => document.removeEventListener('keydown', hkd, true); }, [enableGlobalHandlers, enableKeyboardNavigation]); useEffect(() => { if (!enableGlobalHandlers) return; const hps = (e, a) => { const b = e.target?.closest?.('.button'); if (!b || isButtonDisabled(b) || isToggleButton(b)) return; if (b.dataset.reactHandler === 'true') return; if (a === 'add') b.classList.add('pressed'); else if (a === 'remove' && b.classList.contains('pressed')) { b.classList.remove('pressed'); requestAnimationFrame(() => { if (b instanceof HTMLElement && document.activeElement !== b) b.focus(); }); } }; const hmd = (e) => hps(e, 'add'); const hmu = (e) => { hps(e, 'remove'); const b = e.target?.closest?.('.button'); if (b && !isButtonDisabled(b) && !isToggleButton(b) && b.dataset.reactHandler !== 'true') requestAnimationFrame(() => b instanceof HTMLElement && b.focus()); }; const hml = (e) => e.target?.closest && hps(e, 'remove'); const hts = (e) => hps(e, 'add'); const hte = (e) => { hps(e, 'remove'); const b = e.target?.closest?.('.button'); if (b && !isButtonDisabled(b) && !isToggleButton(b) && b.dataset.reactHandler !== 'true') requestAnimationFrame(() => b instanceof HTMLElement && b.focus()); }; const htc = (e) => hps(e, 'remove'); document.addEventListener('mousedown', hmd, true); document.addEventListener('mouseup', hmu, true); document.addEventListener('mouseleave', hml, true); document.addEventListener('touchstart', hts, { passive: true }); document.addEventListener('touchend', hte, { passive: true }); document.addEventListener('touchcancel', htc, { passive: true }); return () => { document.removeEventListener('mousedown', hmd, true); document.removeEventListener('mouseup', hmu, true); document.removeEventListener('mouseleave', hml, true); document.removeEventListener('touchstart', hts); document.removeEventListener('touchend', hte); document.removeEventListener('touchcancel', htc); }; }, [enableGlobalHandlers]); return enableKeyboardNavigation ? { handleButtonClick, updateFocusableSections } : { handleButtonClick }; };

export const useWebViewMessage = (setisCreditPayContent) => { useEffect(() => { if (window.chrome?.webview) { const hm = (e) => { let d = e.data; if (d.arg.result === CFG.WEBVIEW_SUCCESS) { if (d.Command === 'PAY') setisCreditPayContent(PAY.CARD_OUT); if (d.Command === 'PRINT') setisCreditPayContent(PAY.PRINT_SELECT); } else { console.log(d.arg.errorMessage); } }; window.chrome.webview.addEventListener("message", hm); return () => { if (window.chrome?.webview) window.chrome.webview.removeEventListener("message", hm); }; } }, [setisCreditPayContent]); };

// ============================================================================
// Contexts
// ============================================================================

export const AccessibilityContext = createContext();
export const AccessibilityProvider = ({ children }) => { const [isDark, setisDark] = useState(false); const [isLow, setisLow] = useState(false); const [isLarge, setisLarge] = useState(false); const [volume, setVolume] = useState(1); useBodyClass('dark', isDark); useBodyClass('large', isLarge); useBodyClass('low', isLow); const accessibility = useMemo(() => ({ isHighContrast: isDark, isLowScreen: isLow, isBigSize: isLarge, volume }), [isDark, isLow, isLarge, volume]); const [accessibilityState, setAccessibilityState] = useState(accessibility); useEffect(() => { setAccessibilityState(accessibility); }, [accessibility]); const value = useMemo(() => ({ isDark, setisDark, isLow, setisLow, isLarge, setisLarge, volume, setVolume, accessibility, setAccessibility: setAccessibilityState }), [isDark, isLow, isLarge, volume, accessibility]); return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>; };

export const UIContext = createContext();
export const UIProvider = ({ children }) => { const [currentPage, setCurrentPageState] = useState('process1'); const [history, setHistory] = useState(['process1']); const setCurrentPage = useCallback((p) => { if (p !== currentPage) { setHistory(pr => [...pr, currentPage]); setCurrentPageState(p); } }, [currentPage]); const goBack = useCallback(() => { if (history.length > 1) { const nh = [...history]; nh.pop(); setHistory(nh); setCurrentPageState(nh[nh.length - 1]); } }, [history]); const [intervalTime, setintervalTime] = useState(0); const [introFlag, setintroFlag] = useState(true); const sections = { top: useRef(null), row1: useRef(null), row2: useRef(null), row3: useRef(null), row4: useRef(null), row5: useRef(null), row6: useRef(null), page: useRef(null), modalPage: useRef(null), middle: useRef(null), bottom: useRef(null), footer: useRef(null), bottomfooter: useRef(null), confirmSections: useRef(null), AccessibilitySections1: useRef(null), AccessibilitySections2: useRef(null), AccessibilitySections3: useRef(null), AccessibilitySections4: useRef(null), AccessibilitySections5: useRef(null), AccessibilitySections6: useRef(null) }; const value = useMemo(() => ({ currentPage, setCurrentPage, goBack, history, intervalTime, setintervalTime, introFlag, setintroFlag, sections }), [currentPage, setCurrentPage, goBack, history, intervalTime, introFlag, sections]); return <UIContext.Provider value={value}>{children}</UIContext.Provider>; };

export const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);
export const ModalProvider = ({ children }) => { const [ModalReturnOpen, setModalReturnOpen] = useState(false); const [ModalAccessibilityOpen, setModalAccessibilityOpen] = useState(false); const [ModalResetOpen, setModalResetOpen] = useState(false); const [ModalDeleteOpen, setModalDeleteOpen] = useState(false); const [ModalDeleteCheckOpen, setModalDeleteCheckOpen] = useState(false); const [ModalCallOpen, setModalCallOpen] = useState(false); const [ModalDeleteItemId, setModalDeleteItemId] = useState(0); const createModalHandlers = useCallback((isOpen, setIsOpen) => ({ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), toggle: () => setIsOpen(p => !p) }), []); const value = useMemo(() => ({ ModalReturn: createModalHandlers(ModalReturnOpen, setModalReturnOpen), ModalAccessibility: createModalHandlers(ModalAccessibilityOpen, setModalAccessibilityOpen), ModalReset: createModalHandlers(ModalResetOpen, setModalResetOpen), ModalDelete: createModalHandlers(ModalDeleteOpen, setModalDeleteOpen), ModalDeleteCheck: createModalHandlers(ModalDeleteCheckOpen, setModalDeleteCheckOpen), ModalCall: createModalHandlers(ModalCallOpen, setModalCallOpen), ModalDeleteItemId, setModalDeleteItemId }), [ModalReturnOpen, ModalAccessibilityOpen, ModalResetOpen, ModalDeleteOpen, ModalDeleteCheckOpen, ModalCallOpen, ModalDeleteItemId, createModalHandlers]); return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>; };

export const OrderContext = createContext();
export const OrderProvider = ({ children }) => { const { tabs, totalMenuItems, categoryInfo, isLoading: menuLoading } = useMenuData(); const { categorizeMenu, calculateSum, calculateTotal, filterMenuItems, createOrderItems } = useMenuUtils(); const [selectedTab, setSelectedTab] = useState("전체메뉴"); const menuItems = useMemo(() => categorizeMenu(totalMenuItems, selectedTab, categoryInfo), [totalMenuItems, selectedTab, categoryInfo, categorizeMenu]); const [quantities, setQuantities] = useState({}); const [isCreditPayContent, setisCreditPayContent] = useState(0); const handleIncrease = useCallback((id) => { setQuantities(p => ({ ...p, [id]: (p[id] || 0) + 1 })); }, []); const handleDecrease = useCallback((id) => { setQuantities(p => ({ ...p, [id]: p[id] > 0 ? p[id] - 1 : 0 })); }, []); const totalCount = useMemo(() => calculateSum(quantities), [quantities, calculateSum]); const totalSum = useMemo(() => calculateTotal(quantities, totalMenuItems), [quantities, totalMenuItems, calculateTotal]); const orderItems = useMemo(() => createOrderItems(totalMenuItems, quantities), [totalMenuItems, quantities, createOrderItems]); const updateOrderNumber = useCallback(() => { const c = safeParseInt(safeLocalStorage.getItem(STORAGE.ORDER_NUM), 0); const n = c + 1; safeLocalStorage.setItem(STORAGE.ORDER_NUM, n); return n; }, []); const setCallWebToApp = useCallback((cmd, val) => { const o = { Command: cmd, arg: val }; console.log("obj_cmd: " + JSON.stringify(o)); if (window.chrome?.webview) window.chrome.webview.postMessage(JSON.stringify(o)); }, []); const sendOrderDataToApp = useCallback((paymentType) => { const arr = orderItems.map(i => ({ menuName: i.name, quantity: i.quantity, price: i.price * i.quantity })); const sp = (totalSum / 1.1).toFixed(2); setCallWebToApp(WEBVIEW.PAY, { orderData: arr, totalPrice: totalSum, supplyPrice: sp, tax: (totalSum - sp).toFixed(2), paymentType, orderNumber: updateOrderNumber() }); }, [orderItems, totalSum, updateOrderNumber, setCallWebToApp]); const sendPrintReceiptToApp = useCallback(() => setCallWebToApp(WEBVIEW.PRINT, ''), [setCallWebToApp]); const sendCancelPayment = useCallback(() => setCallWebToApp(WEBVIEW.CANCEL, ''), [setCallWebToApp]); const handlePreviousTab = useCallback(() => { const i = (tabs.indexOf(selectedTab) - 1 + tabs.length) % tabs.length; setSelectedTab(tabs[i]); }, [tabs, selectedTab]); const handleNextTab = useCallback(() => { const i = (tabs.indexOf(selectedTab) + 1) % tabs.length; setSelectedTab(tabs[i]); }, [tabs, selectedTab]); const categoryPageNavRef = useRef(null); const handleCategoryPageNav = useCallback((dir) => { if (categoryPageNavRef.current) categoryPageNavRef.current(dir); }, []); const setHandleCategoryPageNav = useCallback((fn) => { categoryPageNavRef.current = fn; }, []); const value = useMemo(() => ({ tabs, totalMenuItems, categoryInfo, menuItems, selectedTab, setSelectedTab, menuLoading, quantities, setQuantities, handleIncrease, handleDecrease, totalCount, totalSum, filterMenuItems, createOrderItems, convertToKoreanQuantity, calculateSum, calculateTotal, isCreditPayContent, setisCreditPayContent, sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, updateOrderNumber, handlePreviousTab, handleNextTab, handleCategoryPageNav, setHandleCategoryPageNav }), [tabs, totalMenuItems, categoryInfo, menuItems, selectedTab, menuLoading, quantities, setQuantities, handleIncrease, handleDecrease, totalCount, totalSum, filterMenuItems, createOrderItems, calculateSum, calculateTotal, orderItems, isCreditPayContent, setisCreditPayContent, sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, updateOrderNumber, handlePreviousTab, handleNextTab, handleCategoryPageNav, setHandleCategoryPageNav]); return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>; };

export const ButtonStyleContext = createContext(null);
export const ButtonStyleProvider = ({ children }) => { const [groupStates, setGroupStates] = useState({}); const [buttonStates, setButtonStates] = useState({}); const { play: playSound } = useSound(); const playOnPressedSound = useCallback(() => playSound('onPressed'), [playSound]); const setButtonPressed = useCallback((id, p) => { setButtonStates(pr => ({ ...pr, [id]: p })); }, []); const toggleButtonPressed = useCallback((id) => { let ns; setButtonStates(p => { ns = !p[id]; return { ...p, [id]: ns }; }); return ns; }, []); const isButtonPressed = useCallback((id) => buttonStates[id] || false, [buttonStates]); const selectInGroup = useCallback((gid, bid) => { setGroupStates(p => ({ ...p, [gid]: bid })); }, []); const getSelectedInGroup = useCallback((gid) => groupStates[gid] || null, [groupStates]); const isSelectedInGroup = useCallback((gid, bid) => groupStates[gid] === bid, [groupStates]); const clearGroupSelection = useCallback((gid) => { setGroupStates(p => { const s = { ...p }; delete s[gid]; return s; }); }, []); const contextValue = useMemo(() => ({ playOnPressedSound, setButtonPressed, toggleButtonPressed, isButtonPressed, buttonStates, selectInGroup, getSelectedInGroup, isSelectedInGroup, clearGroupSelection, groupStates }), [playOnPressedSound, setButtonPressed, toggleButtonPressed, isButtonPressed, buttonStates, selectInGroup, getSelectedInGroup, isSelectedInGroup, clearGroupSelection, groupStates]); return <ButtonStyleContext.Provider value={contextValue}>{children}</ButtonStyleContext.Provider>; };
export const useButtonStyle = () => { const c = useContext(ButtonStyleContext); if (!c) return { playOnPressedSound: () => {}, setButtonPressed: () => {}, toggleButtonPressed: () => false, isButtonPressed: () => false, buttonStates: {}, selectInGroup: () => {}, getSelectedInGroup: () => null, isSelectedInGroup: () => false, clearGroupSelection: () => {}, groupStates: {} }; return c; };

export const InitializationContext = createContext({ isInitialized: false, initializationSteps: {} });
export const useInitialization = () => useContext(InitializationContext);
export const InitializationProvider = ({ children }) => { const [initializationSteps, setInitializationSteps] = useState({ ttsDatabase: false, buttonHandler: false, sizeControl: false, viewport: false }); const { initDB } = useTextHandler(); useEffect(() => { const init = async () => { await initDB(); setInitializationSteps(p => ({ ...p, ttsDatabase: true })); }; init(); }, [initDB]); useMultiModalButtonHandler({ enableGlobalHandlers: true, enableKeyboardNavigation: false }); useEffect(() => { setInitializationSteps(p => ({ ...p, buttonHandler: true })); }, []); useLayoutEffect(() => { SizeControlManager.init(); setInitializationSteps(p => ({ ...p, sizeControl: true })); setViewportZoom(); setupViewportResize(); setInitializationSteps(p => ({ ...p, viewport: true })); }, []); const isInitialized = Object.values(initializationSteps).every(Boolean); const value = { isInitialized, initializationSteps }; return <InitializationContext.Provider value={value}>{children}</InitializationContext.Provider>; };

export const IdleTimeoutContext = createContext({ remainingTime: 0, remainingTimeFormatted: "00:00", isActive: false });
export const useIdleTimeoutContext = () => useContext(IdleTimeoutContext);
export const IdleTimeoutProvider = ({ value, children }) => (<IdleTimeoutContext.Provider value={value}>{children}</IdleTimeoutContext.Provider>);

export const AppContext = createContext();
export const AppContextProvider = ({ children }) => { const accessibilityContext = useContext(AccessibilityContext); const orderContext = useContext(OrderContext); const uiContext = useContext(UIContext); const modalContext = useContext(ModalContext); const { handleText } = useTextHandler(accessibilityContext.volume); const readCurrentPage = useCallback((newVolume) => { const el = safeQuerySelector('.hidden-btn.page-btn'); const p = el?.dataset.ttsText; if (p) handleText(p, true, newVolume); }, [handleText]); const contextValue = useMemo(() => ({ ...accessibilityContext, ...orderContext, ...uiContext, ...modalContext, commonScript: TTS, readCurrentPage }), [accessibilityContext, orderContext, uiContext, modalContext, readCurrentPage]); return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>; };

// ============================================================================
// 상수 정의 (App용)
// ============================================================================

// 페이지 설정
export const PAGE = { FIRST: 'process1', SECOND: 'process2', THIRD: 'process3', FOURTH: 'process4' };

// 결제 단계
export const PAY_STEP = { SELECT_METHOD: 0, CARD_INSERT: 1, MOBILE_PAY: 2, CARD_REMOVE: 3, PRINT_SELECT: 4, ORDER_PRINT: 5, RECEIPT_PRINT: 6, FINISH: 7 };

// 타이머 (ms)
export const TIMER = { AUTO_FINISH: 60000, FINAL_PAGE: 4000, TTS_DELAY: CFG.TTS_DELAY, ACTION_DELAY: 100, INTERVAL: 1000, IDLE: CFG.IDLE_TIMEOUT };

// 페이지네이션
export const PAGINATION = { ITEMS_PER_PAGE_NORMAL: 16, ITEMS_PER_PAGE_LOW: 3 };

// 포커스 섹션
export const SECTION = { PAGE: 'page', TOP: 'top', MIDDLE: 'middle', BOTTOM: 'bottom', FOOTER: 'footer', BOTTOM_FOOTER: 'bottomfooter' };

// 기본값
export const DEFAULT = { VOLUME: 1, IS_DARK: false, IS_LARGE: false, IS_LOW: false, SELECTED_TAB: '전체메뉴' };

// 비활성 메뉴 ID
export const DISABLED_MENU_ID = 13;

// 에러 메시지
export const ERROR = { NO_PRODUCT: '없는 상품입니다.' };

// 레이아웃 컴포넌트
const LAYOUT = { STEP: 'Step', CONTENT: 'Content', SUMMARY: 'Summary', BOTTOM: 'Bottom', MODALS: 'Modals' };
const LAYOUT_COND = {
  [LAYOUT.STEP]: () => true,
  [LAYOUT.CONTENT]: () => true,
  [LAYOUT.SUMMARY]: (ctx) => [PAGE.SECOND, PAGE.THIRD].includes(ctx.currentPage),
  [LAYOUT.BOTTOM]: () => true,
  [LAYOUT.MODALS]: () => true,
};

// 호환성 alias (다른 파일에서 사용)
export const PAGE_CONFIG = PAGE;
export const PAYMENT_STEPS = PAY_STEP;
export const TIMER_CONFIG = TIMER;
export const PAGINATION_CONFIG = PAGINATION;
export const FOCUS_SECTIONS = SECTION;
export const DEFAULT_SETTINGS = DEFAULT;
export const ERROR_MESSAGES = ERROR;
export const commonScript = TTS;
export const PAGE_MESSAGES = { FIRST: { FULL: TTS.page1 }, SECOND: { FULL: TTS.page2 }, THIRD: { FULL: TTS.page3 } };
export const PAYMENT_MESSAGES = { SELECT_METHOD: TTS.paySelect, CARD_INSERT: TTS.cardIn, MOBILE_PAY: TTS.mobile, CARD_REMOVE: TTS.cardOut, PRINT_SELECT: TTS.printSelect, ORDER_PRINT: TTS.orderPrint, RECEIPT_PRINT: TTS.receipt, FINISH: TTS.finish };
export const LAYOUT_COMPONENTS = LAYOUT;
export const LAYOUT_ASSEMBLY_CONTEXT = { conditions: LAYOUT_COND };


// ============================================================================
// 내부 UI 컴포넌트 (App.js 내부용)
// ============================================================================

// 카테고리 탭 버튼
const CategoryTab = memo(({ tab, isSelected, isLast }) => (
  <>
    <Button 
      toggle 
      pressed={isSelected} 
      ttsText={`${tab.name}, ${isSelected ? "선택됨, " : "선택가능, "}`} 
      actionType="selectTab" 
      actionTarget={tab.name} 
      label={tab.name} 
    />
    {!isLast && <div className="secondpage-short-colline" />}
  </>
));
CategoryTab.displayName = 'CategoryTab';

// 카테고리 네비게이션
const CategoryNav = memo(({ categories, selectedTab, pagination, containerRef, sections, convertToKoreanQuantity }) => {
  const { catPage, catTotal, catItems } = pagination;
  return (
    <div 
      className="category-full" 
      ref={sections.top} 
      data-tts-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 총 버튼 ${convertToKoreanQuantity(catItems.length)}개,`}
    >
      <Button toggle ttsText="이전" label="◀" disabled={catPage === 1} actionType="categoryNav" actionTarget="prev" />
      <div className="category" ref={containerRef}>
        {catItems.map((tab, i) => (
          <CategoryTab 
            key={tab.id} 
            tab={tab} 
            isSelected={selectedTab === tab.name} 
            isLast={i === catItems.length - 1} 
          />
        ))}
      </div>
      <Button toggle ttsText="다음" label="▶" disabled={catPage === catTotal} actionType="categoryNav" actionTarget="next" />
    </div>
  );
});
CategoryNav.displayName = 'CategoryNav';

// 메뉴 아이템
const MenuItem = memo(({ item, disabled, onPress }) => (
  <Button 
    className="menu-item" 
    ttsText={disabled ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`} 
    disabled={disabled} 
    onClick={onPress}
  >
    <span className="content icon" aria-hidden="true">
      <img src={`/images/${item.img}`} alt={item.name} />
    </span>
    <span className="content label">
      <div className="txt-box">
        <p>{item.name}</p>
        <p>{Number(item.price).toLocaleString()}원</p>
      </div>
    </span>
  </Button>
));
MenuItem.displayName = 'MenuItem';

// 메뉴 그리드
const MenuGrid = memo(({ items, disabledId, onItemPress, sections, selectedTab, convertToKoreanQuantity }) => {
  return (
    <div className="menu" ref={sections.middle} data-tts-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(items.length)}개,`}>
      {items.map(item => (
        <MenuItem 
          key={item.id} 
          item={item} 
          disabled={item.id === disabledId} 
          onPress={(e) => onItemPress(e, item.id)} 
        />
      ))}
    </div>
  );
});
MenuGrid.displayName = 'MenuGrid';

// 페이지네이션
const Pagination = memo(({ pageNumber, totalPages, onPrev, onNext, isDark, ttsPrefix = "메뉴", sectionRef }) => (
  <div className="pagination" ref={sectionRef} data-tts-text={`페이지네이션, ${ttsPrefix}, ${totalPages} 페이지 중 ${pageNumber} 페이지, 버튼 두 개,`}>
    <Button ttsText="이전," label="이전" onClick={onPrev} />
    <span className="pagination-page-number">
      <span className={isDark ? "pagination-page-number-highlight" : "pagination-page-number-default"}>{pageNumber}</span>
      <span className="pagination-separator">&nbsp;/&nbsp;</span>
      <span className="pagination-separator">{totalPages || 1}</span>
    </span>
    <Button ttsText="다음," label="다음" onClick={onNext} />
  </div>
));
Pagination.displayName = 'Pagination';

// 주문 아이템
const OrderItem = memo(({ item, index, quantity, onDecrease, onIncrease, onDelete, sectionRef, convertToKoreanQuantity }) => {
  const totalPrice = item.price * quantity;
  
  return (
    <>
      <div 
        className="order-item" 
        ref={sectionRef} 
        data-tts-text={`주문목록,${index}번, ${item.name}, ${convertToKoreanQuantity(quantity)} 개, ${totalPrice}원, 버튼 세 개, `}
      >
        <div className="order-image-div">
          <div className="order-index">{index}</div>
          <img src={`/images/${item.img}`} alt={item.name} className="order-image" />
        </div>
        <p className="order-name">{item.name}</p>
        <div className="order-quantity">
          <Button className="qty-btn" ttsText="수량 빼기" label="-" onClick={onDecrease} />
          <span className="qty">{quantity}</span>
          <Button className="qty-btn" ttsText="수량 더하기" label="+" onClick={onIncrease} />
        </div>
        <span className="order-price">{formatNumber(totalPrice)}원</span>
        <Button className="delete-btn" ttsText="삭제" svg={<DeleteIcon />} onClick={onDelete} />
      </div>
      <div className="row-line" />
    </>
  );
});
OrderItem.displayName = 'OrderItem';

// 주문 헤더
const OrderHeader = memo(({ isLow }) => (
  <div className="banner field">
    {isLow ? (
      <>
        <p className="one">상품명</p>
        <p className="one qty">수량</p>
        <p className="one price">가격</p>
        <p className="one delete">삭제</p>
      </>
    ) : (
      <>
        <p className="one-normal">상품명</p>
        <p className="one-qty-normal">수량</p>
        <p className="one-price-normal">가격</p>
        <p className="one-delete-normal">삭제</p>
      </>
    )}
  </div>
));
OrderHeader.displayName = 'OrderHeader';

// 페이지 타이틀
const PageTitle = memo(({ children, isDark }) => (
  <div className="title">
    {children}
  </div>
));
PageTitle.displayName = 'PageTitle';

// 하이라이트 텍스트
const Highlight = memo(({ children, isDark }) => (
  <span className={isDark ? "text-highlight-dark" : "text-highlight-light"}>{children}</span>
));
Highlight.displayName = 'Highlight';

// ============================================================================
// 프로세스 1 컴포넌트 (메인 화면)
// ============================================================================

const Process1 = memo(() => {
  const { 
    sections, setCurrentPage, volume, setisDark, setVolume, setisLarge, setisLow
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { startIntroTimer } = useTimer();
  const { blurActiveElement } = useSafeDocument();

  useMultiModalButtonHandler({
    initFocusableSections: [FOCUS_SECTIONS.PAGE, FOCUS_SECTIONS.MIDDLE, FOCUS_SECTIONS.BOTTOM_FOOTER],
    initFirstButtonSection: FOCUS_SECTIONS.PAGE,
    enableGlobalHandlers: true, handleTextOpt: handleText, enableKeyboardNavigation: true
  });

  const handleIntroComplete = useCallback(() => {
    setisDark(DEFAULT_SETTINGS.IS_DARK);
    setVolume(DEFAULT_SETTINGS.VOLUME);
    setisLarge(DEFAULT_SETTINGS.IS_LARGE);
    setisLow(DEFAULT_SETTINGS.IS_LOW);
  }, [setisDark, setVolume, setisLarge, setisLow]);

  useEffect(() => {
    const timer = setTimeout(() => {
      blurActiveElement();
      handleText(commonScript.intro);
      startIntroTimer(commonScript.intro, handleText, handleIntroComplete);
    }, TIMER_CONFIG.ACTION_DELAY * 2);
    return () => clearTimeout(timer);
  }, [handleText, handleIntroComplete, blurActiveElement, startIntroTimer]);

  return (
    <div className="main first">
      <img src="./images/poster.png" className="poster" alt="" />
      <div className="task-manager" data-tts-text="취식방식, 버튼 두개," ref={sections.middle}>
        <Button className="start" ttsText="포장하기" svg={<TakeoutIcon />} label="포장하기" actionType="navigate" actionTarget={PAGE_CONFIG.SECOND} />
        <Button className="start" ttsText="먹고가기" svg={<TakeinIcon />} label="먹고가기" actionType="navigate" actionTarget={PAGE_CONFIG.SECOND} />
      </div>
    </div>
  );
});
Process1.displayName = 'Process1';

// ============================================================================
// 프로세스 2 컴포넌트 (메뉴 선택 화면)
// ============================================================================

const Process2 = memo(() => {
  const {
    sections, isLow, isDark, tabs, menuItems, selectedTab, setSelectedTab,
    handleIncrease, commonScript, volume, quantities, convertToKoreanQuantity,
    setCurrentPage, setHandleCategoryPageNav, categoryInfo
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { stopIntroTimer } = useTimer();
  const { blurActiveElement, getActiveElementText } = useSafeDocument();

  useEffect(() => { const t = setTimeout(() => setSelectedTab(DEFAULT_SETTINGS.SELECTED_TAB), 0); return () => clearTimeout(t); }, []); // eslint-disable-line

  useEffect(() => {
    stopIntroTimer(); blurActiveElement();
    const t = setTimeout(() => { const p = getActiveElementText(); if (p) setTimeout(() => handleText(p), TIMER_CONFIG.TTS_DELAY); }, 0);
    return () => clearTimeout(t);
  }, [handleText, blurActiveElement, getActiveElementText, stopIntroTimer]);

  useMultiModalButtonHandler({
    initFocusableSections: [FOCUS_SECTIONS.PAGE, FOCUS_SECTIONS.TOP, FOCUS_SECTIONS.MIDDLE, FOCUS_SECTIONS.BOTTOM, FOCUS_SECTIONS.FOOTER, FOCUS_SECTIONS.BOTTOM_FOOTER],
    initFirstButtonSection: FOCUS_SECTIONS.TOP, enableGlobalHandlers: false, enableKeyboardNavigation: true
  });

  const { pageNumber, totalPages, currentItems, handlePrevPage, handleNextPage, resetOnChange } = usePagination(menuItems, PAGINATION_CONFIG.ITEMS_PER_PAGE_NORMAL, PAGINATION_CONFIG.ITEMS_PER_PAGE_LOW, isLow);
  useEffect(() => { const t = setTimeout(() => resetOnChange(), 0); return () => clearTimeout(t); }, [selectedTab]); // eslint-disable-line

  const handleTouchEndWrapper = useCallback((e, id) => {
    if (id !== DISABLED_MENU_ID) { handleIncrease(id); handleText('담기, '); } else { handleText(ERROR_MESSAGES.NO_PRODUCT); }
  }, [handleIncrease, handleText]);

  const handlePaginationPress = useCallback((e, dir) => { e.preventDefault(); e.target.focus(); dir === 'prev' ? handlePrevPage() : handleNextPage(); }, [handlePrevPage, handleNextPage]);
  const handleMenuItemPress = useCallback((e, id) => { e.preventDefault(); e.target.focus(); handleTouchEndWrapper(e, id); }, [handleTouchEndWrapper]);

  const allTabs = useMemo(() => (categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })), [categoryInfo]);
  const { containerRef: catContainerRef, itemsPerRow: catItemsPerRow } = useCategoryLayout();
  const { pageNumber: catPage, totalPages: catTotal, currentItems: catItems, handlePrevPage: catPrev, handleNextPage: catNext } = usePagination(allTabs, catItemsPerRow, catItemsPerRow, false);

  // 카테고리 페이지 네비게이션 핸들러 등록
  const localCategoryPageNav = useCallback((dir) => { dir === 'prev' ? catPrev() : catNext(); }, [catPrev, catNext]);
  useLayoutEffect(() => { 
    setHandleCategoryPageNav?.(localCategoryPageNav); 
    return () => setHandleCategoryPageNav?.(null); 
  }, [localCategoryPageNav, setHandleCategoryPageNav]);

  return (
    <div className="main second">
      <CategoryNav 
        categories={allTabs}
        selectedTab={selectedTab}
        pagination={{ catPage, catTotal, catItems }}
        containerRef={catContainerRef}
        sections={sections}
        convertToKoreanQuantity={convertToKoreanQuantity}
      />
      <MenuGrid 
        items={currentItems} 
        disabledId={DISABLED_MENU_ID} 
        onItemPress={handleMenuItemPress}
        sections={sections}
        selectedTab={selectedTab}
        convertToKoreanQuantity={convertToKoreanQuantity}
      />
      <Pagination 
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPrev={(e) => handlePaginationPress(e, 'prev')}
        onNext={(e) => handlePaginationPress(e, 'next')}
        isDark={isDark}
        ttsPrefix="메뉴"
        sectionRef={sections.bottom}
      />
    </div>
  );
});
Process2.displayName = 'Process2';

// ============================================================================
// 프로세스 3 컴포넌트 (주문 확인 화면)
// ============================================================================

const Process3 = memo(() => {
  const { sections, totalMenuItems, isDark, isLow, quantities, handleIncrease, handleDecrease, filterMenuItems, ModalDelete, ModalDeleteCheck, setModalDeleteItemId, volume, convertToKoreanQuantity, setCurrentPage } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const priceItems = useMemo(() => filterMenuItems(totalMenuItems, quantities), [totalMenuItems, quantities, filterMenuItems]);
  const { pageNumber, totalPages, currentItems, handlePrevPage, handleNextPage, itemsPerPage } = usePagination(priceItems, 6, 3, isLow);
  const startIndex = useMemo(() => (pageNumber - 1) * itemsPerPage, [pageNumber, itemsPerPage]);
  const prependRows = useCallback((arr, cnt) => [FOCUS_SECTIONS.PAGE, ...Array.from({ length: cnt }, (_, i) => `row${i + 1}`), ...arr], []);
  const focusableSections = useMemo(() => prependRows([FOCUS_SECTIONS.BOTTOM, FOCUS_SECTIONS.FOOTER, FOCUS_SECTIONS.BOTTOM_FOOTER], currentItems.length), [currentItems.length, prependRows]);
  const { updateFocusableSections } = useMultiModalButtonHandler({ initFocusableSections: focusableSections, initFirstButtonSection: "row1", enableGlobalHandlers: false, enableKeyboardNavigation: true });

  const handleTouchDecrease = useCallback((id) => {
    if (quantities[id] === 1) { setModalDeleteItemId(id); currentItems.length > 1 ? ModalDelete.open() : ModalDeleteCheck.open(); } else { handleDecrease(id); }
  }, [quantities, currentItems.length, setModalDeleteItemId, ModalDelete, ModalDeleteCheck, handleDecrease]);
  const handleTouchDelete = useCallback((id) => { setModalDeleteItemId(id); currentItems.length > 1 ? ModalDelete.open() : ModalDeleteCheck.open(); }, [currentItems.length, setModalDeleteItemId, ModalDelete, ModalDeleteCheck]);
  const handleQuantityPress = useCallback((e, id, act) => { e.preventDefault(); e.currentTarget.focus(); act === 'decrease' ? handleTouchDecrease(id) : handleIncrease(id); }, [handleTouchDecrease, handleIncrease]);
  const handleDeletePress = useCallback((e, id) => { e.preventDefault(); e.currentTarget.focus(); handleTouchDelete(id); }, [handleTouchDelete]);
  const handlePaginationPress = useCallback((e, dir) => { e.preventDefault(); e.target.focus(); dir === 'prev' ? handlePrevPage() : handleNextPage(); }, [handlePrevPage, handleNextPage]);

  useEffect(() => { updateFocusableSections(focusableSections); }, [pageNumber, focusableSections, updateFocusableSections]);
  useEffect(() => { if (currentItems.length === 0) { const t = setTimeout(() => setCurrentPage(PAGE_CONFIG.SECOND), 0); return () => clearTimeout(t); } }, [currentItems.length]); // eslint-disable-line
  const { blurActiveElement, getActiveElementText } = useSafeDocument();
  useEffect(() => { blurActiveElement(); const t = setTimeout(() => { const p = getActiveElementText(); if (p) setTimeout(() => handleText(p), TIMER_CONFIG.TTS_DELAY); }, 0); return () => clearTimeout(t); }, [handleText, blurActiveElement, getActiveElementText]);

  return (
    <div className="main third">
      <PageTitle>
        <div className="sentence">
          <Highlight isDark={isDark}>내역</Highlight>을 확인하시고 <Highlight isDark={isDark}>결제하기</Highlight> 버튼을 누르세요
        </div>
      </PageTitle>
      <OrderHeader isLow={isLow} />
      <div className="details">
        {currentItems.map((item, i) => (
          <OrderItem 
            key={item.id}
            item={item}
            index={startIndex + i + 1}
            quantity={quantities[item.id]}
            onDecrease={(e) => handleQuantityPress(e, item.id, 'decrease')}
            onIncrease={(e) => handleQuantityPress(e, item.id, 'increase')}
            onDelete={(e) => handleDeletePress(e, item.id)}
            sectionRef={sections[`row${(i % itemsPerPage) + 1}`]}
            convertToKoreanQuantity={convertToKoreanQuantity}
          />
        ))}
      </div>
      <Pagination 
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPrev={(e) => handlePaginationPress(e, 'prev')}
        onNext={(e) => handlePaginationPress(e, 'next')}
        isDark={isDark}
        ttsPrefix="주문목록"
        sectionRef={sections.bottom}
      />
    </div>
  );
});
Process3.displayName = 'Process3';

// ============================================================================
// 프로세스 4 컴포넌트 (결제 화면)
// ============================================================================

const Process4 = memo(() => {
  const { sections, totalSum, isLow, setisLow, isDark, setisDark, isCreditPayContent, setisCreditPayContent, totalMenuItems, quantities, setQuantities, volume, setVolume, isLarge, setisLarge, ModalReturn, ModalAccessibility, setCurrentPage } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { orderNum, updateOrderNumber } = useOrderNumber();
  const countdown = usePaymentCountdown({ isCreditPayContent, setisCreditPayContent, ModalReturn, ModalAccessibility, setQuantities, totalMenuItems, setisDark, setVolume, setisLarge, setisLow, setCurrentPage });
  useWebViewMessage(setisCreditPayContent);
  useEffect(() => { setisCreditPayContent(PAY_STEP.SELECT_METHOD); }, []); // eslint-disable-line
  const { querySelector, getActiveElementText } = useSafeDocument();
  useEffect(() => { const btn = querySelector('.hidden-btn.page-btn'); if (btn) { btn.focus(); const p = getActiveElementText(); if (p) setTimeout(() => handleText(p), TIMER_CONFIG.TTS_DELAY); } }, [isCreditPayContent, querySelector, getActiveElementText, handleText]);
  useMultiModalButtonHandler({ initFocusableSections: [FOCUS_SECTIONS.PAGE, FOCUS_SECTIONS.MIDDLE, FOCUS_SECTIONS.BOTTOM, FOCUS_SECTIONS.BOTTOM_FOOTER], initFirstButtonSection: FOCUS_SECTIONS.PAGE, enableGlobalHandlers: false, enableKeyboardNavigation: true });

  // 접근성 줄바꿈 헬퍼
  const brLarge = isLow && isLarge ? <br /> : '';
  const brSmall = isLow && !isLarge ? <br /> : '';
  const highlight = isDark ? "text-highlight-dark" : "text-highlight-light";

  // 결제 단계별 렌더링
  const renderPaymentStep = () => {
    switch (isCreditPayContent) {
      case 0: return (
        <div className="main forth">
          <div className="title"><div className="sentence"><span className={highlight}>결제방법</span>을 선택하세요</div></div>
          <div className="banner price" onClick={(e) => { e.preventDefault(); e.target.focus(); updateOrderNumber(); setisCreditPayContent(4); }}>
            <span>결제금액</span><span className="payment-amount-large">{totalSum.toLocaleString("ko-KR")}원</span>
          </div>
          <div className="task-manager" ref={sections.middle} data-tts-text="결제 선택. 버튼 두 개, ">
            <Button ttsText="신용카드," className="pay" actionType="payment" actionMethod="card" img="/images/payment-card.png" imgAlt="card" label="신용카드" />
            <Button ttsText="모바일페이," className="pay" actionType="payment" actionMethod="mobile" img="/images/payment-mobile.png" imgAlt="mobile" label="모바일 페이" />
          </div>
          <div ref={sections.bottom} className="task-manager" data-tts-text="작업관리. 버튼 한 개,">
            <Button ttsText="취소," className="w500h120" actionType="cancel" actionTarget={PAGE_CONFIG.THIRD} label="취소" />
          </div>
        </div>
      );
      case 1: return (
        <div data-tts-text="작업 관리, 버튼 한 개," ref={sections.bottom} className="main forth">
          <div className="title">
            <div>가운데 아래에 있는 <span className={highlight}>카드리더기</span>{brSmall ? <>{brSmall}<div className="flex center">에</div></> : "에"}</div>
            <div><span className={highlight}>신용카드</span>를 끝까지 넣으세요</div>
          </div>
          <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image" onClick={() => setisCreditPayContent(3)} />
          <Button ttsText="취소" className="w500h120" actionType="cancel" label="취소" />
        </div>
      );
      case 2: return (
        <div data-tts-text="작업 관리, 버튼 한 개," ref={sections.bottom} className="main forth">
          <div className="title">
            <div>가운데 아래에 있는 <span className={highlight}>카드리더기</span>에</div>
            <div>휴대전화의 <span className={highlight}>모바일페이</span>를 켜고 접근시키세요</div>
          </div>
          <img src="./images/device-cardReader-mobile.png" alt="" className="credit-pay-image" onClick={() => setisCreditPayContent(4)} />
          <Button ttsText="취소" className="w500h120" actionType="cancel" label="취소" />
        </div>
      );
      case 3: return (
        <div data-tts-text="작업 관리, 버튼 한 개," ref={sections.bottom} className="main forth">
          <div className="title"><div><span className={highlight}>신용카드</span>를 뽑으세요.</div></div>
          <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" onClick={() => setisCreditPayContent(4)} />
        </div>
      );
      case 4: return (
        <div data-tts-text="인쇄 선택, 버튼 두 개," ref={sections.bottom} className="main forth">
          <div className="title">
            <div className="sentence"><span className={highlight}>결제되었습니다</span></div>
            <div>왼쪽 아래의 프린터에서 <span className={highlight}>주문표</span>를 받으시고</div>
            <div><span className={highlight}>영수증 출력</span>을 선택하세요</div>
          </div>
          <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
          <div className="order-num"><span>100</span></div>
          <div className="task-manager">
            <Button ttsText="영수증 출력," className="w371h120" actionType="receipt" actionTarget="print" label="영수증 출력" />
            <Button ttsText="출력 안함," className="w371h120" actionType="receipt" actionTarget="skip" label={`출력 안함${countdown}`} />
          </div>
        </div>
      );
      case 5: return (
        <div data-tts-text="작업 관리, 버튼 한 개," ref={sections.bottom} className="main forth">
          <div className="title">
            <div>왼쪽 아래의 <span className={highlight}>프린터</span>에서 <span className={highlight}>주문표</span>가 출력됩니다</div>
            <div>인쇄가 완전히 <span className={highlight}>끝나고</span>&nbsp;받으세요</div>
          </div>
          <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
          <div className="order-num"><span>{orderNum}</span></div>
          <Button ttsText="마무리하기" className="w500h120" actionType="finish" label="마무리하기" />
        </div>
      );
      case 6: return (
        <div data-tts-text="작업 관리, 버튼 한 개," className="main forth" ref={sections.bottom}>
          <div className="title">
            <div>왼쪽 아래의 <span className={highlight}>프린터</span>에서 <span className={highlight}>영수증</span>을 받으시고</div>
            <div><span className={highlight}>마무리하기</span>&nbsp;버튼을 누르세요</div>
          </div>
          <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
          <Button ttsText="마무리하기" className="w500h120" actionType="finish" label={`마무리${countdown}`} />
        </div>
      );
      case 7: return (
        <div className="main forth">
          <div className="title">이용해 주셔서 감사합니다</div>
          <div className="return-num-txt">
              <span>
                {countdown <= 0 ? '✓' : countdown}
              </span>
          </div>
          </div>
      );
      default: return null;
    }
  };

  return renderPaymentStep();
});
Process4.displayName = 'Process4';

// ============================================================================
// 프레임 컴포넌트 (상단/하단 네비게이션)
// ============================================================================

const Black = memo(() => <div className="black"></div>);
Black.displayName = 'Black';

const Top = memo(() => {
  const { isCreditPayContent, currentPage, sections, totalSum } = useContext(AppContext);
  const pageText = useMemo(() => {
    switch (currentPage) {
      case PAGE_CONFIG.FIRST: return PAGE_MESSAGES.FIRST.FULL();
      case PAGE_CONFIG.SECOND: return PAGE_MESSAGES.SECOND.FULL();
      case PAGE_CONFIG.THIRD: return PAGE_MESSAGES.THIRD.FULL();
      case PAGE_CONFIG.FOURTH: {
        const oNum = safeParseInt(safeLocalStorage.getItem("ordernum"), 0);
        switch (isCreditPayContent) {
          case PAYMENT_STEPS.SELECT_METHOD: return PAYMENT_MESSAGES.SELECT_METHOD(totalSum, formatNumber);
          case PAYMENT_STEPS.CARD_INSERT: return PAYMENT_MESSAGES.CARD_INSERT;
          case PAYMENT_STEPS.MOBILE_PAY: return PAYMENT_MESSAGES.MOBILE_PAY;
          case PAYMENT_STEPS.CARD_REMOVE: return PAYMENT_MESSAGES.CARD_REMOVE;
          case PAYMENT_STEPS.PRINT_SELECT: return PAYMENT_MESSAGES.PRINT_SELECT(oNum);
          case PAYMENT_STEPS.ORDER_PRINT: return PAYMENT_MESSAGES.ORDER_PRINT(oNum);
          case PAYMENT_STEPS.RECEIPT_PRINT: return PAYMENT_MESSAGES.RECEIPT_PRINT;
          case PAYMENT_STEPS.FINISH: return PAYMENT_MESSAGES.FINISH;
          default: return "";
        }
      }
      default: return "";
    }
  }, [currentPage, isCreditPayContent, totalSum]);
  return (<div className="top"><div className="hidden-div" ref={sections.page}><button type="hidden" className="hidden-btn page-btn" autoFocus={currentPage !== PAGE_CONFIG.FIRST} data-tts-text={pageText} /></div></div>);
});
Top.displayName = 'Top';

const Step = memo(() => {
  const { isCreditPayContent, currentPage } = useContext(AppContext);
  const path = currentPage;
  const StepItem = ({ num, label, active, checked }) => (<li className="step">{checked ? <div className="checked-circle"></div> : <div className={active ? "border-circle" : "header-black-circle"}>{num}</div>}<span>{label}</span><span className={active ? "active step-separator" : "step-separator"}>›</span></li>);
  const StepLast = ({ num, label, checked }) => (<li className="step">{checked ? <div className="checked-circle"></div> : <div className="border-circle">{num}</div>}<span>{label}</span></li>);
  if (path === PAGE_CONFIG.SECOND) return (<div className="step"><ol className="step-progress"><StepItem num={1} label="메뉴선택" active checked={false} /><StepItem num={2} label="내역확인" /><StepItem num={3} label="결제" /><StepLast num={4} label="완료" /></ol></div>);
  if (path === PAGE_CONFIG.THIRD) return (<div className="step"><ol className="step-progress"><StepItem num={1} label="메뉴선택" active checked /><StepItem num={2} label="내역확인" active /><StepItem num={3} label="결제" /><StepLast num={4} label="완료" /></ol></div>);
  if (path === PAGE_CONFIG.FOURTH) return (<div className="step"><ol className="step-progress"><StepItem num={1} label="메뉴선택" checked /><StepItem num={2} label="내역확인" checked />{isCreditPayContent < 3 ? <StepItem num={3} label="결제" active /> : <StepItem num={3} label="결제" checked />}{isCreditPayContent < 3 ? <StepLast num={4} label="완료" /> : isCreditPayContent !== 7 ? <StepLast num={4} label="완료" /> : <StepLast num={4} label="완료" checked />}</ol></div>);
  return null;
});
Step.displayName = 'Step';

const Summary = memo(() => {
  const { sections, totalCount, totalSum, convertToKoreanQuantity, currentPage } = useContext(AppContext);
  const [isDisabledBtn, setisDisabledBtn] = useState(true);
  useEffect(() => { setisDisabledBtn(totalCount <= 0); }, [totalCount]);
  if (currentPage !== PAGE_CONFIG.SECOND && currentPage !== PAGE_CONFIG.THIRD) return null;
  return (
    <div className="summary">
      <div className="task-manager"><p className="summary-label">수량</p><p className="summary-text">{totalCount}개</p><div className="short-colline"></div><p className="summary-label">금액</p><p className="summary-text">{formatNumber(totalSum)}원</p></div>
      <div className="task-manager" ref={sections.footer} data-tts-text={`주문요약, 주문수량, ${convertToKoreanQuantity(totalCount)} 개, 주문금액, ${formatNumber(totalSum)}원, 버튼 두개,`}>
        {currentPage === PAGE_CONFIG.SECOND && (<><Button className="summary-btn" ttsText="초기화," svg={<ResetIcon className="summary-btn-icon" />} label="초기화" actionType="modal" actionTarget="Reset" /><Button className="summary-btn" ttsText={`주문하기, ${isDisabledBtn ? "비활성" : ""}`} svg={<OrderIcon className="summary-btn-icon" />} label="주문" disabled={isDisabledBtn} actionType="navigate" actionTarget={PAGE_CONFIG.THIRD} /></>)}
        {currentPage === PAGE_CONFIG.THIRD && (<><Button className="summary-btn" ttsText="추가하기," svg={<AddIcon className="summary-btn-icon" />} label="추가" actionType="navigate" actionTarget={PAGE_CONFIG.SECOND} /><Button className="summary-btn" ttsText="결제하기," svg={<PayIcon className="summary-btn-icon" />} label="결제" actionType="navigate" actionTarget={PAGE_CONFIG.FOURTH} /></>)}
      </div>
    </div>
  );
});
Summary.displayName = 'Summary';

const Bottom = memo(() => {
  const { sections, isCreditPayContent, currentPage } = useContext(AppContext);
  const { remainingTimeFormatted, isActive } = useIdleTimeoutContext();
  const showHome = !(currentPage === "" || (currentPage === PAGE_CONFIG.FOURTH && [1,2,3].includes(isCreditPayContent)));
  return (
    <div className="bottom" data-tts-text={showHome ? "시스템 설정, 버튼 두 개," : "시스템 설정, 버튼 한개,"} ref={sections.bottomfooter}>
      {showHome ? <Button className="down-footer-button btn-home" ttsText="처음으로," svg={<HomeIcon />} label="처음으로" actionType="modal" actionTarget="Return" /> : <div className="footer-coffeelogo"></div>}
      {isActive && <div className="countdown"><span>{remainingTimeFormatted}</span></div>}
      <Button className="down-footer-button" ttsText="접근성," svg={<LowposIcon />} label="접근성" actionType="modal" actionTarget="Accessibility" />
    </div>
  );
});
Bottom.displayName = 'Bottom';

// ============================================================================
// 접근성 모달 컴포넌트
// ============================================================================

// 토글 버튼 (접근성 모달용)
const ToggleButton = memo(({ label, ttsText, isPressed, onClick, className = '' }) => (
  <Button toggle pressed={isPressed} className={className} label={label} ttsText={ttsText} onClick={onClick} />
));
ToggleButton.displayName = 'ToggleButton';

// 접근성 모달
const AccessibilityModal = memo(() => {
  const { sections, isLow, setisLow, isDark, setisDark, setAccessibility, ModalAccessibility, volume, setVolume, isLarge, setisLarge, commonScript, readCurrentPage } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(ModalAccessibility.isOpen);
  const { setAudioVolume } = useSafeDocument();

  // 모달 열릴 때의 원본 설정 저장 (취소 시 복원용)
  const originalSettingsRef = useRef(null);
  useEffect(() => {
    if (ModalAccessibility.isOpen && !originalSettingsRef.current) {
      originalSettingsRef.current = { isDark, isLow, isLarge, volume };
    } else if (!ModalAccessibility.isOpen) {
      originalSettingsRef.current = null;
    }
  }, [ModalAccessibility.isOpen, isDark, isLow, isLarge, volume]);

  // 현재 접근성 설정 상태 관리
  const { settings: currentSettings, setHighContrast, setLowScreen, setBigSize, setVolume: setSettingsVolume, updateAll: updateAllSettings, getStatusText } = useAccessibilitySettings({ isHighContrast: isDark, isLowScreen: isLow, isBigSize: isLarge, volume });

  useActiveElementTTS(handleText, 500, ModalAccessibility.isOpen);

  // 즉시 적용 핸들러들
  const handleHighContrastChange = useCallback((v) => { setHighContrast(v); setisDark(v); }, [setHighContrast, setisDark]);
  const handleVolumeChange = useCallback((v) => { setSettingsVolume(v); setVolume(v); setAudioVolume('audioPlayer', VOLUME_VALUES[v]); }, [setSettingsVolume, setVolume, setAudioVolume]);
  const handleBigSizeChange = useCallback((v) => { setBigSize(v); setisLarge(v); }, [setBigSize, setisLarge]);
  const handleLowScreenChange = useCallback((v) => { setLowScreen(v); setisLow(v); }, [setLowScreen, setisLow]);

  // 초기설정 핸들러
  const handleInitialSettingsPress = useCallback(() => {
    updateAllSettings({ isHighContrast: false, isLowScreen: false, volume: 1, isBigSize: false });
    setisDark(false); setVolume(1); setisLarge(false); setisLow(false);
    setAudioVolume('audioPlayer', VOLUME_VALUES[1]);
  }, [updateAllSettings, setisDark, setVolume, setisLarge, setisLow, setAudioVolume]);

  // 적용안함 핸들러 (원래 상태로 복원)
  const handleCancelPress = useCallback(() => {
    const o = originalSettingsRef.current;
    if (o) { setisDark(o.isDark); setVolume(o.volume); setisLarge(o.isLarge); setisLow(o.isLow); setAudioVolume('audioPlayer', VOLUME_VALUES[o.volume]); }
    ModalAccessibility.close(); readCurrentPage();
  }, [setisDark, setVolume, setisLarge, setisLow, setAudioVolume, ModalAccessibility, readCurrentPage]);

  // 적용하기 핸들러
  const handleApplyPress = useCallback(() => {
    setAccessibility(currentSettings); ModalAccessibility.close(); readCurrentPage(currentSettings.volume);
  }, [currentSettings, setAccessibility, ModalAccessibility, readCurrentPage]);

  if (!ModalAccessibility.isOpen) return null;

  const highlight = isDark ? "accessibility-subtitle-highlight" : "accessibility-subtitle-highlight-light";

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={'오버레이, 설정, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다,' + commonScript.replay} />
      </div>
      <div className="accessibility-modal-overlay" />
      <div className={`accessibility-modal-content ${isLow ? "reverse" : ""}`} ref={containerRef}>
        <div className="accessibility-up-content">
          <div className="accessibility-title">접근성</div>
          <div>
            <div className="accessibility-subtitle">원하시는&nbsp;<span className={highlight}>접근성 옵션</span>을 선택하시고</div>
            <div className="accessibility-description"><span className={highlight}>적용하기</span>&nbsp;버튼을 누르세요</div>
          </div>
        </div>
        <div className="accessibility-down-content">
          {/* 초기설정 */}
          <div className="accessibility-down-content-row" data-tts-text="초기설정으로 일괄선택, 버튼 한 개, " ref={sections.AccessibilitySections1}>
            <span className="accessibility-down-content-label">초기설정으로 일괄선택</span>
            <div className="accessibility-down-content-buttons">
              <Button className="acc-btn acc-btn-reset" svg={<Icon name="Restart" />} label="초기설정" ttsText="초기설정," onClick={handleInitialSettingsPress} />
            </div>
          </div>
          <hr className="accessibility-down-content-line" />
          {/* 고대비화면 */}
          <div className="accessibility-down-content-row">
            <span className="accessibility-down-content-label"><Icon name="Contrast" />고대비화면</span>
            <div className="accessibility-down-content-buttons" ref={sections.AccessibilitySections2} data-tts-text={`고대비 화면, 선택상태, ${getStatusText.highContrast}, 버튼 두 개,`}>
              <ToggleButton label="끔" ttsText={`끔, ${currentSettings.isHighContrast ? '선택가능, ' : '선택됨, '}`} isPressed={!currentSettings.isHighContrast} onClick={() => handleHighContrastChange(false)} className="acc-btn" />
              <ToggleButton label="켬" ttsText={`켬, ${currentSettings.isHighContrast ? '선택됨, ' : '선택가능, '}`} isPressed={currentSettings.isHighContrast} onClick={() => handleHighContrastChange(true)} className="acc-btn" />
            </div>
          </div>
          <hr className="accessibility-down-content-line" />
          {/* 소리크기 */}
          <div className="accessibility-down-content-row">
            <span className="accessibility-down-content-label"><Icon name="Volume" />소리크기</span>
            <div className="accessibility-down-content-buttons" ref={sections.AccessibilitySections3} data-tts-text={`소리크기, 선택상태, ${getStatusText.volume}, 버튼 네 개, `}>
              {[0, 1, 2, 3].map((vol) => (
                <ToggleButton key={vol} label={VOLUME_MAP[vol]} ttsText={`${VOLUME_MAP[vol]}, ${currentSettings.volume === vol ? '선택됨, ' : '선택가능, '}`} isPressed={currentSettings.volume === vol} onClick={() => handleVolumeChange(vol)} className="acc-btn acc-btn-volume" />
              ))}
            </div>
          </div>
          <hr className="accessibility-down-content-line" />
          {/* 큰글씨화면 */}
          <div className="accessibility-down-content-row">
            <span className="accessibility-down-content-label"><Icon name="Large" />큰글씨화면</span>
            <div className="accessibility-down-content-buttons" ref={sections.AccessibilitySections4} data-tts-text={`큰글씨 화면, 선택상태, ${getStatusText.bigSize}, 버튼 두 개, `}>
              <ToggleButton label="끔" ttsText={`끔, ${currentSettings.isBigSize ? '선택가능, ' : '선택됨, '}`} isPressed={!currentSettings.isBigSize} onClick={() => handleBigSizeChange(false)} className="acc-btn" />
              <ToggleButton label="켬" ttsText={`켬, ${currentSettings.isBigSize ? '선택됨, ' : '선택가능, '}`} isPressed={currentSettings.isBigSize} onClick={() => handleBigSizeChange(true)} className="acc-btn" />
            </div>
          </div>
          <hr className="accessibility-down-content-line" />
          {/* 낮은화면 */}
          <div className="accessibility-down-content-row">
            <span className="accessibility-down-content-label"><Icon name="Lowpos" />낮은화면</span>
            <div className="accessibility-down-content-buttons" ref={sections.AccessibilitySections5} data-tts-text={`낮은 화면, 선택상태, ${getStatusText.lowScreen}, 버튼 두 개, `}>
              <ToggleButton label="끔" ttsText={`끔, ${currentSettings.isLowScreen ? '선택가능, ' : '선택됨, '}`} isPressed={!currentSettings.isLowScreen} onClick={() => handleLowScreenChange(false)} className="acc-btn" />
              <ToggleButton label="켬" ttsText={`켬, ${currentSettings.isLowScreen ? '선택됨, ' : '선택가능, '}`} isPressed={currentSettings.isLowScreen} onClick={() => handleLowScreenChange(true)} className="acc-btn" />
            </div>
          </div>
          {/* 적용 버튼들 */}
          <div className="accessibility-modal-buttons" ref={sections.AccessibilitySections6} data-tts-text="작업 관리, 버튼 두 개, ">
            <Button className="acc-btn acc-btn-action" svg={<Icon name="Cancel" />} label="적용안함" ttsText="적용안함, " onClick={handleCancelPress} />
            <Button className="acc-btn acc-btn-action" svg={<Icon name="Ok" />} label="적용하기" ttsText="적용하기, " onClick={handleApplyPress} />
          </div>
        </div>
      </div>
    </>
  );
});
AccessibilityModal.displayName = 'AccessibilityModal';

// ============================================================================
// 전역 모달 컴포넌트
// ============================================================================

const GlobalModals = () => {
  const { ModalReturn, ModalAccessibility, ModalReset, ModalCall, ModalDelete, ModalDeleteCheck, ModalDeleteItemId, quantities, handleDecrease, totalMenuItems, filterMenuItems } = useContext(AppContext);
  const currentItems = filterMenuItems(totalMenuItems, quantities);

  return (
    <>
      {ModalReturn.isOpen && <ReturnModal />}
      {ModalReset.isOpen && <ResetModal />}
      {ModalAccessibility.isOpen && <AccessibilityModal />}
      {ModalCall.isOpen && <CallModal />}
      {ModalDelete.isOpen && <DeleteModal handleDecrease={handleDecrease} id={ModalDeleteItemId} quantities={quantities} currentItems={currentItems} />}
      {ModalDeleteCheck.isOpen && <DeleteCheckModal handleDecrease={handleDecrease} id={ModalDeleteItemId} quantities={quantities} currentItems={currentItems} />}
    </>
  );
};

// 메인 레이아웃 컴포넌트 - 조립 순서: Step → Content → Summary → Bottom → Modals
const Layout = ({ children }) => {
  const ctx = useContext(AppContext);
  const cond = LAYOUT_ASSEMBLY_CONTEXT.conditions;
  const render = useMemo(() => ({
    step: cond[LAYOUT_COMPONENTS.STEP](ctx),
    content: cond[LAYOUT_COMPONENTS.CONTENT](ctx),
    summary: cond[LAYOUT_COMPONENTS.SUMMARY](ctx),
    bottom: cond[LAYOUT_COMPONENTS.BOTTOM](ctx),
    modals: cond[LAYOUT_COMPONENTS.MODALS](ctx),
  }), [ctx.currentPage]); // eslint-disable-line

  return (
    <>
      <Black />
      <Top />
      {render.step && <Step />}
      {render.content && children}
      {render.summary && <Summary />}
      {render.bottom && <Bottom />}
      {render.modals && <GlobalModals />}
    </>
  );
};

// 페이지 렌더링 컴포넌트
const AppContent = () => {
  const { currentPage, setCurrentPage, totalMenuItems, setQuantities, setisDark, setVolume, setisLarge, setisLow } = useContext(AppContext);
  const { containerRef } = useFocusTrap(true, { autoFocus: false, restoreFocus: false });

  const resetOrder = useCallback(() => {
    if (!totalMenuItems?.length) return;
    setQuantities(totalMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
    setisDark(false); setVolume(1); setisLarge(false); setisLow(false);
  }, [totalMenuItems, setQuantities, setisDark, setVolume, setisLarge, setisLow]);

  const idleTimeout = useAppIdleTimeout(currentPage, setCurrentPage, resetOrder);
  useLayoutEffect(() => { resetOrder(); }, [totalMenuItems]); // eslint-disable-line
  
  // focus trap을 body에 연결
  useLayoutEffect(() => { containerRef.current = document.body; }, [containerRef]);

  return (
    <IdleTimeoutProvider value={idleTimeout}>
      <Layout>
        {currentPage === PAGE_CONFIG.FIRST && <Process1 />}
        {currentPage === PAGE_CONFIG.SECOND && <Process2 />}
        {currentPage === PAGE_CONFIG.THIRD && <Process3 />}
        {currentPage === PAGE_CONFIG.FOURTH && <Process4 />}
      </Layout>
    </IdleTimeoutProvider>
  );
};

// 메인 App 컴포넌트 - Provider 순서: Init → Accessibility → Order → UI → Modal → ButtonStyle → AppContext
const App = () => (
  <InitializationProvider>
    <AccessibilityProvider>
      <OrderProvider>
        <UIProvider>
          <ModalProvider>
            <ButtonStyleProvider>
              <AppContextProvider>
                <audio id="audioPlayer" src="" controls className="hidden" />
                <AppContent />
              </AppContextProvider>
            </ButtonStyleProvider>
          </ModalProvider>
        </UIProvider>
      </OrderProvider>
    </AccessibilityProvider>
  </InitializationProvider>
);

export default App;

// ============================================================================
// 애플리케이션 마운트
// body를 직접 root로 사용
// ============================================================================
ReactDOM.createRoot(document.body).render(React.createElement(App));
