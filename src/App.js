// ============================================================================
// 커피 키오스크 - 단일 파일 애플리케이션
// ============================================================================
//
// [구조 순서 - 서비스 구성 절차]
// 1. 유틸리티 (37행~)        - 헬퍼 함수, 포맷터, 스토리지
// 2. 상수 (184행~)           - CFG, PAY, TTS, VOLUME 등
// 3. Hooks (220행~)          - 상태/로직 훅 (메뉴, 사운드, TTS, 타이머 등)
// 4. Button/Modal (1145행~)  - 핵심 UI 컴포넌트
// 5. Contexts (1629행~)      - 상태 관리 Provider
// 6. UI 컴포넌트 (2049행~)   - CategoryNav, MenuGrid, Pagination 등
//
// [사용 흐름 - Process 순서]
// Process1 (2289행) → 시작화면 (포장/매장 선택)
// Process2 (2335행) → 메뉴선택 (카테고리, 메뉴그리드)
// Process3 (2465행) → 주문확인 (수량조절, 삭제)
// Process4 (2601행) → 결제 (카드/모바일, 영수증)
//
// [레이아웃]
// Top/Step/Summary/Bottom (2764행~) - 공통 프레임
// AccessibilityModal (2999행~) - 접근성 설정
// Layout/App (3186행~) - 메인 조립
// ============================================================================

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, createContext, useContext, memo } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import menuData from "./menuData";

// Components
import Icon, { TakeinIcon, TakeoutIcon, DeleteIcon, ResetIcon, OrderIcon, AddIcon, PayIcon, HomeIcon, WheelchairIcon, ToggleIcon, StepIcon } from "./Icon";

// ============================================================================
// 유틸리티
// ============================================================================

export const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
      const v = window.localStorage.getItem(key);
      return v !== null ? v : defaultValue;
    } catch { return defaultValue; }
  },
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, String(value));
      return true;
    } catch { return false; }
  },
  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch { return false; }
  }
};
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

export const safeQuerySelector = (s, c = null) => {
  try {
    if (typeof document === 'undefined') return null;
    return (c || document).querySelector(s);
  } catch { return null; }
};

const UNITS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
const TENS = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
const HUNDREDS = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];
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

export const SizeControlManager = {
  DEFAULT_WIDTH_SCALE: 1.0,
  DEFAULT_HEIGHT_SCALE: 1.0,
  MIN_SCALE: 0.5,
  MAX_SCALE: 2.0,
  currentWidthScale: 1.0,
  currentHeightScale: 1.0,
  
  init() {
    this.currentWidthScale = this.DEFAULT_WIDTH_SCALE;
    this.currentHeightScale = this.DEFAULT_HEIGHT_SCALE;
    this.applyScaleToButtons();
  },
  
  setWidthScale(s) {
    this.currentWidthScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, s));
    this.applyScaleToButtons();
  },
  
  setHeightScale(s) {
    this.currentHeightScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, s));
    this.applyScaleToButtons();
  },
  
  applyScaleToButtons() {
    document.documentElement.style.setProperty('--button-width-scale', this.currentWidthScale);
    document.documentElement.style.setProperty('--button-height-scale', this.currentHeightScale);
  },
  
  reset() {
    this.setWidthScale(this.DEFAULT_WIDTH_SCALE);
    this.setHeightScale(this.DEFAULT_HEIGHT_SCALE);
  },
  
  getScales() {
    return { width: this.currentWidthScale, height: this.currentHeightScale };
  }
};

const SCREEN = { WIDTH: 1080, HEIGHT: 1920 };

export function setViewportZoom() {
  const { WIDTH: bw, HEIGHT: bh } = SCREEN;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const zoom = Math.min(vw / bw, vh / bh);
  const html = document.documentElement;
  
  if (html) {
    html.style.transform = `scale(${zoom})`;
    html.style.transformOrigin = 'top left';
    const sw = bw * zoom;
    const sh = bh * zoom;
    html.style.position = 'fixed';
    html.style.top = `${(vh - sh) / 2}px`;
    html.style.left = `${(vw - sw) / 2}px`;
    html.style.width = `${bw}px`;
    html.style.height = `${bh}px`;
  }
}

export function setupViewportResize() {
  const h = () => setViewportZoom();
  window.addEventListener("resize", h);
  return () => window.removeEventListener("resize", h);
}

// ============================================================================
// 내부 상수 (Hooks/Contexts용)
// ============================================================================

// 공통 상수 (단일 정의)
const REPLAY = "키패드 사용법 안내는 키패드의 별 버튼을, 직전 안내 다시 듣기는 샵 버튼을 누릅니다,";
export const VOLUME_MAP = { 0: '끔', 1: '약', 2: '중', 3: '강' };
export const VOLUME_VALUES = { 0: 0, 1: 0.5, 2: 0.75, 3: 1 };
export const DEFAULT_ACCESSIBILITY = { isDark: false, isLow: false, isLarge: false, volume: 1 };

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
  page3: () => `안내, 내역 확인, 주문목록에서 상품명, 수량, 가격을 확인합니다, 수량 버튼 및 삭제 버튼으로 주문목록을 수정 할 수 있습니다. 추가하기 버튼으로 이전 단계, 메뉴선택으로 돌아갈 수 있습니다, 결제하기 버튼으로 다음 단계, 결제선택으로 이동할 수 있습니다,${REPLAY}`,
  paySelect: (sum, fmt) => `작업 안내, 결제 단계, 결제 금액, ${fmt(sum)}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ${REPLAY}`,
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

export const useBodyClass = (className, condition) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (condition) document.body.classList.add(className);
    else document.body.classList.remove(className);
    return () => document.body.classList.remove(className);
  }, [className, condition]);
};

// HTML 요소에 클래스 + font-size 직접 적용 (font-size 스케일링용)
export const useHtmlClass = (className, condition) => {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const targetFontSize = condition ? '12px' : '10px';
    
    html.style.fontSize = targetFontSize;
    if (condition) {
      html.classList.add(className);
    } else {
      html.classList.remove(className);
    }
    console.log(`🎨 useHtmlClass: ${className}=${condition}, font-size=${targetFontSize}`);
    // cleanup 없음 - ResizeObserver가 변경 감지
  }, [className, condition]);
};

export const usePagination = (items, itemsPerPageNormal, itemsPerPageLow, isLow) => {
  const itemsPerPage = isLow ? itemsPerPageLow : itemsPerPageNormal;
  const [pageNumber, setPageNumber] = useState(1);
  
  const totalPages = useMemo(() => 
    (!items || items.length === 0) ? 1 : Math.ceil(items.length / itemsPerPage),
    [items, itemsPerPage]
  );
  
  const currentItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const s = (pageNumber - 1) * itemsPerPage;
    return items.slice(s, s + itemsPerPage);
  }, [items, pageNumber, itemsPerPage]);
  
  const handlePrevPage = useCallback(() => setPageNumber(p => p > 1 ? p - 1 : p), []);
  const handleNextPage = useCallback(() => setPageNumber(p => p < totalPages ? p + 1 : p), [totalPages]);
  const goToPage = useCallback((p) => { if (p >= 1 && p <= totalPages) setPageNumber(p); }, [totalPages]);
  const resetPage = useCallback(() => setPageNumber(1), []);
  const resetOnChange = useCallback(() => setPageNumber(1), []);
  
  return {
    pageNumber, totalPages, currentItems, itemsPerPage,
    handlePrevPage, handleNextPage, goToPage, resetPage, resetOnChange, setPageNumber
  };
};

export const useSafeDocument = () => {
  const querySelector = useCallback((s) => safeQuerySelector(s), []);
  
  const getElementById = useCallback((id) => 
    typeof document !== 'undefined' ? document.getElementById(id) : null, 
    []
  );
  
  const toggleBodyClass = useCallback((c, cond) => {
    if (typeof document === 'undefined') return;
    if (cond) document.body.classList.add(c);
    else document.body.classList.remove(c);
  }, []);
  
  const blurActiveElement = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement) {
      document.activeElement.blur();
    }
  }, []);
  
  const getActiveElementText = useCallback(() => 
    typeof document !== 'undefined' && document.activeElement 
      ? document.activeElement.dataset.ttsText || null 
      : null,
    []
  );
  
  const setAudioVolume = useCallback((audioId, vol) => {
    if (typeof document === 'undefined') return;
    const a = document.getElementById(audioId);
    if (a) a.volume = vol;
  }, []);
  
  return {
    querySelector, getElementById, toggleBodyClass,
    blurActiveElement, getActiveElementText, setAudioVolume
  };
};

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

export const useOrderNumber = () => {
  const [orderNum, setOrderNum] = useState(0);
  
  const updateOrderNumber = useCallback(() => {
    const c = safeParseInt(safeLocalStorage.getItem('ordernum'), 0);
    const n = c + 1;
    safeLocalStorage.setItem('ordernum', n);
    setOrderNum(n);
    return n;
  }, []);
  
  return { orderNum, updateOrderNumber };
};

export const useSound = () => {
  const audioRefs = useRef({});
  const volumeRef = useRef(0.5);
  
  const play = useCallback((name) => {
    const src = CFG.SOUNDS[name];
    if (!src) return;
    if (!audioRefs.current[name]) {
      audioRefs.current[name] = new Audio(src);
    }
    const a = audioRefs.current[name];
    a.volume = volumeRef.current;
    a.currentTime = 0;
    a.play().catch(() => {});
  }, []);
  
  const setVolume = useCallback((v) => {
    volumeRef.current = Math.max(0, Math.min(1, v));
  }, []);
  
  return { play, setVolume };
};

let db;
const dbName = 'TTSDatabase';
const storeName = 'TTSStore';
let isPlaying = false;
let replayText = '';

export function useTextHandler(volume) {
  const initDB = useCallback(() => new Promise((res, rej) => {
    const r = indexedDB.open(dbName, 1);
    r.onerror = (e) => rej(e.target.errorCode);
    r.onsuccess = (e) => { db = e.target.result; res(db); };
    r.onupgradeneeded = (e) => {
      db = e.target.result;
      db.createObjectStore(storeName, { keyPath: 'key' });
    };
  }), []);
  
  const handleText = useCallback((txt, flag = true, newVol = -1) => {
    if (!txt) return;
    if (flag) replayText = txt;
    const v = newVol !== -1 ? VOLUME_VALUES[newVol] : VOLUME_VALUES[volume];
    playText(txt, 1, v);
  }, [volume]);
  
  const handleReplayText = useCallback(() => {
    if (replayText) handleText(replayText, false);
  }, [handleText]);
  
  return { initDB, handleText, handleReplayText };
}

// TTS 재생 (외부 서버 우선, 폴백으로 브라우저 내장)
async function playText(text, speed, vol) {
  const ap = document.getElementById('audioPlayer');
  if (!ap) {
    useBrowserTTS(text, speed, vol);
    return;
  }
  
  const k = `audio_${text}`;
  const s = await getFromDB(k);
  
  if (s) {
    ap.src = s;
    ap.playbackRate = speed;
    ap.volume = vol;
    ap.play().catch(() => useBrowserTTS(text, speed, vol));
    return;
  }
  
  if (isPlaying) return;
  isPlaying = true;
  
  try {
    const r = await fetch('http://gtts.tovair.com:5000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (r.status === 201) {
      const d = await r.json();
      const fr = await fetch(`http://gtts.tovair.com:5000/api/download/${d.filename}`);
      const b = await fr.blob();
      const u = URL.createObjectURL(b);
      ap.src = u;
      ap.playbackRate = speed;
      ap.volume = vol;
      ap.play();
      
      const rd = new FileReader();
      rd.readAsDataURL(b);
      rd.onloadend = async () => {
        await saveToDB(k, rd.result);
        isPlaying = false;
      };
    } else {
      useBrowserTTS(text, speed, vol);
      isPlaying = false;
    }
  } catch {
    useBrowserTTS(text, speed, vol);
    isPlaying = false;
  }
}

// 브라우저 내장 TTS (폴백)
function useBrowserTTS(t, s, v) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'ko-KR';
    u.rate = s;
    u.volume = v;
    window.speechSynthesis.speak(u);
  }
}

async function getFromDB(k) {
  const d = await getDB();
  return new Promise((r) => {
    const t = d.transaction([storeName], 'readonly');
    const req = t.objectStore(storeName).get(k);
    req.onsuccess = (e) => r(e.target.result?.data || null);
    req.onerror = () => r(null);
  });
}

async function saveToDB(k, d) {
  const db2 = await getDB();
  return new Promise((r) => {
    const t = db2.transaction([storeName], 'readwrite');
    t.objectStore(storeName).put({ key: k, data: d });
    t.oncomplete = r;
  });
}

async function getDB() {
  if (!db) {
    await new Promise((r) => {
      const req = indexedDB.open(dbName, 1);
      req.onsuccess = () => { db = req.result; r(); };
      req.onupgradeneeded = (e) => {
        db = e.target.result;
        db.createObjectStore(storeName, { keyPath: 'key' });
      };
    });
  }
  return db;
}

