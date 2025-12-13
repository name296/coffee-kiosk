import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, createContext, useContext, memo } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import menuData from "./menuData";
import Icon, { TakeinIcon, TakeoutIcon, DeleteIcon, ResetIcon, OrderIcon, AddIcon, PayIcon, HomeIcon, WheelchairIcon, StepIcon, TimeIcon } from "./Icon";

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

// TTS 공통 스크립트 (모든 스크린에서 공통으로 사용)
const TTS = {
  replay: "키패드 사용법 안내는 키패드의 별 버튼을, 직전 안내 다시 듣기는 샵 버튼을 누릅니다,",
};

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
  
  return {
    pageNumber, totalPages, currentItems, itemsPerPage,
    handlePrevPage, handleNextPage, goToPage, resetPage, setPageNumber
  };
};


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

// ============================================================================
// 메뉴 유틸리티 함수 (단일책임원칙: 각 함수는 하나의 책임만)
// ============================================================================

// 카테고리별 메뉴 필터링 (단일책임: 카테고리 필터링만)
// placeholderMenu 파라미터는 ScreenMenu에서 전달됨
const categorizeMenu = (items, tabName, categories = [], placeholderMenu) => {
  if (tabName === "전체메뉴") return items;
  const category = categories.find(c => c.cate_name === tabName);
  if (!category) return [placeholderMenu];
  const filtered = items.filter(item => item.cate_id === category.cate_id);
  return filtered.length > 0 ? filtered : [placeholderMenu];
};

// 수량 합계 계산 (단일책임: 수량 합계만)
const calculateSum = (quantities) => 
  Number(Object.values(quantities).reduce((sum, val) => sum + val, 0));

// 총 금액 계산 (단일책임: 금액 계산만)
const calculateTotal = (quantities, items) => {
  const itemMap = new Map(items.map(item => [item.id, item]));
  return Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .reduce((sum, [id, qty]) => {
      const item = itemMap.get(Number(id));
      return sum + (item ? Number(item.price) * qty : 0);
    }, 0);
};

// 선택된 메뉴만 필터링 (단일책임: 필터링만)
const filterMenuItems = (items, quantities) => 
  items.filter(item => quantities[item.id] > 0);

// 주문 아이템 생성 (단일책임: 주문 아이템 생성만)
const createOrderItems = (items, quantities) => 
  items
    .filter(item => quantities[item.id] > 0)
    .map(item => ({ ...item, quantity: quantities[item.id] }));



// ============================================================================
// TTS 관련 Context (단일책임원칙: 각 책임별 분리)
// ============================================================================

// TTS Database Context - IndexedDB를 통한 TTS 오디오 캐시 관리
// 의존성: 없음 (독립)
// 사용처: useTextHandler, usePlayText
const TTSDBContext = createContext();

// TTS State Context - TTS 재생 상태 관리 (isPlaying, replayText, requestIdRef, audioSrc, audioPlaybackRate, audioVolume)
// 의존성: 없음 (독립, 하지만 useTextHandler가 TTSDBContext와 함께 사용)
// 사용처: useTextHandler, usePlayText, useStopAllAudio, TTSAudioPlayer
const TTSStateContext = createContext();

// TTS Audio Player 컴포넌트 (React 방식으로 TTS 재생 관리)
// 의존성: TTSStateContext
// 사용처: TTSStateProvider 내부 (Provider 안에서 Context 사용, JSX 방식)
const TTSAudioPlayer = memo(() => {
  const ttsState = useContext(TTSStateContext);
  const audioPlayerRef = ttsState?.audioPlayerRef;
  
  // React state로 Audio 제어
  const src = ttsState?.audioSrc ?? '';
  const playbackRate = ttsState?.audioPlaybackRate ?? 1;
  const volume = ttsState?.audioVolume ?? 1;
  const shouldPlay = ttsState?.shouldPlay ?? false;
  const setIsPlaying = ttsState?.setIsPlaying;
  
  // 포커스 기반 TTS는 Run 컴포넌트 최상위의 audioPlayer 사용 (과거 앱 방식)
  // TTSAudioPlayer는 ref만 연결하고 실제 audio 요소는 렌더링하지 않음
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const existingAudio = document.getElementById('audioPlayer');
    if (existingAudio && audioPlayerRef) {
      audioPlayerRef.current = existingAudio;
    }
  }, [audioPlayerRef]);
  
  // 통합된 Audio 제어: src, playbackRate, volume, shouldPlay 설정
  useEffect(() => {
    if (!audioPlayerRef?.current) return;
    const audio = audioPlayerRef.current;
    
    // src 설정
    if (src) {
      audio.src = src;
    }
    
    // playbackRate와 volume 설정
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    
    // shouldPlay에 따라 autoplay 속성 설정
    if (shouldPlay && src) {
      audio.setAttribute('autoplay', 'autoplay');
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔊 [TTS] 오디오 autoplay 속성 설정: ${src.substring(0, 60)}...`);
      }
    } else {
      audio.removeAttribute('autoplay');
    }
  }, [src, playbackRate, volume, shouldPlay, audioPlayerRef]);
  
  // 재생 시작/에러 감지 (autoplay로 재생 시작됨)
  useEffect(() => {
    if (!audioPlayerRef?.current || !src || !shouldPlay) return;
    
    const audio = audioPlayerRef.current;
    
    const handlePlay = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔊 [TTS] 오디오 재생 시작 (autoplay)`);
      }
      if (setIsPlaying) setIsPlaying(true);
    };
    
    const handleError = (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔊 [TTS] 오디오 재생 실패:`, error);
      }
      if (setIsPlaying) setIsPlaying(false);
      if (ttsState?.setShouldPlay) ttsState.setShouldPlay(false);
    };
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleError);
    };
  }, [shouldPlay, src, audioPlayerRef, setIsPlaying, ttsState]);
  
  // 재생 완료 이벤트 처리
  useEffect(() => {
    if (!audioPlayerRef?.current) return;
    
    const audio = audioPlayerRef.current;
    
    const handleEnded = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔊 [TTS] 오디오 재생 완료`);
      }
      if (setIsPlaying) setIsPlaying(false);
      if (ttsState?.setShouldPlay) ttsState.setShouldPlay(false);
    };
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioPlayerRef, setIsPlaying, ttsState]);
  
  // TTSAudioPlayer는 실제 audio 요소를 렌더링하지 않음 (Run 컴포넌트의 audioPlayer 사용)
  return null;
});
TTSAudioPlayer.displayName = 'TTSAudioPlayer';

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

const TTSStateProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayText, setReplayText] = useState('');
  // Audio 컴포넌트를 위한 React state
  const [audioSrc, setAudioSrc] = useState('');
  const [audioPlaybackRate, setAudioPlaybackRate] = useState(1);
  const [audioVolume, setAudioVolume] = useState(1);
  const [shouldPlay, setShouldPlay] = useState(false);
  // 사용자 인터랙션 플래그 (브라우저 자동 재생 정책 대응)
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  // 비동기 요청 취소를 위한 요청 ID 추적 (모달과 스크린 간 공유)
  const requestIdRef = useRef(null);
  const audioPlayerRef = useRef(null);
  
  
  const value = useMemo(() => ({
    isPlaying,
    setIsPlaying,
    replayText,
    setReplayText,
    requestIdRef,
    audioSrc,
    setAudioSrc,
    audioPlaybackRate,
    setAudioPlaybackRate,
    audioVolume,
    setAudioVolume,
    shouldPlay,
    setShouldPlay,
    audioPlayerRef,
    hasUserInteracted,
    setHasUserInteracted
  }), [isPlaying, replayText, audioSrc, audioPlaybackRate, audioVolume, shouldPlay, hasUserInteracted]);
  
  // 오디오 플레이어 ref 연결은 TTSAudioPlayer 컴포넌트에서 처리
  
  return (
    <TTSStateContext.Provider value={value}>
      {/* TTSAudioPlayer는 포커스 기반 TTS용 (이니셜 TTS는 Run 컴포넌트 최상위의 audioPlayer 사용) */}
      <TTSAudioPlayer />
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
    setReplayText: context?.setReplayText ?? (() => {}),
    audioSrc: context?.audioSrc ?? '',
    setAudioSrc: context?.setAudioSrc ?? (() => {}),
    audioPlaybackRate: context?.audioPlaybackRate ?? 1,
    setAudioPlaybackRate: context?.setAudioPlaybackRate ?? (() => {}),
    audioVolume: context?.audioVolume ?? 1,
    setAudioVolume: context?.setAudioVolume ?? (() => {}),
    shouldPlay: context?.shouldPlay ?? false,
    setShouldPlay: context?.setShouldPlay ?? (() => {}),
    audioPlayerRef: context?.audioPlayerRef,
    hasUserInteracted: context?.hasUserInteracted ?? false,
    setHasUserInteracted: context?.setHasUserInteracted ?? (() => {})
  };
};


// ============================================================================
// Sound Hook (TTSContext 사용)
// ============================================================================

const useSound = () => {
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
    const src = name === 'onPressed' ? './SoundOnPressed.mp3' : name === 'note' ? './SoundNote.wav' : null;
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
      
      // 에러 핸들러 추가 (개발 환경 디버깅용)
      audio.addEventListener('error', (e) => {
        console.error(`[사운드] ${name} 재생 실패`, {
          src,
          error: e,
          audioError: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState
        });
      });
    }
    const a = audioRefs.current[name];
    a.volume = volumeRef.current;
    a.currentTime = 0;
    
    // play() 호출 및 에러 처리
    const playPromise = a.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[사운드] ${name} 재생 시작`, { src });
          }
        })
        .catch((error) => {
          console.error(`[사운드] ${name} 재생 실패`, {
            src,
            error,
            errorName: error.name,
            errorMessage: error.message
          });
        });
    }
  }, []);
  
  const setVolume = useCallback((v) => {
    volumeRef.current = Math.max(0, Math.min(1, v));
  }, []);
  
  return { play, setVolume };
};

// ============================================================================
// 포커스 관리 유틸리티 함수 (일관된 포커스 관리를 위한 원천 함수)
// ============================================================================

// .main 포커스 설정 원천 함수 (일관된 포커스 관리를 위한 원천 함수)
// 모든 .main 포커스 설정은 이 함수를 통해 수행
// 사용처: useDOM의 focusMain, useFocusTrap, useKeyboardNavigationHandler, RouteProvider
const focusMainElement = () => {
  if (typeof document === 'undefined') return;
  const mainElement = document.querySelector('.main');
  if (mainElement) {
    const prevActive = document.activeElement;
    const prevActiveInfo = prevActive ? {
      tagName: prevActive.tagName,
      className: prevActive.className,
      id: prevActive.id || null
    } : null;
    
    console.log('[포커스] focusMainElement 호출', {
      from: prevActiveInfo,
      to: { tagName: mainElement.tagName, className: mainElement.className },
      timestamp: new Date().toISOString()
    });
    
    mainElement.focus();
    // focusin 이벤트는 브라우저가 자동으로 발생시키므로 수동 트리거 불필요
  }
};

// ============================================================================
// 오디오 중단 유틸리티 함수 (단일책임원칙: 각 오디오 타입별로 분리)
// ============================================================================

// 모든 TTS 즉시 중단 (단일책임: 모든 TTS 중단만)
// 요구사항: 새 TTS 재생 시 이전 TTS 즉시 중단
// React 방식: TTSStateContext를 통해 Audio 제어
const stopAllTTS = (ttsState) => {
  // 오디오 플레이어 중단 (React 방식)
  if (ttsState?.audioPlayerRef?.current) {
    const audioPlayer = ttsState.audioPlayerRef.current;
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
  
  // React state 이니셜
  if (ttsState?.setAudioSrc) ttsState.setAudioSrc('');
  if (ttsState?.setShouldPlay) ttsState.setShouldPlay(false);
  if (ttsState?.setIsPlaying) ttsState.setIsPlaying(false);
  
};

// ============================================================================
// TTS 텍스트 핸들러 (단일책임원칙: TTS 재생 관리만)
// ============================================================================

// TTS 재생 함수 (단일책임: TTS 재생만)
// 요구사항:
// 1. 캐시 우선 사용
// 2. 캐시 없으면 외부 엔진 → 캐시 저장
// 3. 외부 엔진 실패 시 재생 중단
// 4. 단일 재생 보장 (isPlaying 플래그)
// 5. 비동기 요청 취소 메커니즘 (빠른 포커스/호버 변경 시 이전 요청 취소)
const playTTS = async (text, speed, vol, ttsDB, ttsState, requestIdRef) => {
  if (!text) return;
  
  // TTS 재생 관측성: 재생 시작 로그
  if (process.env.NODE_ENV === 'development') {
    const textPreview = text.length > 50 ? text.substring(0, 50) + '...' : text;
    console.log(`🔊 [TTS] 재생 시작: "${textPreview}" (속도: ${speed}, 볼륨: ${vol})`);
  }
  
  const { isPlaying, setIsPlaying } = ttsState || {};
  const { getFromDB, saveToDB } = ttsDB || {};
  
  // 요구사항 5: 새 재생 시 이전 TTS 즉시 중단
  stopAllTTS(ttsState);
  // 이전 재생 상태 해제 (새 재생을 위해)
      setIsPlaying(false);
  
  // 요구사항 4: 단일 재생 보장 (중복 재생 방지)
  // stopAllTTS() 후 즉시 재생 시작하므로 isPlaying 체크는 제거
  setIsPlaying(true);
  
  // 현재 요청 ID 생성 (빠른 포커스/호버 변경 시 이전 요청 취소를 위해)
  const currentRequestId = Date.now() + Math.random();
  if (requestIdRef) {
    requestIdRef.current = currentRequestId;
  }
  
  const audioPlayerRef = ttsState?.audioPlayerRef;
  const cacheKey = `audio_${text}`;
  
  // audioPlayerRef가 없으면 재생 불가능
  if (!audioPlayerRef) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔊 [TTS] 재생 불가능 (audioPlayerRef 없음)`);
    }
    setIsPlaying(false);
    return;
  }
  
  try {
    // 요구사항 1: 캐시 확인
    const cachedAudio = await getFromDB?.(cacheKey);
    
    // 요청이 취소되었는지 확인 (새로운 요청이 들어왔는지)
    if (requestIdRef && requestIdRef.current !== currentRequestId) {
      return;
    }
    
    if (cachedAudio) {
      // 캐시 있으면 캐시 재생
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔊 [TTS] 캐시에서 재생 (캐시 키: ${cacheKey})`);
      }
      
      // 요청이 취소되었는지 다시 확인
      if (requestIdRef && requestIdRef.current !== currentRequestId) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔊 [TTS] 요청 취소됨 (새 요청 들어옴)`);
        }
        return;
      }
      
      // React 방식으로 Audio 재생
      playAudio(ttsState, cachedAudio, speed, vol);
  
      // 에러 처리는 TTSAudioPlayer의 이벤트 리스너에서 처리
      if (audioPlayerRef?.current) {
        const errorHandler = createTTSAudioErrorHandler(requestIdRef, currentRequestId, ttsState, setIsPlaying, '캐시');
        audioPlayerRef.current.addEventListener('error', errorHandler, { once: true });
      }
    } else {
      // 요구사항 2: 캐시 없으면 외부 엔진 시도
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔊 [TTS] 캐시 없음 → 외부 엔진 요청 중...`);
      }
      const audioUrl = await fetchTTSFromServer(text);
      
      // 요청이 취소되었는지 확인 (외부 엔진 응답 후)
      if (requestIdRef && requestIdRef.current !== currentRequestId) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔊 [TTS] 요청 취소됨 (새 요청 들어옴)`);
        }
        return;
      }
      
      if (audioUrl) {
        // 외부 엔진 성공: 재생 및 캐시 저장
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔊 [TTS] 외부 엔진 성공 → 오디오 재생 및 캐시 저장`);
        }
        playAudio(ttsState, audioUrl, speed, vol);
        
        // 요구사항 2: 캐시에 저장 (비동기)
        fetch(audioUrl)
          .then(res => res.blob())
          .then(blob => saveAudioToDB(saveToDB, cacheKey, blob))
          .catch(() => {});
        
        // 에러 처리는 TTSAudioPlayer의 이벤트 리스너에서 처리
        if (audioPlayerRef.current) {
          const errorHandler = createTTSAudioErrorHandler(requestIdRef, currentRequestId, ttsState, setIsPlaying, '외부 엔진');
          audioPlayerRef.current.addEventListener('error', errorHandler, { once: true });
        }
      } else {
        // 요구사항 3: 외부 엔진 실패 시 재생 중단
        if (!requestIdRef || requestIdRef.current === currentRequestId) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔊 [TTS] 외부 엔진 실패`);
          }
        setIsPlaying(false);
        }
      }
    }
  } catch (error) {
    // 에러 시 재생 중단 (요청이 취소되지 않은 경우만)
    if (!requestIdRef || requestIdRef.current === currentRequestId) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔊 [TTS] 에러 발생`, error);
      }
      setIsPlaying(false);
    }
  }
};

// TTS 텍스트 핸들러 훅 (단일책임: TTS 재생 관리만)
// 요구사항: 새 TTS 재생 시 이전 TTS 즉시 중단, 단일 재생 보장
// 의존성: TTSDBContext (initDB, getFromDB, saveToDB), TTSStateContext (setReplayText, replayText, isPlaying, setIsPlaying, requestIdRef)
// 사용처: 모든 Screen 컴포넌트, 모달 컴포넌트
function useTextHandler(volume) {
  const ttsDB = useContext(TTSDBContext) || {};
  const ttsState = useContext(TTSStateContext) || {};
  const initDB = ttsDB?.initDB;
  
  // 비동기 요청 취소를 위한 요청 ID 추적 (TTSStateContext에서 공유)
  const requestIdRef = ttsState?.requestIdRef;
  
  // TTS 텍스트 처리 (요구사항 5: 새 재생 시 이전 TTS 즉시 중단)
  const handleText = useCallback((txt, flag = true, newVol = -1) => {
    if (!txt) return;
    
    // replayText 저장 (필요시)
    if (flag) ttsState?.setReplayText(txt);
    
    // 요구사항 5: 새 재생 시 이전 TTS 즉시 중단 및 재생
    const vol = newVol !== -1 ? VOLUME_MAP[newVol] : VOLUME_MAP[volume];
    playTTS(txt, 1, vol, ttsDB, ttsState, requestIdRef);
  }, [ttsState, ttsDB, volume, requestIdRef]);
  
  // TTS 재생 (replayText 재생)
  const handleReplayText = useCallback(() => {
    if (ttsState?.replayText) {
      const vol = VOLUME_MAP[volume];
      playTTS(ttsState.replayText, 1, vol, ttsDB, ttsState, requestIdRef);
    }
  }, [ttsState, ttsDB, volume, requestIdRef]);
  
  return { initDB, handleText, handleReplayText };
}

// TTS 재생 함수들 (단일책임원칙: 각 단계별로 분리)
// ============================================================================

// 볼륨 매핑 상수 (중복 제거)
const VOLUME_MAP = { 0: 0, 1: 0.5, 2: 0.75, 3: 1 };

// TTS 오디오 에러 핸들러 생성 (중복 제거)
const createTTSAudioErrorHandler = (requestIdRef, currentRequestId, ttsState, setIsPlaying, source = '') => {
  return () => {
    if (!requestIdRef || requestIdRef.current !== currentRequestId) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔊 [TTS] 오디오 에러 핸들러: 요청 취소됨`);
      }
      return;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔊 [TTS] 오디오 에러 발생${source ? ` (${source})` : ''}`);
    }
    if (ttsState?.setAudioSrc) ttsState.setAudioSrc('');
    if (ttsState?.setShouldPlay) ttsState.setShouldPlay(false);
    if (setIsPlaying) setIsPlaying(false);
  };
};

// 외부 TTS 엔진 요청 (단일책임: 외부 엔진 전문 송수신만)
const fetchTTSFromServer = async (text) => {
  try {
    const response = await fetch('http://gtts.tovair.com:5000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (response.status !== 201) return null;
    
    const data = await response.json();
    const fileResponse = await fetch(`http://gtts.tovair.com:5000/api/download/${data.filename}`);
    
    if (!fileResponse.ok) return null;
    
    const blob = await fileResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    return null;
  }
};

