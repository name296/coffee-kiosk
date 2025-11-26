# 프로젝트 구조 가이드

PC/모바일 호환성을 보장하면서 React를 최대한 활용하는 구조적 프로젝트입니다.

## 📁 디렉토리 구조

```
coffee-kiosk/
├── public/
│   ├── data/
│   │   └── menu-data.json          # ✅ 메뉴 데이터 (JSON)
│   ├── images/                     # 이미지 파일
│   └── sound/                      # 사운드 파일
│
├── src/
│   ├── assets/                     # 에셋 및 유틸리티
│   │   ├── icons/                  # SVG 아이콘
│   │   ├── timer.js                # 타이머 유틸리티
│   │   ├── tts.js                  # TTS (Text-to-Speech)
│   │   └── useKeyboardNavigation.js # 키보드 네비게이션 훅
│   │
│   ├── components/                 # 재사용 가능한 컴포넌트
│   │   ├── Button.js               # ✅ React.memo 적용
│   │   ├── Frame.js                # ✅ React.memo, useMemo 적용
│   │   ├── ErrorBoundary.js        # ✅ 에러 바운더리
│   │   ├── AccessibilityModal.js
│   │   ├── CallModal.js
│   │   ├── DeleteModal.js
│   │   ├── DeleteCheckModal.js
│   │   ├── ResetModal.js
│   │   ├── ReturnModal.js
│   │   └── icons/                  # 아이콘 컴포넌트
│   │
│   ├── config/                     # ✅ 설정 파일 (중앙 관리)
│   │   ├── appConfig.js            # 애플리케이션 설정 상수
│   │   ├── messages.js              # 텍스트/메시지
│   │   └── index.js                 # 통합 export
│   │
│   ├── constants/                  # 상수
│   │   └── commonScript.js         # 공통 스크립트
│   │
│   ├── context/                    # ✅ 최적화 완료
│   │   └── AppContext.js           # Context API (메모이제이션)
│   │
│   ├── hooks/                      # ✅ 커스텀 훅 모음
│   │   ├── useBodyClass.js         # body 클래스 관리
│   │   ├── useLocalStorage.js      # localStorage 동기화
│   │   ├── useDebounce.js          # 디바운스
│   │   ├── usePrevious.js          # 이전 값 추적
│   │   ├── usePagination.js        # ✅ 페이지네이션 로직
│   │   ├── usePageTTS.js           # ✅ 페이지 TTS
│   │   ├── useSafeDocument.js      # ✅ 안전한 document 조작
│   │   └── index.js                # 통합 export
│   │
│   ├── layouts/                    # 레이아웃 컴포넌트
│   │   └── Layouts.js
│   │
│   ├── pages/                      # ✅ 모두 최적화 완료
│   │   ├── FirstPage.js            # ✅ React.memo, useCallback
│   │   ├── SecondPage.js           # ✅ usePagination, useCallback
│   │   ├── ThirdPage.js            # ✅ usePagination, useMemo
│   │   └── ForthPage.js            # ✅ useCallback, useSafeDocument
│   │
│   ├── utils/                      # 유틸리티 함수
│   │   ├── browserCompatibility.js # ✅ 브라우저 호환성 유틸
│   │   ├── dataLoader.js           # ✅ 데이터 로딩 유틸
│   │   ├── menuUtils.js            # 메뉴 관련 유틸
│   │   ├── numberUtils.js          # 숫자 관련 유틸
│   │   ├── pathUtils.js            # 경로 유틸
│   │   ├── buttonStyleGenerator.js
│   │   ├── buttonEventHandler.js
│   │   ├── cssInjector.js
│   │   └── sizeControlManager.js
│   │
│   ├── App.js                      # ✅ ErrorBoundary 추가
│   ├── index.js                    # 진입점
│   └── index.css                   # 스타일
│
└── 문서/
    ├── COMPATIBILITY_GUIDE.md      # 브라우저 호환성 가이드
    ├── REACT_BEST_PRACTICES.md     # React 활용 가이드
    ├── CONFIGURATION_GUIDE.md      # 설정 관리 가이드
    ├── REFACTORING_SUMMARY.md      # 리팩터링 요약
    └── PROJECT_STRUCTURE.md        # 이 문서
```

## 🎯 핵심 설계 원칙

### 1. 브라우저 호환성 우선
- 모든 브라우저 API 접근은 안전한 유틸리티 함수 사용
- Private browsing 모드 대응
- 모바일 사파리 특화 이슈 해결