export const useActiveElementTTS = (handleText, delay = CFG.TTS_DELAY, condition = true, shouldBlur = false) => {
  useEffect(() => {
    if (!condition) return;
    
    if (shouldBlur && typeof document !== 'undefined' && document.activeElement?.blur) {
      document.activeElement.blur();
    }
    
    const t = setTimeout(() => {
      if (typeof document !== 'undefined' && document.activeElement?.dataset?.ttsText) {
        handleText(document.activeElement.dataset.ttsText);
      }
    }, delay);
    
    return () => clearTimeout(t);
  }, [handleText, delay, condition, shouldBlur]);
};

export const formatRemainingTime = (ms) => {
  if (ms <= 0) return "00:00";
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export const useIdleTimeout = (onTimeout, timeout = CFG.IDLE_TIMEOUT, enabled = true) => {
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const onTimeoutRef = useRef(onTimeout);
  const timeoutRef = useRef(timeout);
  const [remainingTime, setRemainingTime] = useState(timeout);
  
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    timeoutRef.current = timeout;
  }, [onTimeout, timeout]);
  
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingTime(timeoutRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (onTimeoutRef.current) onTimeoutRef.current();
    }, timeoutRef.current);
  }, []);
  
  useEffect(() => {
    if (!enabled) {
      setRemainingTime(timeout);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemainingTime(Math.max(0, timeout - (Date.now() - lastActivityRef.current)));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, timeout]);
  
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    const events = ['mousedown', 'keydown', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [enabled, resetTimer]);
  
  return { resetTimer, remainingTime, remainingTimeFormatted: formatRemainingTime(remainingTime) };
};

export const useAppIdleTimeout = (currentPage, setCurrentPage, resetOrder) => {
  const handleTimeout = useCallback(() => {
    if (resetOrder) resetOrder();
    setCurrentPage(CFG.PAGE_FIRST);
  }, [setCurrentPage, resetOrder]);
  
  const { remainingTime, remainingTimeFormatted, resetTimer } = useIdleTimeout(
    handleTimeout, CFG.IDLE_TIMEOUT, true
  );
  
  return { remainingTime, remainingTimeFormatted, isActive: true, resetTimer };
};

export const usePaymentCountdown = ({
  isCreditPayContent,
  setIsCreditPayContent,
  ModalReturn,
  ModalAccessibility,
  setQuantities,
  totalMenuItems,
  setIsDark,
  setVolume,
  setIsLarge,
  setIsLow,
  setCurrentPage
}) => {
  const [countdown, setCountdown] = useState(60);
  
  useEffect(() => {
    // 인쇄 선택 또는 영수증 단계
    if (isCreditPayContent === PAY.PRINT_SELECT || isCreditPayContent === PAY.RECEIPT) {
      const resetCountdown = () => setCountdown(CFG.TIME.AUTO_FINISH);
      setCountdown(CFG.TIME.AUTO_FINISH);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 0) {
            clearInterval(timer);
            setTimeout(() => setIsCreditPayContent(PAY.FINISH), 0);
            return 0;
          }
          return prev - 1;
        });
      }, CFG.TIME.INTERVAL);
      
      // 사용자 입력 시 카운트다운 리셋
      window.addEventListener('keydown', resetCountdown);
      window.addEventListener('click', resetCountdown);
      
      return () => {
        window.removeEventListener('keydown', resetCountdown);
        window.removeEventListener('click', resetCountdown);
        clearInterval(timer);
      };
    }
    
    // 완료 단계
    if (isCreditPayContent === PAY.FINISH) {
      setCountdown(CFG.TIME.FINAL_PAGE);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 0) {
            clearInterval(timer);
            setTimeout(() => {
              // 모달 닫기 및 상태 초기화
              ModalReturn.close();
              ModalAccessibility.close();
              setQuantities(totalMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
              setIsDark(false);
              setVolume(1);
              setIsLarge(false);
              setIsLow(false);
              setCurrentPage(CFG.PAGE_FIRST);
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, CFG.TIME.INTERVAL);
      
      return () => clearInterval(timer);
    }
  }, [
    isCreditPayContent, setIsCreditPayContent,
    ModalReturn, ModalAccessibility,
    setQuantities, totalMenuItems,
    setIsDark, setVolume, setIsLarge, setIsLow, setCurrentPage
  ]);
  
  return countdown;
};

// ============================================================================
// 카테고리 페이지네이션 (가변 너비 버튼, 페이지별 시작 인덱스 저장)
// ============================================================================
// 
// [중요] 이 훅은 가변 너비 버튼의 페이지네이션을 처리합니다.
// 
// 문제: 카테고리 탭 버튼은 텍스트 길이에 따라 너비가 다름 (fit-content)
//       단순히 "페이지당 N개"로는 정확한 페이지 분할이 불가능
// 
// 해결: 각 줄(페이지)별 시작 인덱스를 계산하여 저장
// 
// 계산 과정:
//   1줄: 인덱스 0부터 시작, 배열 가능한 아이템 갯수 계산 → N개
//        breakpoints[0] = 0 (1줄 시작)
//   
//   2줄: 시작 인덱스 = 1줄 아이템 갯수 (N)
//        인덱스 N부터 배열 가능한 아이템 갯수 계산 → M개
//        breakpoints[1] = N (2줄 시작)
//   
//   3줄: 시작 인덱스 = N + M
//        breakpoints[2] = N + M (3줄 시작)
//   
//   ... 모든 아이템이 배치될 때까지 반복
// 
// 예시: 아이템 10개, 1줄에 4개, 2줄에 3개, 3줄에 3개 들어갈 때
//       breakpoints = [0, 4, 7]
//       → 1줄: items[0~3] (4개)
//       → 2줄: items[4~6] (3개)  
//       → 3줄: items[7~9] (3개)
// 
// 이전/다음:
//   - "다음" 클릭 → currentPage++ → breakpoints[currentPage]부터 표시
//   - "이전" 클릭 → currentPage-- → breakpoints[currentPage]부터 표시
// 
// 구조:
//   - measureRef: 숨겨진 측정용 컨테이너 (모든 버튼 렌더링해서 너비 측정)
//   - containerRef: 실제 표시 컨테이너 (현재 페이지 버튼만 표시)
//   - pageBreakpoints: 각 페이지의 시작 인덱스 배열 [0, N, N+M, ...]
// 
// ============================================================================
const ACTUAL_GAP_THRESHOLD = 50; // 실제 렌더링 간격이 이 값 초과하면 compact 모드

export const useCategoryPagination = (items, isLarge = false) => {
  const containerRef = useRef(null);  // 실제 표시 컨테이너
  const measureRef = useRef(null);    // 숨겨진 측정용 컨테이너
  const [pageBreakpoints, setPageBreakpoints] = useState([0]); // 페이지별 시작 인덱스
  const [currentPage, setCurrentPage] = useState(0);
  const [calcTrigger, setCalcTrigger] = useState(0); // 재계산 트리거
  const [isCompact, setIsCompact] = useState(false); // compact 모드
  const [isReady, setIsReady] = useState(false); // 최종 표시 준비
  
  // 재계산 함수
  const recalculate = useCallback(() => {
    setCalcTrigger(t => t + 1);
  }, []);
  
  // isLarge 변경 추적 (페이지 리셋용)
  const prevIsLargeRef = useRef(isLarge);
  const lastWidthRef = useRef(0); // 이전 버튼 폭 저장
  const isCalculatingRef = useRef(false); // 계산 중 플래그 (무한루프 방지)
  
  // 계산 함수
  const calculate = useCallback(() => {
    if (!measureRef.current || !containerRef.current) return;
    
    const isLargeChanged = prevIsLargeRef.current !== isLarge;
    prevIsLargeRef.current = isLarge;
    
    // 새 계산 시작 - 숨기고 compact 리셋
    setIsReady(false);
    setIsCompact(false);
    
    const containerWidth = containerRef.current.clientWidth;
    const gap = parseFloat(getComputedStyle(containerRef.current).gap) || 0;
    
    const buttons = measureRef.current.querySelectorAll('.button');
    if (!buttons.length) return;
    
    const separator = measureRef.current.querySelector('.category-separator');
    const separatorWidth = separator ? separator.offsetWidth : 0;
    
    const breakpoints = [0];
    let accumulatedWidth = 0;
    let lineButtonCount = 0;
    
    const btnWidths = [];
    for (let i = 0; i < buttons.length; i++) {
      const btnWidth = buttons[i].offsetWidth;
      btnWidths.push(btnWidth);
      const isLast = i === buttons.length - 1;
      const toNextBtnStart = isLast ? btnWidth : btnWidth + gap + separatorWidth + gap;
      const willOverflow = accumulatedWidth + toNextBtnStart > containerWidth && lineButtonCount > 0;
      
      if (willOverflow) {
        breakpoints.push(i);
        accumulatedWidth = toNextBtnStart;
        lineButtonCount = 1;
      } else {
        accumulatedWidth += toNextBtnStart;
        lineButtonCount++;
      }
    }
    
    console.log(`📊 버튼폭=${btnWidths.slice(0,3).join(',')}... → ${breakpoints.length}페이지`, breakpoints);
    
    setPageBreakpoints(breakpoints);
    // isLarge 변경 시 페이지 리셋, 아니면 현재 페이지 유지 (범위 내)
    if (isLargeChanged) {
      setCurrentPage(0);
    } else {
      setCurrentPage(p => Math.min(p, breakpoints.length - 1));
    }
  }, [isLarge]);
  
  // ResizeObserver로 버튼 크기 변경 감지
  useEffect(() => {
    if (!measureRef.current) return;
    
    const firstButton = measureRef.current.querySelector('.button');
    if (!firstButton) return;
    
    const observer = new ResizeObserver((entries) => {
      // 계산 중이면 무시 (무한루프 방지)
      if (isCalculatingRef.current) return;
      
      const newWidth = entries[0]?.contentRect.width || 0;
      // 폭이 변경되었을 때만 재계산
      if (Math.abs(newWidth - lastWidthRef.current) > 1) {
        console.log(`🔄 버튼 크기 변경 감지: ${lastWidthRef.current}px → ${newWidth}px`);
        lastWidthRef.current = newWidth;
        // 뷰포트 리사이즈 이벤트 강제 발생 → 렌더링 트리거
        isCalculatingRef.current = true;
        window.dispatchEvent(new Event('resize'));
        // 다음 프레임에서 플래그 해제
        requestAnimationFrame(() => {
          isCalculatingRef.current = false;
        });
      }
    });
    
    observer.observe(firstButton);
    
    // 초기 계산
    calculate();
    
    // 윈도우 리사이즈도 감지
    window.addEventListener('resize', calculate);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculate);
    };
  }, [items, calcTrigger, calculate]);
  
  // 2단계: 렌더링 후 compact 결정 (pageBreakpoints 변경 시)
  useEffect(() => {
    if (pageBreakpoints.length === 0) return;
    
    // 다음 프레임에서 측정 (DOM 업데이트 후)
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!containerRef.current) {
          setIsReady(true);
          return;
        }
        
        const renderedButtons = containerRef.current.querySelectorAll('.button');
        if (renderedButtons.length <= 1) {
          setIsReady(true);
          return;
        }
        
        // 실제 간격 측정
        let maxGap = 0;
        for (let i = 0; i < renderedButtons.length - 1; i++) {
          const rect1 = renderedButtons[i].getBoundingClientRect();
          const rect2 = renderedButtons[i + 1].getBoundingClientRect();
          const actualGap = rect2.left - rect1.right;
          maxGap = Math.max(maxGap, actualGap);
        }
        
        console.log(`📐 실제 간격: ${Math.round(maxGap)}px (기준: ${ACTUAL_GAP_THRESHOLD}px)`);
        
        const shouldCompact = maxGap > ACTUAL_GAP_THRESHOLD;
        setIsCompact(shouldCompact);
        
        // compact 적용 후 다음 프레임에서 표시
        requestAnimationFrame(() => setIsReady(true));
      });
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [pageBreakpoints, currentPage]); // isCompact 제거!
  
  // ---------------------------------------------------------------
  // 페이지별 아이템 슬라이싱 (pagedItems)
  // pagedItems[n] = n번째 페이지에 표시될 아이템 배열
  // ---------------------------------------------------------------
  const totalPages = pageBreakpoints.length;
  const pagedItems = useMemo(() => {
    return pageBreakpoints.map((start, idx) => {
      const end = pageBreakpoints[idx + 1] ?? items.length;
      return items.slice(start, end);
    });
  }, [pageBreakpoints, items]);
  
  // 현재 페이지 아이템
  const currentItems = pagedItems[currentPage] ?? [];
  const startIdx = pageBreakpoints[currentPage] ?? 0;
  const endIdx = pageBreakpoints[currentPage + 1] ?? items.length;
  
  // 페이지 변경
  const prevPage = useCallback(() => {
    setIsReady(false);
    setCurrentPage(p => Math.max(0, p - 1));
  }, []);
  
  const nextPage = useCallback(() => {
    setIsReady(false);
    setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);
  
  return {
    containerRef,
    measureRef,
    currentPage: currentPage + 1, // 1-based (UI 표시용)
    totalPages,
    currentItems,        // 현재 페이지 아이템
    pagedItems,          // 모든 페이지별 아이템 배열
    pageBreakpoints,     // 페이지별 시작 인덱스
    hasPrev: currentPage > 0,
    hasNext: currentPage < totalPages - 1,
    prevPage,
    nextPage,
    recalculate,
    isCompact,           // compact 모드 여부
    isReady              // 계산 완료 후 표시 준비됨
  };
};