// 오디오 재생 (단일책임: 오디오 재생만)
const playAudio = (ttsState, audioUrl, speed, volume) => {
  if (!ttsState || !audioUrl) return;
  
  ttsState.setAudioSrc?.(audioUrl);
  ttsState.setAudioPlaybackRate?.(speed);
  ttsState.setAudioVolume?.(volume);
  ttsState.setShouldPlay?.(true);
};

// 오디오를 DB에 저장 (단일책임: DB 저장만)
const saveAudioToDB = async (saveToDB, key, blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      await saveToDB(key, reader.result);
      resolve();
    };
  });
};

// 활성 요소 TTS 재생 훅 (단일책임: 활성 요소 TTS 재생만)
// 남은 시간 포맷팅 (단일책임: 시간 포맷팅만) - MM:SS 형식
const formatRemainingTime = (ms) => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const useIdleTimeout = (onTimeout, timeout = 300000, enabled = true, checkTimeoutModal = null) => {
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const onTimeoutRef = useRef(null);
  const timeoutRef = useRef(null);
  const currentTimeoutRef = useRef(null); // 현재 적용된 타임아웃 시간 저장
  const prevLogSecondRef = useRef(-1); // 로그 중복 방지용
  const [remainingTime, setRemainingTime] = useState(timeout);
  
  // 초기값 설정
  if (lastActivityRef.current === null) lastActivityRef.current = Date.now();
  if (onTimeoutRef.current === null) onTimeoutRef.current = onTimeout;
  if (timeoutRef.current === null) timeoutRef.current = timeout;
  if (currentTimeoutRef.current === null) currentTimeoutRef.current = timeout;
  
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    timeoutRef.current = timeout;
  }, [onTimeout, timeout]);
  
  // 마지막 resetTimer 호출 시간 추적 (너무 자주 호출되는 것 방지)
  const lastResetTimeRef = useRef(0);
  
  const resetTimer = useCallback(() => {
    const now = Date.now();
    // 100ms 이내에 중복 호출 방지
    if (now - lastResetTimeRef.current < 100) {
      console.log('[타이머] resetTimer 중복 호출 방지', { 
        timeSinceLastReset: now - lastResetTimeRef.current 
      });
      return;
    }
    lastResetTimeRef.current = now;
    
    // 타임아웃 모달이 열려있으면 20초로 리셋, 아니면 기본 타임아웃으로 리셋
    // checkTimeoutModal은 Bottom 컴포넌트에서 전달하는 콜백 (accessibility.ModalTimeout?.isOpen 체크)
    const isTimeoutModalOpen = checkTimeoutModal ? checkTimeoutModal() : false;
    const resetTime = isTimeoutModalOpen ? 20000 : timeoutRef.current;
    
    // 사용자 입력 시 리셋
    const prevLastActivity = lastActivityRef.current;
    const prevCurrentTimeout = currentTimeoutRef.current;
    lastActivityRef.current = now;
    currentTimeoutRef.current = resetTime;
    
    console.log('[타이머] resetTimer 호출됨', {
      now: new Date(now).toISOString(),
      resetTime,
      isTimeoutModalOpen,
      prevLastActivity: new Date(prevLastActivity).toISOString(),
      prevCurrentTimeout,
      timeoutRef: timeoutRef.current
    });
    
    // setRemainingTime은 setInterval에서만 호출하여 충돌 방지
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.log('[타이머] setTimeout 콜백 실행 (타임아웃)');
      if (onTimeoutRef.current) onTimeoutRef.current();
    }, resetTime);
  }, []);
  
  useEffect(() => {
    if (!enabled) {
      console.log('[타이머] 비활성화됨');
      setRemainingTime(timeout);
      currentTimeoutRef.current = timeout;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    // 초기 타이머 설정
    const initialTime = timeoutRef.current || timeout;
    const initialTimeMs = Date.now();
    lastActivityRef.current = initialTimeMs;
    currentTimeoutRef.current = initialTime;
    setRemainingTime(initialTime);
    console.log('[타이머] 초기화', {
      initialTime,
      initialTimeMs,
      timeout: timeoutRef.current,
      enabled
    });
    
    // 100ms마다 실행되는 카운트다운
    intervalRef.current = setInterval(() => {
      // 타임아웃 모달 상태 확인
      const isTimeoutModalOpen = checkTimeoutModal ? checkTimeoutModal() : false;
      
      // 타임아웃 모달이 닫혔는데 20초로 설정되어 있으면 기본 타임아웃(2분)으로 리셋
      if (!isTimeoutModalOpen && currentTimeoutRef.current === 20000) {
        const resetTime = timeoutRef.current || timeout;
        const resetTimeMs = Date.now();
        lastActivityRef.current = resetTimeMs;
        currentTimeoutRef.current = resetTime;
        console.log('[타이머] 모달 닫힘 → 기본 타임아웃으로 리셋', { resetTime, resetTimeMs });
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          if (onTimeoutRef.current) onTimeoutRef.current();
        }, resetTime);
      }
      
      // 경과 시간 계산 및 남은 시간 업데이트 (항상 실행)
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const remaining = Math.max(0, currentTimeoutRef.current - elapsed);
      
      // 관측성: 1초마다 로그 출력 (중복 방지)
      const currentSecond = Math.floor(remaining / 1000);
      if (currentSecond !== prevLogSecondRef.current && currentSecond >= 0) {
        prevLogSecondRef.current = currentSecond;
        console.log('[타이머] 카운트다운', {
          remaining: currentSecond + '초',
          remainingMs: remaining,
          elapsed: Math.ceil(elapsed / 1000) + '초',
          elapsedMs: elapsed,
          currentTimeout: currentTimeoutRef.current,
          lastActivity: new Date(lastActivityRef.current).toISOString(),
          now: new Date(now).toISOString()
        });
      }
      
      // 상태 업데이트 (항상 업데이트하여 카운트다운이 정상 작동하도록)
      setRemainingTime(remaining);
      
      // 0초가 되면 초기화
      if (remaining <= 0 && onTimeoutRef.current) {
        console.log('[타이머] 타임아웃 발생! 초기화 실행', {
          onTimeoutRef: !!onTimeoutRef.current,
          remaining,
          currentTimeout: currentTimeoutRef.current
        });
        // onTimeout 호출 전에 타이머 리셋하지 않음 (초기화가 완료된 후 리셋)
        const timeoutCallback = onTimeoutRef.current;
        if (timeoutCallback) {
          try {
            timeoutCallback();
            console.log('[타이머] onTimeout 콜백 실행 완료');
          } catch (error) {
            console.error('[타이머] onTimeout 콜백 실행 중 에러', error);
          }
        }
        // 초기화 후 타이머 리셋 (초기화가 완료된 후)
        const resetTime = timeoutRef.current || timeout;
        const resetTimeMs = Date.now();
        lastActivityRef.current = resetTimeMs;
        currentTimeoutRef.current = resetTime;
        setRemainingTime(resetTime);
        console.log('[타이머] 자동 리셋', { resetTime, resetTimeMs });
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          if (onTimeoutRef.current) onTimeoutRef.current();
        }, resetTime);
      }
    }, 100);
    
    console.log('[타이머] setInterval 시작됨', { intervalId: intervalRef.current });
    
    return () => {
      console.log('[타이머] cleanup - setInterval 정리', { intervalId: intervalRef.current });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled]); // timeout 의존성 제거 - timeoutRef.current 사용
  
  // 이벤트 핸들러를 useCallback으로 정의하여 의존성 문제 해결
  const handleUserActivity = useCallback((eventType = 'unknown') => {
    const now = Date.now();
    if (now - lastResetTimeRef.current < 100) {
      console.log('[타이머] handleUserActivity 중복 호출 방지', { 
        eventType,
        timeSinceLastReset: now - lastResetTimeRef.current 
      });
      return;
    }
    lastResetTimeRef.current = now;
    
    // 타임아웃 모달이 열려있으면 20초로 리셋, 아니면 기본 타임아웃으로 리셋
    const isTimeoutModalOpen = checkTimeoutModal ? checkTimeoutModal() : false;
    const resetTime = isTimeoutModalOpen ? 20000 : timeoutRef.current;
    
    const prevLastActivity = lastActivityRef.current;
    lastActivityRef.current = now;
    currentTimeoutRef.current = resetTime;
    
    console.log('[타이머] handleUserActivity 호출됨', {
      eventType,
      now: new Date(now).toISOString(),
      resetTime,
      isTimeoutModalOpen,
      prevLastActivity: new Date(prevLastActivity).toISOString(),
      timeoutRef: timeoutRef.current
    });
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.log('[타이머] setTimeout 콜백 실행 (타임아웃)', { eventType });
      if (onTimeoutRef.current) onTimeoutRef.current();
    }, resetTime);
  }, []); // 의존성 없음 - ref 사용
  
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    
    // 이벤트 리스너 등록
    const keydownHandler = () => handleUserActivity('keydown');
    const touchstartHandler = () => handleUserActivity('touchstart');
    const clickHandler = () => handleUserActivity('click');
    
    document.addEventListener('keydown', keydownHandler, { passive: true });
    document.addEventListener('touchstart', touchstartHandler, { passive: true });
    document.addEventListener('click', clickHandler, { passive: true });
    
    console.log('[타이머] 이벤트 리스너 등록됨', { enabled, onTimeout: !!onTimeoutRef.current });
    
    return () => {
      console.log('[타이머] cleanup - 이벤트 리스너 제거', { 
        timerRef: !!timerRef.current,
        enabled 
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('keydown', keydownHandler);
      document.removeEventListener('touchstart', touchstartHandler);
      document.removeEventListener('click', clickHandler);
    };
  }, [enabled, handleUserActivity]); // handleUserActivity는 useCallback으로 안정화됨
  
  // remainingTime이 변경될 때마다 포맷팅된 시간 재계산
  const remainingTimeFormatted = useMemo(() => formatRemainingTime(remainingTime), [remainingTime]);
  
  return { resetTimer, remainingTime, remainingTimeFormatted, onTimeoutRef };
};

// ============================================================================
// 결제 카운트다운 훅 (단일책임원칙: 각 단계별로 분리)
// ============================================================================

// 이니셜 함수 (단일책임: 이니셜만)
const initializeApp = (callbacks) => {
  console.log('[초기화] initializeApp 시작', { 
    callbacks: Object.keys(callbacks),
    setCurrentPage: !!callbacks.setCurrentPage
  });
  // 모든 모달 닫기
  callbacks.ModalRestart?.close();
  callbacks.ModalAccessibility?.close();
  callbacks.ModalTimeout?.close(); // 타임아웃 모달 닫기
  callbacks.setQuantities?.(callbacks.totalMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));
  callbacks.setIsDark?.(false);
  callbacks.setVolume?.(1);
  callbacks.setIsLarge?.(false);
  callbacks.setIsLow?.(false);
  
  // 시작화면으로 이동 (가장 중요)
  if (callbacks.setCurrentPage) {
    console.log('[초기화] setCurrentPage 호출 전');
    callbacks.setCurrentPage('ScreenStart');
    console.log('[초기화] setCurrentPage 호출 완료 - ScreenStart로 이동');
    // 모달이 닫힌 후 .main에 포커스 설정
    requestAnimationFrame(() => {
      focusMainElement();
    });
  } else {
    console.error('[초기화] setCurrentPage가 없습니다!');
  }
  console.log('[초기화] initializeApp 완료');
};

// 자동 완료 카운트다운 관리 (단일책임: 자동 완료 카운트다운만)
const useAutoFinishCountdown = (onTimeout) => {
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);
  
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const resetCountdown = () => setCountdown(60);
    setCountdown(60);
    
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
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
  }, [onTimeout]);
  
  return countdown;
};

