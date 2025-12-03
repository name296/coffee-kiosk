import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, createContext, useContext, memo } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import menuData from "./menuData";

// Components

import Icon, { 
  TakeinIcon, TakeoutIcon, DeleteIcon, ResetIcon, OrderIcon,   AddIcon, PayIcon, HomeIcon, WheelchairIcon, ToggleIcon, StepIcon, TimeIcon } from "./Icon";

// ============================================================================
// 유틸리티
// ============================================================================

const safeLocalStorage = {
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
const safeParseInt = (v, d = 0) => {
  if (v == null || v === '') return d;
  const p = parseInt(v, 10);
  return isNaN(p) ? d : p;
};

const safeParseFloat = (v, d = 0) => {
  if (v == null || v === '') return d;
  const p = parseFloat(v);
  return isNaN(p) ? d : p;
};

const formatNumber = (n, l = 'ko-KR', o = {}) => {
  if (n == null || isNaN(n)) return '0';
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '0';
  try {
    return num.toLocaleString(l, { minimumFractionDigits: 0, maximumFractionDigits: 0, ...o });
  } catch {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

const safeQuerySelector = (s, c = null) => {
  try {
    if (typeof document === 'undefined') return null;
    return (c || document).querySelector(s);
  } catch { return null; }
};

const UNITS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
const TENS = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
const HUNDREDS = ["", "백", "이백", "삼백", "사백", "오백", "육백", "칠백", "팔백", "구백"];
const convertToKoreanQuantity = (num) => {
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

const SizeControlManager = {
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

function setViewportZoom() {
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

function setupViewportResize() {
  const h = () => setViewportZoom();
  window.addEventListener("resize", h);
  return () => window.removeEventListener("resize", h);
}

// ============================================================================
// 내부 상수 (Hooks/Contexts용)
// ============================================================================

// 공통 상수 (단일 정의)
const VOLUME_MAP = { 0: '끔', 1: '약', 2: '중', 3: '강' };
const VOLUME_VALUES = { 0: 0, 1: 0.5, 2: 0.75, 3: 1 };
const DEFAULT_ACCESSIBILITY = { isDark: false, isLow: false, isLarge: false, volume: 1 };

const CFG = {
  TTS_DELAY: 100,
  IDLE_TIMEOUT: 300000,
  INTRO_TTS_TIME: 180,
  PAGE_FIRST: 'ScreenStart',
  SOUNDS: { onPressed: './SoundOnPressed.mp3', note: './SoundNote.wav' },
  WEBVIEW_SUCCESS: 'SUCCESS',
  FOCUSABLE: ['button:not([disabled])', 'a[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'].join(', '),
};

const WEBVIEW = { PAY: 'PAY', PRINT: 'PRINT', CANCEL: 'CANCEL' };
const STORAGE = { ORDER_NUM: 'orderNumber' };

// 키보드 상수
const KEYBOARD = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape'
};
const PLACEHOLDER_MENU = { id: 0, name: "추가예정", price: "0", img: "item-americano.png" };

// TTS 스크립트
const TTS = {
  replay: "키패드 사용법 안내는 키패드의 별 버튼을, 직전 안내 다시 듣기는 샵 버튼을 누릅니다,",
  intro: "안녕하세요,장애인, 비장애인 모두 사용 가능한 무인주문기입니다,시각 장애인을 위한 음성 안내와 키패드를 제공합니다,키패드는 손을 아래로 뻗으면 닿는 조작부 영역에 있으며, 돌출된 점자 및 테두리로 자세한 위치를 파악할 수 있습니다,키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다,취식방식 선택입니다. 포장하기, 먹고가기 버튼 두 개가 있습니다,",
  screenStart: () => `안내, 시작 단계, 음식을 포장할지 먹고갈지 선택합니다.${TTS.replay}`,
  screenMenu: () => `안내, 선택 단계, 카테고리에서 메뉴종류를 선택하시고, 메뉴에서 상품을 선택합니다, 초기화 버튼으로 상품을 다시 선택할 수 있습니다, 주문하기 버튼으로 다음 단계, 내역확인으로 이동 할 수 있습니다, ${TTS.replay}`,
  screenDetails: () => `안내, 내역 확인, 주문목록에서 상품명, 수량, 가격을 확인합니다, 수량 버튼 및 삭제 버튼으로 주문목록을 수정 할 수 있습니다. 추가하기 버튼으로 이전 단계, 메뉴선택으로 돌아갈 수 있습니다, 결제하기 버튼으로 다음 단계, 결제선택으로 이동할 수 있습니다,${TTS.replay}`,
  screenPayments: (sum, fmt) => `안내, 결제 단계, 결제 금액, ${fmt(sum)}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ${TTS.replay}`,
  screenCardInsert: () => `안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ${TTS.replay}`,
  screenMobilePay: () => `안내, 모바일페이, 가운데 아래에 있는 카드리더기에 휴대전화의 모바일페이를 켜고 접근시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ${TTS.replay}`,
  screenSimplePay: () => `안내, 심플 결제, 오른쪽 아래에 있는 QR리더기에 QR코드를 인식시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ${TTS.replay}`,
  screenCardRemoval: () => `안내, 신용카드 제거, 신용카드를 뽑습니다, 정상적으로 결제되고 나서 카드가 제거되면, 자동으로 다음 작업, 인쇄 선택으로 이동합니다, ${TTS.replay}`,
  screenOrderComplete: () => `안내, 인쇄 선택, 결제되었습니다, 주문번호, 100번, 왼쪽 아래의 프린터에서 주문표를 받으시고, 영수증 출력을 선택합니다, 육십초 동안 조작이 없을 경우, 출력없이 사용 종료합니다,${TTS.replay}`,
  screenReceiptPrint: () => `안내, 영수증 출력, 왼쪽 아래의 프린터에서 영수증을 받습니다, 마무리하기 버튼으로 사용을 종료할 수 있습니다,${TTS.replay}`,
  screenFinish: `안내, 사용종료, 이용해주셔서 감사합니다,`,
  errorNoProduct: '없는 상품입니다.',
};

// 결제 단계
const PAY_STEP = { 
  SELECT_METHOD: 0, 
  CARD_INSERT: 1, 
  MOBILE_PAY: 2, 
  CARD_REMOVE: 3, 
  PRINT_SELECT: 4, 
  ORDER_PRINT: 5, 
  RECEIPT_PRINT: 6, 
  FINISH: 7 
};

// 타이머 (ms)
const TIMER_CONFIG = { AUTO_FINISH: 60000, FINAL_PAGE: 4000, TTS_DELAY: CFG.TTS_DELAY, ACTION_DELAY: 100, INTERVAL: 1000, IDLE: CFG.IDLE_TIMEOUT };

// 기본값
const DEFAULT_SETTINGS = { VOLUME: 1, IS_DARK: false, IS_LARGE: false, IS_LOW: false, SELECTED_TAB: '전체메뉴' };

// ============================================================================
// Hooks
// ============================================================================

const useBodyClass = (className, condition) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (condition) document.body.classList.add(className);
    else document.body.classList.remove(className);
    return () => document.body.classList.remove(className);
  }, [className, condition]);
};

// HTML 요소에 클래스 + font-size 스케일 적용 (CSS 변수 사용)
const useHtmlClass = (className, condition) => {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const scale = condition ? 1.2 : 1;
    
    // CSS 변수로 스케일 조정 (1 = 기본, 1.2 = 큰글씨)
    html.style.setProperty('--font-size-scale', scale);
    
    if (condition) {
      html.classList.add(className);
    } else {
      html.classList.remove(className);
    }
    console.log(`🎨 useHtmlClass: ${className}=${condition}, scale=${scale}`);
  }, [className, condition]);
};