export const useFocusTrap = (isActive, options = {}) => {
  const { autoFocus = true, restoreFocus = true } = options;
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll(CFG.FOCUSABLE))
      .filter(el => {
        const st = window.getComputedStyle(el);
        return st.display !== 'none' && st.visibility !== 'hidden';
      });
  }, []);
  
  const focusFirst = useCallback(() => {
    const els = getFocusableElements();
    if (els.length > 0) els[0].focus();
  }, [getFocusableElements]);
  
  const focusLast = useCallback(() => {
    const els = getFocusableElements();
    if (els.length > 0) els[els.length - 1].focus();
  }, [getFocusableElements]);
  
  // Tab 키 트래핑
  useEffect(() => {
    if (!isActive) return;
    
    const hkd = (e) => {
      if (e.key !== 'Tab') return;
      const els = getFocusableElements();
      if (els.length === 0) return;
      
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      
      if (e.shiftKey) {
        if (active === first || !containerRef.current?.contains(active)) {
          e.preventDefault();
          focusLast();
        }
      } else {
        if (active === last || !containerRef.current?.contains(active)) {
          e.preventDefault();
          focusFirst();
        }
      }
    };
    
    const hesc = (e) => {
      if (e.key === 'Escape' && containerRef.current?.contains(document.activeElement)) {
        focusFirst();
      }
    };
    
    document.addEventListener('keydown', hkd);
    document.addEventListener('keydown', hesc);
    return () => {
      document.removeEventListener('keydown', hkd);
      document.removeEventListener('keydown', hesc);
    };
  }, [isActive, getFocusableElements, focusFirst, focusLast]);
  
  // 포커스 저장/복원
  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement;
      if (autoFocus) {
        const t = setTimeout(() => focusFirst(), 50);
        return () => clearTimeout(t);
      }
    } else {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isActive, autoFocus, restoreFocus, focusFirst]);
  
  // 포커스 이탈 방지
  useEffect(() => {
    if (!isActive) return;
    
    const hfo = (e) => {
      if (containerRef.current && 
          !containerRef.current.contains(e.relatedTarget) && 
          e.relatedTarget !== null) {
        e.preventDefault();
        focusFirst();
      }
    };
    
    containerRef.current?.addEventListener('focusout', hfo);
    return () => containerRef.current?.removeEventListener('focusout', hfo);
  }, [isActive, focusFirst]);
  
  return { containerRef, focusFirst, focusLast, getFocusableElements };
};

export const useAccessibilitySettings = (initialSettings = DEFAULT_ACCESSIBILITY) => {
  const [settings, setSettings] = useState(initialSettings);
  
  const setDark = useCallback((v) => setSettings(p => ({ ...p, isDark: v })), []);
  const setLow = useCallback((v) => setSettings(p => ({ ...p, isLow: v })), []);
  const setLarge = useCallback((v) => setSettings(p => ({ ...p, isLarge: v })), []);
  const setVolumeVal = useCallback((v) => setSettings(p => ({ ...p, volume: v })), []);
  const resetToDefault = useCallback(() => setSettings(DEFAULT_ACCESSIBILITY), []);
  const updateAll = useCallback((ns) => setSettings(ns), []);
  
  const getStatusText = useMemo(() => ({
    dark: settings.isDark ? '켬' : '끔',
    low: settings.isLow ? '켬' : '끔',
    large: settings.isLarge ? '켬' : '끔',
    volume: VOLUME_MAP[settings.volume]
  }), [settings]);
  
  return {
    settings, setDark, setLow, setLarge,
    setVolume: setVolumeVal, resetToDefault, updateAll, getStatusText
  };
};

class IntroTimerSingleton {
  #intervalId = null;
  #intervalTime = 0;
  
  startIntroTimer(scriptText, handleText, onInitSetting) {
    this.cleanup();
    this.#intervalId = setInterval(() => {
      this.#intervalTime++;
      if (this.#intervalTime >= CFG.INTRO_TTS_TIME) {
        handleText(scriptText);
        this.#intervalTime = 0;
        if (onInitSetting) onInitSetting();
      }
    }, 1000);
  }
  
  stopIntroTimer() {
    this.cleanup();
  }
  
  cleanup() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
    this.#intervalTime = 0;
  }
}

let timerInstance = null;
const getTimerSingleton = () => {
  if (!timerInstance) timerInstance = new IntroTimerSingleton();
  return timerInstance;
};

export const useTimer = () => {
  const t = getTimerSingleton();
  return {
    startIntroTimer: (s, h, o) => t.startIntroTimer(s, h, o),
    stopIntroTimer: () => t.stopIntroTimer()
  };
};

export const applyButtonMinSide = (btn) => {
  const w = btn.offsetWidth;
  const h = btn.offsetHeight;
  const minSide = Math.min(w, h);
  if (minSide > 0) {
    btn.style.setProperty('--min-side', `${minSide}px`);
  }
};

const isButtonDisabled = (btn) => {
  return btn.classList.contains('disabled') || 
         btn.getAttribute('aria-disabled') === 'true' || 
         btn.disabled === true;
};

const isToggleButton = (btn) => btn.classList.contains('toggle');

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
      payment: () => actionMethod && (c.sendOrderDataToApp?.(actionMethod), c.setIsCreditPayContent?.(actionMethod === "card" ? 1 : 2)),
      cancel: () => actionTarget ? c.setCurrentPage?.(actionTarget) : (c.sendCancelPayment?.(), c.setIsCreditPayContent?.(0)),
      receipt: () => actionTarget === 'print' ? (c.sendPrintReceiptToApp?.(), c.setIsCreditPayContent?.(6)) : c.setIsCreditPayContent?.(7),
      finish: () => c.setIsCreditPayContent?.(7),
      tabNav: () => actionTarget === 'prev' ? c.handlePreviousTab?.() : c.handleNextTab?.(),
      categoryNav: () => typeof c.handleCategoryPageNav === 'function' && c.handleCategoryPageNav(actionTarget),
      modal: () => actionTarget && m?.[`Modal${actionTarget}`]?.open?.(),
    };
    actions[actionType]?.();
  }, [disabled, actionType, actionTarget, actionMethod]);
};

// 키 검증 유틸
const isActionKey = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'NumpadEnter';

const Button = memo(({
  className = '',
  style = {},
  svg = null,
  img,
  imgAlt = '',
  imgStyle = {},
  label,
  children,
  disabled = false,
  pressed = false,
  pointed = false,
  toggle = false,
  actionType,
  actionTarget,
  actionMethod,
  onClick,
  ttsText,
  ...rest
}) => {
  const btnRef = useRef(null);
  const [isPressing, setIsPressing] = useState(false);
  const { playOnPressedSound } = useButtonStyle();
  const handleAction = useButtonAction(actionType, actionTarget, actionMethod, disabled);

  useLayoutEffect(() => { if (btnRef.current) applyButtonMinSide(btnRef.current); }, []);

  // pressed: 눌린/선택된 상태 (토글 ON)
  // pointed: 포커스/호버 상태 (강조 테두리) - 동시 적용 가능
  const cls = useMemo(() => {
    const c = ['button'];
    if (!/primary[123]|secondary[123]/.test(className)) c.push('primary2');
    if (toggle) c.push('toggle');
    if (pressed || (isPressing && !toggle)) c.push('pressed');
    if (isPressing) c.push('pressing'); // 누르는 순간에만 적용
    if (pointed) c.push('pointed');
    if (className) c.push(className);
    return c.join(' ');
  }, [className, toggle, pressed, pointed, isPressing]);

  const onStart = useCallback((e) => {
    if (disabled || (e.type === 'keydown' && !isActionKey(e))) return;
    if (e.type === 'keydown') e.preventDefault();
    playOnPressedSound();
    setIsPressing(true); // 모든 버튼에 적용
  }, [disabled, playOnPressedSound]);

  const onEnd = useCallback((e) => {
    if (disabled || (e.type === 'keyup' && !isActionKey(e))) return;
    if (e.type === 'keyup' || e.type === 'touchend') e.preventDefault();
    setIsPressing(false); // 모든 버튼에 적용
    actionType ? handleAction(e) : onClick?.(e);
  }, [disabled, actionType, handleAction, onClick]);

  return (
    <button
      ref={btnRef}
      className={cls}
      style={style}
      data-tts-text={ttsText}
      data-react-handler="true"
      disabled={disabled}
      aria-disabled={disabled}
      aria-pressed={toggle ? pressed : undefined}
      onMouseDown={onStart}
      onMouseUp={onEnd}
      onMouseLeave={() => setIsPressing(false)}
      onTouchStart={onStart}
      onTouchEnd={onEnd}
      onKeyDown={onStart}
      onKeyUp={onEnd}
      {...rest}
    >
      {(svg || img) && (
        <span className="icon" aria-hidden="true">
          {svg || <img src={img} alt={imgAlt} style={imgStyle} />}
        </span>
      )}
      {label}
      {children}
      {toggle && (
        <span className="icon pressed" aria-hidden="true">
          <ToggleIcon />
        </span>
      )}
    </button>
  );
});
Button.displayName = 'Button';

// ============================================================================
// Modal 컴포넌트 (최적화 - 팩토리 패턴)
// ============================================================================

const H = memo(({ children }) => <span className="highlight">{children}</span>); // ModalHighlight 축약
H.displayName = 'H';

// 모달 설정 (컨텍스트 기반 생성)
const MODAL_CONFIG = {
  deleteCheck: {
    tts: "알림, 내역이 없으면 메뉴선택으로 돌아갑니다, 계속 진행하시려면 확인 버튼을 누릅니다, ",
    icon: "GraphicWarning",
    title: "확인",
    confirmLabel: "확인",
    message: (H) => <><p>내역이 없으면 <H>메뉴선택</H>으로 돌아갑니다</p><p>계속 진행하시려면 <H>확인</H> 버튼을 누르세요</p></>,
  },
  delete: {
    tts: "알림, 상품삭제, 주문 상품을 삭제합니다, 계속 진행하시려면 삭제 버튼을 누릅니다, ",
    icon: "GraphicTrash",
    title: "삭제",
    confirmLabel: "삭제",
    message: (H) => <><p>주문 상품을 <H>삭제</H>합니다</p><p>계속 진행하시려면 <H>삭제</H> 버튼을 누릅니다</p></>,
  },
  reset: {
    tts: "알림, 초기화, 주문 내역을 초기화합니다, 계속 진행하시려면 초기화 버튼을 누릅니다, ",
    icon: "GraphicReset",
    title: "초기화",
    confirmLabel: "초기화",
    message: (H) => <><p>주문 내역을 <H>초기화</H>합니다</p><p>계속 진행하시려면 <H>초기화</H> 버튼을 누릅니다</p></>,
  },
  return: {
    tts: "알림, 시작화면, 시작화면으로 이동합니다, 계속 진행하시려면 시작화면 버튼을 누릅니다,",
    icon: "GraphicHome",
    title: "시작화면",
    confirmLabel: "시작화면",
    message: (H) => <><p><H>시작화면</H>으로 이동합니다</p><p>계속 진행하시려면 <H>시작화면</H> 버튼을 누릅니다</p></>,
  },
  call: {
    tts: "알림, 직원 호출, 직원을 호출합니다, 계속 진행하시려면 호출 버튼을 누릅니다,",
    icon: "GraphicBell",
    title: "호출",
    confirmLabel: "호출",
    message: (H) => <><p>직원을 <H>호출</H>합니다</p><p>계속 진행하시려면 <H>호출</H> 버튼을 누릅니다</p></>,
  },
};