// 완료 단계 카운트다운 관리 (단일책임: 완료 단계 카운트다운만)

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
  const containerRef = useRef(null);  // 실제 표시 컨테이너
  const measureRef = useRef(null);    // 숨겨진 측정용 컨테이너
  const [pageBreakpoints, setPageBreakpoints] = useState([0]); // 페이지별 시작 인덱스
  const [currentPage, setCurrentPage] = useState(0);
  const [calcTrigger, setCalcTrigger] = useState(0); // 재계산 트리거
  const [isCompact, setIsCompact] = useState(false); // compact 모드
  const [isReady, setIsReady] = useState(items.length === 0); // 최종 표시 준비 (빈 배열이면 바로 표시)
  
  // 재계산 함수
  const recalculate = useCallback(() => {
    setCalcTrigger(t => t + 1);
  }, []);
  
  // isLarge 변경 추적 (페이지 리셋용) - RefContext에서 가져오기
  const prevIsLargeRef = useContext(RefContext).refs.useCategoryPagination.prevIsLargeRef;
  const lastWidthRef = useContext(RefContext).refs.useCategoryPagination.lastWidthRef; // 이전 버튼 폭 저장
  const isCalculatingRef = useContext(RefContext).refs.useCategoryPagination.isCalculatingRef; // 계산 중 플래그 (무한루프 방지)
  const currentIsLargeRef = useRef(isLarge); // 현재 isLarge 값 저장 (calculate에서 사용)
  
  // 초기값 설정
  if (prevIsLargeRef && prevIsLargeRef.current === null) prevIsLargeRef.current = isLarge;
  if (lastWidthRef && lastWidthRef.current === null) lastWidthRef.current = 0;
  if (isCalculatingRef && isCalculatingRef.current === null) isCalculatingRef.current = false;
  currentIsLargeRef.current = isLarge; // 항상 최신 값으로 업데이트
  
  // isLarge 변경 감지 및 prevIsLargeRef 업데이트
  useEffect(() => {
    if (prevIsLargeRef && prevIsLargeRef.current !== isLarge) {
      prevIsLargeRef.current = isLarge;
      currentIsLargeRef.current = isLarge;
      // isLarge 변경 시 재계산 트리거
      setCalcTrigger(t => t + 1);
    } else {
      currentIsLargeRef.current = isLarge;
    }
  }, [isLarge, prevIsLargeRef]);
  
  // 계산 함수
  // items를 ref로 저장하여 의존성 문제 해결 (자연스러운 동기식 처리)
  const itemsRef = useRef(items);
  // items가 실제로 변경되었을 때만 ref 업데이트 (내용 비교)
  useEffect(() => {
    const currentItems = itemsRef.current;
    // 길이가 다르거나 내용이 다르면 업데이트
    if (items.length !== currentItems.length || 
        items.some((item, idx) => !currentItems[idx] || item.id !== currentItems[idx].id || item.name !== currentItems[idx].name)) {
      itemsRef.current = items;
    }
  }, [items]);
  
  const calculate = useCallback(() => {
    // 계산 중이면 무시 (무한루프 방지)
    if (isCalculatingRef?.current) return;
    
    const currentItems = itemsRef.current;
    
    if (!measureRef.current || !containerRef.current) {
      // ref가 없으면 일단 isReady를 true로 설정 (나중에 재계산됨)
      if (currentItems.length === 0) {
        setIsReady(true);
      }
      return;
    }
    
    // 계산 중 플래그 설정
    if (isCalculatingRef) isCalculatingRef.current = true;
    
    // isLarge는 ref를 통해 접근 (의존성 제거)
    const currentIsLarge = currentIsLargeRef.current;
    const isLargeChanged = prevIsLargeRef?.current !== null && prevIsLargeRef?.current !== currentIsLarge;
    if (prevIsLargeRef) prevIsLargeRef.current = currentIsLarge;
    
    // 새 계산 시작 - 숨기기만 (compact는 실제 측정 후 결정)
    setIsReady(false);
    
    const containerWidth = containerRef.current.clientWidth;
    const gap = parseFloat(getComputedStyle(containerRef.current).gap) || 0;
    
    const buttons = measureRef.current.querySelectorAll('.button');
    if (!buttons.length) {
      // 버튼이 없으면 빈 페이지로 설정하고 표시
      setPageBreakpoints([0]);
      setIsReady(true);
      return;
    }
    
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
    
    // 로그는 개발 환경에서만 출력 (불필요한 로그 제거)
    if (process.env.NODE_ENV === 'development') {
    console.log(`📊 버튼폭=${btnWidths.slice(0,3).join(',')}... → ${breakpoints.length}페이지`, breakpoints);
    }
    
    setPageBreakpoints(breakpoints);
    // isLarge 변경 시 페이지 리셋, 아니면 현재 페이지 유지 (범위 내)
    if (isLargeChanged) {
      setCurrentPage(0);
    } else {
      setCurrentPage(p => Math.min(p, breakpoints.length - 1));
    }
    // pageBreakpoints가 설정되면 일단 표시 (나중에 compact 결정 후 최종 표시)
    if (breakpoints.length > 0) {
      setIsReady(true);
    }
    
    // 계산 완료 후 플래그 해제
    if (isCalculatingRef) isCalculatingRef.current = false;
  }, []); // 의존성 제거: itemsRef, prevIsLargeRef, isCalculatingRef는 ref이므로 의존성 불필요
  
  // ResizeObserver로 버튼 크기 변경 감지
  useEffect(() => {
    const currentItems = itemsRef.current;
    
    if (!measureRef.current) {
      // measureRef가 없으면 일단 표시 (나중에 연결되면 계산됨)
      if (currentItems.length > 0) {
        setIsReady(true);
        setPageBreakpoints([0]);
      }
      return;
    }
    
    const firstButton = measureRef.current.querySelector('.button');
    if (!firstButton) {
      // 버튼이 없어도 초기에는 isReady를 true로 설정 (빈 상태라도 표시)
      setIsReady(true);
      setPageBreakpoints([0]);
      return;
    }
    
    const observer = new ResizeObserver((entries) => {
      // 계산 중이면 무시 (무한루프 방지)
      if (isCalculatingRef?.current) return;
      
      const newWidth = entries[0]?.contentRect.width || 0;
      // 폭이 변경되었을 때만 재계산
      if (lastWidthRef && Math.abs(newWidth - (lastWidthRef.current || 0)) > 1) {
        lastWidthRef.current = newWidth;
        // 직접 calculate 호출 (동기식, calculate 내부에서 플래그 관리)
        calculate();
      }
    });
    
    observer.observe(firstButton);
    
    // 초기 계산 - ref가 연결되면 즉시 계산 (동기식)
    if (measureRef.current && containerRef.current) {
    calculate();
    }
    
    // 윈도우 리사이즈도 감지 (동기식)
    window.addEventListener('resize', calculate);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculate);
    };
  }, [items.length, calcTrigger, calculate]);
  
  // 2단계: 렌더링 후 compact 결정 (pageBreakpoints 변경 시) - 동기식
  useEffect(() => {
    if (pageBreakpoints.length === 0) {
      // pageBreakpoints가 없으면 일단 표시 (나중에 재계산됨)
      setIsReady(true);
      return;
    }
    
    // 동기식 측정
        if (!containerRef.current) {
          setIsReady(true);
          return;
        }
        
        const renderedButtons = containerRef.current.querySelectorAll('.button');
        if (renderedButtons.length <= 1) {
          setIsReady(true);
          return;
        }
        
    // 실제 간격 측정 (동기식)
        let maxGap = 0;
        for (let i = 0; i < renderedButtons.length - 1; i++) {
          const rect1 = renderedButtons[i].getBoundingClientRect();
          const rect2 = renderedButtons[i + 1].getBoundingClientRect();
          const actualGap = rect2.left - rect1.right;
          maxGap = Math.max(maxGap, actualGap);
        }
        
        const shouldCompact = maxGap > ACTUAL_GAP_THRESHOLD;
    // 상태가 실제로 변경될 때만 업데이트 (불필요한 재렌더링 방지)
    setIsCompact(prev => {
      if (prev !== shouldCompact) {
        return shouldCompact;
      }
      return prev;
    });
    
    // isReady는 calculate에서 이미 설정했으므로 여기서는 변경하지 않음 (중복 방지)
  }, [pageBreakpoints, currentPage]);
  
  // ---------------------------------------------------------------
  // 페이지별 아이템 슬라이싱 (pagedItems)
  // pagedItems[n] = n번째 페이지에 표시될 아이템 배열
  // calculate 함수와 동일하게 itemsRef.current 사용 (일관성 유지)
  // ---------------------------------------------------------------
  const totalPages = pageBreakpoints.length;
  const pagedItems = useMemo(() => {
    const currentItems = itemsRef.current;
    return pageBreakpoints.map((start, idx) => {
      const end = pageBreakpoints[idx + 1] ?? currentItems.length;
      return currentItems.slice(start, end);
    });
  }, [pageBreakpoints]); // items는 itemsRef를 통해 접근하므로 의존성 불필요
  
  // 현재 페이지 아이템
  const currentItems = pagedItems[currentPage] ?? [];
  const startIdx = pageBreakpoints[currentPage] ?? 0;
  const endIdx = pageBreakpoints[currentPage + 1] ?? itemsRef.current.length;
  
  // 페이지 변경 시 isReady 복원 (이미 계산된 pageBreakpoints 사용)
  useEffect(() => {
    // pageBreakpoints가 설정되어 있고, currentPage가 유효한 범위 내에 있으면 즉시 표시
    if (pageBreakpoints.length > 0 && currentPage >= 0 && currentPage < pageBreakpoints.length) {
      setIsReady(true);
    }
  }, [currentPage, pageBreakpoints.length]);
  
  // 페이지 변경
  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(0, p - 1));
  }, []);
  
  const nextPage = useCallback(() => {
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
  // 모드: 'modal' (기본값, 특정 컨테이너) 또는 'app' (전체 앱, .main 기준)
  const mode = options.mode || 'modal';
  const isAppMode = mode === 'app';
  
  // useContext(ContextBase) 대신 로컬 ref 생성 (ContextProvider 밖에서도 작동)
  const containerRef = useRef(null);
  
  const getFocusableElements = useCallback(() => {
    if (isAppMode) {
      // 앱 모드: document 전체에서 포커스 가능한 요소 찾기
      const elements = Array.from(document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
      
      // main을 포커스 루프에 항상 추가 (화면 전환 시 포커스 지정을 위해)
      const mainElement = document.querySelector('.main');
      if (mainElement) {
        const mainStyle = window.getComputedStyle(mainElement);
        if (mainStyle.display !== 'none' && mainStyle.visibility !== 'hidden') {
          // main을 첫 번째 요소로 추가 (화면 전환 시 main에 포커스가 가도록)
          elements.unshift(mainElement);
        }
      }
      
      return elements;
    } else {
      // 모달 모드: 특정 컨테이너 내부에서만 포커스 가능한 요소 찾기
    if (!containerRef.current) return [];
      const elements = Array.from(containerRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(el => {
        const st = window.getComputedStyle(el);
        return st.display !== 'none' && st.visibility !== 'hidden';
      });
      
      // main.modal을 포커스 루프에 항상 추가 (모달 열릴 때 포커스 지정을 위해)
      const modalContentElement = containerRef.current;
      if (modalContentElement && modalContentElement.classList.contains('main') && modalContentElement.classList.contains('modal')) {
        // main.modal에 tabindex가 없으면 추가
        if (!modalContentElement.hasAttribute('tabindex')) {
          modalContentElement.setAttribute('tabindex', '-1');
        }
        const modalContentStyle = window.getComputedStyle(modalContentElement);
        if (modalContentStyle.display !== 'none' && modalContentStyle.visibility !== 'hidden') {
          // main.modal을 첫 번째 요소로 추가 (모달 열릴 때 main.modal에 포커스가 가도록)
          elements.unshift(modalContentElement);
        }
      }
      
      return elements;
    }
  }, [isAppMode]);
  
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
      
      if (isAppMode) {
        // 앱 모드: .main 기준으로 포커스 트랩
        const mainElement = document.querySelector('.main');
        const isActiveInMain = mainElement?.contains(active) || active === mainElement;
        
        // main 밖으로 포커스가 나가려고 하면 main으로 포커스 이동 (원천 함수 사용)
        if (!isActiveInMain) {
          e.preventDefault();
          focusMainElement();
          return;
        }
        
        // main 내부에 있을 때 Tab 키 처리 (React 방식: 모든 경우에 preventDefault)
        e.preventDefault();
        
        if (e.shiftKey) {
          // Shift+Tab: 이전 요소로 이동 (React state 기반)
          const currentIndex = els.indexOf(active);
          if (currentIndex === -1) {
            // 현재 포커스된 요소가 배열에 없으면 첫 번째 요소로 포커스
            first?.focus();
          } else if (active === first) {
            // main에서 Shift+Tab을 누르면 마지막 요소로 이동
            last?.focus();
      } else {
            // 이전 요소로 이동
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : els.length - 1;
            els[prevIndex]?.focus();
          }
        } else {
          // Tab: 다음 요소로 이동 (React state 기반)
          const currentIndex = els.indexOf(active);
          if (currentIndex === -1) {
            // 현재 포커스된 요소가 배열에 없으면 첫 번째 요소로 포커스
            first?.focus();
          } else if (active === mainElement) {
            // main에서 Tab을 누르면 첫 번째 버튼으로 이동 (main 다음 요소)
            if (els.length > 1) {
              els[1]?.focus();
            }
          } else if (active === last) {
            // 마지막 버튼에서 Tab을 누르면 main으로 순환
            first?.focus();
          } else {
            // 다음 요소로 이동
            const nextIndex = currentIndex < els.length - 1 ? currentIndex + 1 : 0;
            els[nextIndex]?.focus();
          }
        }
      } else {
        // 모달 모드: 특정 컨테이너 기준으로 포커스 트랩
        const modalContentElement = containerRef.current;
        const isActiveInContainer = modalContentElement?.contains(active) || active === modalContentElement;
        
        // main.modal 밖으로 포커스가 나가려고 하면 main.modal로 포커스 이동
        if (!isActiveInContainer) {
          e.preventDefault();
          if (modalContentElement && modalContentElement.classList.contains('main') && modalContentElement.classList.contains('modal')) {
            if (!modalContentElement.hasAttribute('tabindex')) {
              modalContentElement.setAttribute('tabindex', '-1');
            }
            modalContentElement.focus();
          }
          return;
        }
        
        // main.modal 내부에 있을 때 Tab 키 처리 (React 방식: 모든 경우에 preventDefault)
        e.preventDefault();
        
        if (e.shiftKey) {
          // Shift+Tab: 이전 요소로 이동 (React state 기반)
          const currentIndex = els.indexOf(active);
          if (currentIndex === -1) {
            // 현재 포커스된 요소가 배열에 없으면 첫 번째 요소로 포커스
            first?.focus();
          } else if (active === first) {
            // main.modal에서 Shift+Tab을 누르면 마지막 요소로 이동
            last?.focus();
          } else {
            // 이전 요소로 이동
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : els.length - 1;
            els[prevIndex]?.focus();
          }
        } else {
          // Tab: 다음 요소로 이동 (React state 기반)
          const currentIndex = els.indexOf(active);
          if (currentIndex === -1) {
            // 현재 포커스된 요소가 배열에 없으면 첫 번째 요소로 포커스
            first?.focus();
          } else if (active === modalContentElement) {
            // main.modal에서 Tab을 누르면 첫 번째 버튼으로 이동 (main.modal 다음 요소)
            if (els.length > 1) {
              els[1]?.focus();
            }
          } else if (active === last) {
            // 마지막 버튼에서 Tab을 누르면 main.modal로 순환
            first?.focus();
          } else {
            // 다음 요소로 이동
            const nextIndex = currentIndex < els.length - 1 ? currentIndex + 1 : 0;
            els[nextIndex]?.focus();
          }
        }
      }
    };
    
    const hesc = (e) => {
      if (isAppMode) {
        // 앱 모드에서는 Escape 키 처리 없음
        return;
      }
      // 모달 모드: Escape 키 처리
      const active = document.activeElement;
      const isActiveInContainer = containerRef.current?.contains(active);
      
      if (e.key === 'Escape' && isActiveInContainer) {
        focusFirst();
      }
    };
    
    document.addEventListener('keydown', hkd);
    if (!isAppMode) {
    document.addEventListener('keydown', hesc);
    }
    return () => {
      document.removeEventListener('keydown', hkd);
      if (!isAppMode) {
      document.removeEventListener('keydown', hesc);
      }
    };
  }, [isActive, isAppMode, getFocusableElements, focusFirst, focusLast]);
  
  // 포커스 이탈 방지
  useEffect(() => {
    if (!isActive) return;
    
    const hfo = (e) => {
      if (isAppMode) {
        // 앱 모드: .main 기준으로 포커스 이탈 방지
        const mainElement = document.querySelector('.main');
        if (!mainElement) return;
    
        // 포커스가 main 내부의 다른 요소로 이동하는 경우는 허용
        const isRelatedTargetInMain = mainElement.contains(e.relatedTarget) || e.relatedTarget === mainElement;
    
        // relatedTarget이 유효한 포커스 가능한 요소인 경우는 허용 (방향키 네비게이션 허용)
        // main 밖으로 포커스가 나가려고 하거나 포커스가 사라지면 main으로 포커스 이동
        // 단, main 내부의 버튼 등으로 포커스가 이동하는 경우는 허용
        // 단, relatedTarget이 유효한 포커스 가능한 요소인 경우도 허용 (방향키로 이동한 경우)
        if (e.relatedTarget === null) {
          // 포커스가 사라지는 경우만 .main으로 되돌림
          e.preventDefault();
          focusMainElement();
        } else if (!isRelatedTargetInMain) {
          // main 밖으로 이동하는 경우, relatedTarget이 포커스 가능한 요소인지 확인
          const isFocusable = e.relatedTarget && (
            e.relatedTarget.tagName === 'BUTTON' ||
            e.relatedTarget.tagName === 'A' ||
            e.relatedTarget.tagName === 'INPUT' ||
            e.relatedTarget.tagName === 'SELECT' ||
            e.relatedTarget.tagName === 'TEXTAREA' ||
            e.relatedTarget.hasAttribute('tabindex')
          );
          // 포커스 가능한 요소로 이동하는 경우는 허용 (방향키 네비게이션)
          if (!isFocusable) {
            e.preventDefault();
            focusMainElement();
          }
        }
      } else {
        // 모달 모드: 특정 컨테이너 기준으로 포커스 이탈 방지
        const isRelatedTargetInContainer = containerRef.current?.contains(e.relatedTarget);
        
        if (containerRef.current && 
            !isRelatedTargetInContainer && 
            e.relatedTarget !== null) {
          // relatedTarget이 포커스 가능한 요소인지 확인
          const isFocusable = e.relatedTarget && (
            e.relatedTarget.tagName === 'BUTTON' ||
            e.relatedTarget.tagName === 'A' ||
            e.relatedTarget.tagName === 'INPUT' ||
            e.relatedTarget.tagName === 'SELECT' ||
            e.relatedTarget.tagName === 'TEXTAREA' ||
            e.relatedTarget.hasAttribute('tabindex')
          );
          // 포커스 가능한 요소로 이동하는 경우는 허용
          if (!isFocusable) {
            e.preventDefault();
            focusFirst();
          }
        }
      }
    };
    
    if (isAppMode) {
      const mainElement = document.querySelector('.main');
      if (mainElement) {
        mainElement.addEventListener('focusout', hfo, true);
        return () => mainElement.removeEventListener('focusout', hfo, true);
      }
    } else {
      containerRef.current?.addEventListener('focusout', hfo);
      return () => containerRef.current?.removeEventListener('focusout', hfo);
    }
  }, [isActive, isAppMode, focusFirst]);
  
  return { containerRef, focusFirst, focusLast, getFocusableElements };
};

// 포커스 가능한 요소에 --min-side 계산 (단일책임: 크기 계산만)
const applyFocusableMinSide = (el) => {
  if (!el) return;
  else el.style.setProperty('--min-side', `${Math.min(el.offsetWidth, el.offsetHeight)}px`);
};

const useAccessibilitySettings = (initialSettings = { isDark: false, isLow: false, isLarge: false, volume: 1 }) => {
  const [settings, setSettings] = useState(initialSettings);
  
  const setDark = useCallback((v) => setSettings(p => ({ ...p, isDark: v })), []);
  const setLow = useCallback((v) => setSettings(p => ({ ...p, isLow: v })), []);
  const setLarge = useCallback((v) => setSettings(p => ({ ...p, isLarge: v })), []);
  const setVolumeVal = useCallback((v) => setSettings(p => ({ ...p, volume: v })), []);
  const resetToDefault = useCallback(() => setSettings({ isDark: false, isLow: false, isLarge: false, volume: 1 }), []);
  const updateAll = useCallback((ns) => setSettings(ns), []);
  
  const getStatusText = useMemo(() => ({
    dark: settings.isDark ? '켬' : '끔',
    low: settings.isLow ? '켬' : '끔',
    large: settings.isLarge ? '켬' : '끔',
    volume: ({ 0: '끔', 1: '약', 2: '중', 3: '강' })[settings.volume]
  }), [settings]);
  
  return {
    settings, setDark, setLow, setLarge,
    setVolume: setVolumeVal, resetToDefault, updateAll, getStatusText
  };
};

// ============================================================================
// 버튼 액션 핸들러 (단일책임원칙: 각 액션 타입별로 분리)
// ============================================================================

// 페이지 네비게이션 액션 (단일책임: 페이지 이동만)
const handleNavigateAction = (setCurrentPage, actionTarget) => {
  if (actionTarget) setCurrentPage(actionTarget);
};

// 탭 선택 액션 (단일책임: 탭 선택만)
const handleSelectTabAction = (setSelectedTab, selectedTab, actionTarget) => {
  if (actionTarget && selectedTab !== actionTarget) {
    setSelectedTab(actionTarget);
  }
};

// 결제 액션 (단일책임: 결제 처리 및 페이지 이동)
const handlePaymentAction = (sendOrderDataToApp, setCurrentPage, actionMethod) => {
  if (actionMethod) {
    sendOrderDataToApp(actionMethod);
    const targetPage = actionMethod === "card" ? 'ScreenCardInsert' : 'ScreenMobilePay';
    setCurrentPage(targetPage);
  }
};

// 취소 액션 (단일책임: 취소 처리 및 페이지 이동)
const handleCancelAction = (setCurrentPage, sendCancelPayment, actionTarget) => {
  if (actionTarget) {
    setCurrentPage(actionTarget);
  } else {
    sendCancelPayment();
  }
};

// 영수증 액션 (단일책임: 영수증 출력 처리만)
const handleReceiptAction = (sendPrintReceiptToApp, actionTarget) => {
  if (actionTarget === 'print') {
    sendPrintReceiptToApp();
  }
};

// 탭 네비게이션 액션 (단일책임: 탭 이동만)
const handleTabNavAction = (handlePreviousTab, handleNextTab, actionTarget) => {
  if (actionTarget === 'prev') {
    handlePreviousTab();
  } else {
    handleNextTab();
  }
};

// 카테고리 네비게이션 액션 (단일책임: 카테고리 페이지 이동만)
const handleCategoryNavAction = (handleCategoryPageNav, actionTarget) => {
  handleCategoryPageNav(actionTarget);
};

// 모달 열기 액션 (단일책임: 모달 열기만)
const handleModalAction = (modal, actionTarget, buttonLabel, buttonIcon) => {
  if (actionTarget) {
    modal[`Modal${actionTarget}`].open(buttonLabel, buttonIcon);
  }
};

// 버튼 액션 핸들러 통합 (단일책임: 액션 타입에 따라 적절한 핸들러 호출)
const useButtonAction = (actionType, actionTarget, actionMethod, disabled, buttonLabel, buttonIcon) => {
  const accessibility = useContext(AccessibilityContext);
  const route = useContext(RouteContext);
  const order = useContext(OrderContext);

  return useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    
    switch (actionType) {
      case 'navigate':
        handleNavigateAction(route.setCurrentPage, actionTarget);
        break;
      case 'selectTab':
        handleSelectTabAction(order.setSelectedTab, order.selectedTab, actionTarget);
        break;
      case 'payment':
        handlePaymentAction(order.sendOrderDataToApp, route.setCurrentPage, actionMethod);
        break;
      case 'cancel':
        handleCancelAction(route.setCurrentPage, order.sendCancelPayment, actionTarget);
        break;
      case 'receipt':
        handleReceiptAction(order.sendPrintReceiptToApp, actionTarget);
        break;
      case 'finish':
        // 완료 액션은 별도 처리 없음
        break;
      case 'tabNav':
        handleTabNavAction(order.handlePreviousTab, order.handleNextTab, actionTarget);
        break;
      case 'categoryNav':
        handleCategoryNavAction(order.handleCategoryPageNav, actionTarget);
        break;
      case 'modal':
        handleModalAction(accessibility, actionTarget, buttonLabel, buttonIcon);
        break;
      default:
        break;
    }
  }, [disabled, actionType, actionTarget, actionMethod, buttonLabel, buttonIcon, route, order, accessibility]);
};

// 키 검증 유틸
const isActionKey = (e) => e.key === 'Enter' || e.key === ' ' || e.code === 'NumpadEnter';

// ============================================================================
// 버튼 핸들러 유틸리티 (단일책임원칙: 각 핸들러별로 분리)
// ============================================================================

// 전역 핸들러 등록 (단일책임: window 객체에 핸들러 등록/제거만)
const useGlobalHandlerRegistration = (finalHandleText) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__finalHandleText = finalHandleText;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__finalHandleText;
      }
    };
  }, [finalHandleText]);
};

// 버튼 클릭 핸들러 (단일책임: 버튼 클릭 시 TTS 재생만)
const useButtonClickHandler = (finalHandleText, prefixOpt) => {
  return useCallback((e) => {
    const btn = e.target?.closest?.('.button');
    const isButtonDisabled = (btn) => btn.classList.contains('disabled') || 
                             btn.getAttribute('aria-disabled') === 'true' || 
                             btn.disabled === true;
    if (!btn || isButtonDisabled(btn)) return;
    if (btn.dataset.reactHandler === 'true') return;
    
    const ttsText = btn.dataset.ttsText;
    if (ttsText && finalHandleText) {
      finalHandleText(prefixOpt ? `${prefixOpt}${ttsText}` : ttsText);
    }
  }, [finalHandleText, prefixOpt]);
};

// 토글 버튼 클릭 핸들러 (단일책임: 토글 버튼 클릭 처리만)
const useToggleButtonClickHandler = (enableGlobalHandlers) => {
  useEffect(() => {
    if (!enableGlobalHandlers) return;
    
    const isButtonDisabled = (btn) => btn.classList.contains('disabled') || 
                             btn.getAttribute('aria-disabled') === 'true' || 
                             btn.disabled === true;
    const isToggleButton = (btn) => btn.classList.contains('toggle');
    
    const handleToggleClick = (e) => {
      const btn = e.target?.closest?.('.button');
      if (!btn || isButtonDisabled(btn) || !isToggleButton(btn)) return;
      if (btn.dataset.reactHandler === 'true') return;
    };
    
    document.addEventListener('click', handleToggleClick, false);
    return () => document.removeEventListener('click', handleToggleClick, false);
  }, [enableGlobalHandlers]);
};