### 2. React 최대 활용
- **성능 최적화**: useMemo, useCallback, React.memo
- **커스텀 훅**: 재사용 가능한 로직 추출
- **Context 최적화**: 불필요한 리렌더링 방지

### 3. 설정 중앙 관리
- 하드코딩 값 제거
- 설정 파일로 통합 관리
- 향후 DB/API 연동 용이

### 4. 구조적 설계
- 단일 책임 원칙
- 관심사 분리
- 재사용성 극대화

## 📦 주요 모듈 설명

### config/ - 설정 관리
```javascript
// appConfig.js - 모든 상수값
import { TIMER_CONFIG, SCREEN_CONFIG, PAYMENT_STEPS } from '../config';

// messages.js - 모든 텍스트
import { PAGE_MESSAGES, PAYMENT_MESSAGES } from '../config';
```

### hooks/ - 커스텀 훅
```javascript
// 페이지네이션
const { currentItems, handleNextPage } = usePagination(items, 9, 3, isLow);

// 안전한 document 조작
const { querySelector, blurActiveElement } = useSafeDocument();

// body 클래스 관리
useBodyClass('dark', isDark);
```

### utils/browserCompatibility.js - 호환성
```javascript
// 안전한 localStorage
const value = safeLocalStorage.getItem('key', 'default');

// 안전한 숫자 포맷팅
const formatted = formatNumber(1234567);

// 안전한 window 접근
const webview = safeWindow.get('chrome.webview');
```

## 🔄 데이터 흐름

```
사용자 입력
  ↓
컴포넌트 (React.memo)
  ↓
Context (메모이제이션된 value)
  ↓
커스텀 훅 (로직 처리)
  ↓
유틸리티 함수 (안전한 브라우저 API)
  ↓
브라우저
```

## 🎨 컴포넌트 계층 구조

```
App
├── ErrorBoundary
│   └── AppProvider (Context)
│       └── ErrorBoundary
│           └── AppContent
│               └── LayoutWithHeaderAndFooter
│                   ├── Top (React.memo)
│                   ├── Step (React.memo)
│                   ├── Page Component (React.memo)
│                   ├── Summary (React.memo)
│                   └── Bottom (React.memo)
```

## 🚀 성능 최적화 전략

1. **메모이제이션 계층**
   - Context value → useMemo
   - 계산된 값 → useMemo
   - 함수 → useCallback
   - 컴포넌트 → React.memo

2. **렌더링 최적화**
   - 조건부 렌더링 최적화
   - 불필요한 리렌더링 방지
   - 가상화 (필요시)

3. **로딩 최적화**
   - 코드 스플리팅 (향후)
   - 지연 로딩 (향후)

## 📝 코딩 컨벤션

### 파일 네이밍
- 컴포넌트: `PascalCase.js`
- 유틸리티: `camelCase.js`
- 훅: `useCamelCase.js`
- 설정: `camelCase.js`

### Import 순서
1. React 및 라이브러리
2. 내부 컴포넌트
3. 훅
4. 유틸리티
5. 설정/상수
6. 타입 (TypeScript 사용 시)

### 컴포넌트 구조
```javascript
// 1. Imports
import React, { ... } from 'react';

// 2. Component
const MyComponent = memo(({ props }) => {
  // 3. Hooks
  const { ... } = useCustomHook();
  
  // 4. Memoized values
  const memoized = useMemo(() => ..., [deps]);
  
  // 5. Callbacks
  const handleClick = useCallback(() => ..., [deps]);
  
  // 6. Effects
  useEffect(() => ..., [deps]);
  
  // 7. Render
  return (...);
});

MyComponent.displayName = 'MyComponent';
export default MyComponent;
```

## ✅ 체크리스트

새 컴포넌트/기능 추가 시:

- [ ] 브라우저 호환성 유틸리티 사용
- [ ] React.memo 적용 가능한가?
- [ ] useMemo/useCallback 필요한가?
- [ ] 하드코딩 값이 있는가? → config로 이동
- [ ] 커스텀 훅으로 추출 가능한가?
- [ ] 에러 처리가 되어 있는가?
- [ ] 타입 안정성 (가능하면)

## 🔗 관련 문서

- [COMPATIBILITY_GUIDE.md](./COMPATIBILITY_GUIDE.md) - 브라우저 호환성
- [REACT_BEST_PRACTICES.md](./REACT_BEST_PRACTICES.md) - React 활용
- [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) - 설정 관리
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - 리팩터링 요약