// 공통 모달 베이스 (컨텍스트 기반)
const BaseModal = memo(({ isOpen, type, onCancel, onConfirm, cancelLabel = "취소" }) => {
  const { sections, volume, commonScript } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(isOpen);
  
  const config = MODAL_CONFIG[type];
  
  // 모달 열릴 때 TTS 안내
  useEffect(() => {
    if (isOpen && config?.tts) {
      const t = setTimeout(() => handleText(config.tts + commonScript.replay), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, config, commonScript.replay, handleText]);
  
  if (!isOpen || !config) return null;
  
  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={config.tts + commonScript.replay} />
      </div>
      <div className="modal-overlay">
        <div className="modal-content" ref={containerRef}>
          <div className="up-content">
            <Icon name={config.icon} className="modal-image" />
            <div className="modal-title">{config.title}</div>
          </div>
          <div className="down-content">
            <div className="modal-message">{config.message(H)}</div>
            <div data-tts-text="작업관리, 버튼 두 개," ref={sections.confirmSections} className="task-manager">
              <Button className="w285h090" svg={<Icon name="Cancel" />} label={cancelLabel} ttsText={`${cancelLabel},`} onClick={onCancel} />
              <Button className="w285h090" svg={<Icon name="Ok" />} label={config.confirmLabel} ttsText={`${config.confirmLabel},`} onClick={onConfirm} />
            </div>
          </div>
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

// 개별 모달들 (컨텍스트 기반 생성)
const DeleteCheckModal = ({ handleDelete, id }) => {
  const { ModalDeleteCheck, readCurrentPage, setCurrentPage } = useContext(AppContext);
  const close = useCallback(() => { ModalDeleteCheck.close(); readCurrentPage(); }, [ModalDeleteCheck, readCurrentPage]);
  const confirm = useCallback(() => { handleDelete(id); ModalDeleteCheck.close(); setCurrentPage('process3'); }, [id, handleDelete, ModalDeleteCheck, setCurrentPage]);
  return <BaseModal isOpen={ModalDeleteCheck.isOpen} type="deleteCheck" onCancel={close} onConfirm={confirm} />;
};

const DeleteModal = ({ handleDelete, id }) => {
  const { ModalDelete, readCurrentPage } = useContext(AppContext);
  const close = useCallback(() => { ModalDelete.close(); readCurrentPage(); }, [ModalDelete, readCurrentPage]);
  const confirm = useCallback(() => { handleDelete(id); ModalDelete.close(); readCurrentPage(); }, [id, handleDelete, ModalDelete, readCurrentPage]);
  return <BaseModal isOpen={ModalDelete.isOpen} type="delete" onCancel={close} onConfirm={confirm} />;
};

const ResetModal = () => {
  const { ModalReset, readCurrentPage, setCurrentPage } = useContext(AppContext);
  const resetQty = useResetQuantities();
  const close = useCallback(() => { ModalReset.close(); readCurrentPage(); }, [ModalReset, readCurrentPage]);
  const confirm = useCallback(() => { resetQty(); ModalReset.close(); setCurrentPage('process2'); readCurrentPage(); }, [resetQty, ModalReset, setCurrentPage, readCurrentPage]);
  return <BaseModal isOpen={ModalReset.isOpen} type="reset" onCancel={close} onConfirm={confirm} />;
};

const ReturnModal = () => {
  const { ModalReturn, readCurrentPage, setCurrentPage } = useContext(AppContext);
  const resetQty = useResetQuantities();
  const close = useCallback(() => { ModalReturn.close(); readCurrentPage(); }, [ModalReturn, readCurrentPage]);
  const confirm = useCallback(() => { resetQty(); ModalReturn.close(); setCurrentPage('process1'); }, [resetQty, ModalReturn, setCurrentPage]);
  return <BaseModal isOpen={ModalReturn.isOpen} type="return" onCancel={close} onConfirm={confirm} />;
};

const CallModal = () => {
  const { ModalCall, readCurrentPage } = useContext(AppContext);
  const close = useCallback(() => { ModalCall.close(); readCurrentPage(); }, [ModalCall, readCurrentPage]);
  return <BaseModal isOpen={ModalCall.isOpen} type="call" onCancel={close} onConfirm={close} />;
};

export const useMultiModalButtonHandler = (options = {}) => {
  const {
    initFocusableSections = [],
    initFirstButtonSection = null,
    enableGlobalHandlers = true,
    handleTextOpt = null,
    prefixOpt = '',
    enableKeyboardNavigation = false
  } = options;
  
  const [, setFocusableSections] = useState(initFocusableSections);
  const handlersRef = useRef({});
  const keyboardNavState = useRef({
    currentSectionIndex: 0,
    currentButtonIndex: 0,
    sections: initFocusableSections,
    firstButtonSection: initFirstButtonSection
  });
  
  // 섹션 업데이트 함수
  const updateFocusableSections = useCallback((newSections) => {
    setFocusableSections(newSections);
    keyboardNavState.current.sections = newSections;
  }, []);
  
  // TTS 텍스트 핸들러
  const finalHandleText = useCallback((text) => {
    if (handleTextOpt && typeof handleTextOpt === 'function') {
      handleTextOpt(text);
    }
  }, [handleTextOpt]);
  
  // 버튼 클릭 핸들러
  const handleButtonClick = useCallback((e) => {
    const btn = e.target?.closest?.('.button');
    if (!btn || isButtonDisabled(btn)) return;
    if (btn.dataset.reactHandler === 'true') return;
    
    const ttsText = btn.dataset.ttsText;
    if (ttsText && finalHandleText) {
      finalHandleText(prefixOpt ? `${prefixOpt}${ttsText}` : ttsText);
    }
  }, [finalHandleText, prefixOpt]);
  
  // 토글 버튼 클릭 핸들러
  useEffect(() => {
    if (!enableGlobalHandlers) return;
    
    const handleToggleClick = (e) => {
      const btn = e.target?.closest?.('.button');
      if (!btn || isButtonDisabled(btn) || !isToggleButton(btn)) return;
      if (btn.dataset.reactHandler === 'true') return;
    };
    
    document.addEventListener('click', handleToggleClick, false);
    handlersRef.current.toggleClickHandler = handleToggleClick;
    
    return () => document.removeEventListener('click', handleToggleClick, false);
  }, [enableGlobalHandlers]);
  
  // 비활성화 버튼 클릭 방지
  useEffect(() => {
    if (!enableGlobalHandlers) return;
    
    const blockDisabledButton = (e) => {
      const btn = e.target?.closest?.('.button');
      if (btn && isButtonDisabled(btn)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    document.addEventListener('click', blockDisabledButton, true);
    return () => document.removeEventListener('click', blockDisabledButton, true);
  }, [enableGlobalHandlers]);
  
  // 키보드 네비게이션
  useEffect(() => {
    if (!enableGlobalHandlers || !enableKeyboardNavigation) return;
    
    const handleKeyDown = (e) => {
      const { key } = e;
      
      // 방향키 네비게이션
      if ([KEYBOARD.ARROW_UP, KEYBOARD.ARROW_DOWN, KEYBOARD.ARROW_LEFT, KEYBOARD.ARROW_RIGHT].includes(key)) {
        e.preventDefault();
        const activeEl = document.activeElement;
        if (!activeEl) return;
        
        const currentSection = activeEl.closest('[data-tts-text]');
        if (!currentSection) return;
        
        const buttons = currentSection.querySelectorAll('.button:not([aria-disabled="true"])');
        const currentIndex = Array.from(buttons).indexOf(activeEl);
        let nextIndex = currentIndex;
        
        if (key === KEYBOARD.ARROW_RIGHT || key === KEYBOARD.ARROW_DOWN) {
          nextIndex = (currentIndex + 1) % buttons.length;
        } else if (key === KEYBOARD.ARROW_LEFT || key === KEYBOARD.ARROW_UP) {
          nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        }
        
        if (buttons[nextIndex]) buttons[nextIndex].focus();
      }
      
      // Tab 키 섹션 이동
      if (key === KEYBOARD.TAB) {
        const sections = keyboardNavState.current.sections;
        if (sections.length === 0) return;
        
        e.preventDefault();
        const currentSectionIndex = keyboardNavState.current.currentSectionIndex;
        const nextSectionIndex = e.shiftKey
          ? (currentSectionIndex - 1 + sections.length) % sections.length
          : (currentSectionIndex + 1) % sections.length;
        
        const nextSection = sections[nextSectionIndex]?.current;
        if (nextSection) {
          const firstButton = nextSection.querySelector('.button:not([aria-disabled="true"])');
          if (firstButton) {
            firstButton.focus();
            keyboardNavState.current.currentSectionIndex = nextSectionIndex;
          }
        }
      }
      
      // Enter/Space 버튼 활성화
      if (key === KEYBOARD.ENTER || key === KEYBOARD.SPACE) {
        const activeEl = document.activeElement;
        if (activeEl?.classList?.contains('button')) {
          e.preventDefault();
          activeEl.click();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [enableGlobalHandlers, enableKeyboardNavigation]);
  
  // 마우스/터치 pressed 상태 관리
  useEffect(() => {
    if (!enableGlobalHandlers) return;
    
    const handlePressState = (e, action) => {
      const btn = e.target?.closest?.('.button');
      if (!btn || isButtonDisabled(btn) || isToggleButton(btn)) return;
      if (btn.dataset.reactHandler === 'true') return;
      
      if (action === 'add') {
        btn.classList.add('pressed');
      } else if (action === 'remove' && btn.classList.contains('pressed')) {
        btn.classList.remove('pressed');
        requestAnimationFrame(() => {
          if (btn instanceof HTMLElement && document.activeElement !== btn) {
            btn.focus();
          }
        });
      }
    };
    
    const handleMouseDown = (e) => handlePressState(e, 'add');
    const handleMouseUp = (e) => {
      handlePressState(e, 'remove');
      const btn = e.target?.closest?.('.button');
      if (btn && !isButtonDisabled(btn) && !isToggleButton(btn) && btn.dataset.reactHandler !== 'true') {
        requestAnimationFrame(() => btn instanceof HTMLElement && btn.focus());
      }
    };
    const handleMouseLeave = (e) => e.target?.closest && handlePressState(e, 'remove');
    const handleTouchStart = (e) => handlePressState(e, 'add');
    const handleTouchEnd = (e) => {
      handlePressState(e, 'remove');
      const btn = e.target?.closest?.('.button');
      if (btn && !isButtonDisabled(btn) && !isToggleButton(btn) && btn.dataset.reactHandler !== 'true') {
        requestAnimationFrame(() => btn instanceof HTMLElement && btn.focus());
      }
    };
    const handleTouchCancel = (e) => handlePressState(e, 'remove');
    
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enableGlobalHandlers]);
  
  return enableKeyboardNavigation
    ? { handleButtonClick, updateFocusableSections }
    : { handleButtonClick };
};

export const useWebViewMessage = (setIsCreditPayContent) => {
  useEffect(() => {
    if (!window.chrome?.webview) return;
    
    const hm = (e) => {
      let d = e.data;
      if (d.arg.result === CFG.WEBVIEW_SUCCESS) {
        if (d.Command === 'PAY') setIsCreditPayContent(PAY.CARD_OUT);
        if (d.Command === 'PRINT') setIsCreditPayContent(PAY.PRINT_SELECT);
      } else {
        console.log(d.arg.errorMessage);
      }
    };
    
    window.chrome.webview.addEventListener("message", hm);
    return () => {
      if (window.chrome?.webview) {
        window.chrome.webview.removeEventListener("message", hm);
      }
    };
  }, [setIsCreditPayContent]);
};

// ============================================================================
// Contexts
// ============================================================================

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLow, setIsLow] = useState(false);
  const [isLarge, setIsLarge] = useState(false);
  const [volume, setVolume] = useState(1);
  
  useBodyClass('dark', isDark);
  useHtmlClass('large', isLarge);  // html에 적용 (font-size 스케일링)
  useBodyClass('low', isLow);
  
  const accessibility = useMemo(() => ({
    isDark,
    isLow,
    isLarge,
    volume
  }), [isDark, isLow, isLarge, volume]);
  
  const [accessibilityState, setAccessibilityState] = useState(accessibility);
  
  useEffect(() => {
    setAccessibilityState(accessibility);
  }, [accessibility]);
  
  const value = useMemo(() => ({
    isDark, setIsDark,
    isLow, setIsLow,
    isLarge, setIsLarge,
    volume, setVolume,
    accessibility,
    setAccessibility: setAccessibilityState
  }), [isDark, isLow, isLarge, volume, accessibility]);
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState('process1');
  const [history, setHistory] = useState(['process1']);
  const [intervalTime, setIntervalTime] = useState(0);
  const [introFlag, setIntroFlag] = useState(true);
  
  const setCurrentPage = useCallback((p) => {
    if (p !== currentPage) {
      setHistory(pr => [...pr, currentPage]);
      setCurrentPageState(p);
    }
  }, [currentPage]);
  
  const goBack = useCallback(() => {
    if (history.length > 1) {
      const nh = [...history];
      nh.pop();
      setHistory(nh);
      setCurrentPageState(nh[nh.length - 1]);
    }
  }, [history]);
  
  const sections = {
    top: useRef(null),
    row1: useRef(null),
    row2: useRef(null),
    row3: useRef(null),
    row4: useRef(null),
    row5: useRef(null),
    row6: useRef(null),
    page: useRef(null),
    modalPage: useRef(null),
    middle: useRef(null),
    bottom: useRef(null),
    footer: useRef(null),
    bottomfooter: useRef(null),
    confirmSections: useRef(null),
    AccessibilitySections1: useRef(null),
    AccessibilitySections2: useRef(null),
    AccessibilitySections3: useRef(null),
    AccessibilitySections4: useRef(null),
    AccessibilitySections5: useRef(null),
    AccessibilitySections6: useRef(null)
  };
  
  const value = useMemo(() => ({
    currentPage, setCurrentPage, goBack, history,
    intervalTime, setIntervalTime,
    introFlag, setIntroFlag,
    sections
  }), [currentPage, setCurrentPage, goBack, history, intervalTime, introFlag, sections]);
  
  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({
    return: false,
    accessibility: false,
    reset: false,
    delete: false,
    deleteCheck: false,
    call: false
  });
  const [deleteItemId, setDeleteItemId] = useState(0);
  
  const createModalHandlers = useCallback((key) => ({
    isOpen: modals[key],
    open: () => setModals(p => ({ ...p, [key]: true })),
    close: () => setModals(p => ({ ...p, [key]: false })),
    toggle: () => setModals(p => ({ ...p, [key]: !p[key] }))
  }), [modals]);
  
  const value = useMemo(() => ({
    ModalReturn: createModalHandlers('return'),
    ModalAccessibility: createModalHandlers('accessibility'),
    ModalReset: createModalHandlers('reset'),
    ModalDelete: createModalHandlers('delete'),
    ModalDeleteCheck: createModalHandlers('deleteCheck'),
    ModalCall: createModalHandlers('call'),
    ModalDeleteItemId: deleteItemId,
    setModalDeleteItemId: setDeleteItemId
  }), [modals, deleteItemId, createModalHandlers]);
  
  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // 메뉴 데이터
  const { tabs, totalMenuItems, categoryInfo, isLoading: menuLoading } = useMenuData();
  const { categorizeMenu, calculateSum, calculateTotal, filterMenuItems, createOrderItems } = useMenuUtils();
  
  // 상태
  const [selectedTab, setSelectedTab] = useState("전체메뉴");
  const [quantities, setQuantities] = useState({});
  const [isCreditPayContent, setIsCreditPayContent] = useState(0);
  
  // 메모이즈된 값
  const menuItems = useMemo(() => 
    categorizeMenu(totalMenuItems, selectedTab, categoryInfo),
    [totalMenuItems, selectedTab, categoryInfo, categorizeMenu]
  );
  const totalCount = useMemo(() => calculateSum(quantities), [quantities, calculateSum]);
  const totalSum = useMemo(() => calculateTotal(quantities, totalMenuItems), [quantities, totalMenuItems, calculateTotal]);
  const orderItems = useMemo(() => createOrderItems(totalMenuItems, quantities), [totalMenuItems, quantities, createOrderItems]);
  
  // 수량 핸들러
  const handleIncrease = useCallback((id) => {
    setQuantities(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  }, []);
  
  const handleDecrease = useCallback((id) => {
    setQuantities(p => ({ ...p, [id]: p[id] > 0 ? p[id] - 1 : 0 }));
  }, []);
  
  // 삭제 (수량을 0으로 설정 - 빼기 버튼 qty=1일 때와 동일한 결과)
  const handleDelete = useCallback((id) => {
    setQuantities(p => ({ ...p, [id]: 0 }));
  }, []);
  
  // 주문번호
  const updateOrderNumber = useCallback(() => {
    const c = safeParseInt(safeLocalStorage.getItem(STORAGE.ORDER_NUM), 0);
    const n = c + 1;
    safeLocalStorage.setItem(STORAGE.ORDER_NUM, n);
    return n;
  }, []);
  
  // WebView 통신
  const setCallWebToApp = useCallback((cmd, val) => {
    const o = { Command: cmd, arg: val };
    console.log("obj_cmd: " + JSON.stringify(o));
    if (window.chrome?.webview) window.chrome.webview.postMessage(JSON.stringify(o));
  }, []);
  
  const sendOrderDataToApp = useCallback((paymentType) => {
    const arr = orderItems.map(i => ({
      menuName: i.name,
      quantity: i.quantity,
      price: i.price * i.quantity
    }));
    const sp = (totalSum / 1.1).toFixed(2);
    setCallWebToApp(WEBVIEW.PAY, {
      orderData: arr,
      totalPrice: totalSum,
      supplyPrice: sp,
      tax: (totalSum - sp).toFixed(2),
      paymentType,
      orderNumber: updateOrderNumber()
    });
  }, [orderItems, totalSum, updateOrderNumber, setCallWebToApp]);
  
  const sendPrintReceiptToApp = useCallback(() => setCallWebToApp(WEBVIEW.PRINT, ''), [setCallWebToApp]);
  const sendCancelPayment = useCallback(() => setCallWebToApp(WEBVIEW.CANCEL, ''), [setCallWebToApp]);
  
  // 탭 네비게이션
  const handlePreviousTab = useCallback(() => {
    const i = (tabs.indexOf(selectedTab) - 1 + tabs.length) % tabs.length;
    setSelectedTab(tabs[i]);
  }, [tabs, selectedTab]);
  
  const handleNextTab = useCallback(() => {
    const i = (tabs.indexOf(selectedTab) + 1) % tabs.length;
    setSelectedTab(tabs[i]);
  }, [tabs, selectedTab]);
  
  // 카테고리 페이지 네비게이션
  const categoryPageNavRef = useRef(null);
  const handleCategoryPageNav = useCallback((dir) => {
    if (categoryPageNavRef.current) categoryPageNavRef.current(dir);
  }, []);
  const setHandleCategoryPageNav = useCallback((fn) => {
    categoryPageNavRef.current = fn;
  }, []);
  
  // Context value
  const value = useMemo(() => ({
    // 메뉴 데이터
    tabs, totalMenuItems, categoryInfo, menuItems, selectedTab, setSelectedTab, menuLoading,
    // 주문 상태
    quantities, setQuantities, handleIncrease, handleDecrease, handleDelete,
    totalCount, totalSum, filterMenuItems, createOrderItems,
    convertToKoreanQuantity, calculateSum, calculateTotal,
    // 결제
    isCreditPayContent, setIsCreditPayContent,
    sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, updateOrderNumber,
    // 네비게이션
    handlePreviousTab, handleNextTab, handleCategoryPageNav, setHandleCategoryPageNav
  }), [
    tabs, totalMenuItems, categoryInfo, menuItems, selectedTab, menuLoading,
    quantities, setQuantities, handleIncrease, handleDecrease, handleDelete, totalCount, totalSum,
    filterMenuItems, createOrderItems, calculateSum, calculateTotal, orderItems,
    isCreditPayContent, setIsCreditPayContent, sendOrderDataToApp, sendPrintReceiptToApp,
    sendCancelPayment, updateOrderNumber, handlePreviousTab, handleNextTab,
    handleCategoryPageNav, setHandleCategoryPageNav
  ]);
  
  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const ButtonStyleContext = createContext(null);

export const ButtonStyleProvider = ({ children }) => {
  const [groupStates, setGroupStates] = useState({});
  const [buttonStates, setButtonStates] = useState({});
  const { play: playSound } = useSound();
  
  const playOnPressedSound = useCallback(() => playSound('onPressed'), [playSound]);
  
  const setButtonPressed = useCallback((id, p) => {
    setButtonStates(pr => ({ ...pr, [id]: p }));
  }, []);
  
  const toggleButtonPressed = useCallback((id) => {
    let ns;
    setButtonStates(p => { ns = !p[id]; return { ...p, [id]: ns }; });
    return ns;
  }, []);
  
  const isButtonPressed = useCallback((id) => buttonStates[id] || false, [buttonStates]);
  
  const selectInGroup = useCallback((gid, bid) => {
    setGroupStates(p => ({ ...p, [gid]: bid }));
  }, []);
  
  const getSelectedInGroup = useCallback((gid) => groupStates[gid] || null, [groupStates]);
  const isSelectedInGroup = useCallback((gid, bid) => groupStates[gid] === bid, [groupStates]);
  
  const clearGroupSelection = useCallback((gid) => {
    setGroupStates(p => { const s = { ...p }; delete s[gid]; return s; });
  }, []);
  
  const contextValue = useMemo(() => ({
    playOnPressedSound, setButtonPressed, toggleButtonPressed,
    isButtonPressed, buttonStates,
    selectInGroup, getSelectedInGroup, isSelectedInGroup,
    clearGroupSelection, groupStates
  }), [
    playOnPressedSound, setButtonPressed, toggleButtonPressed,
    isButtonPressed, buttonStates,
    selectInGroup, getSelectedInGroup, isSelectedInGroup,
    clearGroupSelection, groupStates
  ]);
  
  return (
    <ButtonStyleContext.Provider value={contextValue}>
      {children}
    </ButtonStyleContext.Provider>
  );
};

export const useButtonStyle = () => {
  const c = useContext(ButtonStyleContext);
  if (!c) return {
    playOnPressedSound: () => {},
    setButtonPressed: () => {},
    toggleButtonPressed: () => false,
    isButtonPressed: () => false,
    buttonStates: {},
    selectInGroup: () => {},
    getSelectedInGroup: () => null,
    isSelectedInGroup: () => false,
    clearGroupSelection: () => {},
    groupStates: {}
  };
  return c;
};

export const InitializationContext = createContext({ isInitialized: false, initializationSteps: {} });
export const useInitialization = () => useContext(InitializationContext);

export const InitializationProvider = ({ children }) => {
  const [initializationSteps, setInitializationSteps] = useState({
    ttsDatabase: false,
    buttonHandler: false,
    sizeControl: false,
    viewport: false
  });
  
  const { initDB } = useTextHandler();
  
  useEffect(() => {
    const init = async () => {
      await initDB();
      setInitializationSteps(p => ({ ...p, ttsDatabase: true }));
    };
    init();
  }, [initDB]);
  
  useMultiModalButtonHandler({ enableGlobalHandlers: true, enableKeyboardNavigation: false });
  
  useEffect(() => {
    setInitializationSteps(p => ({ ...p, buttonHandler: true }));
  }, []);
  
  useLayoutEffect(() => {
    SizeControlManager.init();
    setInitializationSteps(p => ({ ...p, sizeControl: true }));
    setViewportZoom();
    setupViewportResize();
    setInitializationSteps(p => ({ ...p, viewport: true }));
  }, []);
  
  const isInitialized = Object.values(initializationSteps).every(Boolean);
  const value = { isInitialized, initializationSteps };
  
  return (
    <InitializationContext.Provider value={value}>
      {children}
    </InitializationContext.Provider>
  );
};

export const IdleTimeoutContext = createContext({
  remainingTime: 0,
  remainingTimeFormatted: "00:00",
  isActive: false
});
export const useIdleTimeoutContext = () => useContext(IdleTimeoutContext);
export const IdleTimeoutProvider = ({ value, children }) => (
  <IdleTimeoutContext.Provider value={value}>
    {children}
  </IdleTimeoutContext.Provider>
);

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const accessibilityContext = useContext(AccessibilityContext);
  const orderContext = useContext(OrderContext);
  const uiContext = useContext(UIContext);
  const modalContext = useContext(ModalContext);
  const { handleText } = useTextHandler(accessibilityContext.volume);
  
  const readCurrentPage = useCallback((newVolume) => {
    const el = safeQuerySelector('.hidden-btn.page-btn');
    const p = el?.dataset.ttsText;
    if (p) handleText(p, true, newVolume);
  }, [handleText]);
  
  const contextValue = useMemo(() => ({
    ...accessibilityContext,
    ...orderContext,
    ...uiContext,
    ...modalContext,
    commonScript: TTS,
    readCurrentPage
  }), [accessibilityContext, orderContext, uiContext, modalContext, readCurrentPage]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

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

// 비활성 메뉴 ID (추가예정: 0, 기타: 13)
export const DISABLED_MENU_ID = 13;
export const isMenuDisabled = (id) => id === 0 || id === DISABLED_MENU_ID;

// 에러 메시지
export const ERROR = { NO_PRODUCT: '없는 상품입니다.' };

// 레이아웃 컴포넌트
const LAYOUT = { BLACK: 'Black', TOP: 'Top', STEP: 'Step', MAIN: 'Main', SUMMARY: 'Summary', BOTTOM: 'Bottom', GLOBAL_MODALS: 'GlobalModals' };
const LAYOUT_COND = {
  [LAYOUT.BLACK]: () => true,
  [LAYOUT.TOP]: () => true,
  [LAYOUT.STEP]: () => true,
  [LAYOUT.MAIN]: () => true,
  [LAYOUT.SUMMARY]: (ctx) => [PAGE.SECOND, PAGE.THIRD].includes(ctx.currentPage),
  [LAYOUT.BOTTOM]: () => true,
  [LAYOUT.GLOBAL_MODALS]: () => true,
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
export const PAGE_MESSAGES = {
  FIRST: { FULL: TTS.page1 },
  SECOND: { FULL: TTS.page2 },
  THIRD: { FULL: TTS.page3 }
};
export const PAYMENT_MESSAGES = {
  SELECT_METHOD: TTS.paySelect,
  CARD_INSERT: TTS.cardIn,
  MOBILE_PAY: TTS.mobile,
  CARD_REMOVE: TTS.cardOut,
  PRINT_SELECT: TTS.printSelect,
  ORDER_PRINT: TTS.orderPrint,
  RECEIPT_PRINT: TTS.receipt,
  FINISH: TTS.finish
};
export const LAYOUT_COMPONENTS = LAYOUT;
export const LAYOUT_ASSEMBLY_CONTEXT = { conditions: LAYOUT_COND };


// ============================================================================
// 내부 UI 컴포넌트 (App.js 내부용)
// ============================================================================

// 카테고리 탭 버튼
const CategoryTab = memo(({ tab, isSelected }) => (
  <Button 
    toggle 
    pressed={isSelected} 
    ttsText={`${tab.name}, ${isSelected ? "선택됨, " : "선택가능, "}`} 
    actionType="selectTab" 
    actionTarget={tab.name} 
    label={tab.name} 
  />
));
CategoryTab.displayName = 'CategoryTab';

// 카테고리 네비게이션
const CategorySeparator = () => <span className="category-separator" aria-hidden="true" />;

const CategoryNav = memo(({ categories, selectedTab, pagination, containerRef, measureRef, sections, convertToKoreanQuantity }) => {
  const { catPage, catTotal, catItems, catHasPrev, catHasNext, isCompact, isReady } = pagination;
  return (
    <div 
      className="category-full" 
      ref={sections.top} 
      data-tts-text={`메뉴 카테고리, 현재상태, ${selectedTab}, 총 버튼 ${convertToKoreanQuantity(catItems.length)}개,`}
    >
      {/* 숨겨진 측정용 컨테이너 (실제 구조와 동일하게 구분선 포함) */}
      <div ref={measureRef} className="category measure" aria-hidden="true" inert="true">
        {categories.map((tab, idx) => (
          <React.Fragment key={tab.id}>
            <Button toggle label={tab.name} tabIndex={-1} />
            {idx < categories.length - 1 && <CategorySeparator />}
          </React.Fragment>
        ))}
      </div>
      <Button toggle ttsText="이전" label="◀" disabled={!catHasPrev} actionType="categoryNav" actionTarget="prev" />
      <div 
        className={`category${isCompact ? ' compact' : ''}`} 
        ref={containerRef}
        style={{ visibility: isReady ? 'visible' : 'hidden' }}
      >
        {catItems.map((tab, idx) => (
          <React.Fragment key={tab.id}>
            <CategoryTab tab={tab} isSelected={selectedTab === tab.name} />
            {idx < catItems.length - 1 && <CategorySeparator />}
          </React.Fragment>
        ))}
      </div>
      <Button toggle ttsText="다음" label="▶" disabled={!catHasNext} actionType="categoryNav" actionTarget="next" />
    </div>
  );
});
CategoryNav.displayName = 'CategoryNav';

// 메뉴 아이템
const MenuItem = memo(({ item, disabled, onPress }) => (
  <Button 
    className="primary3"
    ttsText={disabled ? `${item.name}, 비활성,` : `${item.name}, ${item.price}원`} 
    disabled={disabled} 
    onClick={onPress}
  >
    <span className="icon" aria-hidden="true">
      <img src={`./images/${item.img}`} alt={item.name} />
    </span>
    <span className="label">
      <p>{item.name}</p>
      <p>{Number(item.price).toLocaleString()}원</p>
    </span>
  </Button>
));
MenuItem.displayName = 'MenuItem';

// 메뉴 그리드
const MenuGrid = memo(({ items, onItemPress, sections, selectedTab, convertToKoreanQuantity }) => {
  return (
    <div className="menu" ref={sections.middle} data-tts-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(items.length)}개,`}>
      {items.map(item => (
        <MenuItem 
          key={item.id} 
          item={item} 
          disabled={isMenuDisabled(item.id)} 
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
      <span className="pagination-page-current">{pageNumber}</span>
      <span className="pagination-separator">&nbsp;/&nbsp;</span>
      <span className="pagination-page-total">{totalPages || 1}</span>
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
          <img src={`./images/${item.img}`} alt={item.name} className="order-image" />
        </div>
        <p className="order-name">{item.name}</p>
        <div className="order-quantity">
          <Button className="w080h076" ttsText="수량 빼기" label="-" onClick={onDecrease} />
          <span className="qty">{quantity}</span>
          <Button className="w080h076" ttsText="수량 더하기" label="+" onClick={onIncrease} />
        </div>
        <span className="order-price">{formatNumber(totalPrice)}원</span>
        <Button className="w070h070 delete-item" ttsText="삭제" svg={<DeleteIcon />} onClick={onDelete} />
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
const PageTitle = memo(({ children }) => <div className="title">{children}</div>);
PageTitle.displayName = 'PageTitle';

// 하이라이트 텍스트 (.title .primary 스타일 사용)
const Highlight = memo(({ children }) => (
  <span className="primary">{children}</span>
));
Highlight.displayName = 'Highlight';

// ============================================================================
// 프로세스 1 컴포넌트 (메인 화면)
// ============================================================================

const Process1 = memo(() => {
  const { 
    sections, setCurrentPage, volume, setIsDark, setVolume, setIsLarge, setIsLow
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
    setIsDark(DEFAULT_SETTINGS.IS_DARK);
    setVolume(DEFAULT_SETTINGS.VOLUME);
    setIsLarge(DEFAULT_SETTINGS.IS_LARGE);
    setIsLow(DEFAULT_SETTINGS.IS_LOW);
  }, [setIsDark, setVolume, setIsLarge, setIsLow]);

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
      <div className="hero">
        <p>화면 하단의 접근성 버튼을 눌러 고대비화면, 소리크기, 큰글씨화면, 낮은화면을 설정할 수 있습니다</p>
        <div className="task-manager" data-tts-text="취식방식, 버튼 두개," ref={sections.middle}>     
          <Button className="w285h285 secondary1" ttsText="포장하기" svg={<TakeoutIcon />} label="포장하기" actionType="navigate" actionTarget={PAGE_CONFIG.SECOND} />
          <Button className="w285h285 secondary1" ttsText="먹고가기" svg={<TakeinIcon />} label="먹고가기" actionType="navigate" actionTarget={PAGE_CONFIG.SECOND} />     
        </div>
        <p>키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다</p>
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
    sections, isLow, isDark, isLarge, tabs, menuItems, selectedTab, setSelectedTab,
    handleIncrease, commonScript, volume, quantities, convertToKoreanQuantity,
    setCurrentPage, setHandleCategoryPageNav, categoryInfo
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { stopIntroTimer } = useTimer();
  const { blurActiveElement, getActiveElementText } = useSafeDocument();

  // 기본 탭 설정
  useEffect(() => {
    const t = setTimeout(() => setSelectedTab(DEFAULT_SETTINGS.SELECTED_TAB), 0);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  // 페이지 진입 시 TTS 안내
  useEffect(() => {
    stopIntroTimer();
    blurActiveElement();
    const t = setTimeout(() => {
      const p = getActiveElementText();
      if (p) setTimeout(() => handleText(p), TIMER_CONFIG.TTS_DELAY);
    }, 0);
    return () => clearTimeout(t);
  }, [handleText, blurActiveElement, getActiveElementText, stopIntroTimer]);

  useMultiModalButtonHandler({
    initFocusableSections: [FOCUS_SECTIONS.PAGE, FOCUS_SECTIONS.TOP, FOCUS_SECTIONS.MIDDLE, FOCUS_SECTIONS.BOTTOM, FOCUS_SECTIONS.FOOTER, FOCUS_SECTIONS.BOTTOM_FOOTER],
    initFirstButtonSection: FOCUS_SECTIONS.TOP, enableGlobalHandlers: false, enableKeyboardNavigation: true
  });

  const {
    pageNumber, totalPages, currentItems,
    handlePrevPage, handleNextPage, resetOnChange
  } = usePagination(
    menuItems,
    PAGINATION_CONFIG.ITEMS_PER_PAGE_NORMAL,
    PAGINATION_CONFIG.ITEMS_PER_PAGE_LOW,
    isLow
  );
  
  // 탭 변경 시 페이지 리셋
  useEffect(() => {
    const t = setTimeout(() => resetOnChange(), 0);
    return () => clearTimeout(t);
  }, [selectedTab]); // eslint-disable-line

  const handleTouchEndWrapper = useCallback((e, id) => {
    if (!isMenuDisabled(id)) {
      handleIncrease(id);
      handleText('담기, ');
    } else {
      handleText(ERROR_MESSAGES.NO_PRODUCT);
    }
  }, [handleIncrease, handleText]);

  const handlePaginationPress = useCallback((e, dir) => {
    e.preventDefault();
    e.target.focus();
    dir === 'prev' ? handlePrevPage() : handleNextPage();
  }, [handlePrevPage, handleNextPage]);
  
  const handleMenuItemPress = useCallback((e, id) => {
    e.preventDefault();
    e.target.focus();
    handleTouchEndWrapper(e, id);
  }, [handleTouchEndWrapper]);

  // 카테고리 탭 데이터
  const allTabs = useMemo(() => (categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })), [categoryInfo]);
  
  // [중요] 가변 너비 카테고리 페이지네이션 - useCategoryPagination 훅 참조
  // [중요] 가변 너비 카테고리 페이지네이션 - useCategoryPagination 훅 참조
  // gap, separatorWidth 모두 CSS에서 자동으로 가져옴
  const { 
    containerRef: catContainerRef,  // 실제 표시 컨테이너
    measureRef: catMeasureRef,      // 숨겨진 측정용 컨테이너
    currentPage: catPage, 
    totalPages: catTotal, 
    currentItems: catItems,         // 현재 페이지에 표시할 탭들
    hasPrev: catHasPrev,
    hasNext: catHasNext,
    prevPage: catPrev, 
    nextPage: catNext,
    isCompact: catIsCompact,        // compact 모드 여부
    isReady: catIsReady             // 계산 완료 후 표시 준비됨
  } = useCategoryPagination(allTabs, isLarge);

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
        pagination={{ catPage, catTotal, catItems, catHasPrev, catHasNext, catPrev, catNext, isCompact: catIsCompact, isReady: catIsReady }}
        containerRef={catContainerRef}
        measureRef={catMeasureRef}
        sections={sections}
        convertToKoreanQuantity={convertToKoreanQuantity}
      />
      <MenuGrid 
        items={currentItems} 
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
  const {
    sections, totalMenuItems, isDark, isLow, quantities,
    handleIncrease, handleDecrease, filterMenuItems,
    ModalDelete, ModalDeleteCheck, setModalDeleteItemId,
    volume, convertToKoreanQuantity, setCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  
  const priceItems = useMemo(
    () => filterMenuItems(totalMenuItems, quantities),
    [totalMenuItems, quantities, filterMenuItems]
  );
  const {
    pageNumber, totalPages, currentItems,
    handlePrevPage, handleNextPage, itemsPerPage
  } = usePagination(priceItems, 6, 3, isLow);
  const startIndex = useMemo(
    () => (pageNumber - 1) * itemsPerPage,
    [pageNumber, itemsPerPage]
  );
  
  const prependRows = useCallback((arr, cnt) => [
    FOCUS_SECTIONS.PAGE,
    ...Array.from({ length: cnt }, (_, i) => `row${i + 1}`),
    ...arr
  ], []);
  
  const focusableSections = useMemo(
    () => prependRows(
      [FOCUS_SECTIONS.BOTTOM, FOCUS_SECTIONS.FOOTER, FOCUS_SECTIONS.BOTTOM_FOOTER],
      currentItems.length
    ),
    [currentItems.length, prependRows]
  );
  
  const { updateFocusableSections } = useMultiModalButtonHandler({
    initFocusableSections: focusableSections,
    initFirstButtonSection: "row1",
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true
  });

  const handleTouchDecrease = useCallback((id) => {
    if (quantities[id] === 1) {
      setModalDeleteItemId(id);
      currentItems.length > 1 ? ModalDelete.open() : ModalDeleteCheck.open();
    } else {
      handleDecrease(id);
    }
  }, [quantities, currentItems.length, setModalDeleteItemId, ModalDelete, ModalDeleteCheck, handleDecrease]);
  
  const handleTouchDelete = useCallback((id) => {
    setModalDeleteItemId(id);
    currentItems.length > 1 ? ModalDelete.open() : ModalDeleteCheck.open();
  }, [currentItems.length, setModalDeleteItemId, ModalDelete, ModalDeleteCheck]);
  
  const handleQuantityPress = useCallback((e, id, act) => {
    e.preventDefault();
    e.currentTarget.focus();
    act === 'decrease' ? handleTouchDecrease(id) : handleIncrease(id);
  }, [handleTouchDecrease, handleIncrease]);
  
  const handleDeletePress = useCallback((e, id) => {
    e.preventDefault();
    e.currentTarget.focus();
    handleTouchDelete(id);
  }, [handleTouchDelete]);
  
  const handlePaginationPress = useCallback((e, dir) => {
    e.preventDefault();
    e.target.focus();
    dir === 'prev' ? handlePrevPage() : handleNextPage();
  }, [handlePrevPage, handleNextPage]);

  useEffect(() => {
    updateFocusableSections(focusableSections);
  }, [pageNumber, focusableSections, updateFocusableSections]);
  
  // 아이템 없으면 메뉴선택으로 이동
  useEffect(() => {
    if (currentItems.length === 0) {
      const t = setTimeout(() => setCurrentPage(PAGE_CONFIG.SECOND), 0);
      return () => clearTimeout(t);
    }
  }, [currentItems.length]); // eslint-disable-line
  
  const { blurActiveElement } = useSafeDocument();
  
  // 페이지 진입 시 TTS 안내
  const { getActiveElementText } = useSafeDocument();
  useEffect(() => {
    blurActiveElement();
    const t = setTimeout(() => {
      const p = getActiveElementText();
      if (p) setTimeout(() => handleText(p), TIMER_CONFIG.TTS_DELAY);
    }, 0);
    return () => clearTimeout(t);
  }, [handleText, blurActiveElement, getActiveElementText]);

  return (
    <div className="main third">
      <PageTitle>
        <span><Highlight isDark={isDark}>내역</Highlight>을 확인하시고</span>
        <span><Highlight isDark={isDark}>결제하기</Highlight>&nbsp;버튼을 누르세요</span>
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
  const {
    sections, totalSum, isLow, setIsLow, isDark, setIsDark,
    isCreditPayContent, setIsCreditPayContent,
    totalMenuItems, quantities, setQuantities,
    volume, setVolume, isLarge, setIsLarge,
    ModalReturn, ModalAccessibility, setCurrentPage
  } = useContext(AppContext);
  const { handleText } = useTextHandler(volume);
  const { orderNum, updateOrderNumber } = useOrderNumber();
  
  const countdown = usePaymentCountdown({
    isCreditPayContent, setIsCreditPayContent,
    ModalReturn, ModalAccessibility,
    setQuantities, totalMenuItems,
    setIsDark, setVolume, setIsLarge, setIsLow, setCurrentPage
  });
  
  useWebViewMessage(setIsCreditPayContent);
  
  // 초기 결제 단계 설정
  useEffect(() => {
    setIsCreditPayContent(PAY_STEP.SELECT_METHOD);
  }, []); // eslint-disable-line
  
  // 결제 단계별 TTS 안내
  useEffect(() => {
    const oNum = safeParseInt(safeLocalStorage.getItem("ordernum"), 0);
    const ttsMap = {
      [PAYMENT_STEPS.SELECT_METHOD]: PAYMENT_MESSAGES.SELECT_METHOD(totalSum, formatNumber),
      [PAYMENT_STEPS.CARD_INSERT]: PAYMENT_MESSAGES.CARD_INSERT,
      [PAYMENT_STEPS.MOBILE_PAY]: PAYMENT_MESSAGES.MOBILE_PAY,
      [PAYMENT_STEPS.CARD_REMOVE]: PAYMENT_MESSAGES.CARD_REMOVE,
      [PAYMENT_STEPS.PRINT_SELECT]: PAYMENT_MESSAGES.PRINT_SELECT(oNum),
      [PAYMENT_STEPS.ORDER_PRINT]: PAYMENT_MESSAGES.ORDER_PRINT(oNum),
      [PAYMENT_STEPS.RECEIPT_PRINT]: PAYMENT_MESSAGES.RECEIPT_PRINT,
      [PAYMENT_STEPS.FINISH]: PAYMENT_MESSAGES.FINISH,
    };
    const tts = ttsMap[isCreditPayContent];
    if (tts) {
      const t = setTimeout(() => handleText(tts), TIMER_CONFIG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [isCreditPayContent, totalSum, handleText]);
  
  useMultiModalButtonHandler({
    initFocusableSections: [
      FOCUS_SECTIONS.PAGE,
      FOCUS_SECTIONS.MIDDLE,
      FOCUS_SECTIONS.BOTTOM,
      FOCUS_SECTIONS.BOTTOM_FOOTER
    ],
    initFirstButtonSection: FOCUS_SECTIONS.PAGE,
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true
  });

  // 접근성 줄바꿈 헬퍼
  const brLarge = isLow && isLarge ? <br /> : '';
  const brSmall = isLow && !isLarge ? <br /> : '';
  const highlight = "primary";  // .title .primary 사용

  // 결제 단계별 렌더링
  const renderPaymentStep = () => {
    switch (isCreditPayContent) {
      case 0: return (
        <div className="main forth">
          <PageTitle><span><span className={highlight}>결제방법</span>을 선택하세요</span></PageTitle>
          <div className="banner price" onClick={(e) => { e.preventDefault(); e.target.focus(); updateOrderNumber(); setIsCreditPayContent(4); }}>
            <span>결제금액</span><span className="payment-amount-large">{totalSum.toLocaleString("ko-KR")}원</span>
          </div>
          <div className="task-manager" ref={sections.middle} data-tts-text="결제 선택. 버튼 두 개, ">
            <Button ttsText="신용카드," className="w328h460" actionType="payment" actionMethod="card" img="./images/payment-card.png" imgAlt="card" label="신용카드" />
            <Button ttsText="모바일페이," className="w328h460" actionType="payment" actionMethod="mobile" img="./images/payment-mobile.png" imgAlt="mobile" label="모바일 페이" />
          </div>
          <div ref={sections.bottom} className="task-manager" data-tts-text="작업관리. 버튼 한 개,">
            <Button ttsText="취소," className="w500h120" actionType="cancel" actionTarget={PAGE_CONFIG.THIRD} label="취소" />
          </div>
        </div>
      );
      case 1: return (
        <div data-tts-text="작업 관리, 버튼 한 개," ref={sections.bottom} className="main forth">
          <PageTitle>
            <div>가운데 아래에 있는 <span className={highlight}>카드리더기</span>{brSmall ? <>{brSmall}<div className="flex center">에</div></> : "에"}</div>
            <div><span className={highlight}>신용카드</span>를 끝까지 넣으세요</div>
          </PageTitle>
          <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image" onClick={() => setIsCreditPayContent(3)} />
          <Button ttsText="취소" className="w500h120" actionType="cancel" label="취소" />
        </div>
      );
      case 2: return (
        <div data-tts-text="작업 관리, 버튼 한 개," ref={sections.bottom} className="main forth">
          <PageTitle>
            <div>가운데 아래에 있는 <span className={highlight}>카드리더기</span>에</div>
            <div><span className={highlight}>모바일페이</span>를 켜고 접근시키세요</div>
          </PageTitle>
          <img src="./images/device-cardReader-mobile.png" alt="" className="credit-pay-image" onClick={() => setIsCreditPayContent(4)} />
          <Button ttsText="취소" className="w500h120" actionType="cancel" label="취소" />
        </div>
      );
      case 3: return (
        <div data-tts-text="작업 관리, 버튼 한 개," ref={sections.bottom} className="main forth card-remove">
          <PageTitle><span><span className={highlight}>카드</span>를 뽑으세요.</span></PageTitle>
          <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" onClick={() => setIsCreditPayContent(4)} />
        </div>
      );
      case 4: return (
        <div data-tts-text="인쇄 선택, 버튼 두 개," ref={sections.bottom} className="main forth">
          <PageTitle>
            <div>왼쪽 아래의 프린터에서 <span className={highlight}>주문표</span>를</div>
            <div>받으시고 <span className={highlight}>영수증 출력</span>을 선택하세요</div>
          </PageTitle>
          <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
          <div className="order-num">
            <p>주문</p>
            <p>100</p>
          </div>
          <div className="task-manager">
            <Button ttsText="영수증 출력," className="w371h120" actionType="receipt" actionTarget="print" label="영수증 출력" />
            <Button ttsText="출력 안함," className="w371h120" actionType="receipt" actionTarget="skip" label={`출력 안함${countdown}`} />
          </div>
        </div>
      );
      case 5: return (
        <div data-tts-text="작업 관리, 버튼 한 개," ref={sections.bottom} className="main forth">
          <PageTitle>
            <div>왼쪽 아래의 <span className={highlight}>프린터</span>에서 <span className={highlight}>주문표</span>가 출력됩니다</div>
            <div>인쇄가 완전히 <span className={highlight}>끝나고</span>&nbsp;받으세요</div>
          </PageTitle>
          <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
          <div className="order-num"><span>{orderNum}</span></div>
          <Button ttsText="마무리하기" className="w500h120" actionType="finish" label="마무리하기" />
        </div>
      );
      case 6: return (
        <div data-tts-text="작업 관리, 버튼 한 개," className="main forth" ref={sections.bottom}>
          <PageTitle>
            <div>왼쪽 아래의 <span className={highlight}>프린터</span>에서 <span className={highlight}>영수증</span>을</div>
            <div>받으시고<span className={highlight}>마무리</span>&nbsp;버튼을 누르세요</div>
          </PageTitle>
          <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
          <Button ttsText="마무리하기" className="w500h120" actionType="finish" label={`마무리${countdown}`} />
        </div>
      );
      case 7: return (
        <div className="main forth">
          <PageTitle>이용해 주셔서 감사합니다</PageTitle>
          <div className="end-countdown">
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

const PageTTS = memo(() => {
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
  
  return (
    <div className="hidden-div" ref={sections.page}>
      <button
        type="hidden"
        className="hidden-btn page-btn"
        autoFocus={currentPage !== PAGE_CONFIG.FIRST}
        data-tts-text={pageText}
      />
    </div>
  );
});
PageTTS.displayName = 'PageTTS';

// 단계 표시 아이템 컴포넌트
// Step 공통 클래스 헬퍼
const getStepClass = (isPassed, isNow = false) => ({
  circle: `circle ${isPassed ? 'passed' : 'yet'}${isNow ? ' now' : ''}`,
  label: `label${isPassed ? ' passed' : ''}`,
  separator: `separator${isPassed ? ' passed' : ''}`
});

const StepItem = ({ num, label, active, checked }) => {
  const isPassed = checked || active;
  const cls = getStepClass(isPassed, active);
  return (
    <>
      <div className={cls.circle}><span className="num">{checked ? '✓' : num}</span></div>
      <span className={cls.label}>{label}</span>
      <span className={cls.separator}><span className="icon"><StepIcon /></span></span>
    </>
  );
};

const StepLast = ({ num, label, checked }) => {
  const cls = getStepClass(checked);
  return (
    <>
      <div className={cls.circle}><span className="num">{checked ? '✓' : num}</span></div>
      <span className={cls.label}>{label}</span>
    </>
  );
};

const Step = memo(() => {
  const { isCreditPayContent, currentPage } = useContext(AppContext);
  const path = currentPage;
  
  if (path === PAGE_CONFIG.SECOND) {
    return (
      <div className="step">
        <StepItem num={1} label="메뉴선택" active checked={false} />
        <StepItem num={2} label="내역확인" />
        <StepItem num={3} label="결제" />
        <StepLast num={4} label="완료" />
      </div>
    );
  }
  
  if (path === PAGE_CONFIG.THIRD) {
    return (
      <div className="step">
        <StepItem num={1} label="메뉴선택" active checked />
        <StepItem num={2} label="내역확인" active />
        <StepItem num={3} label="결제" />
        <StepLast num={4} label="완료" />
      </div>
    );
  }
  
  if (path === PAGE_CONFIG.FOURTH) {
    const isPaymentComplete = isCreditPayContent >= 3;
    const isFullyComplete = isCreditPayContent === 7;
    
    return (
      <div className="step">
        <StepItem num={1} label="메뉴선택" checked />
        <StepItem num={2} label="내역확인" checked />
        <StepItem 
          num={3} 
          label="결제" 
          active={!isPaymentComplete} 
          checked={isPaymentComplete} 
        />
        <StepLast 
          num={4} 
          label="완료" 
          checked={isFullyComplete} 
        />
      </div>
    );
  }
  
  return null;
});
Step.displayName = 'Step';

const Summary = memo(() => {
  const { 
    sections, 
    totalCount, 
    totalSum, 
    convertToKoreanQuantity, 
    currentPage 
  } = useContext(AppContext);
  
  const [isDisabledBtn, setIsDisabledBtn] = useState(true);
  
  useEffect(() => {
    setIsDisabledBtn(totalCount <= 0);
  }, [totalCount]);
  
  // 메뉴선택/내역확인 페이지에서만 표시
  if (currentPage !== PAGE_CONFIG.SECOND && currentPage !== PAGE_CONFIG.THIRD) {
    return null;
  }
  
  const summaryTtsText = `주문요약, 주문수량, ${convertToKoreanQuantity(totalCount)} 개, 주문금액, ${formatNumber(totalSum)}원, 버튼 두개,`;
  
  return (
    <div className="summary">
      {/* 수량/금액 표시 영역 */}
      <div className="task-manager">
        <p className="summary-label">수량</p>
        <p className="summary-text">{totalCount}개</p>
        <div className="short-colline" />
        <p className="summary-label">금액</p>
        <p className="summary-text">{formatNumber(totalSum)}원</p>
      </div>
      
      {/* 버튼 영역 */}
      <div className="task-manager" ref={sections.footer} data-tts-text={summaryTtsText}>
        {currentPage === PAGE_CONFIG.SECOND && (
          <>
            <Button
              className="w199h090"
              ttsText="초기화,"
              svg={<ResetIcon className="summary-btn-icon" />}
              label="초기화"
              actionType="modal"
              actionTarget="Reset"
            />
            <Button
              className="w199h090 primary1"
              ttsText={`주문하기, ${isDisabledBtn ? "비활성" : ""}`}
              svg={<OrderIcon className="summary-btn-icon" />}
              label="주문"
              disabled={isDisabledBtn}
              actionType="navigate"
              actionTarget={PAGE_CONFIG.THIRD}
            />
          </>
        )}
        {currentPage === PAGE_CONFIG.THIRD && (
          <>
            <Button
              className="w199h090"
              ttsText="추가하기,"
              svg={<AddIcon className="summary-btn-icon" />}
              label="추가"
              actionType="navigate"
              actionTarget={PAGE_CONFIG.SECOND}
            />
            <Button
              className="w199h090 primary1"
              ttsText="결제하기,"
              svg={<PayIcon className="summary-btn-icon" />}
              label="결제"
              actionType="navigate"
              actionTarget={PAGE_CONFIG.FOURTH}
            />
          </>
        )}
      </div>
    </div>
  );
});
Summary.displayName = 'Summary';

const Bottom = memo(() => {
  const { sections } = useContext(AppContext);
  const { remainingTimeFormatted, isActive } = useIdleTimeoutContext();
  return (
    <div className="bottom" data-tts-text="시스템 설정, 버튼 두 개," ref={sections.bottomfooter}>
      <Button
        className="down-footer-button btn-home"
        ttsText="처음으로,"
        svg={<HomeIcon />}
        label="처음으로"
        actionType="modal"
        actionTarget="Return"
      />
      {isActive && <div className="countdown"><span>{remainingTimeFormatted}</span></div>}
      <Button className="down-footer-button" ttsText="접근성," svg={<WheelchairIcon />} label="접근성" actionType="modal" actionTarget="Accessibility" />
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
  const {
    sections,
    isLow, setIsLow,
    isDark, setIsDark,
    isLarge, setIsLarge,
    volume, setVolume,
    setAccessibility,
    ModalAccessibility,
    commonScript,
    readCurrentPage
  } = useContext(AppContext);
  
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
  const {
    settings: currentSettings,
    setDark,
    setLow,
    setLarge,
    setVolume: setSettingsVolume,
    updateAll: updateAllSettings,
    getStatusText
  } = useAccessibilitySettings({ isDark, isLow, isLarge, volume });

  // 모달 열릴 때 TTS 안내
  useEffect(() => {
    if (ModalAccessibility.isOpen) {
      const t = setTimeout(() => handleText("오버레이, 접근성 설정, " + commonScript.replay), 300);
      return () => clearTimeout(t);
    }
  }, [ModalAccessibility.isOpen, handleText, commonScript.replay]);

  // 즉시 적용 핸들러들
  const handleDarkChange = useCallback((val) => {
    setDark(val);
    setIsDark(val);
  }, [setDark, setIsDark]);
  
  const handleVolumeChange = useCallback((val) => {
    setSettingsVolume(val);
    setVolume(val);
    setAudioVolume('audioPlayer', VOLUME_VALUES[val]);
  }, [setSettingsVolume, setVolume, setAudioVolume]);
  
  const handleLargeChange = useCallback((val) => {
    setLarge(val);
    setIsLarge(val);
  }, [setLarge, setIsLarge]);
  
  const handleLowChange = useCallback((val) => {
    setLow(val);
    setIsLow(val);
  }, [setLow, setIsLow]);

  // 초기설정 핸들러
  const handleInitialSettingsPress = useCallback(() => {
    updateAllSettings({ isDark: false, isLow: false, isLarge: false, volume: 1 });
    setIsDark(false);
    setVolume(1);
    setIsLarge(false);
    setIsLow(false);
    setAudioVolume('audioPlayer', VOLUME_VALUES[1]);
  }, [updateAllSettings, setIsDark, setVolume, setIsLarge, setIsLow, setAudioVolume]);

  // 적용안함 핸들러 (원래 상태로 복원)
  const handleCancelPress = useCallback(() => {
    const original = originalSettingsRef.current;
    if (original) {
      setIsDark(original.isDark);
      setVolume(original.volume);
      setIsLarge(original.isLarge);
      setIsLow(original.isLow);
      setAudioVolume('audioPlayer', VOLUME_VALUES[original.volume]);
    }
    ModalAccessibility.close();
    readCurrentPage();
  }, [setIsDark, setVolume, setIsLarge, setIsLow, setAudioVolume, ModalAccessibility, readCurrentPage]);

  // 적용하기 핸들러
  const handleApplyPress = useCallback(() => {
    setAccessibility(currentSettings);
    ModalAccessibility.close();
    readCurrentPage(currentSettings.volume);
  }, [currentSettings, setAccessibility, ModalAccessibility, readCurrentPage]);

  if (!ModalAccessibility.isOpen) return null;

  const highlight = "modal-subtitle-highlight";

  return (
    <>
      <div className="hidden-div" ref={sections.modalPage}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={'오버레이, 설정, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다,' + commonScript.replay} />
      </div>
      <div className="modal-overlay">
      <div className="modal-content" ref={containerRef}>
        <div className="up-content">
          <Icon name="Wheelchair" className="modal-image" />
          <div className="modal-title">접근성</div>
          <div className="modal-description">
            <div className="modal-subtitle">원하시는&nbsp;<span className={highlight}>접근성 옵션</span>을 선택하시고</div>
            <div className="modal-subtitle"><span className={highlight}>적용하기</span>&nbsp;버튼을 누르세요</div>
          </div>
        </div>
        <div className="down-content">
          {/* 초기설정 */}
          <div className="setting-row" data-tts-text="초기설정으로 일괄선택, 버튼 한 개, " ref={sections.AccessibilitySections1}>
            <span className="setting-name">초기설정으로 일괄선택</span>
            <div className="task-manager">
              <Button className="w242h076" svg={<Icon name="Restart" />} label="초기설정" ttsText="초기설정," onClick={handleInitialSettingsPress} />
            </div>
          </div>
          <hr className="setting-line" />
          {/* 고대비화면 */}
          <div className="setting-row">
            <span className="setting-name"><span className="icon"><Icon name="Contrast" /></span>고대비화면</span>
            <div className="task-manager" ref={sections.AccessibilitySections2} data-tts-text={`고대비 화면, 선택상태, ${getStatusText.dark}, 버튼 두 개,`}>
              <ToggleButton label="끔" ttsText={`끔, ${currentSettings.isDark ? '선택가능, ' : '선택됨, '}`} isPressed={!currentSettings.isDark} onClick={() => handleDarkChange(false)} className="w113h076" />
              <ToggleButton label="켬" ttsText={`켬, ${currentSettings.isDark ? '선택됨, ' : '선택가능, '}`} isPressed={currentSettings.isDark} onClick={() => handleDarkChange(true)} className="w113h076" />
            </div>
          </div>
          <hr className="setting-line" />
          {/* 소리크기 */}
          <div className="setting-row">
            <span className="setting-name"><span className="icon"><Icon name="Volume" /></span>소리크기</span>
            <div className="task-manager" ref={sections.AccessibilitySections3} data-tts-text={`소리크기, 선택상태, ${getStatusText.volume}, 버튼 네 개, `}>
              {[0, 1, 2, 3].map((vol) => (
                <ToggleButton key={vol} label={VOLUME_MAP[vol]} ttsText={`${VOLUME_MAP[vol]}, ${currentSettings.volume === vol ? '선택됨, ' : '선택가능, '}`} isPressed={currentSettings.volume === vol} onClick={() => handleVolumeChange(vol)} className="w070h076" />
              ))}
            </div>
          </div>
          <hr className="setting-line" />
          {/* 큰글씨화면 */}
          <div className="setting-row">
            <span className="setting-name"><span className="icon"><Icon name="Large" /></span>큰글씨화면</span>
            <div className="task-manager" ref={sections.AccessibilitySections4} data-tts-text={`큰글씨 화면, 선택상태, ${getStatusText.large}, 버튼 두 개, `}>
              <ToggleButton label="끔" ttsText={`끔, ${currentSettings.isLarge ? '선택가능, ' : '선택됨, '}`} isPressed={!currentSettings.isLarge} onClick={() => handleLargeChange(false)} className="w113h076" />
              <ToggleButton label="켬" ttsText={`켬, ${currentSettings.isLarge ? '선택됨, ' : '선택가능, '}`} isPressed={currentSettings.isLarge} onClick={() => handleLargeChange(true)} className="w113h076" />
            </div>
          </div>
          <hr className="setting-line" />
          {/* 낮은화면 */}
          <div className="setting-row">
            <span className="setting-name"><span className="icon"><Icon name="Wheelchair" /></span>낮은화면</span>
            <div className="task-manager" ref={sections.AccessibilitySections5} data-tts-text={`낮은 화면, 선택상태, ${getStatusText.low}, 버튼 두 개, `}>
              <ToggleButton label="끔" ttsText={`끔, ${currentSettings.isLow ? '선택가능, ' : '선택됨, '}`} isPressed={!currentSettings.isLow} onClick={() => handleLowChange(false)} className="w113h076" />
              <ToggleButton label="켬" ttsText={`켬, ${currentSettings.isLow ? '선택됨, ' : '선택가능, '}`} isPressed={currentSettings.isLow} onClick={() => handleLowChange(true)} className="w113h076" />
            </div>
          </div>
          {/* 적용 버튼들 */}
          <div className="task-manager" ref={sections.AccessibilitySections6} data-tts-text="작업 관리, 버튼 두 개, ">
            <Button className="w285h090" svg={<Icon name="Cancel" />} label="적용안함" ttsText="적용안함, " onClick={handleCancelPress} />
            <Button className="w285h090" svg={<Icon name="Ok" />} label="적용하기" ttsText="적용하기, " onClick={handleApplyPress} />
          </div>
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
  const { ModalReturn, ModalAccessibility, ModalReset, ModalCall, ModalDelete, ModalDeleteCheck, ModalDeleteItemId, handleDelete } = useContext(AppContext);

  return (
    <>
      {ModalReturn.isOpen && <ReturnModal />}
      {ModalReset.isOpen && <ResetModal />}
      {ModalAccessibility.isOpen && <AccessibilityModal />}
      {ModalCall.isOpen && <CallModal />}
      {ModalDelete.isOpen && <DeleteModal handleDelete={handleDelete} id={ModalDeleteItemId} />}
      {ModalDeleteCheck.isOpen && <DeleteCheckModal handleDelete={handleDelete} id={ModalDeleteItemId} />}
    </>
  );
};

// 메인 레이아웃 컴포넌트 - 조립 순서: Step → Content → Summary → Bottom → Modals
const Layout = ({ children }) => {
  const ctx = useContext(AppContext);
  const cond = LAYOUT_ASSEMBLY_CONTEXT.conditions;
  const render = useMemo(() => ({
    step: cond[LAYOUT_COMPONENTS.STEP](ctx),
    main: cond[LAYOUT_COMPONENTS.MAIN](ctx),
    summary: cond[LAYOUT_COMPONENTS.SUMMARY](ctx),
    bottom: cond[LAYOUT_COMPONENTS.BOTTOM](ctx),
    globalModals: cond[LAYOUT_COMPONENTS.GLOBAL_MODALS](ctx),
  }), [ctx.currentPage]); // eslint-disable-line

  return (
    <>
      <Black />
      <PageTTS />
      {render.step && <Step />}
      {render.main && children}
      {render.summary && <Summary />}
      {render.bottom && <Bottom />}
      {render.globalModals && <GlobalModals />}
    </>
  );
};

// 페이지 렌더링 컴포넌트
const AppContent = () => {
  const { currentPage, setCurrentPage, totalMenuItems, setQuantities, setIsDark, setVolume, setIsLarge, setIsLow } = useContext(AppContext);
  const { containerRef } = useFocusTrap(true, { autoFocus: false, restoreFocus: false });

  const resetOrder = useCallback(() => {
    if (!totalMenuItems?.length) return;
    setQuantities(totalMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
    setIsDark(false); setVolume(1); setIsLarge(false); setIsLow(false);
  }, [totalMenuItems, setQuantities, setIsDark, setVolume, setIsLarge, setIsLow]);

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