// 비활성화 버튼 클릭 방지 (단일책임: 비활성화 버튼 클릭 차단만)
const useDisabledButtonBlocker = (enableGlobalHandlers) => {
  useEffect(() => {
    if (!enableGlobalHandlers) return;
    
    const isButtonDisabled = (btn) => btn.classList.contains('disabled') || 
                             btn.getAttribute('aria-disabled') === 'true' || 
                             btn.disabled === true;
    
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
};

// 포커스 가능한 요소 찾기 (단일책임: 포커스 가능 요소 필터링만)
const getFocusableElements = () => {
  const elements = Array.from(document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  
  // 모달 상태 확인
  const modalContentElement = document.querySelector('.main.modal');
  const isModalOpen = modalContentElement && window.getComputedStyle(modalContentElement).display !== 'none';
  
  if (isModalOpen) {
    // 모달이 열려있을 때: .main.modal을 포커스 루프에 추가
    if (modalContentElement) {
      const modalStyle = window.getComputedStyle(modalContentElement);
      if (modalStyle.display !== 'none' && modalStyle.visibility !== 'hidden') {
        // .main.modal에 tabindex가 없으면 추가
        if (!modalContentElement.hasAttribute('tabindex')) {
          modalContentElement.setAttribute('tabindex', '-1');
        }
        // .main.modal을 첫 번째 요소로 추가 (모달 열릴 때 .main.modal에 포커스가 가도록)
        elements.unshift(modalContentElement);
      }
    }
  } else {
    // 모달이 닫혀있을 때: .main을 포커스 루프에 추가 (화면 전환 시 포커스 지정을 위해)
    const mainElement = document.querySelector('.main');
    if (mainElement && !mainElement.classList.contains('modal')) {
      const mainStyle = window.getComputedStyle(mainElement);
      if (mainStyle.display !== 'none' && mainStyle.visibility !== 'hidden') {
        // main을 첫 번째 요소로 추가 (화면 전환 시 main에 포커스가 가도록)
        elements.unshift(mainElement);
      }
    }
  }
  
  return elements;
};

// 다음 섹션(부모)으로 이동할 요소 찾기 (단일책임: 다음 부모의 첫 요소 찾기만)
const findNextSectionElement = (allFocusable, currentIndex, currentParent) => {
  // 현재 부모와 다른 부모를 가진 첫 번째 요소 찾기
  const seenParents = new Set();
  seenParents.add(currentParent);
  
  for (let i = currentIndex + 1; i < allFocusable.length; i++) {
    const nextParent = allFocusable[i].closest('[data-tts-text]');
    if (nextParent && nextParent !== currentParent && !seenParents.has(nextParent)) {
      // 다른 부모를 찾았으면, 이 부모의 첫 번째 포커스 가능한 요소 반환
      for (let j = i; j < allFocusable.length; j++) {
        if (allFocusable[j].closest('[data-tts-text]') === nextParent) {
          return j;
        }
      }
    }
  }
  
  // 마지막까지 찾지 못하면 첫 번째 다른 부모로 순환
  for (let i = 0; i < currentIndex; i++) {
    const nextParent = allFocusable[i].closest('[data-tts-text]');
    if (nextParent && nextParent !== currentParent && !seenParents.has(nextParent)) {
      return i;
    }
  }
  
  return -1; // 다른 부모가 없으면 -1 반환
};

// 이전 섹션(부모)으로 이동할 요소 찾기 (단일책임: 이전 부모의 첫 요소 찾기만)
const findPrevSectionElement = (allFocusable, currentIndex, currentParent) => {
  // 현재 부모와 다른 부모를 가진 첫 번째 요소 찾기
  const seenParents = new Set();
  seenParents.add(currentParent);
  
  for (let i = currentIndex - 1; i >= 0; i--) {
    const prevParent = allFocusable[i].closest('[data-tts-text]');
    if (prevParent && prevParent !== currentParent && !seenParents.has(prevParent)) {
      // 다른 부모를 찾았으면, 이 부모의 첫 번째 포커스 가능한 요소 반환
      for (let j = i; j >= 0; j--) {
        const checkParent = allFocusable[j].closest('[data-tts-text]');
        if (checkParent === prevParent) {
          // 이전 요소가 같은 부모면 계속, 다른 부모면 반환
          if (j === 0 || allFocusable[j - 1].closest('[data-tts-text]') !== prevParent) {
            return j;
          }
        }
      }
      return i;
    }
  }
  
  // 처음까지 찾지 못하면 마지막 다른 부모로 순환
  for (let i = allFocusable.length - 1; i > currentIndex; i--) {
    const prevParent = allFocusable[i].closest('[data-tts-text]');
    if (prevParent && prevParent !== currentParent && !seenParents.has(prevParent)) {
      // 이 부모의 첫 번째 요소 찾기
      for (let j = i; j >= 0; j--) {
        if (allFocusable[j].closest('[data-tts-text]') === prevParent) {
          if (j === 0 || allFocusable[j - 1].closest('[data-tts-text]') !== prevParent) {
            return j;
          }
        }
      }
      return i;
    }
  }
  
  return -1; // 다른 부모가 없으면 -1 반환
};

// 키보드 네비게이션 핸들러 (단일책임: 방향키 네비게이션만)
// 스크린과 모달 모두에서 일관된 포커스 이동 경로 제공
const useKeyboardNavigationHandler = (enableGlobalHandlers, enableKeyboardNavigation) => {
  useEffect(() => {
    if (!enableKeyboardNavigation) return;
    
    const handleKeyDown = (e) => {
      const { key } = e;
      
      // 방향키만 처리
      if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown') {
        return;
      }
      
      e.preventDefault();
      const activeEl = document.activeElement;
      if (!activeEl) return;
      
      // 모달 상태 확인
      const modalContentElement = document.querySelector('.main.modal');
      const isModalOpen = modalContentElement && window.getComputedStyle(modalContentElement).display !== 'none';
      
      // 좌우 방향키: 모든 포커스 가능한 개체를 선형으로 탐색 (부모 관계 없이, .main 포함)
      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        // 모달이 열려있으면 모달 안의 요소만, 아니면 전체 요소 (.main 포함)
        const allFocusable = getFocusableElements();
        const focusableElements = isModalOpen 
          ? allFocusable.filter(el => {
              return modalContentElement.contains(el) || el === modalContentElement;
            })
          : allFocusable; // 스크린일 때는 전체 요소 (.main 포함)
        
        if (focusableElements.length === 0) {
          console.log('[키보드] 좌우 방향키 스킵 (포커스 가능한 요소 없음)', {
            container: isModalOpen ? 'modal' : 'screen'
          });
          return;
        }
        
        const currentIndex = focusableElements.indexOf(activeEl);
        if (currentIndex === -1) {
          console.log('[키보드] 좌우 방향키 → 첫 번째 요소로 포커스 (현재 요소 없음)');
          focusableElements[0]?.focus();
          return;
        }
        
        console.log('[키보드] 좌우 방향키 입력', {
          key,
          container: isModalOpen ? 'modal' : 'screen',
          currentElement: {
            tagName: activeEl.tagName,
            className: activeEl.className
          },
          currentIndex,
          totalElements: focusableElements.length,
          timestamp: new Date().toISOString()
        });
        
        if (key === 'ArrowLeft') {
          // 좌 방향키: 이전 요소로 이동 (순환)
          const targetIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
          const targetElement = focusableElements[targetIndex];
          console.log('[키보드] ArrowLeft → 이전 요소로 이동', {
            from: currentIndex,
            to: targetIndex,
            targetElement: { tagName: targetElement.tagName, className: targetElement.className }
          });
          targetElement?.focus();
        } else {
          // 우 방향키: 다음 요소로 이동 (순환)
          const targetIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
          const targetElement = focusableElements[targetIndex];
          console.log('[키보드] ArrowRight → 다음 요소로 이동', {
            from: currentIndex,
            to: targetIndex,
            targetElement: { tagName: targetElement.tagName, className: targetElement.className }
          });
          targetElement?.focus();
        }
        return;
      }
      
      // 상하 방향키: 부모가 바뀌는 지점(data-tts-text가 있는 조건)만 확인해서 이동
      if (key === 'ArrowUp' || key === 'ArrowDown') {
        // 모달이 열려있으면 모달 안의 요소만, 아니면 전체 요소
        const allFocusable = getFocusableElements();
        // .main 제외 (버튼들만)
        const focusableButtons = (isModalOpen 
          ? allFocusable.filter(el => {
              return modalContentElement.contains(el) || el === modalContentElement;
            })
          : allFocusable).filter(el => !el.classList.contains('main'));
        
        if (focusableButtons.length === 0) {
          console.log('[키보드] 상하 방향키 스킵 (포커스 가능한 버튼 없음)');
          return;
        }
        
        const currentIndex = focusableButtons.indexOf(activeEl);
        if (currentIndex === -1) {
          console.log('[키보드] 상하 방향키 → 첫 번째 버튼으로 포커스 (현재 요소 없음)');
          focusableButtons[0]?.focus();
          return;
        }
        
        const currentParent = activeEl.closest('[data-tts-text]');
        if (!currentParent) {
          console.log('[키보드] 상하 방향키 스킵 (현재 부모 섹션 없음)');
          return;
        }
        
        console.log('[키보드] 상하 방향키 입력', {
          key,
          container: isModalOpen ? 'modal' : 'screen',
          currentElement: {
            tagName: activeEl.tagName,
            className: activeEl.className
          },
          currentParent: {
            className: currentParent.className
          },
          timestamp: new Date().toISOString()
        });
        
        // 부모가 바뀌는 지점 찾기 (단순 로직)
        let targetElement = null;
        if (key === 'ArrowDown') {
          // 다음 부모로 이동: 현재 인덱스 이후에서 부모가 다른 첫 번째 요소
          for (let i = currentIndex + 1; i < focusableButtons.length; i++) {
            const el = focusableButtons[i];
            const elParent = el.closest('[data-tts-text]');
            if (elParent && elParent !== currentParent) {
              targetElement = el;
              break;
            }
          }
          // 마지막까지 찾지 못하면 첫 번째 다른 부모로 순환
          if (!targetElement) {
            for (let i = 0; i < currentIndex; i++) {
              const el = focusableButtons[i];
              const elParent = el.closest('[data-tts-text]');
              if (elParent && elParent !== currentParent) {
                targetElement = el;
                break;
              }
            }
          }
        } else {
          // 이전 부모로 이동: 현재 인덱스 이전에서 부모가 다른 첫 번째 요소
          for (let i = currentIndex - 1; i >= 0; i--) {
            const el = focusableButtons[i];
            const elParent = el.closest('[data-tts-text]');
            if (elParent && elParent !== currentParent) {
              targetElement = el;
              break;
            }
          }
          // 처음까지 찾지 못하면 마지막 다른 부모로 순환
          if (!targetElement) {
            for (let i = focusableButtons.length - 1; i > currentIndex; i--) {
              const el = focusableButtons[i];
              const elParent = el.closest('[data-tts-text]');
              if (elParent && elParent !== currentParent) {
                targetElement = el;
                break;
              }
            }
          }
        }
        
        if (!targetElement) {
          console.log('[키보드] 상하 방향키 스킵 (다른 부모 섹션 없음)');
          return;
        }
        
        const targetParent = targetElement.closest('[data-tts-text]');
        console.log('[키보드] 상하 방향키 → 부모(섹션) 간 이동', {
          key,
          from: {
            element: { tagName: activeEl.tagName, className: activeEl.className },
            parent: { className: currentParent.className }
          },
          to: {
            element: { tagName: targetElement.tagName, className: targetElement.className },
            parent: targetParent ? { className: targetParent.className } : null
          }
        });
        
        targetElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [enableGlobalHandlers, enableKeyboardNavigation]);
};

// 버튼 pressed 상태 추가 (단일책임: pressed 클래스 추가 및 사운드 재생만)
const addButtonPressedState = (btn, playSoundFn) => {
  if (btn.dataset.reactHandler !== 'true') {
    btn.classList.add('pressed');
    // 사운드 재생 (사용자 인터랙션마다)
    if (playSoundFn && typeof playSoundFn === 'function') {
      playSoundFn('onPressed');
    }
  }
};

// 버튼 pressed 상태 제거 (단일책임: pressed 클래스 제거 및 포커스 복원만)
const removeButtonPressedState = (btn) => {
  if (btn.classList.contains('pressed')) {
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

// 마우스/터치 pressed 상태 관리 (단일책임: pressed 상태 관리만)
const usePressStateHandler = (enableGlobalHandlers) => {
  // useSound 훅을 사용하여 사운드 재생 함수 가져오기
  const { play: playSound } = useSound();
  
  useEffect(() => {
    if (!enableGlobalHandlers) return;
    
    const isButtonDisabled = (btn) => btn.classList.contains('disabled') || 
                             btn.getAttribute('aria-disabled') === 'true' || 
                             btn.disabled === true;
    const isToggleButton = (btn) => btn.classList.contains('toggle');
    
    const handlePressState = (e, action) => {
      const btn = e.target?.closest?.('.button');
      if (!btn || isButtonDisabled(btn) || isToggleButton(btn)) return;
      
      if (action === 'add') {
        addButtonPressedState(btn, playSound);
      } else if (action === 'remove') {
        removeButtonPressedState(btn);
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
};

// 이전 버튼의 부모 요소를 저장하는 전역 ref (같은 부모 안에서 버튼 변경 시 부모 TTS 재생 방지)
const prevButtonParentRef = { current: null };
// 이전 TTS 텍스트 저장 (중복 실행 방지)
const prevTtsTextRef = { current: '' };
const lastTtsTimeRef = { current: 0 };

// 포커스 인 및 마우스 엔터 시 TTS 재생 핸들러 (단일책임: 포커스 인 및 마우스 엔터 시 TTS 재생만)
const useInteractiveTTSHandler = (enableGlobalHandlers, finalHandleText) => {
  const ttsState = useContext(TTSStateContext);
  
  useEffect(() => {
    if (!enableGlobalHandlers) return;
    
    // 사용자 인터랙션 감지 (키보드, 마우스, 터치)
    const handleUserInteraction = () => {
      if (ttsState && !ttsState.hasUserInteracted && ttsState.setHasUserInteracted) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔊 [TTS] 사용자 인터랙션 감지 → TTS 활성화`);
        }
        ttsState.setHasUserInteracted(true);
      }
    };
    
    // 사용자 인터랙션 이벤트 리스너 등록
    document.addEventListener('keydown', handleUserInteraction, { once: true, passive: true });
    document.addEventListener('mousedown', handleUserInteraction, { once: true, passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });
    
    const handleTTS = (e) => {
      const target = e.target;
      if (!target) return;
      
      // 같은 요소에 대한 중복 실행 방지 (200ms 이내)
      const now = Date.now();
      if (now - lastTtsTimeRef.current < 200) return;
      lastTtsTimeRef.current = now;
      
      // 버튼인 경우
      const btn = target.closest?.('.button');
      if (btn) {
        // 현재 버튼의 부모 요소 찾기
        const currentParent = btn.parentElement?.closest('[data-tts-text]');
        const isSameParent = prevButtonParentRef.current && currentParent && prevButtonParentRef.current === currentParent;
        
        // 같은 부모 안에서 버튼이 바뀌면 부모 TTS 재생하지 않음
        const parentTts = isSameParent ? '' : (currentParent?.dataset?.ttsText || '');
        const btnTts = btn.dataset?.ttsText || '';
        const ttsText = parentTts + btnTts;
        
        // 이전과 같은 텍스트면 재생하지 않음
        if (ttsText && ttsText !== prevTtsTextRef.current) {
          prevTtsTextRef.current = ttsText;
          finalHandleText(ttsText);
        }
        
        // 현재 부모를 이전 부모로 저장
        prevButtonParentRef.current = currentParent;
        return;
      }
      
      // 버튼이 아닌 경우: data-tts-text가 있는 요소인지 확인 (예: .main)
      const elementTts = target.dataset?.ttsText || '';
      if (elementTts && elementTts !== prevTtsTextRef.current) {
        prevTtsTextRef.current = elementTts;
        finalHandleText(elementTts);
        // .main 같은 경우는 부모가 없으므로 prevButtonParentRef를 null로 설정
        prevButtonParentRef.current = null;
      }
    };
    
    // 포커스 인 이벤트 (키보드 네비게이션)
    document.addEventListener('focusin', handleTTS, true);
    // 마우스 엔터 이벤트 (마우스 호버)
    document.addEventListener('mouseenter', handleTTS, true);
    
    return () => {
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('focusin', handleTTS, true);
      document.removeEventListener('mouseenter', handleTTS, true);
    };
  }, [enableGlobalHandlers, finalHandleText, ttsState]);
};

// 섹션 업데이트 관리 (단일책임: 포커스 가능 섹션 관리만)
const useFocusableSectionsManager = (initFocusableSections, sectionsRefs) => {
  const [, setFocusableSections] = useState(initFocusableSections);
  const keyboardNavState = useRef(null);
  
  if (!keyboardNavState.current) {
    keyboardNavState.current = {
      currentSectionIndex: 0,
      currentButtonIndex: 0,
      sections: initFocusableSections,
      sectionsRefs: sectionsRefs
    };
  }
  
  useEffect(() => {
    if (sectionsRefs && Object.keys(sectionsRefs).length > 0) {
      keyboardNavState.current.sectionsRefs = sectionsRefs;
    }
  }, [sectionsRefs]);
  
  const updateFocusableSections = useCallback((newSections, newSectionsRefs = null) => {
    setFocusableSections(newSections);
    keyboardNavState.current.sections = newSections;
    if (newSectionsRefs) {
      keyboardNavState.current.sectionsRefs = newSectionsRefs;
    }
  }, []);
  
  return { updateFocusableSections };
};


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
  const isPressingRef = useRef(false);
  const { play: playSound } = useSound();
  
  // pressed 계산: value와 selectedValue가 제공되면 자동 계산, 아니면 pressed prop 사용
  // useEffect보다 먼저 선언되어야 함
  const pressed = useMemo(() => {
    if (value !== undefined && selectedValue !== undefined) {
      return value === selectedValue;
    }
    return pressedProp;
  }, [value, selectedValue, pressedProp]);
  
  useEffect(() => {
    isPressingRef.current = isPressing;
  }, [isPressing]);
  
  
  // SVG에서 아이콘 이름 추출 (단일책임: 아이콘 이름 추출만)
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
  
  // 버튼 액션 핸들러
  const handleAction = useButtonAction(finalActionType, finalActionTarget, finalActionMethod, disabled, buttonLabel, buttonIcon);

  // 버튼 최소 크기 적용 (단일책임: 크기 적용만)
  useLayoutEffect(() => { 
    if (btnRef.current) {
      applyFocusableMinSide(btnRef.current);
      // ResizeObserver로 크기 변경 감지
      const resizeObserver = new ResizeObserver(() => {
        if (btnRef.current) {
          applyFocusableMinSide(btnRef.current);
        }
      });
      resizeObserver.observe(btnRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // TTS 텍스트 생성 (단일책임: TTS 텍스트 생성만)
  const finalTtsText = useMemo(() => {
    const baseText = ttsText || label || '';
    if (!baseText) return '';
    
    let cleanedText = baseText.replace(/\s*비활성\s*,?\s*/g, '').trim();
    
    if (toggle) {
      const statusText = pressed ? '선택됨, ' : '선택가능, ';
      cleanedText = cleanedText
        .replace(/\s*선택됨\s*,\s*/g, '')
        .replace(/\s*선택가능\s*,\s*/g, '')
        .trim();
      const result = cleanedText ? `${cleanedText}, ${statusText}` : statusText;
      return disabled ? `${result}비활성, ` : result;
    }
    
    return disabled ? `${cleanedText}, 비활성, ` : cleanedText;
  }, [ttsText, label, toggle, pressed, disabled]);

  // 버튼 클래스명 생성 (단일책임: 클래스명 생성만)
  const cls = useMemo(() => {
    const c = ['button'];
    if (!/primary[123]|secondary[123]/.test(className)) c.push('primary2');
    if (toggle) c.push('toggle');
    if (pressed || (isPressing && !toggle)) c.push('pressed');
    if (isPressing) c.push('pressing');
    if (className) c.push(className);
    return c.join(' ');
  }, [className, toggle, pressed, isPressing]);

  // 버튼 시작 이벤트 핸들러 (단일책임: pressed 상태 설정 및 사운드 재생만)
  const onStart = useCallback((e) => {
    if (disabled || (e.type === 'keydown' && !isActionKey(e))) return;
    if (e.type === 'keydown') {
      e.preventDefault();
    }
    setIsPressing(true);
    onPressed?.(true);
    
    if (!disabled) {
      playSound('onPressed');
    }
  }, [disabled, onPressed, playSound]);

  // 버튼 종료 이벤트 핸들러 (단일책임: pressed 상태 해제 및 액션 실행만)
  const onEnd = useCallback((e) => {
    if (disabled || (e.type === 'keyup' && !isActionKey(e))) return;
    if (e.type === 'keyup' || e.type === 'touchend') e.preventDefault();
    setIsPressing(false);
    onPressed?.(false);
    
    if (onChange && selectedValue !== undefined) {
      onChange(selectedValue);
    } else if (finalActionType) {
      handleAction(e);
    } else {
      onClick?.(e);
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
        <span className="icon pressed" aria-hidden="true"></span>
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

// Highlight 컴포넌트 (BaseModal보다 앞에 정의되어야 함)
const Highlight = memo(({ children }) => (
  <span className="primary">{children}</span>
));
Highlight.displayName = 'Highlight';

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
  restart: {
    tts: "알림, 시작화면, 시작화면으로 이동합니다, 계속 진행하시려면 시작화면 버튼을 누릅니다,",
    icon: "GraphicHome",
    title: "시작화면",
    cancelIcon: "Cancel",
    cancelLabel: "취소",
    confirmIcon: "Ok",
    confirmLabel: "시작화면",
    message: (H) => <><p><H>시작화면</H>으로 이동합니다</p><p>계속 진행하시려면 <H>시작화면</H> 버튼을 누릅니다</p></>,
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
    message: (H, countdown) => <><p>사용시간이 <H>{countdown !== undefined ? `${countdown}초` : '20초'}</H> 남았습니다</p><p>계속 사용하시려면 <H>연장</H> 버튼을 누릅니다</p></>,
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
  accessibility: {
    tts: "알림, 접근성, 원하시는 접근성 옵션을 선택하시고, 적용하기 버튼을 누릅니다, ",
    icon: "Wheelchair",
    title: "접근성",
    cancelIcon: "Cancel",
    cancelLabel: "적용안함",
    confirmIcon: "Ok",
    confirmLabel: "적용하기",
    message: (H) => <><p>원하시는 <H>접근성 옵션</H>을 선택하시고</p><p><H>적용하기</H> 버튼을 누르세요</p></>,
  },
};

// 공통 모달 베이스 (컨텍스트 기반)
const BaseModal = memo(({ isOpen, type, onCancel, onConfirm, cancelLabel, cancelIcon, confirmIcon, confirmLabel, customContent, customTts, icon: customIcon, title: customTitle, countdown }) => {
  // RefContext에서 값 가져오기
  const refsData = useContext(RefContext);
  const accessibility = useContext(AccessibilityContext);
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
  
  // 접근성 모달일 때만 접근성 설정 로직 사용
  const isAccessibilityModal = type === 'accessibility';
  const originalSettingsRef = isAccessibilityModal ? refsData.refs.AccessibilityModal.originalSettingsRef : null;
  const { setAudioVolume } = useDOM();
  
  // 접근성 모달: 현재 접근성 설정 상태 관리 (Hook은 항상 호출해야 함)
  const accessibilitySettings = useAccessibilitySettings({ isDark: accessibility.isDark, isLow: accessibility.isLow, isLarge: accessibility.isLarge, volume: accessibility.volume });
  const currentSettings = isAccessibilityModal ? accessibilitySettings.settings : null;
  const setDark = accessibilitySettings.setDark;
  const setLow = accessibilitySettings.setLow;
  const setLarge = accessibilitySettings.setLarge;
  const setSettingsVolume = accessibilitySettings.setVolume;
  const updateAllSettings = accessibilitySettings.updateAll;
  const getStatusText = accessibilitySettings.getStatusText;
  
  // 접근성 모달: 원래 설정 저장
  useEffect(() => {
    if (isAccessibilityModal && originalSettingsRef) {
      if (isOpen && !originalSettingsRef.current) {
        originalSettingsRef.current = { isDark: accessibility.isDark, isLow: accessibility.isLow, isLarge: accessibility.isLarge, volume: accessibility.volume };
      } else if (!isOpen) {
        originalSettingsRef.current = null;
      }
    }
  }, [isAccessibilityModal, isOpen, originalSettingsRef, accessibility.isDark, accessibility.isLow, accessibility.isLarge, accessibility.volume]);
  
  // 접근성 모달: 즉시 적용 핸들러들
  const handleDarkChange = useCallback((val) => {
    if (!isAccessibilityModal || !setDark) return;
    setDark(val);
    accessibility.setIsDark(val);
  }, [isAccessibilityModal, setDark, accessibility.setIsDark]);
  
  const handleVolumeChange = useCallback((val) => {
    if (!isAccessibilityModal || !setSettingsVolume) return;
    setSettingsVolume(val);
    accessibility.setVolume(val);
    setAudioVolume('audioPlayer', ({ 0: 0, 1: 0.5, 2: 0.75, 3: 1 })[val]);
  }, [isAccessibilityModal, setSettingsVolume, accessibility.setVolume, setAudioVolume]);
  
  const handleLargeChange = useCallback((val) => {
    if (!isAccessibilityModal || !setLarge) return;
    setLarge(val);
    accessibility.setIsLarge(val);
  }, [isAccessibilityModal, setLarge, accessibility.setIsLarge]);
  
  const handleLowChange = useCallback((val) => {
    if (!isAccessibilityModal || !setLow) return;
    setLow(val);
    accessibility.setIsLow(val);
  }, [isAccessibilityModal, setLow, accessibility.setIsLow]);
  
  // 접근성 모달: 초기설정 핸들러
  const handleInitialSettingsPress = useCallback(() => {
    if (!isAccessibilityModal || !updateAllSettings) return;
    updateAllSettings({ isDark: false, isLow: false, isLarge: false, volume: 1 });
    accessibility.setIsDark(false);
    accessibility.setVolume(1);
    accessibility.setIsLarge(false);
    accessibility.setIsLow(false);
    setAudioVolume('audioPlayer', 0.5);
  }, [isAccessibilityModal, updateAllSettings, accessibility.setIsDark, accessibility.setVolume, accessibility.setIsLarge, accessibility.setIsLow, setAudioVolume]);
  
  // 접근성 모달: 적용안함 핸들러 (원래 상태로 복원)
  const handleCancelPress = useCallback(() => {
    if (!isAccessibilityModal || !originalSettingsRef) {
      onCancel?.();
      return;
    }
    const original = originalSettingsRef.current;
    if (original) {
      accessibility.setIsDark(original.isDark);
      accessibility.setVolume(original.volume);
      accessibility.setIsLarge(original.isLarge);
      accessibility.setIsLow(original.isLow);
      setAudioVolume('audioPlayer', ({ 0: 0, 1: 0.5, 2: 0.75, 3: 1 })[original.volume]);
    }
    accessibility.ModalAccessibility.close();
  }, [isAccessibilityModal, originalSettingsRef, accessibility, setAudioVolume, onCancel]);
  
  // 접근성 모달: 적용하기 핸들러
  const handleConfirmPress = useCallback(() => {
    if (!isAccessibilityModal || !currentSettings) {
      onConfirm?.();
      return;
    }
    accessibility.setAccessibility(currentSettings);
    accessibility.ModalAccessibility.close();
  }, [isAccessibilityModal, currentSettings, accessibility, onConfirm]);
  
  // 모달 열릴 때 main.modal에 포커스 (동기식)
  const { focusModalContent } = useDOM();
  const route = useContext(RouteContext);
  useLayoutEffect(() => {
    if (isOpen) {
      console.log('[포커스] BaseModal 열림 → focusModalContent 호출', {
        type,
        timestamp: new Date().toISOString()
      });
      focusModalContent();
    } else {
      console.log('[포커스] BaseModal 닫힘', { type });
      // 모달이 닫힐 때, 현재 페이지가 ScreenStart이면 .main에 포커스 설정
      if (route?.currentPage === 'ScreenStart') {
        console.log('[포커스] BaseModal 닫힘 → ScreenStart로 포커스 설정');
        // 모달이 완전히 닫힌 후 포커스 설정
        requestAnimationFrame(() => {
          focusMainElement();
        });
      }
    }
  }, [isOpen, focusModalContent, type, route]);
  
  // 접근성 모달: 접근성 설정 요소들
  const accessibilityContent = isAccessibilityModal && currentSettings && getStatusText ? (
    <>
      {/* 설명 문구 */}
      <div className="modal-message">
        <div>원하시는&nbsp;<Highlight>접근성 옵션</Highlight>을 선택하시고</div>
        <div><Highlight>적용하기</Highlight>&nbsp;버튼을 누르세요</div>
      </div>
      {/* 초기설정 */}
      <div className="setting-row" data-tts-text="초기설정으로 일괄선택, 버튼 한 개, ">
        <span className="setting-name"><Highlight>초기설정</Highlight>으로 일괄선택</span>
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
          <Button toggle value={currentSettings.volume} selectedValue={0} onChange={handleVolumeChange} label="끔" className="w070h076" />
          <Button toggle value={currentSettings.volume} selectedValue={1} onChange={handleVolumeChange} label="약" className="w070h076" />
          <Button toggle value={currentSettings.volume} selectedValue={2} onChange={handleVolumeChange} label="중" className="w070h076" />
          <Button toggle value={currentSettings.volume} selectedValue={3} onChange={handleVolumeChange} label="강" className="w070h076" />
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
    </>
  ) : null;
  
  return (
    <>
      <div className="modal-overlay">
        <div className="main modal" ref={containerRef} data-tts-text={finalTts ? (finalTts + TTS.replay) : ''} tabIndex={-1}>
          <div className="up-content">
            {finalIcon && <Icon name={finalIcon} className="modal-image" />}
            {finalTitle && <div className="modal-title">{finalTitle}</div>}
          </div>
          <div className="down-content">
            {customContent || (
              <>
                {isAccessibilityModal ? (
                  <>
                    {accessibilityContent}
                    <div data-tts-text="작업 관리, 버튼 두 개, " ref={refsData.refs.BaseModal.modalConfirmButtonsRef} className="task-manager">
                      <Button className="w285h090" svg={<Icon name={finalCancelIcon} />} label={finalCancelLabel} onClick={handleCancelPress} />
                      <Button className="w285h090" svg={<Icon name={finalConfirmIcon} />} label={finalConfirmLabel} onClick={handleConfirmPress} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="modal-message">{config.message(H, countdown)}</div>
                <div data-tts-text={finalCancelLabel ? "작업관리, 버튼 두 개," : "작업관리, 버튼 한 개,"} ref={refsData.refs.BaseModal.modalConfirmButtonsRef} className="task-manager">
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
// 의존성: OrderContext
// 사용처: 모달 컴포넌트
const useResetQuantities = () => {
  const order = useContext(OrderContext);
  return useCallback(() => {
    const reset = {};
    order?.totalMenuItems?.forEach(i => { reset[i.id] = 0; });
    order?.setQuantities?.(reset);
  }, [order]);
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
    accessibility.setVolume(1); // 0, 1, 2, 3 중 하나만 허용 (1 = "약" = 0.5 볼륨)
    accessibility.setIsLarge(false);
    accessibility.setIsLow(false);
  }, [order, accessibility]);
};

// 개별 모달들 (개별 Context 사용)
const DeleteCheckModal = ({ handleDelete, id }) => {
  const accessibility = useContext(AccessibilityContext);
  const route = useContext(RouteContext);
  const ModalDeleteCheck = accessibility?.ModalDeleteCheck || { isOpen: false, close: () => {} };
  const close = useCallback(() => { ModalDeleteCheck.close(); }, [ModalDeleteCheck]);
  const confirm = useCallback(() => { handleDelete(id); ModalDeleteCheck.close(); route?.setCurrentPage?.('ScreenDetails'); }, [id, handleDelete, ModalDeleteCheck, route]);
  return <BaseModal isOpen={ModalDeleteCheck.isOpen} type="deleteCheck" onCancel={close} onConfirm={confirm} />;
};

const DeleteModal = ({ handleDelete, id }) => {
  const accessibility = useContext(AccessibilityContext);
  const ModalDelete = accessibility?.ModalDelete || { isOpen: false, close: () => {} };
  const close = useCallback(() => { ModalDelete.close(); }, [ModalDelete]);
  const confirm = useCallback(() => { handleDelete(id); ModalDelete.close(); }, [id, handleDelete, ModalDelete]);
  return <BaseModal isOpen={ModalDelete.isOpen} type="delete" onCancel={close} onConfirm={confirm} />;
};

const ResetModal = () => {
  const accessibility = useContext(AccessibilityContext);
  const route = useContext(RouteContext);
  const resetQty = useResetQuantities();
  const ModalReset = accessibility?.ModalReset || { isOpen: false, close: () => {} };
  const close = useCallback(() => { ModalReset.close(); }, [ModalReset]);
  const confirm = useCallback(() => { resetQty(); ModalReset.close(); route?.setCurrentPage?.('ScreenMenu'); }, [resetQty, ModalReset, route]);
  return <BaseModal isOpen={ModalReset.isOpen} type="reset" onCancel={close} onConfirm={confirm} />;
};

const RestartModal = () => {
  const accessibility = useContext(AccessibilityContext);
  const route = useContext(RouteContext);
  const order = useContext(OrderContext);
  const ModalRestart = accessibility?.ModalRestart || { isOpen: false, close: () => {}, buttonLabel: null, buttonIcon: null };
  const close = useCallback(() => { ModalRestart.close(); }, [ModalRestart]);
  const confirm = useCallback(() => {
    // 모든 이니셜은 initializeApp로 통일
    const callbacks = {
      ModalRestart: accessibility.ModalRestart,
      ModalAccessibility: accessibility.ModalAccessibility,
      setQuantities: order.setQuantities,
      totalMenuItems: order.totalMenuItems,
      setIsDark: accessibility.setIsDark,
      setVolume: accessibility.setVolume,
      setIsLarge: accessibility.setIsLarge,
      setIsLow: accessibility.setIsLow,
      setCurrentPage: route.setCurrentPage
    };
    initializeApp(callbacks);
  }, [ModalRestart, accessibility, order, route]);
  const config = MODAL_CONFIG.restart;
  return <BaseModal isOpen={ModalRestart.isOpen} type="restart" icon={ModalRestart.buttonIcon || undefined} title={ModalRestart.buttonLabel || undefined} confirmIcon={config.confirmIcon} confirmLabel={config.confirmLabel} onCancel={close} onConfirm={confirm} />;
};

const CallModal = () => {
  const accessibility = useContext(AccessibilityContext);
  const ModalCall = accessibility?.ModalCall || { isOpen: false, close: () => {} };
  const close = useCallback(() => { ModalCall.close(); }, [ModalCall]);
  return <BaseModal isOpen={ModalCall.isOpen} type="call" onCancel={close} onConfirm={close} />;
};

const TimeoutModal = () => {
  const accessibility = useContext(AccessibilityContext);
  const route = useContext(RouteContext);
  const order = useContext(OrderContext);
  const ModalTimeout = accessibility?.ModalTimeout || { isOpen: false, close: () => {} };
  
  // 전역 타이머의 remainingTime을 초 단위로 변환 (모달 표시용)
  const globalRemainingTime = accessibility?.globalRemainingTime ?? 0;
  const countdown = Math.ceil(globalRemainingTime / 1000); // 밀리초를 초로 변환
  
  // 모든 이니셜은 initializeApp로 통일
  const handleReset = useCallback(() => {
    const callbacks = {
      ModalRestart: accessibility.ModalRestart,
      ModalAccessibility: accessibility.ModalAccessibility,
      setQuantities: order.setQuantities,
      totalMenuItems: order.totalMenuItems,
      setIsDark: accessibility.setIsDark,
      setVolume: accessibility.setVolume,
      setIsLarge: accessibility.setIsLarge,
      setIsLow: accessibility.setIsLow,
      setCurrentPage: route.setCurrentPage
    };
    initializeApp(callbacks);
  }, [accessibility, order, route]);
  
  const close = useCallback(() => { 
    ModalTimeout.close(); 
    // 이니셜 실행 (initializeApp로 통일)
    handleReset();
  }, [ModalTimeout, handleReset]);
  
  const extend = useCallback(() => { 
    ModalTimeout.close(); 
  }, [ModalTimeout]);
  
  return <BaseModal isOpen={ModalTimeout.isOpen} type="timeout" onCancel={close} onConfirm={extend} countdown={countdown} />;
};

const PaymentErrorModal = () => {
  const accessibility = useContext(AccessibilityContext);
  const route = useContext(RouteContext);
  const ModalPaymentError = accessibility?.ModalPaymentError || { isOpen: false, close: () => {} };
  const handleRePayment = useCallback(() => { 
    ModalPaymentError.close(); 
    route?.setCurrentPage?.('ScreenPayments');
  }, [ModalPaymentError, route]);
  return <BaseModal isOpen={ModalPaymentError.isOpen} type="paymentError" cancelLabel={null} onCancel={handleRePayment} onConfirm={handleRePayment} />;
};

const useWebViewMessage = () => {
  const route = useContext(RouteContext);
  
  useEffect(() => {
    if (!window.chrome?.webview) return;
    
    const hm = (e) => {
      let d = e.data;
      if (d.arg.result === 'SUCCESS') {
        if (d.Command === 'PAY') route.setCurrentPage('ScreenCardRemoval');
        if (d.Command === 'PRINT') route.setCurrentPage('ScreenOrderComplete');
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
  }, [route]);
};

// ============================================================================
// Contexts
// ============================================================================

// Accessibility Context - 접근성 설정 및 모달 상태 관리
// 의존성: 없음 (독립)
// 사용처: 모든 Screen 컴포넌트, 모달 컴포넌트
// 제공 값: isDark, isLow, isLarge, volume, 모달 핸들러들
const AccessibilityContext = createContext();


const AccessibilityProvider = ({ children }) => {
  // 접근성 설정 상태
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
  
  // 모달 상태 관리
  const [modals, setModals] = useState({
    restart: false,
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
  const [globalRemainingTime, setGlobalRemainingTime] = useState(null);
  
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
    // 접근성 설정
    isDark, setIsDark,
    isLow, setIsLow,
    isLarge, setIsLarge,
    volume, setVolume,
    accessibility,
    setAccessibility: setAccessibilityState,
    // 모달 상태
    ModalRestart: createModalHandlers('restart'),
    ModalAccessibility: createModalHandlers('accessibility'),
    ModalReset: createModalHandlers('reset'),
    ModalDelete: createModalHandlers('delete'),
    ModalDeleteCheck: createModalHandlers('deleteCheck'),
    ModalCall: createModalHandlers('call'),
    ModalTimeout: createModalHandlers('timeout'),
    ModalPaymentError: createModalHandlers('paymentError'),
    ModalDeleteItemId: deleteItemId,
    setModalDeleteItemId: setDeleteItemId,
    // 전역 타이머 (TimeoutModal에서 사용)
    globalRemainingTime,
    setGlobalRemainingTime
  }), [isDark, isLow, isLarge, volume, accessibility, modals, deleteItemId, createModalHandlers, globalRemainingTime]);
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};


// ============================================================================
// DOM Context (DOM 조작을 React 생명주기로 관리)
// ============================================================================

const useDOM = () => {
  const refsData = useContext(RefContext) || {};
  const ttsState = useContext(TTSStateContext) || {};
  const audioPlayerRef = ttsState?.audioPlayerRef || refsData?.refs?.audioPlayer?.ref;
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
  const focusMain = useCallback(() => {
    // 원천 함수 focusMainElement 사용 (일관성 유지)
    focusMainElement();
  }, []);
  const focusModalContent = useCallback(() => {
    if (typeof document !== 'undefined') {
      // main.modal 클래스를 가진 첫 번째 요소 찾기
      const modalContentElement = document.querySelector('.main.modal');
      if (modalContentElement) {
        const prevActive = document.activeElement;
        const prevActiveInfo = prevActive ? {
          tagName: prevActive.tagName,
          className: prevActive.className,
          id: prevActive.id || null
        } : null;
        
        // main.modal에 tabindex가 없으면 추가
        if (!modalContentElement.hasAttribute('tabindex')) {
          modalContentElement.setAttribute('tabindex', '-1');
        }
        
        console.log('[포커스] focusModalContent 호출', {
          from: prevActiveInfo,
          to: { tagName: modalContentElement.tagName, className: modalContentElement.className },
          timestamp: new Date().toISOString()
        });
        
        // 항상 포커스 설정 (모달이 열릴 때)
        modalContentElement.focus();
      } else {
        console.log('[포커스] focusModalContent 스킵 (.main.modal 요소 없음)');
      }
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
    // 동적 오디오 플레이어 사용 (React 방식)
    if (id === 'audioPlayer') {
      // TTSStateContext를 통해 Audio volume 제어
      if (ttsState?.setAudioVolume) {
        ttsState.setAudioVolume(Math.max(0, Math.min(1, vol)));
      } else {
        // 폴백: 직접 DOM 접근
        const audioPlayer = audioPlayerRef?.current || document.getElementById('audioPlayer');
        if (audioPlayer) {
          audioPlayer.volume = Math.max(0, Math.min(1, vol));
        }
      }
    } else {
      // 다른 오디오 요소는 기존 방식 유지
    const audio = getElementById(id);
    if (audio && audio instanceof HTMLAudioElement) {
      audio.volume = Math.max(0, Math.min(1, vol));
    }
    }
  }, [getElementById, ttsState, audioPlayerRef]);
  
  return {
    querySelector,
    getElementById,
    toggleBodyClass,
    blurActiveElement,
    getActiveElementText,
    focusMain,
    focusModalContent,
    setAudioVolume
  };
};

// ============================================================================
// Route Context (라우팅 상태 관리)
// ============================================================================

// Route Context - 라우팅 및 Screen 컴포넌트 렌더링
// 의존성: 없음 (독립, 하지만 내부에서 Screen 컴포넌트들을 렌더링하므로 다른 Context들이 필요)
// 사용처: 모든 Screen 컴포넌트, 모달 컴포넌트
// 제공 값: currentPage, setCurrentPage
const RouteContext = createContext();

const RouteProvider = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState('ScreenStart');
  
  const setCurrentPage = useCallback((p) => {
    console.log('[라우팅] setCurrentPage 호출', { 
      from: currentPage, 
      to: p,
      timestamp: new Date().toISOString()
    });
    setCurrentPageState(p);
    console.log('[라우팅] setCurrentPage 완료', { newPage: p });
  }, [currentPage]);
  
  // 스크린 전환 시 자동으로 .main에 포커스 설정 및 TTS 재생 (원천적 통일)
  // 모든 Screen 컴포넌트에서 개별적으로 focusMain을 호출할 필요 없음
  // useEffect로 변경하여 useInteractiveTTSHandler의 useEffect (이벤트 리스너 등록) 이후에 실행
  // useLayoutEffect는 자식이 부모보다 먼저 실행되므로, ScreenStart의 useInteractiveTTSHandler가
  // 이벤트 리스너를 등록하기 전에 focusMainElement()가 실행될 수 있음
  const lastPageRef = useRef(null);
  useLayoutEffect(() => {
    // 페이지가 실제로 변경되었을 때만 포커스 설정 (중복 방지)
    if (lastPageRef.current === currentPage) {
      console.log('[포커스] RouteProvider 스킵 (페이지 변경 없음)', { currentPage });
      return;
    }
    
    const prevPage = lastPageRef.current;
    lastPageRef.current = currentPage;
    
    console.log('[포커스] RouteProvider 페이지 변경 감지', {
      from: prevPage,
      to: currentPage,
      timestamp: new Date().toISOString()
    });
    
    // 모든 화면에서 .main에 자동 포커스 설정 (포커스 TTS 로직 통일)
    // useLayoutEffect는 DOM 업데이트 후 동기적으로 실행되므로 .main 요소가 확실히 존재함
    // focusMainElement 내부에서 이미 포커스가 있으면 스킵하므로 여기서는 항상 호출
    console.log('[포커스] RouteProvider → focusMainElement 실행 (동기 처리)');
    focusMainElement();
  }, [currentPage]);
  
  const value = useMemo(() => ({
    currentPage, 
    setCurrentPage
  }), [currentPage, setCurrentPage]);
  
  return (
    <RouteContext.Provider value={value}>
      {children}
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
    </RouteContext.Provider>
  );
};


// Order Context - 주문 상태 관리 (메뉴 선택, 수량, 주문 아이템)
// 의존성: 없음 (독립, 내부 Hook: useMenuData(독립), useMenuUtils(독립))
// 사용처: ScreenMenu, ScreenDetails, ScreenPayments 등 주문 관련 컴포넌트
// 제공 값: menuItems, quantities, totalCount, totalSum, orderItems, 핸들러들
const OrderContext = createContext();

const OrderProvider = ({ children }) => {
  // 메뉴 데이터 (독립 Hook - menuData import 사용)
  const { tabs, totalMenuItems, categoryInfo, isLoading: menuLoading } = useMenuData();
  
  // PLACEHOLDER_MENU는 ScreenMenu로 이동했으나, OrderProvider에서도 사용하므로 기본값 제공
  const PLACEHOLDER_MENU_DEFAULT = { id: 0, name: "추가예정", price: "0", img: "item-americano.png" };
  
  // 상태
  const [selectedTab, setSelectedTab] = useState("전체메뉴");
  const [quantities, setQuantities] = useState({});
  
  // 메모이즈된 값
  const menuItems = useMemo(() => 
    categorizeMenu(totalMenuItems, selectedTab, categoryInfo, PLACEHOLDER_MENU_DEFAULT),
    [totalMenuItems, selectedTab, categoryInfo]
  );
  const totalCount = useMemo(() => calculateSum(quantities), [quantities]);
  const totalSum = useMemo(() => calculateTotal(quantities, totalMenuItems), [quantities, totalMenuItems]);
  const orderItems = useMemo(() => createOrderItems(totalMenuItems, quantities), [totalMenuItems, quantities]);
  
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
  
  // 주문번호 (STORAGE.ORDER_NUM은 ScreenOrderComplete로 이동됨)
  // 주의: 이 함수는 ScreenOrderComplete의 STORAGE_ORDER_NUM을 사용해야 하지만,
  // OrderProvider가 전역이므로 기본값 'orderNumber'를 하드코딩하여 사용
  const updateOrderNumber = useCallback(() => {
    const c = safeParseInt(safeLocalStorage.getItem('orderNumber'), 0);
    const n = c + 1;
    safeLocalStorage.setItem('orderNumber', n);
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
    setCallWebToApp('PAY', {
      orderData: arr,
      totalPrice: totalSum,
      supplyPrice: sp,
      tax: (totalSum - sp).toFixed(2),
      paymentType,
      orderNumber: updateOrderNumber()
    });
  }, [orderItems, totalSum, updateOrderNumber, setCallWebToApp]);
  
  const sendPrintReceiptToApp = useCallback(() => setCallWebToApp('PRINT', ''), [setCallWebToApp]);
  const sendCancelPayment = useCallback(() => setCallWebToApp('CANCEL', ''), [setCallWebToApp]);
  
  // 탭 네비게이션
  const handlePreviousTab = useCallback(() => {
    const i = (tabs.indexOf(selectedTab) - 1 + tabs.length) % tabs.length;
    setSelectedTab(tabs[i]);
  }, [tabs, selectedTab]);
  
  const handleNextTab = useCallback(() => {
    const i = (tabs.indexOf(selectedTab) + 1) % tabs.length;
    setSelectedTab(tabs[i]);
  }, [tabs, selectedTab]);
  
  // 카테고리 페이지 네비게이션 - 로컬 ref 사용 (이니셜 순서 문제 해결)
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
// Button State Context - 버튼 상태 관리 (pressed 상태)
// 의존성: 없음 (독립)
// 사용처: Button 컴포넌트
// 제공 값: buttonStates, setButtonPressed, toggleButtonPressed, isButtonPressed
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

// Button Group Context - 버튼 그룹 선택 관리 (그룹 내 단일 선택)
// 의존성: 없음 (독립)
// 사용처: Button 컴포넌트 (toggle prop 사용 시)
// 제공 값: groupStates, selectInGroup, getSelectedInGroup, isSelectedInGroup, clearGroupSelection
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


// ============================================================================
// 이니셜 컴포넌트 (단일책임원칙: 각 이니셜 로직 분리)
// ============================================================================

// 버튼 핸들러 이니셜
const ButtonHandlerInitializer = () => {
  useToggleButtonClickHandler(true);
  useDisabledButtonBlocker(true);
  usePressStateHandler(true);
  return null;
};

// 사이즈 컨트롤 이니셜
const SizeControlInitializer = () => {
  useLayoutEffect(() => {
    SizeControlManager.init();
  }, []);
  return null;
};
  
// 뷰포트 이니셜
const ViewportInitializer = () => {
  useLayoutEffect(() => {
    setViewportZoom();
    setupViewportResize();
  }, []);
  return null;
};

// 전체 앱 포커스 트랩 이니셜 (useFocusTrap의 앱 모드 사용)
const AppFocusTrapInitializer = () => {
  useFocusTrap(true, { mode: 'app' });
  return null;
};

// ============================================================================
// Ref Context - 전역 refs 관리
// ============================================================================
// Ref Context - 전역 refs 관리 (Hook refs, Component refs)
// 의존성: 없음 (독립)
// 사용처: 모든 Screen 컴포넌트, Hook들
// 제공 값: refs 객체 (Hook refs, Component refs)
const RefContext = createContext();

// ============================================================================
// Ref Provider - refs만 제공
// ============================================================================
// 주의: Screen 컴포넌트들이 RefContext를 사용하므로 RouteProvider보다 바깥에 위치해야 함
const RefProvider = ({ children }) => {
  // 모든 refs를 Ref Provider에서 직접 정의
  // Hooks 내부 ref
  const useIdleTimeout_timerRef = useRef(null);
  const useIdleTimeout_intervalRef = useRef(null);
  const useIdleTimeout_lastActivityRef = useRef(Date.now());
  const useIdleTimeout_onTimeoutRef = useRef(null);
  const useIdleTimeout_timeoutRef = useRef(null);
  
  
  const useCategoryPagination_containerRef = useRef(null);
  const useCategoryPagination_measureRef = useRef(null);
  const useCategoryPagination_prevIsLargeRef = useRef(null);
  const useCategoryPagination_lastWidthRef = useRef(0);
  const useCategoryPagination_isCalculatingRef = useRef(false);
  
  const useSound_timerInstanceRef = useRef(null);
  const useSound_audioRefs = useRef({});
  
  const BaseModal_modalConfirmButtonsRef = useRef(null);
  
  const CategoryNav_categoryPageNavRef = useRef(null);
  const Summary_categoryPageNavRef = useRef(null);
  
  // Screen Components ref
  const ScreenStart_mainContentRef = useRef(null);
  
  const ScreenMenu_categoryNavRef = useRef(null);
  const ScreenMenu_mainContentRef = useRef(null);
  const ScreenMenu_actionBarRef = useRef(null);
  const ScreenMenu_orderSummaryRef = useRef(null);
  const ScreenMenu_systemControlsRef = useRef(null);
  
  const ScreenDetails_actionBarRef = useRef(null);
  const ScreenDetails_orderSummaryRef = useRef(null);
  const ScreenDetails_systemControlsRef = useRef(null);
  const ScreenDetails_row1Ref = useRef(null);
  const ScreenDetails_row2Ref = useRef(null);
  const ScreenDetails_row3Ref = useRef(null);
  const ScreenDetails_row4Ref = useRef(null);
  const ScreenDetails_row5Ref = useRef(null);
  const ScreenDetails_row6Ref = useRef(null);
  
  const ScreenPayments_mainContentRef = useRef(null);
  const ScreenPayments_actionBarRef = useRef(null);
  const ScreenPayments_systemControlsRef = useRef(null);
  
  const ScreenCardInsert_actionBarRef = useRef(null);
  const ScreenCardInsert_systemControlsRef = useRef(null);
  
  const ScreenMobilePay_actionBarRef = useRef(null);
  const ScreenMobilePay_systemControlsRef = useRef(null);
  
  const ScreenSimplePay_actionBarRef = useRef(null);
  const ScreenSimplePay_systemControlsRef = useRef(null);
  
  const ScreenCardRemoval_systemControlsRef = useRef(null);
  
  const ScreenOrderComplete_actionBarRef = useRef(null);
  const ScreenOrderComplete_systemControlsRef = useRef(null);
  
  const ScreenReceiptPrint_actionBarRef = useRef(null);
  const ScreenReceiptPrint_systemControlsRef = useRef(null);
  
  const ScreenFinish_systemControlsRef = useRef(null);
  
  const AccessibilityModal_originalSettingsRef = useRef(null);
  
  // Context value - refs만 제공
  const contextValue = useMemo(() => ({
    refs: {
      // Hooks refs
      useIdleTimeout: { timerRef: useIdleTimeout_timerRef, intervalRef: useIdleTimeout_intervalRef, lastActivityRef: useIdleTimeout_lastActivityRef, onTimeoutRef: useIdleTimeout_onTimeoutRef, timeoutRef: useIdleTimeout_timeoutRef },
      useCategoryPagination: { containerRef: useCategoryPagination_containerRef, measureRef: useCategoryPagination_measureRef, prevIsLargeRef: useCategoryPagination_prevIsLargeRef, lastWidthRef: useCategoryPagination_lastWidthRef, isCalculatingRef: useCategoryPagination_isCalculatingRef },
      useSound: { timerInstanceRef: useSound_timerInstanceRef, audioRefs: useSound_audioRefs },
      // Component refs
      BaseModal: { modalConfirmButtonsRef: BaseModal_modalConfirmButtonsRef },
      CategoryNav: { categoryPageNavRef: CategoryNav_categoryPageNavRef },
      Summary: { categoryPageNavRef: Summary_categoryPageNavRef },
      ScreenStart: { mainContentRef: ScreenStart_mainContentRef },
      ScreenMenu: { categoryNavRef: ScreenMenu_categoryNavRef, mainContentRef: ScreenMenu_mainContentRef, actionBarRef: ScreenMenu_actionBarRef, orderSummaryRef: ScreenMenu_orderSummaryRef, systemControlsRef: ScreenMenu_systemControlsRef },
      ScreenDetails: { actionBarRef: ScreenDetails_actionBarRef, orderSummaryRef: ScreenDetails_orderSummaryRef, systemControlsRef: ScreenDetails_systemControlsRef, row1Ref: ScreenDetails_row1Ref, row2Ref: ScreenDetails_row2Ref, row3Ref: ScreenDetails_row3Ref, row4Ref: ScreenDetails_row4Ref, row5Ref: ScreenDetails_row5Ref, row6Ref: ScreenDetails_row6Ref },
      ScreenPayments: { mainContentRef: ScreenPayments_mainContentRef, actionBarRef: ScreenPayments_actionBarRef, systemControlsRef: ScreenPayments_systemControlsRef },
      ScreenCardInsert: { actionBarRef: ScreenCardInsert_actionBarRef, systemControlsRef: ScreenCardInsert_systemControlsRef },
      ScreenMobilePay: { actionBarRef: ScreenMobilePay_actionBarRef, systemControlsRef: ScreenMobilePay_systemControlsRef },
      ScreenSimplePay: { actionBarRef: ScreenSimplePay_actionBarRef, systemControlsRef: ScreenSimplePay_systemControlsRef },
      ScreenCardRemoval: { systemControlsRef: ScreenCardRemoval_systemControlsRef },
      ScreenOrderComplete: { actionBarRef: ScreenOrderComplete_actionBarRef, systemControlsRef: ScreenOrderComplete_systemControlsRef },
      ScreenReceiptPrint: { actionBarRef: ScreenReceiptPrint_actionBarRef, systemControlsRef: ScreenReceiptPrint_systemControlsRef },
      ScreenFinish: { systemControlsRef: ScreenFinish_systemControlsRef },
      AccessibilityModal: { originalSettingsRef: AccessibilityModal_originalSettingsRef }
    }
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
  
  // category 클래스 메모이제이션 (isCompact 변경 시에만 재계산)
  const categoryClassName = useMemo(() => `category${isCompact ? ' compact' : ''}`, [isCompact]);
  
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
        className={categoryClassName} 
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

// 메뉴 그리드
const MenuGrid = memo(({ items, onItemPress, selectedTab, convertToKoreanQuantity, mainContentRef }) => {
  return (
    <div className="menu" ref={mainContentRef} data-tts-text={`메뉴, ${selectedTab}, 버튼 ${convertToKoreanQuantity(items.length)}개,`}>
      {items.map(item => (
        <MenuItem 
          key={item.id} 
          item={item} 
          disabled={item.id === 0}
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
// Highlight는 BaseModal보다 앞에 정의되어 있음 (2470번 라인 근처)

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
  const route = useContext(RouteContext);
  const currentPage = route?.currentPage || 'ScreenStart';
  
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
  const route = useContext(RouteContext);
  const totalCount = order?.totalCount || 0;
  const totalSum = order?.totalSum || 0;
  const currentPage = route?.currentPage || 'ScreenStart';
  
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
  const route = useContext(RouteContext);
  const accessibility = useContext(AccessibilityContext);
  const order = useContext(OrderContext);
  
  // ScreenStart에서는 타임아웃이 모달 없이 실행됨 (이니셜 TTS 재생)
  // 다른 화면에서는 타임아웃 모달 표시
  const isTimeoutEnabled = true; // 모든 화면에서 타임아웃 활성화
  
  const onTimeout = useCallback(() => {
    console.log('[타이머] onTimeout 호출됨', { currentPage: route.currentPage });
    
    // 타임아웃 발생 시 항상 초기화 실행 (모든 화면에서 시작화면으로 이동)
    const callbacks = {
      ModalRestart: accessibility.ModalRestart,
      ModalAccessibility: accessibility.ModalAccessibility,
      ModalTimeout: accessibility.ModalTimeout, // 타임아웃 모달 닫기용
      setQuantities: order.setQuantities,
      totalMenuItems: order.totalMenuItems,
      setIsDark: accessibility.setIsDark,
      setVolume: accessibility.setVolume,
      setIsLarge: accessibility.setIsLarge,
      setIsLow: accessibility.setIsLow,
      setCurrentPage: route.setCurrentPage
    };
    console.log('[타이머] initializeApp 호출 시작', { 
      callbacks: Object.keys(callbacks),
      currentPage: route.currentPage 
    });
    initializeApp(callbacks);
    console.log('[타이머] initializeApp 호출 완료');
    
    // ScreenStart로 이동 후 포커스 갱신하여 TTS 재생 트리거
    requestAnimationFrame(() => {
      const mainElement = document.querySelector('.main.first');
      if (mainElement) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement !== mainElement) {
          activeElement.blur();
        }
        mainElement.focus();
      }
    });
  }, [accessibility, order, route]);
  
  // 타임아웃 모달 상태 체크 함수 (useIdleTimeout에 전달)
  const checkTimeoutModal = useCallback(() => {
    return accessibility.ModalTimeout?.isOpen ?? false;
  }, [accessibility.ModalTimeout]);
  
  const { remainingTimeFormatted, remainingTime, resetTimer } = useIdleTimeout(
    onTimeout,
    120000, // 2분 (120초)
    isTimeoutEnabled,
    checkTimeoutModal
  );
  
  // 전역 타이머 remainingTime을 AccessibilityContext에 전달 (TimeoutModal에서 사용)
  useEffect(() => {
    if (accessibility.setGlobalRemainingTime) {
      accessibility.setGlobalRemainingTime(remainingTime);
    }
  }, [remainingTime, accessibility.setGlobalRemainingTime]);
  
  // 잔여시간이 20초 남았을 때 처리
  const hasShownWarningRef = useRef(false);
  useEffect(() => {
    // 20초 이하이고 아직 경고를 표시하지 않았을 때만 실행
    if (remainingTime > 0 && remainingTime <= 20000 && !hasShownWarningRef.current && !accessibility.ModalTimeout?.isOpen) {
      hasShownWarningRef.current = true;
      
      if (route.currentPage === 'ScreenStart') {
        // ScreenStart: 모달 없이 포커스 기반 TTS 재생
        // 20초 경고 시 TTS 재생하지 않음 (초기화 시에만 TTS 재생)
        console.log('[타이머] ScreenStart 20초 경고 - TTS 재생하지 않음');
      } else {
        // ScreenStart 외의 화면: 타임아웃 모달 표시
        if (accessibility.ModalTimeout) {
          accessibility.ModalTimeout.open();
        }
      }
    }
    // remainingTime이 20초를 넘어가면 경고 플래그 리셋
    if (remainingTime > 20000) {
      hasShownWarningRef.current = false;
    }
  }, [remainingTime, accessibility.ModalTimeout, route.currentPage]);
  
  const openModalManually = useCallback(() => {
    if (accessibility.ModalTimeout) {
      accessibility.ModalTimeout.open();
    }
  }, [accessibility.ModalTimeout]);
  
  return (
    <div className="bottom" data-tts-text="시스템 설정, 버튼 세 개," ref={systemControlsRef}>
      <Button
        className="down-footer-button btn-home"
        svg={<HomeIcon />}
        label="시작화면"
        actionType="modal"
        actionTarget="Restart"
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
  // ScreenStart 전용 TTS 스크립트 (단일책임: ScreenStart TTS만)

  const TTS_SCREEN_START = `안녕하세요, 장애인, 비장애인 모두 사용 가능한 무인주문기입니다,시각 장애인을 위한 음성 안내와 키패드를 제공합니다,키패드는 손을 아래로 뻗으면 닿는 조작부 영역에 있으며, 돌출된 점자 및 테두리로 자세한 위치를 파악할 수 있습니다,키패드 사용은 이어폰 잭에 이어폰을 꽂거나, 상하좌우 버튼 또는 동그라미 버튼을 눌러 시작할 수 있습니다, 안내, 시작 단계, 음식을 포장할지 먹고갈지 선택합니다.${TTS.replay}`;
  
  // 개별 Context에서 직접 가져오기
  const route = useContext(RouteContext);
  const accessibility = useContext(AccessibilityContext);
  const ttsDB = useContext(TTSDBContext);
  
  // 로컬 ref 생성
  const mainContentRef = useRef(null);
  const hasInitializedRef = useRef(false);
  
  const { handleText } = useTextHandler((accessibility.volume ?? 1));
  
  const { blurActiveElement } = useDOM();
  const { play: playSound } = useSound();

  // ScreenStart의 포커스는 RouteProvider에서 처리하므로 여기서는 제거 (중복 방지)

  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)

  useGlobalHandlerRegistration(handleText);
  useToggleButtonClickHandler(true);
  useDisabledButtonBlocker(true);
  useKeyboardNavigationHandler(true, true);
  usePressStateHandler(true);
  useInteractiveTTSHandler(true, handleText);
  const { updateFocusableSections } = useFocusableSectionsManager(['mainContent'], { mainContent: mainContentRef });

  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <div className="main first" data-tts-text={TTS_SCREEN_START} tabIndex={-1}>
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
      <ModalContainer />
    </>
  );
});
ScreenStart.displayName = 'ScreenStart';

// ============================================================================
// 프로세스 2 컴포넌트 (메뉴 선택 화면)
// ============================================================================

const ScreenMenu = memo(() => {
  // ScreenMenu 전용 TTS 스크립트 (단일책임: ScreenMenu TTS만)
  const TTS_SCREEN_MENU = `안내, 선택 단계, 카테고리에서 메뉴종류를 선택하시고, 메뉴에서 상품을 선택합니다, 초기화 버튼으로 상품을 다시 선택할 수 있습니다, 주문하기 버튼으로 다음 단계, 내역확인으로 이동 할 수 있습니다, ${TTS.replay}`;
  const TTS_ERROR_NO_PRODUCT = '없는 상품입니다.';
  
  // ScreenMenu 전용 상수 (단일책임: ScreenMenu 상수만)
  const PLACEHOLDER_MENU = { id: 0, name: "추가예정", price: "0", img: "item-americano.png" };
  
  // Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const accessibility = useContext(AccessibilityContext);
  const order = useContext(OrderContext);
  const route = useContext(RouteContext);
  
  // 페이지네이션 설정
  const PAGINATION_CONFIG = { ITEMS_PER_PAGE_NORMAL: 16, ITEMS_PER_PAGE_LOW: 3 };
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  const { blurActiveElement, getActiveElementText } = useDOM();
  
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)

  // 기본 탭 설정
  useEffect(() => {
    const t = setTimeout(() => order.setSelectedTab('전체메뉴'), 0);
    return () => clearTimeout(t);
  }, [order.setSelectedTab]); // eslint-disable-line


  useKeyboardNavigationHandler(false, true);
  const { updateFocusableSections } = useFocusableSectionsManager(['categoryNav', 'mainContent', 'actionBar', 'orderSummary', 'systemControls'], {
    categoryNav: refsData.refs.ScreenMenu.categoryNavRef,
    mainContent: refsData.refs.ScreenMenu.mainContentRef,
    actionBar: refsData.refs.ScreenMenu.actionBarRef,
    orderSummary: refsData.refs.ScreenMenu.orderSummaryRef,
    systemControls: refsData.refs.ScreenMenu.systemControlsRef
  });

  const {
    pageNumber, totalPages, currentItems,
    handlePrevPage, handleNextPage, resetPage
  } = usePagination(
    order.menuItems,
    PAGINATION_CONFIG.ITEMS_PER_PAGE_NORMAL,
    PAGINATION_CONFIG.ITEMS_PER_PAGE_LOW,
    accessibility.isLow
  );
  
  // 탭 변경 시 페이지 리셋
  useEffect(() => {
    const t = setTimeout(() => resetPage(), 0);
    return () => clearTimeout(t);
  }, [order.selectedTab, resetPage]); // eslint-disable-line



  
  // 가변 너비 카테고리 페이지네이션
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
  } = useCategoryPagination(
    useMemo(() => (order.categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })), [order.categoryInfo]),
    accessibility.isLarge
  );

  // 카테고리 페이지 네비게이션 핸들러 등록
  useLayoutEffect(() => { 
    order.setHandleCategoryPageNav?.((dir) => { dir === 'prev' ? catPrev() : catNext(); }); 
    return () => order.setHandleCategoryPageNav?.(null); 
  }, [catPrev, catNext, order.setHandleCategoryPageNav]);

  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div className="main second" data-tts-text={TTS_SCREEN_MENU} tabIndex={-1}>
        <CategoryNav 
          categories={useMemo(() => (order.categoryInfo || []).map(c => ({ id: c.cate_id, name: c.cate_name })), [order.categoryInfo])}
          selectedTab={order.selectedTab}
          pagination={{ catPage, catTotal, catItems, catHasPrev, catHasNext, catPrev, catNext, isCompact: catIsCompact, isReady: catIsReady }}
          containerRef={catContainerRef}
          measureRef={catMeasureRef}
          convertToKoreanQuantity={convertToKoreanQuantity}
          categoryNavRef={refsData.refs.ScreenMenu.categoryNavRef}
        />
        <MenuGrid 
          items={currentItems} 
          onItemPress={(e, id) => { 
            e.preventDefault(); 
            e.target.focus(); 
            if (id !== 0) {
              order.handleIncrease(id);
              handleText('담기, ');
            } else {
              handleText(TTS_ERROR_NO_PRODUCT);
            }
          }}
          selectedTab={order.selectedTab}
          convertToKoreanQuantity={convertToKoreanQuantity}
          mainContentRef={refsData.refs.ScreenMenu.mainContentRef}
        />
        <Pagination 
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPrev={(e) => { e.preventDefault(); e.target.focus(); handlePrevPage(); }}
          onNext={(e) => { e.preventDefault(); e.target.focus(); handleNextPage(); }}
          isDark={accessibility.isDark}
          ttsPrefix="메뉴"
          sectionRef={refsData.refs.ScreenMenu.actionBarRef}
        />
      </div>
      <Summary orderSummaryRef={refsData.refs.ScreenMenu.orderSummaryRef} />
      <Bottom systemControlsRef={refsData.refs.ScreenMenu.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenMenu.displayName = 'ScreenMenu';

// ============================================================================
// 프로세스 3 컴포넌트 (주문 확인 화면)
// ============================================================================

const ScreenDetails = memo(() => {
  // ScreenDetails 전용 TTS 스크립트 (단일책임: ScreenDetails TTS만)
  const TTS_SCREEN_DETAILS = `안내, 내역 확인, 주문목록에서 상품명, 수량, 가격을 확인합니다, 수량 버튼 및 삭제 버튼으로 주문목록을 수정 할 수 있습니다. 추가하기 버튼으로 이전 단계, 메뉴선택으로 돌아갈 수 있습니다, 결제하기 버튼으로 다음 단계, 결제선택으로 이동할 수 있습니다,${TTS.replay}`;
  
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const route = useContext(RouteContext);
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // rowRefs를 useMemo로 메모이제이션 (무한루프 방지) - ref는 항상 같은 참조이므로 의존성 불필요
  const rowRefs = useMemo(() => [
    refsData.refs.ScreenDetails.row1Ref, 
    refsData.refs.ScreenDetails.row2Ref, 
    refsData.refs.ScreenDetails.row3Ref, 
    refsData.refs.ScreenDetails.row4Ref, 
    refsData.refs.ScreenDetails.row5Ref, 
    refsData.refs.ScreenDetails.row6Ref
  ], []); // ref는 항상 같은 참조이므로 의존성 불필요
  
  const {
    pageNumber, totalPages, currentItems,
    handlePrevPage, handleNextPage, itemsPerPage
  } = usePagination(order.filterMenuItems(order.totalMenuItems, order.quantities), 6, 3, accessibility.isLow);
  
  useKeyboardNavigationHandler(false, true);
  const { updateFocusableSections } = useFocusableSectionsManager(
    [
      'hiddenPageButton',
      ...Array.from({ length: (currentItems && currentItems.length) ? currentItems.length : 0 }, (_, i) => `row${i + 1}`),
      'actionBar', 'orderSummary', 'systemControls'
    ],
    {
    actionBar: refsData.refs.ScreenDetails.actionBarRef,
    orderSummary: refsData.refs.ScreenDetails.orderSummaryRef,
    systemControls: refsData.refs.ScreenDetails.systemControlsRef,
    rows: rowRefs,
    row1: rowRefs[0], row2: rowRefs[1], row3: rowRefs[2],
    row4: rowRefs[3], row5: rowRefs[4], row6: rowRefs[5]
    }
  );

  // currentItems.length만 의존성에 포함 (배열 참조가 아닌 길이만)
  const currentItemsLength = currentItems?.length ?? 0;

  useEffect(() => {
    // 동적 섹션 변경 시 sectionsRefs도 함께 업데이트
    updateFocusableSections(
      [
        'hiddenPageButton',
        ...Array.from({ length: currentItemsLength }, (_, i) => `row${i + 1}`),
        'actionBar', 'orderSummary', 'systemControls'
      ],
      {
        actionBar: refsData.refs.ScreenDetails.actionBarRef,
        orderSummary: refsData.refs.ScreenDetails.orderSummaryRef,
        systemControls: refsData.refs.ScreenDetails.systemControlsRef,
        rows: rowRefs,
        row1: rowRefs[0], row2: rowRefs[1], row3: rowRefs[2],
        row4: rowRefs[3], row5: rowRefs[4], row6: rowRefs[5]
      }
    );
  }, [pageNumber, currentItemsLength, rowRefs, updateFocusableSections]); // refsData.refs 제거, currentItems 대신 currentItemsLength 사용
  
  // 아이템 없으면 메뉴선택으로 이동
  useEffect(() => {
    if (!currentItems || currentItems.length === 0) {
      const t = setTimeout(() => route.setCurrentPage('ScreenMenu'), 0);
      return () => clearTimeout(t);
    }
  }, [currentItems, route]); // eslint-disable-line
  
  const { blurActiveElement } = useDOM();
  
  // 페이지 진입 시 blur만 설정 (포커스는 RouteProvider에서 자동으로 처리됨, TTS는 .main의 data-tts-text에서 자동 재생)
  useEffect(() => {
    blurActiveElement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.currentPage]); // 페이지 변경 시에만 실행

  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div className="main third" data-tts-text={TTS_SCREEN_DETAILS} tabIndex={-1}>
        <PageTitle>
          <span><Highlight isDark={accessibility.isDark}>내역</Highlight>을 확인하시고</span>
          <span><Highlight isDark={accessibility.isDark}>결제하기</Highlight>&nbsp;버튼을 누르세요</span>
        </PageTitle>
        <OrderHeader isLow={accessibility.isLow} />
        <div className="details">
          {currentItems && currentItems.length > 0 && currentItems.map((item, i) => (
            <OrderItem 
              key={item.id}
              item={item}
              index={(pageNumber - 1) * itemsPerPage + i + 1}
              quantity={order.quantities[item.id]}
              onDecrease={(e) => { 
                e.preventDefault(); 
                e.currentTarget.focus(); 
                if (order.quantities[item.id] === 1) {
                  accessibility.setModalDeleteItemId(item.id);
                  (currentItems && currentItems.length > 1) ? accessibility.ModalDelete.open() : accessibility.ModalDeleteCheck.open();
                } else {
                  order.handleDecrease(item.id);
                }
              }}
              onIncrease={(e) => { e.preventDefault(); e.currentTarget.focus(); order.handleIncrease(item.id); }}
              onDelete={(e) => { 
                e.preventDefault(); 
                e.currentTarget.focus(); 
                accessibility.setModalDeleteItemId(item.id);
                (currentItems && currentItems.length > 1) ? accessibility.ModalDelete.open() : accessibility.ModalDeleteCheck.open();
              }}
              sectionRef={itemsPerPage ? rowRefs[(i % itemsPerPage)] : rowRefs[i]}
              convertToKoreanQuantity={convertToKoreanQuantity}
            />
          ))}
        </div>
        <Pagination 
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPrev={(e) => { e.preventDefault(); e.target.focus(); handlePrevPage(); }}
          onNext={(e) => { e.preventDefault(); e.target.focus(); handleNextPage(); }}
          isDark={accessibility.isDark}
          ttsPrefix="주문목록"
          sectionRef={refsData.refs.ScreenDetails.actionBarRef}
        />
      </div>
      <Summary orderSummaryRef={refsData.refs.ScreenDetails.orderSummaryRef} />
      <Bottom systemControlsRef={refsData.refs.ScreenDetails.systemControlsRef} />
      <ModalContainer />
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
  const route = useContext(RouteContext);
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // TTS는 .main의 data-tts-text에서 자동 재생됨 (동적 값 포함)
  const paymentTts = useMemo(() => 
    `안내, 결제 단계, 결제 금액, ${formatNumber(order.totalSum)}원, 결제 방법을 선택합니다. 취소 버튼으로 이전 단계, 내역확인으로 돌아갈 수 있습니다. ${TTS.replay}`,
    [order.totalSum]
  );
  
  // 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  // totalSum 변경 시에는 포커스 재설정 불필요 (RouteProvider가 currentPage 변경 시에만 포커스 설정)
  
  useKeyboardNavigationHandler(false, true);
  useFocusableSectionsManager(['mainContent', 'actionBar', 'systemControls'], {
    mainContent: refsData.refs.ScreenPayments.mainContentRef,
    actionBar: refsData.refs.ScreenPayments.actionBarRef,
    systemControls: refsData.refs.ScreenPayments.systemControlsRef
  });

  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div className="main forth" data-tts-text={paymentTts} tabIndex={-1}>
        <PageTitle><span><span className="primary">결제방법</span>을 선택합니다</span></PageTitle>
        <div className="banner price" onClick={(e) => { e.preventDefault(); e.target.focus(); order.updateOrderNumber(); route.setCurrentPage('ScreenOrderComplete'); }}>
          <span>결제금액</span><span className="payment-amount-large">{order.totalSum.toLocaleString("ko-KR")}원</span>
        </div>
        <div className="task-manager" ref={refsData.refs.ScreenPayments.mainContentRef} data-tts-text="결제 선택. 버튼 세 개, ">
          <Button className="w328h460" payment="card" img="./images/payment-card.png" imgAlt="card" label="신용카드" />
          <Button className="w328h460" payment="mobile" img="./images/payment-mobile.png" imgAlt="mobile" label="모바일 페이" />
          <Button className="w328h460" navigate="ScreenSimplePay" img="./images/payment-simple.png" imgAlt="simple" label="간편결제" />
        </div>
        <div ref={refsData.refs.ScreenPayments.actionBarRef} className="task-manager" data-tts-text="작업관리. 버튼 한 개,">
          <Button className="w500h120" navigate="ScreenDetails" label="취소" />
        </div>
      </div>
      <Bottom systemControlsRef={refsData.refs.ScreenPayments.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenPayments.displayName = 'ScreenPayments';

// ============================================================================
// 프로세스 5 컴포넌트 (카드 삽입)
// ============================================================================

const ScreenCardInsert = memo(() => {
  // ScreenCardInsert 전용 TTS 스크립트 (단일책임: ScreenCardInsert TTS만)
  const TTS_SCREEN_CARD_INSERT = `안내, 신용카드 삽입, 가운데 아래에 있는 카드리더기에 신용카드를 끝까지 넣습니다, 취소 버튼으로 이전 단계, 결제선택으로 이동 할 수 있습니다, ${TTS.replay}`;
  
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const accessibility = useContext(AccessibilityContext);
  const route = useContext(RouteContext);
  const order = useContext(OrderContext);
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  useWebViewMessage();
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // TTS는 .main의 data-tts-text에서 자동 재생됨
  
  useKeyboardNavigationHandler(false, true);
  useFocusableSectionsManager(['actionBar'], {
    actionBar: refsData.refs.ScreenCardInsert.actionBarRef,
    systemControls: refsData.refs.ScreenCardInsert.systemControlsRef
  });


  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div data-tts-text={TTS_SCREEN_CARD_INSERT} ref={refsData.refs.ScreenCardInsert.actionBarRef} className="main forth" tabIndex={-1}>
        <PageTitle>
          <div>가운데 아래에 있는 <span className="primary">카드리더기</span>{accessibility.isLow && !accessibility.isLarge ? <><br /><div className="flex center">에</div></> : "에"}</div>
          <div><span className="primary">신용카드</span>를 끝까지 넣으세요</div>
        </PageTitle>
        <img src="./images/device-cardReader-insert.png" alt="" className="credit-pay-image" onClick={() => accessibility.ModalPaymentError.open()} />
        <Button className="w500h120" navigate="ScreenPayments" label="취소" />
      </div>
      <Bottom systemControlsRef={refsData.refs.ScreenCardInsert.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenCardInsert.displayName = 'ScreenCardInsert';

// ============================================================================
// 프로세스 6 컴포넌트 (모바일페이)
// ============================================================================

const ScreenMobilePay = memo(() => {
  // ScreenMobilePay 전용 TTS 스크립트 (단일책임: ScreenMobilePay TTS만)
  const TTS_SCREEN_MOBILE_PAY = `안내, 모바일페이, 가운데 아래에 있는 카드리더기에 휴대전화의 모바일페이를 켜고 접근시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ${TTS.replay}`;
  
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const route = useContext(RouteContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  useWebViewMessage();
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // TTS는 .main의 data-tts-text에서 자동 재생됨
  
  useKeyboardNavigationHandler(false, true);
  useFocusableSectionsManager(['actionBar'], {
    actionBar: refsData.refs.ScreenMobilePay.actionBarRef,
    systemControls: refsData.refs.ScreenMobilePay.systemControlsRef
  });


  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div data-tts-text={TTS_SCREEN_MOBILE_PAY} ref={refsData.refs.ScreenMobilePay.actionBarRef} className="main forth" tabIndex={-1}>
        <PageTitle>
          <div>가운데 아래에 있는 <span className="primary">카드리더기</span>에</div>
          <div><span className="primary">모바일페이</span>를 켜고 접근시키세요</div>
        </PageTitle>
        <img src="./images/device-cardReader-mobile.png" alt="" className="credit-pay-image" onClick={() => route.setCurrentPage('ScreenOrderComplete')} />
        <Button className="w500h120" navigate="ScreenPayments" label="취소" />
      </div>
      <Bottom systemControlsRef={refsData.refs.ScreenMobilePay.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenMobilePay.displayName = 'ScreenMobilePay';

// ============================================================================
// 프로세스 7 컴포넌트 (심플 결제)
// ============================================================================

const ScreenSimplePay = memo(() => {
  // ScreenSimplePay 전용 TTS 스크립트 (단일책임: ScreenSimplePay TTS만)
  const TTS_SCREEN_SIMPLE_PAY = `안내, 심플 결제, 오른쪽 아래에 있는 QR리더기에 QR코드를 인식시킵니다, 취소 버튼을 눌러 이전 작업, 결제 선택으로 돌아갈 수 있습니다, ${TTS.replay}`;
  
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const route = useContext(RouteContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  useWebViewMessage();
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // TTS는 .main의 data-tts-text에서 자동 재생됨
  
  useKeyboardNavigationHandler(false, true);
  useFocusableSectionsManager(['actionBar'], {
    actionBar: refsData.refs.ScreenSimplePay.actionBarRef,
    systemControls: refsData.refs.ScreenSimplePay.systemControlsRef
  });


  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div data-tts-text={TTS_SCREEN_SIMPLE_PAY} ref={refsData.refs.ScreenSimplePay.actionBarRef} className="main forth" tabIndex={-1}>
        <PageTitle>
          <div>오른쪽 아래에 있는 <span className="primary">QR리더기</span>에</div>
          <div><span className="primary">QR코드</span>를 인식시킵니다</div>
        </PageTitle>
        <img src="./images/device-codeReader-simple.png" alt="" className="credit-pay-image" onClick={() => route.setCurrentPage('ScreenOrderComplete')} />
        <Button className="w500h120" navigate="ScreenPayments" label="취소" />
      </div>
      <Bottom systemControlsRef={refsData.refs.ScreenSimplePay.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenSimplePay.displayName = 'ScreenSimplePay';

// ============================================================================
// 프로세스 8 컴포넌트
// ============================================================================

const ScreenCardRemoval = memo(() => {
  // ScreenCardRemoval 전용 TTS 스크립트 (단일책임: ScreenCardRemoval TTS만)
  const TTS_SCREEN_CARD_REMOVAL = `안내, 신용카드 제거, 신용카드를 뽑습니다, 정상적으로 결제되고 나서 카드가 제거되면, 자동으로 다음 작업, 인쇄 선택으로 이동합니다, ${TTS.replay}`;
  
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const route = useContext(RouteContext);
  const accessibility = useContext(AccessibilityContext);
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // TTS는 .main의 data-tts-text에서 자동 재생됨
  
  useKeyboardNavigationHandler(false, true);
  useFocusableSectionsManager([], { systemControls: refsData.refs.ScreenCardRemoval.systemControlsRef });


  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div data-tts-text={TTS_SCREEN_CARD_REMOVAL} className="main forth card-remove" tabIndex={-1}>
        <PageTitle><span><span className="primary">카드</span>를 뽑으세요.</span></PageTitle>
        <img src="./images/device-cardReader-remove.png" alt="" className="credit-pay-image" onClick={() => accessibility.ModalPaymentError.open()} />
      </div>
      <Bottom systemControlsRef={refsData.refs.ScreenCardRemoval.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenCardRemoval.displayName = 'ScreenCardRemoval';

// ============================================================================
// 프로세스 9 컴포넌트 (인쇄 선택)
// ============================================================================

const ScreenOrderComplete = memo(() => {
  // ScreenOrderComplete 전용 TTS 스크립트 (단일책임: ScreenOrderComplete TTS만)
  const TTS_SCREEN_ORDER_COMPLETE = `안내, 인쇄 선택, 결제되었습니다, 주문번호, 백 번, 왼쪽 아래의 프린터에서 주문표를 받으시고, 영수증 출력을 선택합니다, 육십초 동안 조작이 없을 경우, 출력없이 사용 종료합니다,${TTS.replay}`;
  
  // ScreenOrderComplete 전용 상수 (단일책임: ScreenOrderComplete 상수만)
  const STORAGE_ORDER_NUM = 'orderNumber';
  
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const route = useContext(RouteContext);
  const order = useContext(OrderContext);
  const accessibility = useContext(AccessibilityContext);
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // sections 객체 생성
  const sections = {
    actionBar: refsData.refs.ScreenOrderComplete.actionBarRef,
    systemControls: refsData.refs.ScreenOrderComplete.systemControlsRef
  };
  
  useEffect(() => {
    order.updateOrderNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // ScreenOrderComplete 전용 카운트다운 훅 (단일책임: ScreenOrderComplete 카운트다운만)
  const countdown = useAutoFinishCountdown(() => route.setCurrentPage('ScreenFinish'));
  
  // TTS는 .main의 data-tts-text에서 자동 재생됨
  
  useKeyboardNavigationHandler(false, true);
  useFocusableSectionsManager(['actionBar'], {
    actionBar: refsData.refs.ScreenOrderComplete.actionBarRef,
    systemControls: refsData.refs.ScreenOrderComplete.systemControlsRef
  });

  

  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div data-tts-text={TTS_SCREEN_ORDER_COMPLETE} className="main forth" tabIndex={-1}>
        <PageTitle>
          <div>왼쪽 아래의 프린터에서 <span className="primary">주문표</span>를</div>
          <div>받으시고 <span className="primary">영수증 출력</span>을 선택합니다</div>
        </PageTitle>
        <img src="./images/device-printer-order.png" alt="" className="credit-pay-image" />
        <div className="order-num">
          <p>주문</p>
          <p>100</p>
        </div>
        <div className="task-manager" ref={refsData.refs.ScreenOrderComplete.actionBarRef} data-tts-text="인쇄 선택, 버튼 두 개,">
          <Button className="w371h120" onClick={() => { if (order.sendPrintReceiptToApp) order.sendPrintReceiptToApp(); route.setCurrentPage('ScreenReceiptPrint'); }} label="영수증 출력" />
          <Button ttsText="출력 안함," className="w371h120" onClick={() => route.setCurrentPage('ScreenFinish')} label={`출력 안함${countdown}`} />
        </div>
      </div>
      <Bottom systemControlsRef={refsData.refs.ScreenOrderComplete.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenOrderComplete.displayName = 'ScreenOrderComplete';

// ============================================================================
// 프로세스 10 컴포넌트 (영수증 출력)
// ============================================================================

const ScreenReceiptPrint = memo(() => {
  // ScreenReceiptPrint 전용 TTS 스크립트 (단일책임: ScreenReceiptPrint TTS만)
  const TTS_SCREEN_RECEIPT_PRINT = `안내, 영수증 출력, 왼쪽 아래의 프린터에서 영수증을 받습니다, 마무리하기 버튼으로 사용을 종료할 수 있습니다,${TTS.replay}`;
  
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const route = useContext(RouteContext);
  const accessibility = useContext(AccessibilityContext);
  const order = useContext(OrderContext);
  
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  const countdown = useAutoFinishCountdown(() => route.setCurrentPage('ScreenFinish'));
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // TTS는 .main의 data-tts-text에서 자동 재생됨
  
  useKeyboardNavigationHandler(false, true);
  useFocusableSectionsManager(['actionBar'], {
    actionBar: refsData.refs.ScreenReceiptPrint.actionBarRef,
    systemControls: refsData.refs.ScreenReceiptPrint.systemControlsRef
  });

  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div data-tts-text={TTS_SCREEN_RECEIPT_PRINT} className="main forth" ref={refsData.refs.ScreenReceiptPrint.actionBarRef} tabIndex={-1}>
        <PageTitle>
          <div>왼쪽 아래의 <span className="primary">프린터</span>에서 <span className="primary">영수증</span>을</div>
          <div>받으시고 <span className="primary">마무리</span>&nbsp;버튼을 누르세요</div>
        </PageTitle>
        <img src="./images/device-printer-receipt.png" alt="" className="credit-pay-image" />
        <Button className="w500h120" navigate="ScreenFinish" label={`마무리${countdown}`} ttsText="마무리하기" />
      </div>
      <Bottom systemControlsRef={refsData.refs.ScreenReceiptPrint.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenReceiptPrint.displayName = 'ScreenReceiptPrint';

// ============================================================================
// 프로세스 11 컴포넌트 (완료)
// ============================================================================

const ScreenFinish = memo(() => {
  // ScreenFinish 전용 TTS 스크립트 (단일책임: ScreenFinish TTS만)
  const TTS_SCREEN_FINISH = `안내, 사용종료, 이용해주셔서 감사합니다,`;
  
  // 개별 Context에서 값 가져오기
  const refsData = useContext(RefContext);
  const accessibility = useContext(AccessibilityContext);
  const order = useContext(OrderContext);
  const route = useContext(RouteContext);
  const { handleText } = useTextHandler(accessibility.volume);
  useInteractiveTTSHandler(true, handleText);
  // 화면이 보일 때 main에 포커스는 RouteProvider에서 자동으로 처리됨 (중복 제거)
  
  // ScreenFinish 전용 카운트다운 훅 (단일책임: ScreenFinish 카운트다운만)
  const useFinishCountdown = () => {
    const [countdown, setCountdown] = useState(3);
    const timerRef = useRef(null);
    const callbacksRef = useRef(null);
    
    // callbacks를 ref로 저장하여 의존성 배열에서 제거
    useEffect(() => {
      callbacksRef.current = {
        ModalRestart: accessibility.ModalRestart,
        ModalAccessibility: accessibility.ModalAccessibility,
        ModalTimeout: accessibility.ModalTimeout,
        setQuantities: order.setQuantities,
        totalMenuItems: order.totalMenuItems,
        setIsDark: accessibility.setIsDark,
        setVolume: accessibility.setVolume,
        setIsLarge: accessibility.setIsLarge,
        setIsLow: accessibility.setIsLow,
        setCurrentPage: route.setCurrentPage
      };
    }, [accessibility, order, route]);
    
    useEffect(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setCountdown(3);
      
      const tick = () => {
        setCountdown(prev => {
          const next = prev - 1;
          if (next === 0) {
            // 체크 표시를 위해 0으로 설정하고, 1초 후 초기화
            setTimeout(() => {
              if (callbacksRef.current) {
                initializeApp(callbacksRef.current);
              }
            }, 1000);
            return 0;
          } else if (next < 0) {
            // 이미 초기화가 진행 중이므로 타이머 정리만
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return next;
        });
      };
      
      timerRef.current = setInterval(tick, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }, []); // 의존성 배열을 빈 배열로 변경하여 컴포넌트 마운트 시 한 번만 실행
    
    return countdown;
  };
  
  const countdown = useFinishCountdown();
  
  // TTS는 .main의 data-tts-text에서 자동 재생됨

  return (
    <>
      <div className="black"></div>
      <div className="top"></div>
      <Step />
      <div className="main forth" data-tts-text={TTS_SCREEN_FINISH} tabIndex={-1}>
        <PageTitle>이용해 주셔서 감사합니다</PageTitle>
        <div className="end-countdown">
            <span>
            {countdown <= 0 ? '✓' : `${Math.floor(countdown)}`}
            </span>
        </div>
      </div>
      <Bottom systemControlsRef={refsData.refs.ScreenFinish.systemControlsRef} />
      <ModalContainer />
    </>
  );
});
ScreenFinish.displayName = 'ScreenFinish';

// ============================================================================
// 전역 모달 컴포넌트
// ============================================================================

const ModalContainer = () => {
  const accessibility = useContext(AccessibilityContext);
  const order = useContext(OrderContext);

  return (
    <>
      {(accessibility?.ModalRestart || { isOpen: false }).isOpen && <RestartModal />}
      {(accessibility?.ModalReset || { isOpen: false }).isOpen && <ResetModal />}
      {(accessibility?.ModalAccessibility || { isOpen: false }).isOpen && (
        <BaseModal
          isOpen={accessibility.ModalAccessibility.isOpen}
          type="accessibility"
          onCancel={() => {}}
          onConfirm={() => {}}
        />
      )}
      {(accessibility?.ModalCall || { isOpen: false }).isOpen && <CallModal />}
      {(accessibility?.ModalDelete || { isOpen: false }).isOpen && <DeleteModal handleDelete={order?.handleDelete || (() => {})} id={accessibility?.ModalDeleteItemId || 0} />}
      {(accessibility?.ModalDeleteCheck || { isOpen: false }).isOpen && <DeleteCheckModal handleDelete={order?.handleDelete || (() => {})} id={accessibility?.ModalDeleteItemId || 0} />}
      {(accessibility?.ModalTimeout || { isOpen: false }).isOpen && <TimeoutModal />}
      {(accessibility?.ModalPaymentError || { isOpen: false }).isOpen && <PaymentErrorModal />}
    </>
  );
};

// ============================================================================
// 메인 Run 컴포넌트 - Provider 레이어 구조 (의존성 순서에 따라)
// ============================================================================
// 
// Provider 의존성 체인:
// 1. TTSDBProvider (독립) - IndexedDB 관리
// 2. TTSStateProvider (독립) - TTS 재생 상태 관리
//    → useTextHandler가 TTSDBContext와 TTSStateContext를 모두 사용하므로 함께 필요
// 3. AccessibilityProvider (독립) - 접근성 설정 (isDark, isLow, isLarge, volume)
// 4. OrderProvider (독립) - 주문 상태 관리 (useMenuData, useMenuUtils 사용)
// 5. RefProvider (독립) - 전역 refs 관리
//    → Screen 컴포넌트들이 RefContext를 사용하므로 RouteProvider보다 바깥에 위치
// 6. RouteProvider (독립) - 라우팅 및 Screen 컴포넌트 렌더링
//    → Screen 컴포넌트들이 RefContext, AccessibilityContext, OrderContext, RouteContext 사용
// 7. ButtonStateProvider (독립) - 버튼 상태 관리
// 8. ButtonGroupProvider (독립) - 버튼 그룹 선택 관리
//
// 실행 순서: 외부 Provider → 내부 Provider (의존성이 없는 Provider는 순서 무관)
// ============================================================================
const Run = () => {
  // 전역 포커스 이동 추적 (관측성)
  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target;
      const targetInfo = target ? {
        tagName: target.tagName,
        className: target.className,
        id: target.id || null,
        isMain: target.classList.contains('main'),
        isModal: target.classList.contains('modal')
      } : null;
      
      console.log('[포커스] focusin 이벤트 발생', {
        target: targetInfo,
        timestamp: new Date().toISOString()
      });
    };
    
    const handleFocusOut = (e) => {
      const target = e.target;
      const relatedTarget = e.relatedTarget;
      const targetInfo = target ? {
        tagName: target.tagName,
        className: target.className,
        id: target.id || null
      } : null;
      const relatedInfo = relatedTarget ? {
        tagName: relatedTarget.tagName,
        className: relatedTarget.className,
        id: relatedTarget.id || null
      } : null;
      
      console.log('[포커스] focusout 이벤트 발생', {
        from: targetInfo,
        to: relatedInfo,
        timestamp: new Date().toISOString()
      });
    };
    
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };
  }, []);
  
  return (
    <>
      {/* 과거 앱 방식: audioPlayer를 Provider 체인 밖 최상위에 직접 렌더링 (가장 빠른 마운트) */}
      <audio id="audioPlayer" src=""/>
      {/* Layer 1: TTS Database Provider (독립) - IndexedDB 관리 */}
    <TTSDBProvider>
        {/* Layer 2: TTS State Provider (독립) - TTS 재생 상태 관리
            주의: useTextHandler가 TTSDBContext와 TTSStateContext를 모두 사용하므로 함께 필요 */}
      <TTSStateProvider>
          {/* Layer 3: Accessibility Provider (독립) - 접근성 설정 */}
          <AccessibilityProvider>
            {/* Layer 4: Order Provider (독립) - 주문 상태 관리
                내부 Hook: useMenuData(독립), useMenuUtils(독립) */}
            <OrderProvider>
              {/* Layer 5: Ref Provider (독립) - 전역 refs 관리
                  주의: Screen 컴포넌트들이 RefContext를 사용하므로 RouteProvider보다 바깥에 위치 */}
              <RefProvider>
                {/* Layer 6: Button State Provider (독립) - 버튼 상태 관리
                    주의: Screen 컴포넌트들이 Button 컴포넌트를 사용하므로 RouteProvider보다 바깥에 위치 */}
                <ButtonStateProvider>
                  {/* Layer 7: Button Group Provider (독립) - 버튼 그룹 선택 관리
                      주의: Screen 컴포넌트들이 Button 컴포넌트를 사용하므로 RouteProvider보다 바깥에 위치 */}
                  <ButtonGroupProvider>
                    {/* Layer 8: Route Provider (독립) - 라우팅 및 Screen 컴포넌트 렌더링
                        내부 컴포넌트: ScreenStart, ScreenMenu, ScreenDetails 등
                        사용 Context: RefContext, AccessibilityContext, OrderContext, RouteContext, ButtonStateContext, ButtonGroupContext */}
                    <RouteProvider>
                      {/* 이니셜 컴포넌트들 (의존성 없음, 순서 무관) */}
                    <ButtonHandlerInitializer />
                    <SizeControlInitializer />
                    <ViewportInitializer />
                      <AppFocusTrapInitializer />
                    </RouteProvider>
                  </ButtonGroupProvider>
                </ButtonStateProvider>
              </RefProvider>
            </OrderProvider>
          </AccessibilityProvider>
      </TTSStateProvider>
    </TTSDBProvider>
  </>
  );
};

export default Run;

// ============================================================================
// 애플리케이션 마운트
// body를 직접 root로 사용
// ============================================================================
ReactDOM.createRoot(document.body).render(React.createElement(Run));