const usePagination = (items, itemsPerPageNormal, itemsPerPageLow, isLow) => {
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

// useSafeDocument는 이제 useDOM으로 대체됨
const useSafeDocument = () => useDOM();

// 메뉴 데이터 훅 - 네스티드 구조 기반
const useMenuData = () => {
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
const useMenuUtils = () => {
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

const useOrderNumber = () => {
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

// ============================================================================
// TTS 관련 Context (단일책임원칙: 각 책임별 분리)
// ============================================================================

// TTS DB 관리
const TTSDBContext = createContext();
const TTSDBProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const dbName = 'TTSDatabase';
  const storeName = 'TTSStore';
  
  const initDB = useCallback(() => {
    return new Promise((res, rej) => {
      if (db) {
        res(db);
        return;
      }
      const r = indexedDB.open(dbName, 1);
      r.onerror = (e) => rej(e.target.errorCode);
      r.onsuccess = (e) => {
        const database = e.target.result;
        setDb(database);
        res(database);
      };
      r.onupgradeneeded = (e) => {
        const database = e.target.result;
        database.createObjectStore(storeName, { keyPath: 'key' });
        setDb(database);
      };
    });
  }, [db]);
  
  const getFromDB = useCallback(async (k) => {
    const database = db || await initDB();
    return new Promise((r) => {
      const t = database.transaction([storeName], 'readonly');
      const req = t.objectStore(storeName).get(k);
      req.onsuccess = (e) => r(e.target.result?.data || null);
      req.onerror = () => r(null);
    });
  }, [db, initDB]);
  
  const saveToDB = useCallback(async (k, d) => {
    const database = db || await initDB();
    return new Promise((r) => {
      const t = database.transaction([storeName], 'readwrite');
      t.objectStore(storeName).put({ key: k, data: d });
      t.oncomplete = r;
    });
  }, [db, initDB]);
  
  const value = useMemo(() => ({
    db,
    initDB,
    getFromDB,
    saveToDB
  }), [db, initDB, getFromDB, saveToDB]);
  
  return (
    <TTSDBContext.Provider value={value}>
      {children}
    </TTSDBContext.Provider>
  );
};
const useTTSDB = () => {
  const context = useContext(TTSDBContext);
  return {
    db: context?.db ?? null,
    initDB: context?.initDB ?? (async () => null),
    getFromDB: context?.getFromDB ?? (async () => null),
    saveToDB: context?.saveToDB ?? (async () => {})
  };
};

// TTS 재생 상태 관리
const TTSStateContext = createContext();
const TTSStateProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayText, setReplayText] = useState('');
  
  const value = useMemo(() => ({
    isPlaying,
    setIsPlaying,
    replayText,
    setReplayText
  }), [isPlaying, replayText]);
  
  return (
    <TTSStateContext.Provider value={value}>
      {children}
    </TTSStateContext.Provider>
  );
};
const useTTSState = () => {
  const context = useContext(TTSStateContext);
  return {
    isPlaying: context?.isPlaying ?? false,
    setIsPlaying: context?.setIsPlaying ?? (() => {}),
    replayText: context?.replayText ?? '',
    setReplayText: context?.setReplayText ?? (() => {})
  };
};

// 통합 hook (하위 호환성) - 개별 Context 사용
const useTTS = () => {
  const ttsDB = useContext(TTSDBContext);
  const ttsState = useContext(TTSStateContext);
  return useMemo(() => ({
    initDB: ttsDB?.initDB ?? (async () => null),
    getFromDB: ttsDB?.getFromDB ?? (async () => null),
    saveToDB: ttsDB?.saveToDB ?? (async () => {}),
    isPlaying: ttsState?.isPlaying ?? false,
    setIsPlaying: ttsState?.setIsPlaying ?? (() => {}),
    replayText: ttsState?.replayText ?? '',
    setReplayText: ttsState?.setReplayText ?? (() => {})
  }), [ttsDB, ttsState]);
};

// ============================================================================
// Sound Hook (TTSContext 사용)
// ============================================================================

const useSound = () => {
  // 로컬 ref 생성 (글로벌 ref 통합 관리 제거)
  const audioRefs = useRef({});
  const volumeRef = useRef(0.5);
  const globalAudioRefs = useRef(new Set());
  
  // 컴포넌트 마운트 시 audioRefs 등록, 언마운트 시 제거
  useEffect(() => {
    const refs = audioRefs.current;
    Object.values(refs).forEach(audio => {
      if (audio instanceof Audio) {
        globalAudioRefs.current.add(audio);
      }
    });
    
    return () => {
      Object.values(refs).forEach(audio => {
        if (audio instanceof Audio) {
          globalAudioRefs.current.delete(audio);
        }
      });
    };
  }, [globalAudioRefs]);
  
  const play = useCallback((name) => {
    const src = CFG.SOUNDS[name];
    if (!src) return;
    
    // onPressed 사운드는 재생 중단 제외
    if (name !== 'onPressed') {
      // 기존 모든 사운드 중단
      Object.values(audioRefs.current).forEach(audio => {
        if (audio instanceof Audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
    
    if (!audioRefs.current[name]) {
      const audio = new Audio(src);
      audioRefs.current[name] = audio;
      globalAudioRefs.current.add(audio);
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

// ============================================================================
// 유틸리티 함수 (Promise/이벤트)
// ============================================================================

// 이벤트가 발생할 때까지 대기하는 보편적인 유틸리티
const waitForEvent = (target, eventName, condition = null) => {
  // 조건이 이미 만족되면 즉시 resolve
  if (condition && condition(target)) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    const handler = (e) => {
      if (!condition || condition(target, e)) {
        resolve(e);
      }
    };
    target.addEventListener(eventName, handler, { once: true });
  });
};

// Audio 객체의 pause 완료를 기다리는 유틸리티
const waitForAudioPause = (audio) => {
  return waitForEvent(audio, 'suspend', (target) => target.readyState >= 2);
};

// 모든 오디오 재생 중단 함수 (useState/useEffect 기반)
const useStopAllAudio = () => {
  // 개별 Context에서 직접 가져오기 (Provider 계층 안전성)
  const { setIsPlaying } = useContext(TTSStateContext) || {};
  const globalAudioRefs = useRef(new Set());
  const [stopRequested, setStopRequested] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  
  // 오디오 중단 처리
  useEffect(() => {
    if (!stopRequested) return;
    
    const stopAll = async () => {
    // TTS 중단
    const ap = document.getElementById('audioPlayer');
    if (ap) {
      ap.pause();
      ap.currentTime = 0;
      await waitForAudioPause(ap);
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    
    // 사운드 중단 (모든 Audio 객체 정지)
    const pausePromises = Array.from(globalAudioRefs.current)
      .filter(audio => audio instanceof Audio)
      .map(audio => {
        audio.pause();
        audio.currentTime = 0;
        return waitForAudioPause(audio);
      });
    
    await Promise.all(pausePromises);
      
      setIsStopped(true);
      setStopRequested(false);
    };
    
    setIsStopped(false);
    stopAll();
  }, [stopRequested, setIsPlaying, globalAudioRefs]);
  
  const requestStop = useCallback(() => {
    setStopRequested(true);
  }, []);
  
  return { requestStop, isStopped };
};

function useTextHandler(volume) {
  // 개별 Context에서 직접 가져오기 (Provider 계층 안전성)
  const ttsDB = useContext(TTSDBContext) || {};
  const ttsState = useContext(TTSStateContext) || {};
  const initDB = ttsDB?.initDB;
  const getFromDB = ttsDB?.getFromDB;
  const saveToDB = ttsDB?.saveToDB;
  const isPlaying = ttsState?.isPlaying ?? false;
  const setIsPlaying = ttsState?.setIsPlaying ?? (() => {});
  const replayText = ttsState?.replayText ?? '';
  const setReplayText = ttsState?.setReplayText ?? (() => {});
  const { requestStop, isStopped } = useStopAllAudio();
  const [pendingText, setPendingText] = useState(null);
  const [pendingVol, setPendingVol] = useState(null);
  
  // 오디오 중단 완료 후 재생
  useEffect(() => {
    if (!isStopped || !pendingText) return;
    
    const playPending = async () => {
      const v = pendingVol !== -1 ? VOLUME_VALUES[pendingVol] : VOLUME_VALUES[volume];
      const text = pendingText;
      setPendingText(null);
      setPendingVol(null);
      
      await playText(text, 1, v, { getFromDB, saveToDB, isPlaying, setIsPlaying });
    };
    
    playPending();
  }, [isStopped, pendingText, pendingVol, volume, getFromDB, saveToDB, isPlaying, setIsPlaying]);
  
  const handleText = useCallback((txt, flag = true, newVol = -1) => {
    if (!txt) return;
    if (flag) setReplayText(txt);
    
    // 오디오 중단 요청하고 대기
    requestStop();
    setPendingText(txt);
    setPendingVol(newVol);
  }, [setReplayText, requestStop]);
  
  const handleReplayText = useCallback(() => {
    if (replayText) handleText(replayText, false);
  }, [handleText, replayText]);
  
  return { initDB, handleText, handleReplayText };
}

// TTS 재생 (외부 서버 우선, 폴백으로 브라우저 내장) - Context 기반
async function playText(text, speed, vol, { getFromDB, saveToDB, isPlaying, setIsPlaying }) {
  if (!text) return;
  
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
  setIsPlaying(true);
  
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
        setIsPlaying(false);
      };
    } else {
      useBrowserTTS(text, speed, vol);
      setIsPlaying(false);
    }
  } catch {
    useBrowserTTS(text, speed, vol);
    setIsPlaying(false);
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

// getFromDB, saveToDB, getDB는 TTSContext에서 관리됨

const useActiveElementTTS = (handleText, delay = CFG.TTS_DELAY, condition = true, shouldBlur = false) => {
  useEffect(() => {
    if (!condition) return;
    
    if (shouldBlur && typeof document !== 'undefined' && document.activeElement?.blur) {
      document.activeElement.blur();
    }
    
    const t = setTimeout(() => {
      if (typeof document !== 'undefined' && document.activeElement) {
        const el = document.activeElement;
        const elTts = el.dataset?.ttsText || '';
        const parentTts = el.parentElement?.dataset?.ttsText || '';
        const fullTts = parentTts + elTts;
        if (fullTts) handleText(fullTts);
      }
    }, delay);
    
    return () => clearTimeout(t);
  }, [handleText, delay, condition, shouldBlur]);
};

const formatRemainingTime = (ms) => {
  if (ms <= 0) return "00:00";
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const useIdleTimeout = (onTimeout, timeout = CFG.IDLE_TIMEOUT, enabled = true) => {
  // 로컬 ref 생성 (글로벌 ref 통합 관리 제거)
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const onTimeoutRef = useRef(null);
  const timeoutRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(timeout);
  
  // 초기값 설정
  if (lastActivityRef.current === null) lastActivityRef.current = Date.now();
  if (onTimeoutRef.current === null) onTimeoutRef.current = onTimeout;
  if (timeoutRef.current === null) timeoutRef.current = timeout;
  
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
    // 이벤트 리스너를 명시적으로 분리 (Step 컴포넌트 패턴)
    document.addEventListener('mousedown', resetTimer, { passive: true });
    document.addEventListener('keydown', resetTimer, { passive: true });
    document.addEventListener('touchstart', resetTimer, { passive: true });
    document.addEventListener('click', resetTimer, { passive: true });
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('mousedown', resetTimer);
      document.removeEventListener('keydown', resetTimer);
      document.removeEventListener('touchstart', resetTimer);
      document.removeEventListener('click', resetTimer);
    };
  }, [enabled, resetTimer]);
  
  return { resetTimer, remainingTime, remainingTimeFormatted: formatRemainingTime(remainingTime) };
};

// useAppIdleTimeout은 제거됨 - 로직이 ContextProvider 내부로 직접 이동됨

const usePaymentCountdown = ({
  step,
  onTimeout,
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
  // step에 따라 초기값 설정
  const getInitialCountdown = () => {
    if (step === PAY_STEP.FINISH) {
      return TIMER_CONFIG.FINAL_PAGE / 1000;
    } else if (step === PAY_STEP.PRINT_SELECT || step === PAY_STEP.RECEIPT_PRINT) {
      return TIMER_CONFIG.AUTO_FINISH / 1000;
    }
    return 60;
  };
  
  const [countdown, setCountdown] = useState(getInitialCountdown());
  // 로컬 ref 생성 (글로벌 ref 통합 관리 제거)
  const timerRef = useRef(null);
  const callbacksRef = useRef({});
  
  // 초기값 설정
  callbacksRef.current = { onTimeout, ModalReturn, ModalAccessibility, setQuantities, totalMenuItems, setIsDark, setVolume, setIsLarge, setIsLow, setCurrentPage };
  
  // 콜백 refs 업데이트
  useEffect(() => {
    callbacksRef.current = { onTimeout, ModalReturn, ModalAccessibility, setQuantities, totalMenuItems, setIsDark, setVolume, setIsLarge, setIsLow, setCurrentPage };
  }, [onTimeout, ModalReturn, ModalAccessibility, setQuantities, totalMenuItems, setIsDark, setVolume, setIsLarge, setIsLow, setCurrentPage]);
  
  useEffect(() => {
    // 기존 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 인쇄 선택 또는 영수증 단계
    if (step === PAY_STEP.PRINT_SELECT || step === PAY_STEP.RECEIPT_PRINT) {
      const autoFinishSeconds = TIMER_CONFIG.AUTO_FINISH / 1000;
      const resetCountdown = () => setCountdown(autoFinishSeconds);
      setCountdown(autoFinishSeconds);
      
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            if (callbacksRef.current.onTimeout) callbacksRef.current.onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, TIMER_CONFIG.INTERVAL);
      
      // 사용자 입력 시 카운트다운 리셋
      window.addEventListener('keydown', resetCountdown);
      window.addEventListener('click', resetCountdown);
      
      return () => {
        window.removeEventListener('keydown', resetCountdown);
        window.removeEventListener('click', resetCountdown);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
    
    // 완료 단계
    if (step === PAY_STEP.FINISH) {
      const finalPageSeconds = TIMER_CONFIG.FINAL_PAGE / 1000;
      setCountdown(finalPageSeconds);
      
      // 카운트다운 감소 함수
      const tick = () => {
        setCountdown(prev => {
          const next = prev - 1;
          if (next <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            // 체크(✓) 표시 후 1초 더 기다린 후 상태 초기화
            setTimeout(() => {
              const cb = callbacksRef.current;
              // 모달 닫기 및 상태 초기화
              cb.ModalReturn.close();
              cb.ModalAccessibility.close();
              cb.setQuantities(cb.totalMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
              cb.setIsDark(false);
              cb.setVolume(1);
              cb.setIsLarge(false);
              cb.setIsLow(false);
              cb.setCurrentPage('ScreenStart');
            }, TIMER_CONFIG.INTERVAL); // 1초(1000ms) 대기
            return 0;
          }
          return next;
        });
      };
      
      // 1초 후 첫 감소 시작, 그 다음부터 1초마다 감소 (4→3→2→1→✓ 총 5초)
      timerRef.current = setInterval(tick, TIMER_CONFIG.INTERVAL);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step]);
  
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
const ACTUAL_GAP_THRESHOLD = 500; // 실제 렌더링 간격이 이 값 초과하면 compact 모드

const useCategoryPagination = (items, isLarge = false) => {
  // 로컬 ref 생성 (글로벌 ref 통합 관리 제거)
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
  
  // isLarge 변경 추적 (페이지 리셋용) - RefContext에서 가져오기
  const refsData = useContext(RefContext);
  const prevIsLargeRef = refsData.refs.useCategoryPagination.prevIsLargeRef;
  const lastWidthRef = refsData.refs.useCategoryPagination.lastWidthRef; // 이전 버튼 폭 저장
  const isCalculatingRef = refsData.refs.useCategoryPagination.isCalculatingRef; // 계산 중 플래그 (무한루프 방지)
  
  // 초기값 설정
  if (prevIsLargeRef && prevIsLargeRef.current === null) prevIsLargeRef.current = isLarge;
  if (lastWidthRef && lastWidthRef.current === null) lastWidthRef.current = 0;
  if (isCalculatingRef && isCalculatingRef.current === null) isCalculatingRef.current = false;
  
  // 계산 함수
  const calculate = useCallback(() => {
    if (!measureRef.current || !containerRef.current) return;
    
    const isLargeChanged = prevIsLargeRef?.current !== isLarge;
    if (prevIsLargeRef) prevIsLargeRef.current = isLarge;
    
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
      if (isCalculatingRef?.current) return;
      
      const newWidth = entries[0]?.contentRect.width || 0;
      // 폭이 변경되었을 때만 재계산
      if (lastWidthRef && Math.abs(newWidth - (lastWidthRef.current || 0)) > 1) {
        console.log(`🔄 버튼 크기 변경 감지: ${lastWidthRef.current}px → ${newWidth}px`);
        lastWidthRef.current = newWidth;
        // 뷰포트 리사이즈 이벤트 강제 발생 → 렌더링 트리거
        if (isCalculatingRef) isCalculatingRef.current = true;
        window.dispatchEvent(new Event('resize'));
        // 다음 프레임에서 플래그 해제
        requestAnimationFrame(() => {
          if (isCalculatingRef) isCalculatingRef.current = false;
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

const useFocusTrap = (isActive, options = {}) => {
  const { autoFocus = true, restoreFocus = true } = options;
  // useContext(ContextBase) 대신 로컬 ref 생성 (ContextProvider 밖에서도 작동)
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

const useAccessibilitySettings = (initialSettings = DEFAULT_ACCESSIBILITY) => {
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

// ============================================================================
// Timer Context (전역 타이머 상태를 React 생명주기로 관리)
// ============================================================================

const applyButtonMinSide = (btn) => {
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

// 버튼 액션 핸들러 (단순화 - 필요한 함수만 추출)
const useButtonAction = (actionType, actionTarget, actionMethod, disabled, buttonLabel, buttonIcon) => {
  const ui = useContext(RouteContext);
  const order = useContext(OrderContext);
  const modal = useContext(ModalContext);

  return useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    
    if (actionType === 'navigate') {
      ui.setCurrentPage(actionTarget);
      return;
    }
    
    if (actionType === 'selectTab') {
      if (actionTarget && order.selectedTab !== actionTarget) {
        order.setSelectedTab(actionTarget);
      }
      return;
    }
    
    if (actionType === 'payment') {
      if (actionMethod) {
        order.sendOrderDataToApp(actionMethod);
        const targetPage = actionMethod === "card" ? 'ScreenCardInsert' : 'ScreenMobilePay';
        ui.setCurrentPage(targetPage);
      }
      return;
    }
    
    if (actionType === 'cancel') {
      if (actionTarget) {
        ui.setCurrentPage(actionTarget);
      } else {
        order.sendCancelPayment();
      }
      return;
    }
    
    if (actionType === 'receipt') {
      if (actionTarget === 'print') {
        order.sendPrintReceiptToApp();
      }
      return;
    }
    
    if (actionType === 'finish') {
      return;
    }
    
    if (actionType === 'tabNav') {
      if (actionTarget === 'prev') {
        order.handlePreviousTab();
      } else {
        order.handleNextTab();
      }
      return;
    }
    
    if (actionType === 'categoryNav') {
      order.handleCategoryPageNav(actionTarget);
      return;
    }
    
    if (actionType === 'modal') {
      if (actionTarget) {
        modal[`Modal${actionTarget}`].open(buttonLabel, buttonIcon);
      }
      return;
    }
  }, [disabled, actionType, actionTarget, actionMethod, buttonLabel, buttonIcon, ui, order, modal]);
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
  pressed: pressedProp = false,
  pointed = false,
  toggle = false,
  value,
  selectedValue,
  onChange,
  navigate,
  payment,
  actionType,
  actionTarget,
  actionMethod,
  onClick,
  onPressed,
  onPointed,
  ttsText,
  ...rest
}) => {
  // 공통 패턴 프롭화: navigate와 payment를 actionType/actionTarget으로 변환
  const finalActionType = navigate ? 'navigate' : payment ? 'payment' : actionType;
  const finalActionTarget = navigate || actionTarget;
  const finalActionMethod = payment || actionMethod;
  // 각 Button 인스턴스마다 자체 ref 생성
  const btnRef = useRef(null);
  const [isPressing, setIsPressing] = useState(false);
  const prevParentRef = useRef(null);
  const prevButtonRef = useRef(null);
  const [internalPointed, setInternalPointed] = useState(pointed);
  const isPressingRef = useRef(false);
  // 호버를 포커스로 치환: 호버가 들어오면 포커스로 변환되므로 포커스만 관리
  const [isFocused, setIsFocused] = useState(false);
  const wasPointedBeforePressRef = useRef(false);
  
  // 전역 포인티드 관리를 위한 Context 사용
  const pointedButtonContext = useContext(PointedButtonContext);
  const buttonIdRef = useRef(Math.random().toString(36).substr(2, 9));
  const buttonId = buttonIdRef.current;
  
  // pressed 계산: value와 selectedValue가 제공되면 자동 계산, 아니면 pressed prop 사용
  // useEffect보다 먼저 선언되어야 함
  const pressed = useMemo(() => {
    if (value !== undefined && selectedValue !== undefined) {
      return value === selectedValue;
    }
    return pressedProp;
  }, [value, selectedValue, pressedProp]);
  
  // pointed prop이 변경되면 내부 상태 동기화
  useEffect(() => {
    if (pointed) {
      setInternalPointed(true);
    }
  }, [pointed]);
  
  useEffect(() => {
    isPressingRef.current = isPressing;
  }, [isPressing]);
  
  // 포인티드 상태 관리: 호버는 계속 입력이 들어오므로 자연스럽게 포인티드 유지
  // 호버 입력이 없을 때만 포커스로 포인티드 가능
  // press 입력을 해도 포인티드는 유지되어야 함
  useEffect(() => {
    if (!pointedButtonContext) return;
    
    // 호버를 포커스로 치환: 포커스가 있으면 포인티드
    if (isFocused) {
      wasPointedBeforePressRef.current = true;
      
      // 다른 버튼이 포인티드되어 있으면 해제
      if (pointedButtonContext.pointedButtonId !== buttonId) {
        if (pointedButtonContext.pointedButtonId) {
          pointedButtonContext.clearPointed(pointedButtonContext.pointedButtonId);
        }
      }
      pointedButtonContext.setPointed(buttonId);
      setInternalPointed(true);
      onPointed?.(true);
      return;
    }
    
    // 포커스가 없을 때: pressing/pressed 상태이고 이전에 포인티드였으면 포인티드 유지
    if ((isPressing || pressed) && wasPointedBeforePressRef.current) {
      if (pointedButtonContext.pointedButtonId !== buttonId) {
        if (pointedButtonContext.pointedButtonId) {
          pointedButtonContext.clearPointed(pointedButtonContext.pointedButtonId);
        }
      }
      pointedButtonContext.setPointed(buttonId);
      setInternalPointed(true);
      onPointed?.(true);
      return;
    }
    
    // 포커스/pressing 모두 없으면 포인티드 해제
    if (pointedButtonContext.pointedButtonId === buttonId) {
      pointedButtonContext.clearPointed(buttonId);
    }
    setInternalPointed(false);
    wasPointedBeforePressRef.current = false;
    onPointed?.(false);
  }, [isFocused, isPressing, pressed, onPointed, pointedButtonContext, buttonId]);
  
  // 다른 버튼이 포인티드되었을 때 이 버튼의 포인티드 해제
  // Context의 pointedButtonId와 현재 buttonId를 비교하여 포인티드 여부 결정
  useEffect(() => {
    if (!pointedButtonContext) return;
    const shouldBePointed = pointedButtonContext.pointedButtonId === buttonId;
    if (!shouldBePointed && internalPointed) {
      setInternalPointed(false);
      wasPointedBeforePressRef.current = false;
      onPointed?.(false);
    } else if (shouldBePointed && !internalPointed) {
      // Context에서 이 버튼이 포인티드로 설정되었지만 내부 상태가 아니면 동기화
      setInternalPointed(true);
      onPointed?.(true);
    }
  }, [pointedButtonContext?.pointedButtonId, buttonId, internalPointed, onPointed]);
  
  // svg에서 아이콘 이름 추출 (HomeIcon -> "Home")
  const getIconNameFromSvg = useMemo(() => {
    if (!svg || typeof svg !== 'object') return null;
    const componentName = svg.type?.name || '';
    if (componentName.endsWith('Icon')) {
      return componentName.replace('Icon', '');
    }
    return null;
  }, [svg]);
  
  const buttonIcon = getIconNameFromSvg;
  const buttonLabel = label;
  
  const handleAction = useButtonAction(finalActionType, finalActionTarget, finalActionMethod, disabled, buttonLabel, buttonIcon);

  useLayoutEffect(() => { if (btnRef.current) applyButtonMinSide(btnRef.current); }, []);

  // TTS 텍스트: ttsText가 없으면 label 사용, 토글 버튼일 때는 상태 텍스트 자동 추가
  const finalTtsText = useMemo(() => {
    // ttsText가 없으면 label 사용
    const baseText = ttsText || label || '';
    
    if (!baseText) return '';
    
    // disabled 상태 텍스트 제거 (자동 추가할 예정)
    let cleanedText = baseText
      .replace(/\s*비활성\s*,?\s*/g, '')
      .trim();
    
    if (toggle) {
      // 토글 버튼: baseText + 상태 텍스트 자동 추가
      const statusText = pressed ? '선택됨, ' : '선택가능, ';
      // 기존 상태 텍스트 제거 후 새로 추가 (항상 현재 상태 반영)
      cleanedText = cleanedText
        .replace(/\s*선택됨\s*,\s*/g, '')
        .replace(/\s*선택가능\s*,\s*/g, '')
        .trim();
      const result = cleanedText ? `${cleanedText}, ${statusText}` : statusText;
      // disabled면 마지막에 비활성 추가
      return disabled ? `${result}비활성, ` : result;
    }
    
    // 일반 버튼: disabled면 "비활성" 추가
    return disabled ? `${cleanedText}, 비활성, ` : cleanedText;
  }, [ttsText, label, toggle, pressed, disabled]);
  
  // 포인티드 상태일 때 TTS 및 사운드 재생 (부모 또는 버튼이 바뀔 때마다)
  // Context를 통해 포인티드 여부 결정 (화면에 포인티드는 하나만)
  const finalPointed = useMemo(() => {
    if (!pointedButtonContext) return pointed || internalPointed;
    return pointedButtonContext.pointedButtonId === buttonId;
  }, [pointedButtonContext?.pointedButtonId, buttonId, pointed, internalPointed]);
  useEffect(() => {
    if (!finalPointed || !btnRef.current) return;
    const btn = btnRef.current;
    const parent = btn.parentElement;
    const currentParent = parent?.closest('[data-tts-text]');
    
    // 부모도 안 바뀌고 버튼도 안 바뀌면 재생하지 않음
    if (currentParent === prevParentRef.current && btn === prevButtonRef.current) return;
    
    prevParentRef.current = currentParent;
    prevButtonRef.current = btn;
    
    // 사운드 재생
    if (!disabled && typeof window !== 'undefined' && window.__playSound) {
      window.__playSound('onPressed');
    }
    
    // 전역 핸들러를 통해 TTS 재생
    const parentTts = currentParent?.dataset?.ttsText || '';
    const btnTts = finalTtsText || '';
    if ((parentTts || btnTts) && typeof window !== 'undefined' && window.__finalHandleText) {
      window.__finalHandleText(parentTts + btnTts);
    }
  }, [finalPointed, finalTtsText, disabled]);

  // pressed: 눌린/선택된 상태 (토글 ON)
  // pointed: 포커스/호버 상태 (강조 테두리) - 동시 적용 가능 (pressed 상태에서도 유지)
  const cls = useMemo(() => {
    const c = ['button'];
    if (!/primary[123]|secondary[123]/.test(className)) c.push('primary2');
    if (toggle) c.push('toggle');
    if (pressed || (isPressing && !toggle)) c.push('pressed');
    if (isPressing) c.push('pressing'); // 누르는 순간에만 적용
    if (finalPointed) c.push('pointed'); // pressed 상태에서도 포인티드 유지
    if (className) c.push(className);
    return c.join(' ');
  }, [className, toggle, pressed, finalPointed, isPressing]);

  const onStart = useCallback((e) => {
    if (disabled || (e.type === 'keydown' && !isActionKey(e))) return;
    if (e.type === 'keydown') {
      e.preventDefault();
      // 키보드 입력 시작 시 전역 플래그 설정 (포커스 보호용)
      if (typeof window !== 'undefined') {
        window.__isKeyboardInputActive = true;
      }
    }
    setIsPressing(true); // 모든 버튼에 적용
    onPressed?.(true); // pressed 상태 시작
    
    // onPressStart (mousedown/touchstart/keydown) 시 사운드 재생
    if (!disabled && typeof window !== 'undefined' && window.__playSound) {
      window.__playSound('onPressed');
    }
  }, [disabled, onPressed]);

  const onEnd = useCallback((e) => {
    if (disabled || (e.type === 'keyup' && !isActionKey(e))) return;
    if (e.type === 'keyup' || e.type === 'touchend') e.preventDefault();
    setIsPressing(false); // 모든 버튼에 적용
    onPressed?.(false); // pressed 상태 해제
    
    // onChange가 있고 selectedValue가 제공되면 onChange(selectedValue) 호출
    if (onChange && selectedValue !== undefined) {
      onChange(selectedValue);
    } else if (finalActionType) {
      handleAction(e);
    } else {
      onClick?.(e);
    }
    
    // 입력 후에도 포커스 유지 (키보드 입력의 경우)
    if (e.type === 'keyup' && btnRef.current) {
      // 키보드 입력 완료 시 전역 플래그 해제 (포커스 보호 해제)
      if (typeof window !== 'undefined') {
        window.__isKeyboardInputActive = false;
      }
      
      // 포커스가 없으면 다시 포커스 설정
      if (document.activeElement !== btnRef.current) {
        requestAnimationFrame(() => {
          if (btnRef.current && !disabled) {
            btnRef.current.focus();
            setIsFocused(true);
          }
        });
      }
    }
  }, [disabled, finalActionType, handleAction, onClick, onChange, selectedValue, onPressed]);

  return (
    <button
      ref={btnRef}
      className={cls}
      style={style}
      data-tts-text={finalTtsText}
      data-react-handler="true"
      aria-disabled={disabled}
      aria-pressed={toggle ? pressed : undefined}
      tabIndex={disabled ? 0 : undefined}
      onMouseDown={onStart}
      onMouseUp={onEnd}
      onMouseEnter={() => {
        // 호버를 포커스로 치환: 탭 키 포커스와 동일한 브라우저 기본 메커니즘 사용
        // 브라우저가 자동으로 이전 포커스를 해제하므로 하나만 존재하게 됨 (탭 포커스와 동일)
        if (btnRef.current) {
          const isKeyboardInputActive = typeof window !== 'undefined' ? window.__isKeyboardInputActive : false;
          if (!isKeyboardInputActive) {
            // 탭 키 포커스와 동일한 방식: 브라우저 기본 포커스 메커니즘 사용
            // focus() 호출 = 탭 키와 동일하게 브라우저가 하나의 포커스만 유지
            btnRef.current.focus();
          }
        }
      }}
      onMouseLeave={() => {
        // 호버가 나가도 포커스는 유지 (호버를 포커스로 치환했으므로 포커스 유지)
        // 다른 버튼으로 호버가 이동했다면 그 버튼의 onMouseEnter가 포커스를 설정할 것
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // 다른 요소로 포커스가 이동한 경우에만 포커스 해제
        const relatedTarget = e.relatedTarget;
        const isFocusMovingToChild = relatedTarget && btnRef.current?.contains(relatedTarget);
        
        if (!isFocusMovingToChild) {
          setIsFocused(false);
          // 포커스 해제 시 Context에서 포커스 상태 해제
          if (pointedButtonContext) {
            pointedButtonContext.clearPointed(buttonId);
          }
        }
      }}
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
    cancelIcon: "Cancel",
    cancelLabel: "취소",
    confirmIcon: "Ok",
    confirmLabel: "확인",
    message: (H) => <><p>내역이 없으면 <H>메뉴선택</H>으로 돌아갑니다</p><p>계속 진행하시려면 <H>확인</H> 버튼을 누르세요</p></>,
  },
  delete: {
    tts: "알림, 상품삭제, 주문 상품을 삭제합니다, 계속 진행하시려면 삭제 버튼을 누릅니다, ",
    icon: "GraphicTrash",
    title: "삭제",
    cancelIcon: "Cancel",
    cancelLabel: "취소",
    confirmIcon: "Delete",
    confirmLabel: "삭제",
    message: (H) => <><p>주문 상품을 <H>삭제</H>합니다</p><p>계속 진행하시려면 <H>삭제</H> 버튼을 누릅니다</p></>,
  },
  reset: {
    tts: "알림, 초기화, 주문 내역을 초기화합니다, 계속 진행하시려면 초기화 버튼을 누릅니다, ",
    icon: "GraphicReset",
    title: "초기화",
    cancelIcon: "Cancel",
    cancelLabel: "취소",
    confirmIcon: "Reset",
    confirmLabel: "초기화",
    message: (H) => <><p>주문 내역을 <H>초기화</H>합니다</p><p>계속 진행하시려면 <H>초기화</H> 버튼을 누릅니다</p></>,
  },
  return: {
    tts: "알림, 처음으로, 시작화면으로 이동합니다, 계속 진행하시려면 처음으로 버튼을 누릅니다,",
    icon: "GraphicHome",
    title: "처음으로",
    cancelIcon: "Cancel",
    cancelLabel: "취소",
    confirmIcon: "Ok",
    confirmLabel: "처음으로",
    message: (H) => <><p><H>시작화면</H>으로 이동합니다</p><p>계속 진행하시려면 <H>처음으로</H> 버튼을 누릅니다</p></>,
  },
  call: {
    tts: "알림, 직원 호출, 직원을 호출합니다, 계속 진행하시려면 호출 버튼을 누릅니다,",
    icon: "GraphicCall",
    title: "직원 호출",
    cancelIcon: "Cancel",
    cancelLabel: "취소",
    confirmIcon: "Call",
    confirmLabel: "호출",
    message: (H) => <><p>직원을 <H>호출</H>합니다</p><p>계속 진행하시려면 <H>호출</H> 버튼을 누릅니다</p></>,
  },
  timeout: {
    tts: "알림, 시간연장, 사용시간이 20초 남았습니다, 계속 사용하시려면 연장 버튼을 누릅니다, ",
    icon: "Extention",
    title: "시간연장",
    cancelIcon: "Home",
    cancelLabel: "시작화면",
    confirmIcon: "Extention",
    confirmLabel: "연장",
    message: (H) => <><p>사용시간이 <H>20초</H> 남았습니다</p><p>계속 사용하시려면 <H>연장</H> 버튼을 누릅니다</p></>,
  },
  paymentError: {
    tts: "알림, 결제 경고, 카드가 잘못 삽입되었습니다, 카드를 제거하시고 다시결제 버튼을 누릅니다, ",
    icon: "GraphicWarning",
    title: "결제 경고",
    cancelIcon: null,
    cancelLabel: null,
    confirmIcon: "Warning",
    confirmLabel: "다시결제",
    confirmButtonStyle: "delete",
    message: (H) => <><p>카드가 <H>잘못 삽입</H>되었습니다</p><p>카드를 제거하시고</p><p><H>다시결제</H> 버튼을 누릅니다</p></>,
  },
};

// 공통 모달 베이스 (컨텍스트 기반)
const BaseModal = memo(({ isOpen, type, onCancel, onConfirm, cancelLabel, cancelIcon, confirmIcon, confirmLabel, customContent, customTts, icon: customIcon, title: customTitle }) => {
  // RefContext와 AccessibilityContext에서 값 가져오기
  const refsData = useContext(RefContext);
  const accessibility = useContext(AccessibilityContext);
  const hiddenModalPageButtonRef = refsData.refs.BaseModal.hiddenModalPageButtonRef;
  const modalConfirmButtonsRef = refsData.refs.BaseModal.modalConfirmButtonsRef;
  const volume = accessibility.volume;
  const { handleText } = useTextHandler(volume);
  const { containerRef } = useFocusTrap(isOpen);
  
  const config = MODAL_CONFIG[type];
  
  // customContent가 있으면 config 없이도 작동 가능
  if (!isOpen || (!config && !customContent)) return null;
  
  // customContent 사용 시 또는 config 사용 시
  const finalIcon = customIcon || config?.icon;
  const finalTitle = customTitle || config?.title;
  const finalTts = customTts || config?.tts;
  const finalCancelLabel = cancelLabel !== undefined ? cancelLabel : (config?.cancelLabel ?? "취소");
  const finalCancelIcon = cancelIcon || config?.cancelIcon || "Cancel";
  const finalConfirmIcon = confirmIcon || finalIcon || config?.confirmIcon || "Ok";
  const finalConfirmLabel = confirmLabel || finalTitle || config?.confirmLabel || "확인";
  
  // 모달 열릴 때 TTS 안내
  useEffect(() => {
    if (isOpen && finalTts) {
      const t = setTimeout(() => handleText(finalTts + TTS.replay), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [isOpen, finalTts, TTS.replay, handleText]);
  
  return (
    <>
      <div className="hidden-div" ref={hiddenModalPageButtonRef}>
        <button type="hidden" autoFocus className="hidden-btn" data-tts-text={(finalTts || '') + TTS.replay} />
      </div>
      <div className="modal-overlay">
        <div className="modal-content" ref={containerRef}>
          <div className="up-content">
            {finalIcon && <Icon name={finalIcon} className="modal-image" />}
            {finalTitle && <div className="modal-title">{finalTitle}</div>}
          </div>
          <div className="down-content">
            {customContent || (
              <>
            <div className="modal-message">{config.message(H)}</div>
                <div data-tts-text={finalCancelLabel ? "작업관리, 버튼 두 개," : "작업관리, 버튼 한 개,"} ref={modalConfirmButtonsRef} className="task-manager">
                  {finalCancelLabel && (
                    <Button 
                      className="w285h090" 
                      svg={<Icon name={finalCancelIcon} />} 
                      label={finalCancelLabel} 
                      onClick={onCancel} 
                    />
                  )}
                  <Button 
                    className={`w285h090 ${config.confirmButtonStyle === 'delete' ? 'delete-item' : ''}`} 
                    svg={<Icon name={finalConfirmIcon} />} 
                    label={finalConfirmLabel} 
                    onClick={onConfirm} 
                  />
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
BaseModal.displayName = 'BaseModal';

// 수량 리셋 유틸
const useResetQuantities = () => {
  const order = useContext(OrderContext);
  return useCallback(() => {
    const reset = {};
    order?.totalMenuItems?.forEach(i => { reset[i.id] = 0; });
    order?.setQuantities?.(reset);
  }, [order]);
};

// readCurrentPage helper hook - Context에서 값 읽고 useTextHandler 사용
const useReadCurrentPage = () => {
  const ui = useContext(RouteContext);
  const accessibility = useContext(AccessibilityContext);
  const order = useContext(OrderContext);
  const volume = accessibility.volume;
  const { handleText } = useTextHandler(volume);
  
  return useCallback(() => {
    const pageText = (() => {
      switch (ui.currentPage) {
        case 'ScreenStart': return TTS.screenStart();
        case 'ScreenMenu': return TTS.screenMenu();
        case 'ScreenDetails': return TTS.screenDetails();
        case 'ScreenPayments': {
          const totalSum = order.totalSum;
          return totalSum ? TTS.screenPayments(totalSum, formatNumber) : '';
        }
        default: return '';
      }
    })();
    if (pageText) handleText(pageText);
  }, [ui.currentPage, order.totalSum, handleText]);
};

// resetOrder helper hook
const useResetOrder = () => {
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  return useCallback(() => {
    const reset = {};
    order.totalMenuItems.forEach(item => { reset[item.id] = 0; });
    order.setQuantities(reset);
    accessibility.setIsDark(false);
    accessibility.setVolume(0.5);
    accessibility.setIsLarge(false);
    accessibility.setIsLow(false);
  }, [order, accessibility]);
};

// 개별 모달들 (개별 Context 사용)
const DeleteCheckModal = ({ handleDelete, id }) => {
  const modal = useContext(ModalContext);
  const ui = useContext(RouteContext);
  const readCurrentPage = useReadCurrentPage();
  const ModalDeleteCheck = modal?.ModalDeleteCheck || { isOpen: false, close: () => {} };
  const setCurrentPage = ui?.setCurrentPage || (() => {});
  const close = useCallback(() => { ModalDeleteCheck.close(); readCurrentPage(); }, [ModalDeleteCheck, readCurrentPage]);
  const confirm = useCallback(() => { handleDelete(id); ModalDeleteCheck.close(); setCurrentPage('ScreenDetails'); }, [id, handleDelete, ModalDeleteCheck, setCurrentPage]);
  return <BaseModal isOpen={ModalDeleteCheck.isOpen} type="deleteCheck" onCancel={close} onConfirm={confirm} />;
};

const DeleteModal = ({ handleDelete, id }) => {
  const modal = useContext(ModalContext);
  const readCurrentPage = useReadCurrentPage();
  const ModalDelete = modal?.ModalDelete || { isOpen: false, close: () => {} };
  const close = useCallback(() => { ModalDelete.close(); readCurrentPage(); }, [ModalDelete, readCurrentPage]);
  const confirm = useCallback(() => { handleDelete(id); ModalDelete.close(); readCurrentPage(); }, [id, handleDelete, ModalDelete, readCurrentPage]);
  return <BaseModal isOpen={ModalDelete.isOpen} type="delete" onCancel={close} onConfirm={confirm} />;
};

const ResetModal = () => {
  const modal = useContext(ModalContext);
  const ui = useContext(RouteContext);
  const resetQty = useResetQuantities();
  const readCurrentPage = useReadCurrentPage();
  const ModalReset = modal?.ModalReset || { isOpen: false, close: () => {} };
  const setCurrentPage = ui?.setCurrentPage || (() => {});
  const close = useCallback(() => { ModalReset.close(); readCurrentPage(); }, [ModalReset, readCurrentPage]);
  const confirm = useCallback(() => { resetQty(); ModalReset.close(); setCurrentPage('ScreenMenu'); readCurrentPage(); }, [resetQty, ModalReset, setCurrentPage, readCurrentPage]);
  return <BaseModal isOpen={ModalReset.isOpen} type="reset" onCancel={close} onConfirm={confirm} />;
};

const ReturnModal = () => {
  const modal = useContext(ModalContext);
  const ui = useContext(RouteContext);
  const resetQty = useResetQuantities();
  const ModalReturn = modal?.ModalReturn || { isOpen: false, close: () => {}, buttonLabel: null, buttonIcon: null };
  const setCurrentPage = ui?.setCurrentPage || (() => {});
  const close = useCallback(() => { ModalReturn.close(); }, [ModalReturn]);
  const confirm = useCallback(() => { resetQty(); ModalReturn.close(); setCurrentPage('ScreenStart'); }, [resetQty, ModalReturn, setCurrentPage]);
  const buttonLabel = ModalReturn.buttonLabel;
  const buttonIcon = ModalReturn.buttonIcon;
  const config = MODAL_CONFIG.return;
  return <BaseModal isOpen={ModalReturn.isOpen} type="return" icon={buttonIcon || undefined} title={buttonLabel || undefined} confirmIcon={config.confirmIcon} confirmLabel={config.confirmLabel} onCancel={close} onConfirm={confirm} />;
};

const CallModal = () => {
  const modal = useContext(ModalContext);
  const readCurrentPage = useReadCurrentPage();
  const ModalCall = modal?.ModalCall || { isOpen: false, close: () => {} };
  const close = useCallback(() => { ModalCall.close(); readCurrentPage(); }, [ModalCall, readCurrentPage]);
  return <BaseModal isOpen={ModalCall.isOpen} type="call" onCancel={close} onConfirm={close} />;
};

const TimeoutModal = () => {
  const modal = useContext(ModalContext);
  const ui = useContext(RouteContext);
  const resetOrder = useResetOrder();
  const readCurrentPage = useReadCurrentPage();
  const ModalTimeout = modal?.ModalTimeout || { isOpen: false, close: () => {} };
  const setCurrentPage = ui?.setCurrentPage || (() => {});
  const close = useCallback(() => { 
    ModalTimeout.close(); 
    resetOrder();
    setCurrentPage('ScreenStart');
  }, [ModalTimeout, resetOrder, setCurrentPage]);
  const extend = useCallback(() => { 
    ModalTimeout.close(); 
    readCurrentPage(); 
  }, [ModalTimeout, readCurrentPage]);
  return <BaseModal isOpen={ModalTimeout.isOpen} type="timeout" onCancel={close} onConfirm={extend} />;
};

const PaymentErrorModal = () => {
  const modal = useContext(ModalContext);
  const ui = useContext(RouteContext);
  const readCurrentPage = useReadCurrentPage();
  const ModalPaymentError = modal?.ModalPaymentError || { isOpen: false, close: () => {} };
  const setCurrentPage = ui?.setCurrentPage || (() => {});
  const handleRePayment = useCallback(() => { 
    ModalPaymentError.close(); 
    setCurrentPage('ScreenPayments');
    readCurrentPage();
  }, [ModalPaymentError, setCurrentPage, readCurrentPage]);
  return <BaseModal isOpen={ModalPaymentError.isOpen} type="paymentError" cancelLabel={null} onCancel={handleRePayment} onConfirm={handleRePayment} />;
};

const useMultiModalButtonHandler = (options = {}) => {
  const {
    initFocusableSections = [],
    initFirstButtonSection = null,
    enableGlobalHandlers = true,
    handleTextOpt = null,
    prefixOpt = '',
    enableKeyboardNavigation = false,
    playSoundOpt = null
  } = options;
  
  const [, setFocusableSections] = useState(initFocusableSections);
  // 로컬 ref 생성 (글로벌 ref 통합 관리 제거)
  const handlersRef = useRef({});
  const keyboardNavState = useRef({ sections: {}, currentSection: null, currentIndex: -1 });
  
  // 초기값 설정
  if (Object.keys(handlersRef.current).length === 0) handlersRef.current = {};
  if (!keyboardNavState.current || Object.keys(keyboardNavState.current).length === 0) {
    keyboardNavState.current = {
    currentSectionIndex: 0,
    currentButtonIndex: 0,
    sections: initFocusableSections,
    firstButtonSection: initFirstButtonSection
    };
  }
  
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
  
  // 전역 핸들러를 window에 등록 (Button 컴포넌트에서 접근 가능하도록)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__finalHandleText = finalHandleText;
      if (playSoundOpt && typeof playSoundOpt === 'function') {
        window.__playSound = playSoundOpt;
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__finalHandleText;
        delete window.__playSound;
      }
    };
  }, [finalHandleText, playSoundOpt]);
  
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
        
        if (buttons[nextIndex]) {
          buttons[nextIndex].focus();
          // TTS는 focusin 이벤트에서 처리
        }
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
      
      if (action === 'add') {
        // data-react-handler가 있어도 사운드는 재생
        if (playSoundOpt && typeof playSoundOpt === 'function') {
          playSoundOpt('onPressed');
        }
        // pressed 클래스는 data-react-handler가 없을 때만 추가 (기존 동작 유지)
        if (btn.dataset.reactHandler !== 'true') {
          btn.classList.add('pressed');
        }
      } else if (action === 'remove' && btn.classList.contains('pressed')) {
        btn.classList.remove('pressed');
        if (btn.dataset.reactHandler !== 'true') {
        requestAnimationFrame(() => {
          if (btn instanceof HTMLElement && document.activeElement !== btn) {
            btn.focus();
          }
        });
        }
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
    
    // 버튼 포커스 시 TTS 재생 (마우스/키보드 공통)
    const handleFocusIn = (e) => {
      const btn = e.target?.closest?.('.button');
      if (!btn) return;
      // data-react-handler가 있어도 TTS는 재생 (포인티드 상태일 때)
      const parentTts = btn.parentElement?.closest('[data-tts-text]')?.dataset?.ttsText || '';
      const btnTts = btn.dataset?.ttsText || '';
      if (parentTts || btnTts) finalHandleText(parentTts + btnTts);
    };
    
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enableGlobalHandlers, playSoundOpt]);
  
  return enableKeyboardNavigation
    ? { handleButtonClick, updateFocusableSections }
    : { handleButtonClick };
};

const useWebViewMessage = (setCurrentPage) => {
  useEffect(() => {
    if (!window.chrome?.webview) return;
    
    const hm = (e) => {
      let d = e.data;
      if (d.arg.result === CFG.WEBVIEW_SUCCESS) {
        if (d.Command === 'PAY') setCurrentPage('ScreenCardRemoval');
        if (d.Command === 'PRINT') setCurrentPage('ScreenOrderComplete');
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
  }, [setCurrentPage]);
};

// ============================================================================
// Contexts
// ============================================================================

// 전역 포인티드 버튼 관리 Context (화면에 포인티드는 하나만)
const PointedButtonContext = createContext();
const PointedButtonProvider = ({ children }) => {
  const [pointedButtonId, setPointedButtonId] = useState(null);
  
  // 호버를 포커스로 치환했으므로 단순화: 포커스만 관리
  const setPointed = useCallback((buttonId) => {
    setPointedButtonId(buttonId);
  }, []);
  
  const clearPointed = useCallback((buttonId) => {
    // 특정 버튼의 포인티드 해제
    setPointedButtonId(prevPointed => prevPointed === buttonId ? null : prevPointed);
  }, []);
  
  const value = useMemo(() => ({
    pointedButtonId,
    setPointed,
    clearPointed
  }), [pointedButtonId, setPointed, clearPointed]);
  
  return (
    <PointedButtonContext.Provider value={value}>
      {children}
    </PointedButtonContext.Provider>
  );
};

const AccessibilityContext = createContext();

const AccessibilityProvider = ({ children }) => {
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

// Screen 렌더러 (RouteProvider 안에서 모든 Context에 접근 가능)
const RouteRenderer = ({ currentPage }) => {
  return (
    <>
      {currentPage === 'ScreenStart' && <ScreenStart />}
      {currentPage === 'ScreenMenu' && <ScreenMenu />}
      {currentPage === 'ScreenDetails' && <ScreenDetails />}
      {currentPage === 'ScreenPayments' && <ScreenPayments />}
      {currentPage === 'ScreenCardInsert' && <ScreenCardInsert />}
      {currentPage === 'ScreenMobilePay' && <ScreenMobilePay />}
      {currentPage === 'ScreenSimplePay' && <ScreenSimplePay />}
      {currentPage === 'ScreenCardRemoval' && <ScreenCardRemoval />}
      {currentPage === 'ScreenOrderComplete' && <ScreenOrderComplete />}
      {currentPage === 'ScreenReceiptPrint' && <ScreenReceiptPrint />}
      {currentPage === 'ScreenFinish' && <ScreenFinish />}
    </>
  );
};

// ============================================================================
// DOM Context (DOM 조작을 React 생명주기로 관리)
// ============================================================================

const useDOM = () => {
  // DOM 기능은 ContextBase에서 제거되었으므로 직접 구현
  const querySelector = useCallback((s, c = null) => safeQuerySelector(s, c), []);
  const getElementById = useCallback((id) => {
    try {
    if (typeof document === 'undefined') return null;
    return document.getElementById(id);
    } catch { return null; }
  }, []);
  const toggleBodyClass = useCallback((className, condition) => {
    if (typeof document === 'undefined') return;
    if (condition) document.body.classList.add(className);
    else document.body.classList.remove(className);
  }, []);
  const blurActiveElement = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement?.blur) {
      document.activeElement.blur();
    }
  }, []);
  const getActiveElementText = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement) {
      const el = document.activeElement;
      const elTts = el.dataset?.ttsText || '';
      const parentTts = el.parentElement?.dataset?.ttsText || '';
      return parentTts + elTts;
    }
    return '';
  }, []);
  const setAudioVolume = useCallback((id, vol) => {
    const audio = getElementById(id);
    if (audio && audio instanceof HTMLAudioElement) {
      audio.volume = Math.max(0, Math.min(1, vol));
    }
  }, [getElementById]);
  
  return {
    querySelector,
    getElementById,
    toggleBodyClass,
    blurActiveElement,
    getActiveElementText,
    setAudioVolume
  };
};

// ============================================================================
// Route Context (라우팅 상태 관리)
// ============================================================================

const RouteContext = createContext();

const RouteProvider = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState('ScreenStart');
  
  const setCurrentPage = useCallback((p) => {
      setCurrentPageState(p);
  }, []);
  
  const value = useMemo(() => ({
    currentPage, 
    setCurrentPage
  }), [currentPage, setCurrentPage]);
  
  return (
    <RouteContext.Provider value={value}>
      {children}
      <RouteRenderer currentPage={currentPage} />
    </RouteContext.Provider>
  );
};

const ModalContext = createContext();

const useModal = () => {
  const context = useContext(ModalContext);
  return {
    ModalReturn: context?.ModalReturn || { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
    ModalAccessibility: context?.ModalAccessibility || { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
    ModalReset: context?.ModalReset || { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
    ModalDelete: context?.ModalDelete || { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
    ModalDeleteCheck: context?.ModalDeleteCheck || { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
    ModalCall: context?.ModalCall || { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
    ModalTimeout: context?.ModalTimeout || { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
    ModalPaymentError: context?.ModalPaymentError || { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
    ModalDeleteItemId: context?.ModalDeleteItemId || 0,
    setModalDeleteItemId: context?.setModalDeleteItemId || (() => {})
  };
};

const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({
    return: false,
    accessibility: false,
    reset: false,
    delete: false,
    deleteCheck: false,
    call: false,
    timeout: false,
    paymentError: false
  });
  const [deleteItemId, setDeleteItemId] = useState(0);
  const [modalButtonInfo, setModalButtonInfo] = useState({});
  
  const createModalHandlers = useCallback((key) => ({
    isOpen: modals[key],
    open: (buttonLabel, buttonIcon) => {
      if (buttonLabel || buttonIcon) {
        setModalButtonInfo(p => ({ ...p, [key]: { label: buttonLabel, icon: buttonIcon } }));
      }
      setModals(p => ({ ...p, [key]: true }));
    },
    close: () => setModals(p => ({ ...p, [key]: false })),
    toggle: () => setModals(p => ({ ...p, [key]: !p[key] })),
    buttonLabel: modalButtonInfo[key]?.label,
    buttonIcon: modalButtonInfo[key]?.icon
  }), [modals, modalButtonInfo]);
  
  const value = useMemo(() => ({
    ModalReturn: createModalHandlers('return'),
    ModalAccessibility: createModalHandlers('accessibility'),
    ModalReset: createModalHandlers('reset'),
    ModalDelete: createModalHandlers('delete'),
    ModalDeleteCheck: createModalHandlers('deleteCheck'),
    ModalCall: createModalHandlers('call'),
    ModalTimeout: createModalHandlers('timeout'),
    ModalPaymentError: createModalHandlers('paymentError'),
    ModalDeleteItemId: deleteItemId,
    setModalDeleteItemId: setDeleteItemId
  }), [modals, deleteItemId, createModalHandlers]);
  
  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

const OrderContext = createContext();

const OrderProvider = ({ children }) => {
  // 메뉴 데이터
  const { tabs, totalMenuItems, categoryInfo, isLoading: menuLoading } = useMenuData();
  const { categorizeMenu, calculateSum, calculateTotal, filterMenuItems, createOrderItems } = useMenuUtils();
  
  // 상태
  const [selectedTab, setSelectedTab] = useState("전체메뉴");
  const [quantities, setQuantities] = useState({});
  
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
  
  // 카테고리 페이지 네비게이션 - 로컬 ref 사용 (초기화 순서 문제 해결)
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
    sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, updateOrderNumber,
    // 네비게이션
    handlePreviousTab, handleNextTab, handleCategoryPageNav, setHandleCategoryPageNav
  }), [
    tabs, totalMenuItems, categoryInfo, menuItems, selectedTab, menuLoading,
    quantities, setQuantities, handleIncrease, handleDecrease, handleDelete, totalCount, totalSum,
    filterMenuItems, createOrderItems, calculateSum, calculateTotal, orderItems,
    sendOrderDataToApp, sendPrintReceiptToApp, sendCancelPayment, updateOrderNumber, 
    handlePreviousTab, handleNextTab, handleCategoryPageNav, setHandleCategoryPageNav
  ]);
  
  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// ============================================================================
// Button 관련 Context (단일책임원칙: 각 책임별 분리)
// ============================================================================

// 버튼 상태 관리
const ButtonStateContext = createContext();
const ButtonStateProvider = ({ children }) => {
  const [buttonStates, setButtonStates] = useState({});
  
  const setButtonPressed = useCallback((id, p) => {
    setButtonStates(pr => ({ ...pr, [id]: p }));
  }, []);
  
  const toggleButtonPressed = useCallback((id) => {
    let ns;
    setButtonStates(p => { ns = !p[id]; return { ...p, [id]: ns }; });
    return ns;
  }, []);
  
  const isButtonPressed = useCallback((id) => buttonStates[id] || false, [buttonStates]);
  
  const value = useMemo(() => ({
    setButtonPressed,
    toggleButtonPressed,
    isButtonPressed,
    buttonStates
  }), [setButtonPressed, toggleButtonPressed, isButtonPressed, buttonStates]);
  
  return (
    <ButtonStateContext.Provider value={value}>
      {children}
    </ButtonStateContext.Provider>
  );
};
const useButtonState = () => {
  const context = useContext(ButtonStateContext);
  return {
    buttonStates: context?.buttonStates || {},
    setButtonPressed: context?.setButtonPressed || (() => {}),
    toggleButtonPressed: context?.toggleButtonPressed || (() => false),
    isButtonPressed: context?.isButtonPressed || (() => false)
  };
};

// 버튼 그룹 선택 관리
const ButtonGroupContext = createContext();
const ButtonGroupProvider = ({ children }) => {
  const [groupStates, setGroupStates] = useState({});
  
  const selectInGroup = useCallback((gid, bid) => {
    setGroupStates(p => ({ ...p, [gid]: bid }));
  }, []);
  
  const getSelectedInGroup = useCallback((gid) => groupStates[gid] || null, [groupStates]);
  const isSelectedInGroup = useCallback((gid, bid) => groupStates[gid] === bid, [groupStates]);
  
  const clearGroupSelection = useCallback((gid) => {
    setGroupStates(p => { const s = { ...p }; delete s[gid]; return s; });
  }, []);
  
  const value = useMemo(() => ({
    selectInGroup,
    getSelectedInGroup,
    isSelectedInGroup,
    clearGroupSelection,
    groupStates
  }), [selectInGroup, getSelectedInGroup, isSelectedInGroup, clearGroupSelection, groupStates]);
  
  return (
    <ButtonGroupContext.Provider value={value}>
      {children}
    </ButtonGroupContext.Provider>
  );
};
const useButtonGroup = () => {
  const context = useContext(ButtonGroupContext);
  return {
    groupStates: context?.groupStates || {},
    selectInGroup: context?.selectInGroup || (() => {}),
    getSelectedInGroup: context?.getSelectedInGroup || (() => null),
    isSelectedInGroup: context?.isSelectedInGroup || (() => false),
    clearGroupSelection: context?.clearGroupSelection || (() => {})
  };
};

// 통합 hook (하위 호환성 - 사운드는 useSound hook 직접 사용)
const useButtonStyle = () => {
  const stateContext = useButtonState();
  const groupContext = useButtonGroup();
  const { play: playSound } = useSound();

  const playOnPressedSound = useCallback(() => playSound('onPressed'), [playSound]);
  
  return useMemo(() => ({
    ...stateContext,
    ...groupContext,
    playOnPressedSound
  }), [stateContext, groupContext, playOnPressedSound]);
};

// ============================================================================
// 초기화 컴포넌트 (단일책임원칙: 각 초기화 로직 분리)
// ============================================================================

// TTSDBInitializer는 ContextProvider 내부에서 직접 처리됨

// 버튼 핸들러 초기화
const ButtonHandlerInitializer = () => {
  useMultiModalButtonHandler({ enableGlobalHandlers: true, enableKeyboardNavigation: false });
  return null;
};

// 사이즈 컨트롤 초기화
const SizeControlInitializer = () => {
  useLayoutEffect(() => {
    SizeControlManager.init();
  }, []);
  return null;
};
  
// 뷰포트 초기화
const ViewportInitializer = () => {
  useLayoutEffect(() => {
    setViewportZoom();
    setupViewportResize();
  }, []);
  return null;
};


// useAppFocusTrap은 ContextProvider 내부에서 호출되므로 useContext(ContextBase)를 사용할 수 없음
// 대신 ref를 직접 생성하도록 변경
const useAppFocusTrap = () => {
  const containerRef = useRef(null);
  useLayoutEffect(() => { 
    containerRef.current = document.body; 
  }, []);
  return containerRef;
};

// ============================================================================
// Ref Context - refs만 제공
// ============================================================================
const RefContext = createContext();

// ============================================================================
// Ref Provider - refs만 제공
// ============================================================================
const RefProvider = ({ children }) => {
  // 모든 refs를 Ref Provider에서 직접 정의
  // Hooks 내부 ref
  const useIdleTimeout_timerRef = useRef(null);
  const useIdleTimeout_intervalRef = useRef(null);
  const useIdleTimeout_lastActivityRef = useRef(Date.now());
  const useIdleTimeout_onTimeoutRef = useRef(null);
  const useIdleTimeout_timeoutRef = useRef(null);
  
  const usePaymentCountdown_timerRef = useRef(null);
  const usePaymentCountdown_callbacksRef = useRef({});
  
  const useCategoryPagination_containerRef = useRef(null);
  const useCategoryPagination_measureRef = useRef(null);
  const useCategoryPagination_prevIsLargeRef = useRef(null);
  const useCategoryPagination_lastWidthRef = useRef(0);
  const useCategoryPagination_isCalculatingRef = useRef(false);
  
  const useFocusTrap_previousActiveElement = useRef(null);
  
  const useSound_timerInstanceRef = useRef(null);
  const useSound_audioRefs = useRef({});
  
  const useMultiModalButtonHandler_ctxRef = useRef(null);
  const useMultiModalButtonHandler_modalRef = useRef(null);
  const useMultiModalButtonHandler_handlersRef = useRef({});
  const useMultiModalButtonHandler_keyboardNavState = useRef({ sections: {}, currentSection: null, currentIndex: -1 });
  
  const BaseModal_hiddenModalPageButtonRef = useRef(null);
  const BaseModal_modalConfirmButtonsRef = useRef(null);
  
  const CategoryNav_categoryPageNavRef = useRef(null);
  const Summary_categoryPageNavRef = useRef(null);
  
  // Screen Components ref
  const ScreenStart_hiddenPageButtonRef = useRef(null);
  const ScreenStart_mainContentRef = useRef(null);
  
  const ScreenMenu_hiddenPageButtonRef = useRef(null);
  const ScreenMenu_categoryNavRef = useRef(null);
  const ScreenMenu_mainContentRef = useRef(null);
  const ScreenMenu_actionBarRef = useRef(null);
  const ScreenMenu_orderSummaryRef = useRef(null);
  const ScreenMenu_systemControlsRef = useRef(null);
  
  const ScreenDetails_hiddenPageButtonRef = useRef(null);
  const ScreenDetails_actionBarRef = useRef(null);
  const ScreenDetails_orderSummaryRef = useRef(null);
  const ScreenDetails_systemControlsRef = useRef(null);
  const ScreenDetails_row1Ref = useRef(null);
  const ScreenDetails_row2Ref = useRef(null);
  const ScreenDetails_row3Ref = useRef(null);
  const ScreenDetails_row4Ref = useRef(null);
  const ScreenDetails_row5Ref = useRef(null);
  const ScreenDetails_row6Ref = useRef(null);
  
  const ScreenPayments_hiddenPageButtonRef = useRef(null);
  const ScreenPayments_mainContentRef = useRef(null);
  const ScreenPayments_actionBarRef = useRef(null);
  const ScreenPayments_systemControlsRef = useRef(null);
  
  const ScreenCardInsert_hiddenPageButtonRef = useRef(null);
  const ScreenCardInsert_actionBarRef = useRef(null);
  const ScreenCardInsert_systemControlsRef = useRef(null);
  
  const ScreenMobilePay_hiddenPageButtonRef = useRef(null);
  const ScreenMobilePay_actionBarRef = useRef(null);
  const ScreenMobilePay_systemControlsRef = useRef(null);
  
  const ScreenSimplePay_hiddenPageButtonRef = useRef(null);
  const ScreenSimplePay_actionBarRef = useRef(null);
  const ScreenSimplePay_systemControlsRef = useRef(null);
  
  const ScreenCardRemoval_hiddenPageButtonRef = useRef(null);
  const ScreenCardRemoval_systemControlsRef = useRef(null);
  
  const ScreenOrderComplete_hiddenPageButtonRef = useRef(null);
  const ScreenOrderComplete_actionBarRef = useRef(null);
  const ScreenOrderComplete_systemControlsRef = useRef(null);
  
  const ScreenReceiptPrint_hiddenPageButtonRef = useRef(null);
  const ScreenReceiptPrint_actionBarRef = useRef(null);
  const ScreenReceiptPrint_systemControlsRef = useRef(null);
  
  const ScreenFinish_hiddenPageButtonRef = useRef(null);
  const ScreenFinish_systemControlsRef = useRef(null);
  
  const AccessibilityModal_hiddenModalPageButtonRef = useRef(null);
  const AccessibilityModal_originalSettingsRef = useRef(null);
  
  const useTextHandler_volumeRef = useRef(0.5);
  
  const globalAudioRefs = useRef(new Set());
  
  // Context value - refs만 제공
  const contextValue = useMemo(() => ({
    refs: {
      // Hooks refs
      useIdleTimeout: { timerRef: useIdleTimeout_timerRef, intervalRef: useIdleTimeout_intervalRef, lastActivityRef: useIdleTimeout_lastActivityRef, onTimeoutRef: useIdleTimeout_onTimeoutRef, timeoutRef: useIdleTimeout_timeoutRef },
      usePaymentCountdown: { timerRef: usePaymentCountdown_timerRef, callbacksRef: usePaymentCountdown_callbacksRef },
      useCategoryPagination: { containerRef: useCategoryPagination_containerRef, measureRef: useCategoryPagination_measureRef, prevIsLargeRef: useCategoryPagination_prevIsLargeRef, lastWidthRef: useCategoryPagination_lastWidthRef, isCalculatingRef: useCategoryPagination_isCalculatingRef },
      useFocusTrap: { previousActiveElement: useFocusTrap_previousActiveElement },
      useSound: { timerInstanceRef: useSound_timerInstanceRef, audioRefs: useSound_audioRefs },
      useMultiModalButtonHandler: { ctxRef: useMultiModalButtonHandler_ctxRef, modalRef: useMultiModalButtonHandler_modalRef, handlersRef: useMultiModalButtonHandler_handlersRef, keyboardNavState: useMultiModalButtonHandler_keyboardNavState },
      useTextHandler: { volumeRef: useTextHandler_volumeRef },
      // Component refs
      BaseModal: { hiddenModalPageButtonRef: BaseModal_hiddenModalPageButtonRef, modalConfirmButtonsRef: BaseModal_modalConfirmButtonsRef },
      CategoryNav: { categoryPageNavRef: CategoryNav_categoryPageNavRef },
      Summary: { categoryPageNavRef: Summary_categoryPageNavRef },
      ScreenStart: { hiddenPageButtonRef: ScreenStart_hiddenPageButtonRef, mainContentRef: ScreenStart_mainContentRef },
      ScreenMenu: { hiddenPageButtonRef: ScreenMenu_hiddenPageButtonRef, categoryNavRef: ScreenMenu_categoryNavRef, mainContentRef: ScreenMenu_mainContentRef, actionBarRef: ScreenMenu_actionBarRef, orderSummaryRef: ScreenMenu_orderSummaryRef, systemControlsRef: ScreenMenu_systemControlsRef },
      ScreenDetails: { hiddenPageButtonRef: ScreenDetails_hiddenPageButtonRef, actionBarRef: ScreenDetails_actionBarRef, orderSummaryRef: ScreenDetails_orderSummaryRef, systemControlsRef: ScreenDetails_systemControlsRef, row1Ref: ScreenDetails_row1Ref, row2Ref: ScreenDetails_row2Ref, row3Ref: ScreenDetails_row3Ref, row4Ref: ScreenDetails_row4Ref, row5Ref: ScreenDetails_row5Ref, row6Ref: ScreenDetails_row6Ref },
      ScreenPayments: { hiddenPageButtonRef: ScreenPayments_hiddenPageButtonRef, mainContentRef: ScreenPayments_mainContentRef, actionBarRef: ScreenPayments_actionBarRef, systemControlsRef: ScreenPayments_systemControlsRef },
      ScreenCardInsert: { hiddenPageButtonRef: ScreenCardInsert_hiddenPageButtonRef, actionBarRef: ScreenCardInsert_actionBarRef, systemControlsRef: ScreenCardInsert_systemControlsRef },
      ScreenMobilePay: { hiddenPageButtonRef: ScreenMobilePay_hiddenPageButtonRef, actionBarRef: ScreenMobilePay_actionBarRef, systemControlsRef: ScreenMobilePay_systemControlsRef },
      ScreenSimplePay: { hiddenPageButtonRef: ScreenSimplePay_hiddenPageButtonRef, actionBarRef: ScreenSimplePay_actionBarRef, systemControlsRef: ScreenSimplePay_systemControlsRef },
      ScreenCardRemoval: { hiddenPageButtonRef: ScreenCardRemoval_hiddenPageButtonRef, systemControlsRef: ScreenCardRemoval_systemControlsRef },
      ScreenOrderComplete: { hiddenPageButtonRef: ScreenOrderComplete_hiddenPageButtonRef, actionBarRef: ScreenOrderComplete_actionBarRef, systemControlsRef: ScreenOrderComplete_systemControlsRef },
      ScreenReceiptPrint: { hiddenPageButtonRef: ScreenReceiptPrint_hiddenPageButtonRef, actionBarRef: ScreenReceiptPrint_actionBarRef, systemControlsRef: ScreenReceiptPrint_systemControlsRef },
      ScreenFinish: { hiddenPageButtonRef: ScreenFinish_hiddenPageButtonRef, systemControlsRef: ScreenFinish_systemControlsRef },
      AccessibilityModal: { hiddenModalPageButtonRef: AccessibilityModal_hiddenModalPageButtonRef, originalSettingsRef: AccessibilityModal_originalSettingsRef }
    },
    globalAudioRefs
  }), []);
  
  return (
    <RefContext.Provider value={contextValue}>
      {children}
    </RefContext.Provider>
  );
};


// ============================================================================
// 내부 UI 컴포넌트 (App.js 내부용)
// ============================================================================

// 카테고리 탭 버튼
const CategoryTab = memo(({ tab, isSelected }) => (
  <Button 
    toggle 
    pressed={isSelected} 
    actionType="selectTab" 
    actionTarget={tab.name} 
    label={tab.name} 
  />
));
CategoryTab.displayName = 'CategoryTab';

// 카테고리 네비게이션
const CategorySeparator = () => <span className="category-separator" aria-hidden="true" />;

const CategoryNav = memo(({ categories, selectedTab, pagination, containerRef, measureRef, convertToKoreanQuantity, categoryNavRef }) => {
  const { catPage, catTotal, catItems, catHasPrev, catHasNext, isCompact, isReady } = pagination;
  
  return (
    <div 
      className="category-full" 
      ref={categoryNavRef} 
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
      <Button toggle label="◀" disabled={!catHasPrev} actionType="categoryNav" actionTarget="prev" ttsText="이전" />
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
      <Button toggle label="▶" disabled={!catHasNext} actionType="categoryNav" actionTarget="next" ttsText="다음" />
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
    <div className="label">
      <p>{item.name}</p>
      <p>{Number(item.price).toLocaleString()}원</p>
    </div>
  </Button>
));
MenuItem.displayName = 'MenuItem';

// 비활성 메뉴 ID (추가예정: 0, 기타: 13)
const DISABLED_MENU_ID = 13;
const isMenuDisabled = (id) => id === 0 || id === DISABLED_MENU_ID;

// 메뉴 그리드
const MenuGrid = memo(({ items, onItemPress, selectedTab, convertToKoreanQuantity, mainContentRef }) => {
  return (
    <div className="menu" ref={mainContentRef} data-tts-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(items.length)}개,`}>
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
    <Button label="이전" onClick={onPrev} />
    <span className="pagination-page-number">
      <span className="pagination-page-current">{pageNumber}</span>
      <span className="pagination-separator">&nbsp;/&nbsp;</span>
      <span className="pagination-page-total">{totalPages || 1}</span>
    </span>
    <Button label="다음" onClick={onNext} />
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
        <Button className="w070h070 delete-item" svg={<DeleteIcon />} onClick={onDelete} ttsText="삭제" />
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
// 프레임 컴포넌트 (상단/하단 네비게이션)
// ============================================================================

// 단계 표시 아이템 컴포넌트
const Step1 = () => (
  <div className="step">
    <span className="step-num progress current">✓</span>
    <span className="step-name progress">메뉴선택</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num">2</span>
    <span className="step-name">내역확인</span>
    <span className="separator icon"><StepIcon /></span>
    <span className="step-num">3</span>
    <span className="step-name">결제</span>
    <span className="separator icon"><StepIcon /></span>
    <span className="step-num">4</span>
    <span className="step-name">완료</span>
  </div>
);

const Step2 = () => (
  <div className="step">
    <span className="step-num progress">✓</span>
    <span className="step-name progress">메뉴선택</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress current">2</span>
    <span className="step-name progress">내역확인</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num">3</span>
    <span className="step-name">결제</span>
    <span className="separator icon"><StepIcon /></span>
    <span className="step-num">4</span>
    <span className="step-name">완료</span>
  </div>
);

const Step3 = () => (
  <div className="step">
    <span className="step-num progress">✓</span>
    <span className="step-name progress">메뉴선택</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress">✓</span>
    <span className="step-name progress">내역확인</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress current">3</span>
    <span className="step-name progress">결제</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num">4</span>
    <span className="step-name">완료</span>
  </div>
);

const Step4 = () => (
  <div className="step">
    <span className="step-num progress">✓</span>
    <span className="step-name progress">메뉴선택</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress">✓</span>
    <span className="step-name progress">내역확인</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress">✓</span>
    <span className="step-name progress">결제</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress current">4</span>
    <span className="step-name progress">완료</span>
  </div>
);

const Step5 = () => (
  <div className="step">
    <span className="step-num progress">✓</span>
    <span className="step-name progress">메뉴선택</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress">✓</span>
    <span className="step-name progress">내역확인</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress">✓</span>
    <span className="step-name progress">결제</span>
    <span className="separator progress icon"><StepIcon /></span>
    <span className="step-num progress">✓</span>
    <span className="step-name progress">완료</span>
  </div>
);

const Step = memo(() => {
  const ui = useContext(RouteContext);
  const currentPage = ui?.currentPage || 'ScreenStart';
  
  if ( currentPage === 'ScreenMenu') {
    return <Step1 />;
  }
  
  if ( currentPage === 'ScreenDetails') {
    return <Step2 />;
  }
  
  if (['ScreenPayments', 'ScreenCardInsert', 'ScreenMobilePay', 'ScreenSimplePay', 'ScreenCardRemoval'].includes( currentPage )) {
    return <Step3 />;
  }
  
  if (['ScreenOrderComplete', 'ScreenReceiptPrint'].includes( currentPage )) {
    return <Step4 />;
  }
  
  if ( currentPage === 'ScreenFinish') {
    return <Step5 />;
  }
  
  return null;
});
Step.displayName = 'Step';

const Summary = memo(({ orderSummaryRef }) => {
  const order = useContext(OrderContext);
  const ui = useContext(RouteContext);
  const totalCount = order?.totalCount || 0;
  const totalSum = order?.totalSum || 0;
  const currentPage = ui?.currentPage || 'ScreenStart';
  
  const [isDisabledBtn, setIsDisabledBtn] = useState(true);
  
  useEffect(() => {
    setIsDisabledBtn(totalCount <= 0);
  }, [totalCount]);
  
  // 메뉴선택/내역확인 페이지에서만 표시
  if (currentPage !== 'ScreenMenu' && currentPage !== 'ScreenDetails') {
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
      <div className="task-manager" ref={orderSummaryRef} data-tts-text={summaryTtsText}>
        {currentPage === 'ScreenMenu' && (
          <>
            <Button
              className="w199h090"
              svg={<ResetIcon className="summary-btn-icon" />}
              label="초기화"
              actionType="modal"
              actionTarget="Reset"
            />
            <Button
              className="w199h090 primary1"
              svg={<OrderIcon className="summary-btn-icon" />}
              label="주문"
              disabled={isDisabledBtn}
              actionType="navigate"
              actionTarget="ScreenDetails"
            />
          </>
        )}
        {currentPage === 'ScreenDetails' && (
          <>
            <Button
              className="w199h090"
              svg={<AddIcon className="summary-btn-icon" />}
              label="추가"
              actionType="navigate"
              actionTarget="ScreenMenu"
            />
            <Button
              className="w199h090 primary1"
              svg={<PayIcon className="summary-btn-icon" />}
              label="결제"
              actionType="navigate"
              actionTarget="ScreenPayments"
            />
          </>
        )}
      </div>
    </div>
  );
});
Summary.displayName = 'Summary';

const Bottom = memo(({ systemControlsRef }) => {
  const ui = useContext(RouteContext);
  const modal = useContext(ModalContext);
  const currentPage = ui.currentPage;
  
  // ScreenStart에서는 타임아웃 기능만 비활성화 (버튼은 항상 표시)
  const isTimeoutEnabled = currentPage !== 'ScreenStart';
  
  const onTimeout = useCallback(() => {
    if (modal.ModalTimeout) {
      modal.ModalTimeout.open();
    }
  }, [modal]);
  
  const { remainingTimeFormatted } = useIdleTimeout(
    onTimeout,
    CFG.IDLE_TIMEOUT,
    isTimeoutEnabled
  );
  
  const openModalManually = useCallback(() => {
    if (modal.ModalTimeout) {
      modal.ModalTimeout.open();
    }
  }, [modal]);
  
  return (
    <div className="bottom" data-tts-text="시스템 설정, 버튼 세 개," ref={systemControlsRef}>
      <Button
        className="down-footer-button btn-home"
        svg={<HomeIcon />}
        label="처음으로"
        actionType="modal"
        actionTarget="Return"
      />
      <Button
        className="down-footer-button"
        svg={<TimeIcon />}
        label={remainingTimeFormatted}
        onClick={openModalManually}
        disabled={!isTimeoutEnabled}
      />
      <Button className="down-footer-button" svg={<WheelchairIcon />} label="접근성" actionType="modal" actionTarget="Accessibility" />
    </div>
  );
});
Bottom.displayName = 'Bottom';

// ============================================================================
// 프로세스 1 컴포넌트 (메인 화면)
// ============================================================================

const ScreenStart = memo(() => {
  // 개별 Context에서 직접 가져오기
  const ui = useContext(RouteContext) || {};
  const accessibility = useContext(AccessibilityContext) || {};
  const setCurrentPage = ui.setCurrentPage || (() => {});
  const volume = accessibility.volume ?? 1;
  const setIsDark = accessibility.setIsDark || (() => {});
  const setVolume = accessibility.setVolume || (() => {});
  const setIsLarge = accessibility.setIsLarge || (() => {});
  const setIsLow = accessibility.setIsLow || (() => {});
  
  // 로컬 ref 생성
  const hiddenPageButtonRef = useRef(null);
  const mainContentRef = useRef(null);
  
  const { handleText } = useTextHandler(volume);
  
  // IntroTimer 직접 사용
  const timerInstanceRef = useRef(null);
  useEffect(() => {
    if (!timerInstanceRef.current) {
      timerInstanceRef.current = new IntroTimerSingleton();
    }
    return () => {
      if (timerInstanceRef.current) {
        timerInstanceRef.current.stopIntroTimer();
      }
    };
  }, []);
  const startIntroTimer = useCallback((s, h, o) => {
    if (timerInstanceRef.current) {
      timerInstanceRef.current.startIntroTimer(s, h, o);
    }
  }, []);
  
  const { blurActiveElement } = useSafeDocument();
  const { play: playSound } = useSound();

  useMultiModalButtonHandler({
    initFocusableSections: ['mainContent'],
    initFirstButtonSection: 'mainContent',
    enableGlobalHandlers: true, handleTextOpt: handleText, enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections: { mainContent: mainContentRef }
  });

  // 초기화 기능 (설정만 초기화)
  const handleIntroComplete = useCallback(() => {
    setIsDark(DEFAULT_SETTINGS.IS_DARK);
    setVolume(DEFAULT_SETTINGS.VOLUME);
    setIsLarge(DEFAULT_SETTINGS.IS_LARGE);
    setIsLow(DEFAULT_SETTINGS.IS_LOW);
  }, [setIsDark, setVolume, setIsLarge, setIsLow]);

  // 초기 포커스 설정 및 인트로 처리
  useEffect(() => {
    const focusFirstButton = () => {
      const middleSection = mainContentRef.current;
      if (middleSection) {
        const firstButton = middleSection.querySelector('.button:not([aria-disabled="true"])');
        if (firstButton) {
          firstButton.focus();
        }
      }
    };
    
    let process1Timer = null;
    const timer = setTimeout(() => {
      blurActiveElement();
      // blurActiveElement() 호출 후 동기적으로 포커스 설정
      focusFirstButton();
      // 인트로 TTS 재생
      handleText(TTS.intro);
      startIntroTimer(TTS.intro, handleText, handleIntroComplete);
      // 인트로 재생 후 프로세스1 TTS 재생 (인트로 재생 완료 후 약간의 딜레이)
      process1Timer = setTimeout(() => {
        handleText(TTS.screenStart());
      }, TIMER_CONFIG.TTS_DELAY);
    }, TIMER_CONFIG.ACTION_DELAY * 2);
    return () => {
      clearTimeout(timer);
      if (process1Timer) clearTimeout(process1Timer);
    };
  }, [handleText, handleIntroComplete, blurActiveElement, startIntroTimer]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text=""
          />
        </div>
      </div>
      <div className="main first">
        <img src="./images/poster.png" className="poster" alt="커피포스터" />
        <div className="hero">
          <p>화면 하단의 접근성 버튼을 눌러 고대비화면, 소리크기, 큰글씨화면, 낮은화면을 설정할 수 있습니다</p>
          <div 
            className="task-manager" 
            data-tts-text="취식방식 선택 영역입니다. 포장하기, 먹고가기 버튼이 있습니다. 좌우 방향키로 버튼을 선택합니다," 
            ref={mainContentRef}
          >
            <Button className="w285h285 secondary1" svg={<TakeoutIcon />} label="포장하기" navigate="ScreenMenu" />
            <Button className="w285h285 secondary1" svg={<TakeinIcon />} label="먹고가기" navigate="ScreenMenu" />
          </div>
          <p>키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다</p>
        </div>
      </div>
      <Bottom />
      <GlobalModals />
    </>
  );
});
ScreenStart.displayName = 'ScreenStart';

// ============================================================================
// 프로세스 2 컴포넌트 (메뉴 선택 화면)
// ============================================================================

const ScreenMenu = memo(() => {
  // Context에서 ref 가져오기 (글로벌 스코프에서 관리)
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const accessibility = useContext(AccessibilityContext);
  const order = useContext(OrderContext);
  const ui = useContext(RouteContext);
  const refs = refsData.refs;
  const isLow = accessibility.isLow;
  const isDark = accessibility.isDark;
  const isLarge = accessibility.isLarge;
  const volume = accessibility.volume;
  const tabs = order.tabs;
  const menuItems = order.menuItems;
  const selectedTab = order.selectedTab;
  const setSelectedTab = order.setSelectedTab;
  const handleIncrease = order.handleIncrease;
  const quantities = order.quantities;
  const setCurrentPage = ui.setCurrentPage;
  const setHandleCategoryPageNav = order.setHandleCategoryPageNav;
  const categoryInfo = order.categoryInfo;
  const totalSum = order.totalSum;
  const hiddenPageButtonRef = refs.ScreenMenu.hiddenPageButtonRef;
  const categoryNavRef = refs.ScreenMenu.categoryNavRef;
  const mainContentRef = refs.ScreenMenu.mainContentRef;
  const actionBarRef = refs.ScreenMenu.actionBarRef;
  const orderSummaryRef = refs.ScreenMenu.orderSummaryRef;
  const systemControlsRef = refs.ScreenMenu.systemControlsRef;
  
  // 페이지네이션 설정
  const PAGINATION_CONFIG = { ITEMS_PER_PAGE_NORMAL: 16, ITEMS_PER_PAGE_LOW: 3 };
  const { handleText } = useTextHandler(volume);
  // stopIntroTimer는 현재 제공되지 않음 (필요시 별도 구현)
  const stopIntroTimer = () => {};
  const { blurActiveElement, getActiveElementText } = useSafeDocument();
  const { play: playSound } = useSound();
  
  // sections 객체 생성 (useMultiModalButtonHandler에 전달)
  const sections = {
    hiddenPageButton: hiddenPageButtonRef,
    categoryNav: categoryNavRef,
    mainContent: mainContentRef,
    actionBar: actionBarRef,
    orderSummary: orderSummaryRef,
    systemControls: systemControlsRef
  };

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
    initFocusableSections: ['hiddenPageButton', 'categoryNav', 'mainContent', 'actionBar', 'orderSummary', 'systemControls'],
    initFirstButtonSection: 'categoryNav', enableGlobalHandlers: false, enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections
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
      handleText(TTS.errorNoProduct);
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

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div className="main second">
        <CategoryNav 
          categories={allTabs}
          selectedTab={selectedTab}
          pagination={{ catPage, catTotal, catItems, catHasPrev, catHasNext, catPrev, catNext, isCompact: catIsCompact, isReady: catIsReady }}
          containerRef={catContainerRef}
          measureRef={catMeasureRef}
          convertToKoreanQuantity={convertToKoreanQuantity}
          categoryNavRef={categoryNavRef}
        />
        <MenuGrid 
          items={currentItems} 
          onItemPress={handleMenuItemPress}
          selectedTab={selectedTab}
          convertToKoreanQuantity={convertToKoreanQuantity}
          mainContentRef={mainContentRef}
        />
        <Pagination 
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPrev={(e) => handlePaginationPress(e, 'prev')}
          onNext={(e) => handlePaginationPress(e, 'next')}
          isDark={isDark}
          ttsPrefix="메뉴"
          sectionRef={actionBarRef}
        />
      </div>
      <Summary orderSummaryRef={orderSummaryRef} />
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenMenu.displayName = 'ScreenMenu';

// ============================================================================
// 프로세스 3 컴포넌트 (주문 확인 화면)
// ============================================================================

const ScreenDetails = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const modal = useContext(ModalContext);
  const ui = useContext(RouteContext);
  const refs = refsData.refs;
  const totalMenuItems = order.totalMenuItems;
  const isDark = accessibility.isDark;
  const isLow = accessibility.isLow;
  const quantities = order.quantities;
  const handleIncrease = order.handleIncrease;
  const handleDecrease = order.handleDecrease;
  const filterMenuItems = order.filterMenuItems;
  const ModalDelete = modal.ModalDelete;
  const ModalDeleteCheck = modal.ModalDeleteCheck;
  const setModalDeleteItemId = modal.setModalDeleteItemId;
  const volume = accessibility.volume;
  const setCurrentPage = ui.setCurrentPage;
  const hiddenPageButtonRef = refs.ScreenDetails.hiddenPageButtonRef;
  const actionBarRef = refs.ScreenDetails.actionBarRef;
  const orderSummaryRef = refs.ScreenDetails.orderSummaryRef;
  const systemControlsRef = refs.ScreenDetails.systemControlsRef;
  const row1Ref = refs.ScreenDetails.row1Ref;
  const row2Ref = refs.ScreenDetails.row2Ref;
  const row3Ref = refs.ScreenDetails.row3Ref;
  const row4Ref = refs.ScreenDetails.row4Ref;
  const row5Ref = refs.ScreenDetails.row5Ref;
  const row6Ref = refs.ScreenDetails.row6Ref;
  const rowRefs = [row1Ref, row2Ref, row3Ref, row4Ref, row5Ref, row6Ref];
  const { handleText } = useTextHandler(volume);
  const { play: playSound } = useSound();
  
  // sections 객체 생성
  const sections = {
    hiddenPageButton: hiddenPageButtonRef,
    actionBar: actionBarRef,
    orderSummary: orderSummaryRef,
    systemControls: systemControlsRef,
    rows: rowRefs,
    row1: rowRefs[0], row2: rowRefs[1], row3: rowRefs[2],
    row4: rowRefs[3], row5: rowRefs[4], row6: rowRefs[5]
  };
  
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
    'hiddenPageButton',
    ...Array.from({ length: cnt }, (_, i) => `row${i + 1}`),
    ...arr
  ], []);
  
  const focusableSections = useMemo(
    () => prependRows(
      ['actionBar', 'orderSummary', 'systemControls'],
      (currentItems && currentItems.length) ? currentItems.length : 0
    ),
    [currentItems, prependRows]
  );
  
  const { updateFocusableSections } = useMultiModalButtonHandler({
    initFocusableSections: focusableSections,
    initFirstButtonSection: "row1",
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections // sections 객체 전달
  });

  const handleTouchDecrease = useCallback((id) => {
    if (quantities[id] === 1) {
      setModalDeleteItemId(id);
      (currentItems && currentItems.length > 1) ? ModalDelete.open() : ModalDeleteCheck.open();
    } else {
      handleDecrease(id);
    }
  }, [quantities, currentItems, setModalDeleteItemId, ModalDelete, ModalDeleteCheck, handleDecrease]);
  
  const handleTouchDelete = useCallback((id) => {
    setModalDeleteItemId(id);
    (currentItems && currentItems.length > 1) ? ModalDelete.open() : ModalDeleteCheck.open();
  }, [currentItems, setModalDeleteItemId, ModalDelete, ModalDeleteCheck]);
  
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
    if (!currentItems || currentItems.length === 0) {
      const t = setTimeout(() => setCurrentPage('ScreenMenu'), 0);
      return () => clearTimeout(t);
    }
  }, [currentItems, setCurrentPage]); // eslint-disable-line
  
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

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div className="main third">
        <PageTitle>
          <span><Highlight isDark={isDark}>내역</Highlight>을 확인하시고</span>
          <span><Highlight isDark={isDark}>결제하기</Highlight>&nbsp;버튼을 누르세요</span>
        </PageTitle>
        <OrderHeader isLow={isLow} />
        <div className="details">
          {currentItems && currentItems.length > 0 && currentItems.map((item, i) => (
            <OrderItem 
              key={item.id}
              item={item}
              index={startIndex + i + 1}
              quantity={quantities[item.id]}
              onDecrease={(e) => handleQuantityPress(e, item.id, 'decrease')}
              onIncrease={(e) => handleQuantityPress(e, item.id, 'increase')}
              onDelete={(e) => handleDeletePress(e, item.id)}
              sectionRef={itemsPerPage ? sections.rows[(i % itemsPerPage)] : sections.rows[i]}
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
          sectionRef={sections.actionBar}
        />
      </div>
      <Summary orderSummaryRef={orderSummaryRef} />
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenDetails.displayName = 'ScreenDetails';

// ============================================================================
// 프로세스 4 컴포넌트 (결제방법 선택)
// ============================================================================

const ScreenPayments = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const ui = useContext(RouteContext);
  const refs = refsData.refs;
  const totalSum = order.totalSum;
  const isLow = accessibility.isLow;
  const setIsLow = accessibility.setIsLow;
  const isDark = accessibility.isDark;
  const setIsDark = accessibility.setIsDark;
  const volume = accessibility.volume;
  const setVolume = accessibility.setVolume;
  const isLarge = accessibility.isLarge;
  const setIsLarge = accessibility.setIsLarge;
  const setCurrentPage = ui.setCurrentPage;
  const sendOrderDataToApp = order.sendOrderDataToApp;
  const hiddenPageButtonRef = refs.ScreenPayments.hiddenPageButtonRef;
  const mainContentRef = refs.ScreenPayments.mainContentRef;
  const actionBarRef = refs.ScreenPayments.actionBarRef;
  const systemControlsRef = refs.ScreenPayments.systemControlsRef;
  const { handleText } = useTextHandler(volume);
  const { updateOrderNumber } = useOrderNumber();
  const { play: playSound } = useSound();
  
  // sections 객체 생성
  const sections = useMemo(() => ({
    hiddenPageButton: hiddenPageButtonRef,
    mainContent: mainContentRef,
    actionBar: actionBarRef,
    systemControls: systemControlsRef
  }), []);
  
  // TTS 안내
  useEffect(() => {
    const t = setTimeout(() => handleText(TTS.screenPayments(totalSum, formatNumber)), TIMER_CONFIG.TTS_DELAY);
    return () => clearTimeout(t);
  }, [totalSum, handleText]);
  
  useMultiModalButtonHandler({
    initFocusableSections: [
      'hiddenPageButton',
      'mainContent',
      'actionBar',
      'systemControls'
    ],
    initFirstButtonSection: 'hiddenPageButton',
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections
  });

  const highlight = "primary";
  
  const handlePaymentMethod = useCallback((method) => {
    if (sendOrderDataToApp) sendOrderDataToApp(method);
    setCurrentPage(method === "card" ? 'ScreenCardInsert' : 'ScreenMobilePay');
  }, [sendOrderDataToApp, setCurrentPage]);

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div className="main forth">
        <PageTitle><span><span className={highlight}>결제방법</span>을 선택합니다</span></PageTitle>
        <div className="banner price" onClick={(e) => { e.preventDefault(); e.target.focus(); updateOrderNumber(); setCurrentPage('ScreenOrderComplete'); }}>
          <span>결제금액</span><span className="payment-amount-large">{totalSum.toLocaleString("ko-KR")}원</span>
        </div>
        <div className="task-manager" ref={mainContentRef} data-tts-text="결제 선택. 버튼 세 개, ">
          <Button className="w328h460" payment="card" img="./images/payment-card.png" imgAlt="card" label="신용카드" />
          <Button className="w328h460" payment="mobile" img="./images/payment-mobile.png" imgAlt="mobile" label="모바일 페이" />
          <Button className="w328h460" navigate="ScreenSimplePay" img="./images/payment-simple.png" imgAlt="simple" label="간편결제" />
        </div>
        <div ref={actionBarRef} className="task-manager" data-tts-text="작업관리. 버튼 한 개,">
          <Button className="w500h120" navigate="ScreenDetails" label="취소" />
        </div>
      </div>
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenPayments.displayName = 'ScreenPayments';

// ============================================================================
// 프로세스 5 컴포넌트 (카드 삽입)
// ============================================================================

const ScreenCardInsert = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const accessibility = useContext(AccessibilityContext);
  const ui = useContext(RouteContext);
  const order = useContext(OrderContext);
  const modal = useContext(ModalContext);
  const refs = refsData.refs;
  const isLow = accessibility.isLow;
  const isLarge = accessibility.isLarge;
  const setCurrentPage = ui.setCurrentPage;
  const volume = accessibility.volume;
  const ModalPaymentError = modal.ModalPaymentError;
  const hiddenPageButtonRef = refs.ScreenCardInsert.hiddenPageButtonRef;
  const actionBarRef = refs.ScreenCardInsert.actionBarRef;
  const systemControlsRef = refs.ScreenCardInsert.systemControlsRef;
  const { handleText } = useTextHandler(volume);
  const { play: playSound } = useSound();
  
  // sections 객체 생성
  const sections = {
    hiddenPageButton: hiddenPageButtonRef,
    actionBar: actionBarRef,
    systemControls: systemControlsRef
  };
  
  useWebViewMessage(setCurrentPage);
  
  useEffect(() => {
    const t = setTimeout(() => handleText(TTS.screenCardInsert()), TIMER_CONFIG.TTS_DELAY);
    return () => clearTimeout(t);
  }, [handleText]);
  
  useMultiModalButtonHandler({
    initFocusableSections: ['hiddenPageButton', 'actionBar'],
    initFirstButtonSection: 'hiddenPageButton',
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections
  });

  const brSmall = isLow && !isLarge ? <br /> : '';
  const highlight = "primary";

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div data-tts-text="작업 관리, 버튼 한 개," ref={actionBarRef} className="main forth">
        <PageTitle>
          <div>가운데 아래에 있는 <span className={highlight}>카드리더기</span>{brSmall ? <>{brSmall}<div className="flex center">에</div></> : "에"}</div>
          <div><span className={highlight}>신용카드</span>를 끝까지 넣으세요</div>
        </PageTitle>
        <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image" onClick={() => ModalPaymentError.open()} />
        <Button className="w500h120" navigate="ScreenPayments" label="취소" />
      </div>
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenCardInsert.displayName = 'ScreenCardInsert';

// ============================================================================
// 프로세스 6 컴포넌트 (모바일페이)
// ============================================================================

const ScreenMobilePay = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const ui = useContext(RouteContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const refs = refsData.refs;
  const setCurrentPage = ui.setCurrentPage;
  const volume = accessibility.volume;
  const hiddenPageButtonRef = refs.ScreenMobilePay.hiddenPageButtonRef;
  const actionBarRef = refs.ScreenMobilePay.actionBarRef;
  const systemControlsRef = refs.ScreenMobilePay.systemControlsRef;
  const { handleText } = useTextHandler(volume);
  const { play: playSound } = useSound();
  
  // sections 객체 생성
  const sections = {
    hiddenPageButton: hiddenPageButtonRef,
    actionBar: actionBarRef,
    systemControls: systemControlsRef
  };
  
  useWebViewMessage(setCurrentPage);
  
  useEffect(() => {
    const t = setTimeout(() => handleText(TTS.screenMobilePay()), TIMER_CONFIG.TTS_DELAY);
    return () => clearTimeout(t);
  }, [handleText]);
  
  useMultiModalButtonHandler({
    initFocusableSections: ['hiddenPageButton', 'actionBar'],
    initFirstButtonSection: 'hiddenPageButton',
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections
  });

  const highlight = "primary";

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div data-tts-text="작업 관리, 버튼 한 개," ref={actionBarRef} className="main forth">
        <PageTitle>
          <div>가운데 아래에 있는 <span className={highlight}>카드리더기</span>에</div>
          <div><span className={highlight}>모바일페이</span>를 켜고 접근시키세요</div>
        </PageTitle>
        <img src="./images/device-cardReader-mobile.png" alt="" className="credit-pay-image" onClick={() => setCurrentPage('ScreenOrderComplete')} />
        <Button className="w500h120" navigate="ScreenPayments" label="취소" />
      </div>
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenMobilePay.displayName = 'ScreenMobilePay';

// ============================================================================
// 프로세스 7 컴포넌트 (심플 결제)
// ============================================================================

const ScreenSimplePay = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const ui = useContext(RouteContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const refs = refsData.refs;
  const setCurrentPage = ui.setCurrentPage;
  const volume = accessibility.volume;
  const hiddenPageButtonRef = refs.ScreenSimplePay.hiddenPageButtonRef;
  const actionBarRef = refs.ScreenSimplePay.actionBarRef;
  const systemControlsRef = refs.ScreenSimplePay.systemControlsRef;
  const { handleText } = useTextHandler(volume);
  const { play: playSound } = useSound();
  
  // sections 객체 생성
  const sections = {
    hiddenPageButton: hiddenPageButtonRef,
    actionBar: actionBarRef,
    systemControls: systemControlsRef
  };
  
  useWebViewMessage(setCurrentPage);
  
  useEffect(() => {
    const t = setTimeout(() => handleText(TTS.screenSimplePay()), TIMER_CONFIG.TTS_DELAY);
    return () => clearTimeout(t);
  }, [handleText]);
  
  useMultiModalButtonHandler({
    initFocusableSections: ['hiddenPageButton', 'actionBar'],
    initFirstButtonSection: 'hiddenPageButton',
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections
  });

  const highlight = "primary";

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div data-tts-text="작업 관리, 버튼 한 개," ref={actionBarRef} className="main forth">
        <PageTitle>
          <div>오른쪽 아래에 있는 <span className={highlight}>QR리더기</span>에</div>
          <div><span className={highlight}>QR코드</span>를 인식시킵니다</div>
        </PageTitle>
        <img src="./images/device-codeReader-simple.png" alt="" className="credit-pay-image" onClick={() => setCurrentPage('ScreenOrderComplete')} />
        <Button className="w500h120" navigate="ScreenPayments" label="취소" />
      </div>
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenSimplePay.displayName = 'ScreenSimplePay';

// ============================================================================
// 프로세스 8 컴포넌트 (카드 제거)
// ============================================================================

const ScreenCardRemoval = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const ui = useContext(RouteContext);
  const accessibility = useContext(AccessibilityContext);
  const modal = useContext(ModalContext);
  const refs = refsData.refs;
  const setCurrentPage = ui.setCurrentPage;
  const volume = accessibility.volume;
  const ModalPaymentError = modal.ModalPaymentError;
  const hiddenPageButtonRef = refs.ScreenCardRemoval.hiddenPageButtonRef;
  const systemControlsRef = refs.ScreenCardRemoval.systemControlsRef;
  const { handleText } = useTextHandler(volume);
  const { play: playSound } = useSound();
  
  // sections 객체 생성
  const sections = useMemo(() => ({
    hiddenPageButton: hiddenPageButtonRef,
    systemControls: systemControlsRef
  }), []);
  
  useEffect(() => {
    const t = setTimeout(() => handleText(TTS.screenCardRemoval()), TIMER_CONFIG.TTS_DELAY);
    return () => clearTimeout(t);
  }, [handleText]);
  
  useMultiModalButtonHandler({
    initFocusableSections: ['hiddenPageButton'],
    initFirstButtonSection: 'hiddenPageButton',
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections
  });

  const highlight = "primary";

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div data-tts-text="작업 관리, 버튼 한 개," className="main forth card-remove">
        <PageTitle><span><span className={highlight}>카드</span>를 뽑으세요.</span></PageTitle>
        <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" onClick={() => ModalPaymentError.open()} />
      </div>
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenCardRemoval.displayName = 'ScreenCardRemoval';

// ============================================================================
// 프로세스 9 컴포넌트 (인쇄 선택)
// ============================================================================

const ScreenOrderComplete = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const ui = useContext(RouteContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const modal = useContext(ModalContext);
  const refs = refsData.refs;
  const setCurrentPage = ui.setCurrentPage;
  const sendPrintReceiptToApp = order.sendPrintReceiptToApp;
  const volume = accessibility.volume;
  const ModalReturn = modal.ModalReturn;
  const ModalAccessibility = modal.ModalAccessibility;
  const setQuantities = order.setQuantities;
  const totalMenuItems = order.totalMenuItems;
  const setIsDark = accessibility.setIsDark;
  const setVolume = accessibility.setVolume;
  const setIsLarge = accessibility.setIsLarge;
  const setIsLow = accessibility.setIsLow;
  const hiddenPageButtonRef = refs.ScreenOrderComplete.hiddenPageButtonRef;
  const actionBarRef = refs.ScreenOrderComplete.actionBarRef;
  const systemControlsRef = refs.ScreenOrderComplete.systemControlsRef;
  const { handleText } = useTextHandler(volume);
  const { updateOrderNumber } = useOrderNumber();
  const { play: playSound } = useSound();
  
  // sections 객체 생성
  const sections = {
    hiddenPageButton: hiddenPageButtonRef,
    actionBar: actionBarRef,
    systemControls: systemControlsRef
  };
  
  useEffect(() => {
    updateOrderNumber();
  }, [updateOrderNumber]);
  
  const countdown = usePaymentCountdown({
    step: PAY_STEP.PRINT_SELECT,
    onTimeout: () => setCurrentPage('ScreenFinish'),
    ModalReturn, ModalAccessibility,
    setQuantities, totalMenuItems,
    setIsDark, setVolume, setIsLarge, setIsLow,
    setCurrentPage
  });
  
  useEffect(() => {
    const t = setTimeout(() => handleText(TTS.screenOrderComplete()), TIMER_CONFIG.TTS_DELAY);
    return () => clearTimeout(t);
  }, [handleText]);
  
  useMultiModalButtonHandler({
    initFocusableSections: ['hiddenPageButton', 'actionBar'],
    initFirstButtonSection: 'hiddenPageButton',
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections
  });

  const highlight = "primary";
  
  const handleReceipt = useCallback((target) => {
    if (target === 'print') {
      if (sendPrintReceiptToApp) sendPrintReceiptToApp();
      setCurrentPage('ScreenReceiptPrint');
    } else {
      setCurrentPage('ScreenFinish');
    }
  }, [sendPrintReceiptToApp, setCurrentPage]);

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div data-tts-text="인쇄 선택, 버튼 두 개," ref={actionBarRef} className="main forth">
        <PageTitle>
          <div>왼쪽 아래의 프린터에서 <span className={highlight}>주문표</span>를</div>
          <div>받으시고 <span className={highlight}>영수증 출력</span>을 선택합니다</div>
        </PageTitle>
        <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
        <div className="order-num">
          <p>주문</p>
          <p>100</p>
        </div>
        <div className="task-manager">
          <Button className="w371h120" onClick={() => handleReceipt("print")} label="영수증 출력" />
          <Button ttsText="출력 안함," className="w371h120" onClick={() => handleReceipt("skip")} label={`출력 안함${countdown}`} />
        </div>
      </div>
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenOrderComplete.displayName = 'ScreenOrderComplete';


// ============================================================================
// 프로세스 10 컴포넌트 (영수증 출력)
// ============================================================================

const ScreenReceiptPrint = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const ui = useContext(RouteContext);
  const accessibility = useContext(AccessibilityContext);
  const modal = useContext(ModalContext);
  const order = useContext(OrderContext);
  const refs = refsData.refs;
  const setCurrentPage = ui.setCurrentPage;
  const volume = accessibility.volume;
  const ModalReturn = modal.ModalReturn;
  const ModalAccessibility = modal.ModalAccessibility;
  const setQuantities = order.setQuantities;
  const totalMenuItems = order.totalMenuItems;
  const setIsDark = accessibility.setIsDark;
  const setVolume = accessibility.setVolume;
  const setIsLarge = accessibility.setIsLarge;
  const setIsLow = accessibility.setIsLow;
  const hiddenPageButtonRef = refs.ScreenReceiptPrint.hiddenPageButtonRef;
  const actionBarRef = refs.ScreenReceiptPrint.actionBarRef;
  const systemControlsRef = refs.ScreenReceiptPrint.systemControlsRef;
  const { handleText } = useTextHandler(volume);
  const { play: playSound } = useSound();
  
  // sections 객체 생성
  const sections = {
    hiddenPageButton: hiddenPageButtonRef,
    actionBar: actionBarRef,
    systemControls: systemControlsRef
  };
  
  const countdown = usePaymentCountdown({
    step: PAY_STEP.RECEIPT_PRINT,
    onTimeout: () => setCurrentPage('ScreenFinish'),
    ModalReturn, ModalAccessibility,
    setQuantities, totalMenuItems,
    setIsDark, setVolume, setIsLarge, setIsLow,
    setCurrentPage
  });
  
  useEffect(() => {
    const t = setTimeout(() => handleText(TTS.screenReceiptPrint()), TIMER_CONFIG.TTS_DELAY);
    return () => clearTimeout(t);
  }, [handleText]);
  
  useMultiModalButtonHandler({
    initFocusableSections: ['hiddenPageButton', 'actionBar'],
    initFirstButtonSection: 'hiddenPageButton',
    enableGlobalHandlers: false,
    enableKeyboardNavigation: true,
    playSoundOpt: playSound,
    sections
  });

  const highlight = "primary";

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div data-tts-text="작업 관리, 버튼 한 개," className="main forth" ref={actionBarRef}>
        <PageTitle>
          <div>왼쪽 아래의 <span className={highlight}>프린터</span>에서 <span className={highlight}>영수증</span>을</div>
          <div>받으시고 <span className={highlight}>마무리</span>&nbsp;버튼을 누르세요</div>
        </PageTitle>
        <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
        <Button className="w500h120" navigate="ScreenFinish" label={`마무리${countdown}`} ttsText="마무리하기" />
      </div>
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenReceiptPrint.displayName = 'ScreenReceiptPrint';

// ============================================================================
// 프로세스 11 컴포넌트 (완료)
// ============================================================================

const ScreenFinish = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const modal = useContext(ModalContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const ui = useContext(RouteContext);
  const refs = refsData.refs;
  const ModalReturn = modal.ModalReturn;
  const ModalAccessibility = modal.ModalAccessibility;
  const setQuantities = order.setQuantities;
  const totalMenuItems = order.totalMenuItems;
  const setIsDark = accessibility.setIsDark;
  const setVolume = accessibility.setVolume;
  const setIsLarge = accessibility.setIsLarge;
  const setIsLow = accessibility.setIsLow;
  const setCurrentPage = ui.setCurrentPage;
  const volume = accessibility.volume;
  const hiddenPageButtonRef = refs.ScreenFinish.hiddenPageButtonRef;
  const systemControlsRef = refs.ScreenFinish.systemControlsRef;
  const { handleText } = useTextHandler(volume);
  
  const countdown = usePaymentCountdown({
    step: PAY_STEP.FINISH,
    onTimeout: () => {},
    ModalReturn, ModalAccessibility,
    setQuantities, totalMenuItems,
    setIsDark, setVolume, setIsLarge, setIsLow, setCurrentPage
  });
  
  useEffect(() => {
    const t = setTimeout(() => handleText(TTS.screenFinish), TIMER_CONFIG.TTS_DELAY);
    return () => clearTimeout(t);
  }, [handleText]);

  const currentPageForTop = ui.currentPage;
  const totalSumForTop = order.totalSum;
  const volumeForTop = accessibility.volume;
  const { handleText: handleTextForTop } = useTextHandler(volumeForTop);
  
  const pageText = useMemo(() => {
    switch (currentPageForTop) {
      case 'ScreenStart': return TTS.screenStart();
      case 'ScreenMenu': return TTS.screenMenu();
      case 'ScreenDetails': return TTS.screenDetails();
      case 'ScreenPayments': return TTS.screenPayments(totalSumForTop, formatNumber);
      default: return "";
    }
  }, [currentPageForTop, totalSumForTop]);
  
  useEffect(() => {
    if (pageText && currentPageForTop !== 'ScreenStart' && currentPageForTop !== 'ScreenPayments') {
      const t = setTimeout(() => handleTextForTop(pageText), CFG.TTS_DELAY);
      return () => clearTimeout(t);
    }
  }, [currentPageForTop, pageText, handleTextForTop]);

  return (
    <>
      <div className="black"></div>
      <div className="top">
        <div className="hidden-div" ref={hiddenPageButtonRef}>
          <button
            type="hidden"
            className="hidden-btn page-btn"
            data-tts-text={pageText}
          />
        </div>
      </div>
      <Step />
      <div className="main forth">
        <PageTitle>이용해 주셔서 감사합니다</PageTitle>
        <div className="end-countdown">
            <span>
            {countdown <= 0 ? '✓' : `${Math.floor(countdown)}`}
            </span>
        </div>
      </div>
      <Bottom systemControlsRef={systemControlsRef} />
      <GlobalModals />
    </>
  );
});
ScreenFinish.displayName = 'ScreenFinish';

// ============================================================================
// 접근성 모달 컴포넌트
// ============================================================================


// 접근성 모달
const AccessibilityModal = memo(() => {
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const accessibility = useContext(AccessibilityContext);
  const modal = useContext(ModalContext);
  const refs = refsData.refs;
  const isLow = accessibility.isLow;
  const setIsLow = accessibility.setIsLow;
  const isDark = accessibility.isDark;
  const setIsDark = accessibility.setIsDark;
  const isLarge = accessibility.isLarge;
  const setIsLarge = accessibility.setIsLarge;
  const volume = accessibility.volume;
  const setVolume = accessibility.setVolume;
  const setAccessibility = accessibility.setAccessibility;
  const ModalAccessibility = modal.ModalAccessibility;
  const readCurrentPage = useReadCurrentPage();
  const originalSettingsRef = refs.AccessibilityModal.originalSettingsRef;
  
  const { setAudioVolume } = useSafeDocument();
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

  // customContent: 설정 옵션들
  const customContent = (
    <>
      {/* 설명 문구 */}
      <div className="modal-message">
        <div>원하시는&nbsp;<Highlight>접근성 옵션</Highlight>을 선택하시고</div>
        <div><Highlight>적용하기</Highlight>&nbsp;버튼을 누르세요</div>
      </div>
          {/* 초기설정 */}
      <div className="setting-row" data-tts-text="초기설정으로 일괄선택, 버튼 한 개, ">
            <span className="setting-name">초기설정으로 일괄선택</span>
            <div className="task-manager">
          <Button className="w242h076" svg={<Icon name="Restart" />} label="초기설정" onClick={handleInitialSettingsPress} />
            </div>
          </div>
          <hr className="setting-line" />
          {/* 고대비화면 */}
          <div className="setting-row">
            <span className="setting-name"><span className="icon"><Icon name="Contrast" /></span>고대비화면</span>
        <div className="task-manager" data-tts-text={`고대비 화면, 선택상태, ${getStatusText.dark}, 버튼 두 개,`}>
          <Button toggle value={currentSettings.isDark} selectedValue={false} onChange={handleDarkChange} label="끔" className="w113h076" />
          <Button toggle value={currentSettings.isDark} selectedValue={true} onChange={handleDarkChange} label="켬" className="w113h076" />
            </div>
          </div>
          <hr className="setting-line" />
          {/* 소리크기 */}
          <div className="setting-row">
            <span className="setting-name"><span className="icon"><Icon name="Volume" /></span>소리크기</span>
        <div className="task-manager" data-tts-text={`소리크기, 선택상태, ${getStatusText.volume}, 버튼 네 개, `}>
          <Button toggle value={currentSettings.volume} selectedValue={0} onChange={handleVolumeChange} label={VOLUME_MAP[0]} className="w070h076" />
          <Button toggle value={currentSettings.volume} selectedValue={1} onChange={handleVolumeChange} label={VOLUME_MAP[1]} className="w070h076" />
          <Button toggle value={currentSettings.volume} selectedValue={2} onChange={handleVolumeChange} label={VOLUME_MAP[2]} className="w070h076" />
          <Button toggle value={currentSettings.volume} selectedValue={3} onChange={handleVolumeChange} label={VOLUME_MAP[3]} className="w070h076" />
            </div>
          </div>
          <hr className="setting-line" />
          {/* 큰글씨화면 */}
          <div className="setting-row">
            <span className="setting-name"><span className="icon"><Icon name="Large" /></span>큰글씨화면</span>
        <div className="task-manager" data-tts-text={`큰글씨 화면, 선택상태, ${getStatusText.large}, 버튼 두 개, `}>
          <Button toggle value={currentSettings.isLarge} selectedValue={false} onChange={handleLargeChange} label="끔" className="w113h076" />
          <Button toggle value={currentSettings.isLarge} selectedValue={true} onChange={handleLargeChange} label="켬" className="w113h076" />
            </div>
          </div>
          <hr className="setting-line" />
          {/* 낮은화면 */}
          <div className="setting-row">
            <span className="setting-name"><span className="icon"><Icon name="Wheelchair" /></span>낮은화면</span>
        <div className="task-manager" data-tts-text={`낮은 화면, 선택상태, ${getStatusText.low}, 버튼 두 개, `}>
          <Button toggle value={currentSettings.isLow} selectedValue={false} onChange={handleLowChange} label="끔" className="w113h076" />
          <Button toggle value={currentSettings.isLow} selectedValue={true} onChange={handleLowChange} label="켬" className="w113h076" />
            </div>
          </div>
          {/* 적용 버튼들 */}
      <div className="task-manager" data-tts-text="작업 관리, 버튼 두 개, " ref={refs.BaseModal.modalConfirmButtonsRef}>
        <Button className="w285h090" svg={<Icon name="Cancel" />} label="적용안함" onClick={handleCancelPress} />
        <Button className="w285h090" svg={<Icon name="Ok" />} label="적용하기" onClick={handleApplyPress} />
      </div>
    </>
  );

  return (
    <BaseModal
      isOpen={ModalAccessibility.isOpen}
      customContent={customContent}
      customTts="알림, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다, "
      icon="Wheelchair"
      title="접근성"
      onCancel={handleCancelPress}
      onConfirm={handleApplyPress}
      cancelLabel="적용안함"
    />
  );
});
AccessibilityModal.displayName = 'AccessibilityModal';

// ============================================================================
// 전역 모달 컴포넌트
// ============================================================================

const GlobalModals = () => {
  // 개별 Context에서 값 가져오기
  const modal = useContext(ModalContext);
  const order = useContext(OrderContext);
  const ModalReturn = modal?.ModalReturn || { isOpen: false, open: () => {}, close: () => {} };
  const ModalAccessibility = modal?.ModalAccessibility || { isOpen: false, open: () => {}, close: () => {} };
  const ModalReset = modal?.ModalReset || { isOpen: false, open: () => {}, close: () => {} };
  const ModalCall = modal?.ModalCall || { isOpen: false, open: () => {}, close: () => {} };
  const ModalDelete = modal?.ModalDelete || { isOpen: false, open: () => {}, close: () => {} };
  const ModalDeleteCheck = modal?.ModalDeleteCheck || { isOpen: false, open: () => {}, close: () => {} };
  const ModalTimeout = modal?.ModalTimeout || { isOpen: false, open: () => {}, close: () => {} };
  const ModalPaymentError = modal?.ModalPaymentError || { isOpen: false, open: () => {}, close: () => {} };
  const ModalDeleteItemId = modal?.ModalDeleteItemId || 0;
  const handleDelete = order?.handleDelete || (() => {});

  return (
    <>
      {ModalReturn.isOpen && <ReturnModal />}
      {ModalReset.isOpen && <ResetModal />}
      {ModalAccessibility.isOpen && <AccessibilityModal />}
      {ModalCall.isOpen && <CallModal />}
      {ModalDelete.isOpen && <DeleteModal handleDelete={handleDelete} id={ModalDeleteItemId} />}
      {ModalDeleteCheck.isOpen && <DeleteCheckModal handleDelete={handleDelete} id={ModalDeleteItemId} />}
      {ModalTimeout.isOpen && <TimeoutModal />}
      {ModalPaymentError.isOpen && <PaymentErrorModal />}
    </>
  );
};

// 메인 Run 컴포넌트 - Provider 레이어 구조 (의존성 순서에 따라)
const Run = () => (
  <>
    <audio id="audioPlayer" src="" controls className="hidden" />
    {/* Layer 1: TTS 기반 Provider */}
    <TTSDBProvider>
      {/* Layer 2: TTS State Provider (TTSDBProvider 의존) */}
      <TTSStateProvider>
        {/* Layer 3: Accessibility Provider (독립) */}
          <AccessibilityProvider>
          {/* Layer 4: Order Provider (독립) */}
            <OrderProvider>
            {/* Layer 5: Modal Provider (독립 - RouteProvider보다 바깥에 있어야 Screen 컴포넌트가 접근 가능) */}
                <ModalProvider>
              {/* Layer 6: Ref Provider (refs만 제공 - RouteProvider보다 바깥에 있어야 Screen 컴포넌트가 접근 가능) */}
              <RefProvider>
                {/* Layer 6.5: Pointed Button Provider (전역 포인티드 버튼 관리) */}
                <PointedButtonProvider>
                  {/* Layer 7: UI Provider (독립) */}
                  <RouteProvider>
                  {/* Layer 8: Button State Provider (독립) */}
                  <ButtonStateProvider>
                    {/* Layer 9: Button Group Provider (독립) */}
                    <ButtonGroupProvider>
                      <ButtonHandlerInitializer />
                      <SizeControlInitializer />
                      <ViewportInitializer />
                    </ButtonGroupProvider>
                  </ButtonStateProvider>
                </RouteProvider>
                </PointedButtonProvider>
              </RefProvider>
                </ModalProvider>
            </OrderProvider>
          </AccessibilityProvider>
      </TTSStateProvider>
    </TTSDBProvider>
  </>
);

export default Run;

// ============================================================================
// 애플리케이션 마운트
// body를 직접 root로 사용
// ============================================================================
ReactDOM.createRoot(document.body).render(React.createElement(Run));
