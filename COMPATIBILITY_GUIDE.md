# 브라우저 호환성 가이드

PC와 모바일(특히 iOS Safari) 간 호환성을 보장하기 위한 가이드입니다.

## 📋 목차

1. [핵심 원칙](#핵심-원칙)
2. [호환성 유틸리티 사용법](#호환성-유틸리티-사용법)
3. [자주 발생하는 문제와 해결책](#자주-발생하는-문제와-해결책)
4. [코딩 베스트 프랙티스](#코딩-베스트-프랙티스)

## 핵심 원칙

### 1. 항상 안전한 접근 사용
- `localStorage` 직접 사용 ❌ → `safeLocalStorage` 사용 ✅
- `parseInt` 직접 사용 ❌ → `safeParseInt` 사용 ✅
- `toLocaleString` 직접 사용 ❌ → `formatNumber` 사용 ✅
- `window.xxx` 직접 접근 ❌ → `safeWindow.get()` 사용 ✅

### 2. Switch 문에서 블록 스코프 사용
```javascript
// ❌ 나쁜 예
switch (value) {
  case 'forth':
    const orderNum = parseInt(...); // 모바일 사파리에서 문제 발생 가능
    return ...;
}

// ✅ 좋은 예
switch (value) {
  case 'forth': {
    const orderNum = safeParseInt(...); // 블록 스코프로 감싸기
    return ...;
  }
}
```

### 3. 에러 처리와 폴백 제공
모든 브라우저 API 호출은 try-catch로 감싸고 폴백을 제공하세요.

## 호환성 유틸리티 사용법

### localStorage 사용

```javascript
// ❌ 나쁜 예
const value = localStorage.getItem("key");
localStorage.setItem("key", "value");

// ✅ 좋은 예
import { safeLocalStorage } from "../utils/browserCompatibility";

const value = safeLocalStorage.getItem("key", "defaultValue");
safeLocalStorage.setItem("key", "value");
```

### 숫자 파싱

```javascript
// ❌ 나쁜 예
const num = parseInt(localStorage.getItem("ordernum") || "0");

// ✅ 좋은 예
import { safeParseInt, safeParseFloat } from "../utils/browserCompatibility";

const num = safeParseInt(safeLocalStorage.getItem("ordernum"), 0);
const float = safeParseFloat(safeLocalStorage.getItem("price"), 0.0);
```

### 숫자 포맷팅

```javascript
// ❌ 나쁜 예
const formatted = totalSum.toLocaleString("ko-KR");

// ✅ 좋은 예
import { formatNumber } from "../utils/browserCompatibility";

const formatted = formatNumber(totalSum); // 기본: ko-KR, 천 단위 구분
const formattedWithOptions = formatNumber(totalSum, 'ko-KR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
```

### Window 객체 접근

```javascript
// ❌ 나쁜 예
if (window.chrome && window.chrome.webview) {
  window.chrome.webview.addEventListener(...);
}

// ✅ 좋은 예
import { safeWindow } from "../utils/browserCompatibility";

if (safeWindow.has('chrome.webview')) {
  const webview = safeWindow.get('chrome.webview');
  if (webview) {
    webview.addEventListener(...);
  }
}
```

### Document 쿼리

```javascript
// ❌ 나쁜 예
const element = document.querySelector('.my-class');

// ✅ 좋은 예
import { safeQuerySelector } from "../utils/browserCompatibility";

const element = safeQuerySelector('.my-class');
if (element) {
  // element 사용
}
```

### 이벤트 리스너

```javascript
// ❌ 나쁜 예
window.addEventListener('resize', handler);
// cleanup이 어려움

// ✅ 좋은 예
import { safeAddEventListener } from "../utils/browserCompatibility";

const cleanup = safeAddEventListener(window, 'resize', handler);
// cleanup 함수 호출로 이벤트 제거
useEffect(() => {
  return cleanup;
}, []);
```

## 자주 발생하는 문제와 해결책

### 1. Switch 문 내부 const 선언 문제

**문제**: 모바일 사파리에서 switch 문 내부의 const 선언이 스코프 문제를 일으킬 수 있음

**해결책**: 블록 스코프 `{}` 사용

```javascript
switch (currentPage) {
  case 'forth': {  // 블록 스코프 추가
    const orderNum = safeParseInt(...);
    // ...
  }
}
```

### 2. localStorage 접근 실패

**문제**: Private browsing 모드나 쿠키 차단 시 localStorage 접근 실패

**해결책**: `safeLocalStorage` 사용

```javascript
// 자동으로 에러 처리 및 기본값 반환
const value = safeLocalStorage.getItem("key", "default");
```

### 3. toLocaleString 호환성 문제

**문제**: 일부 브라우저에서 toLocaleString이 실패하거나 다른 결과 반환

**해결책**: `formatNumber` 사용 (자동 폴백 제공)

```javascript
// 실패 시 수동 포맷팅으로 자동 전환
const formatted = formatNumber(1234567); // "1,234,567"
```

### 4. Window 객체 체크 누락

**문제**: SSR 환경이나 특정 브라우저에서 window가 undefined

**해결책**: `safeWindow` 사용

```javascript
// 자동으로 undefined 체크
const webview = safeWindow.get('chrome.webview');
```

## 코딩 베스트 프랙티스

### 1. 항상 유틸리티 함수 사용

프로젝트 전반에 걸쳐 일관된 방식으로 브라우저 API를 사용하세요.

### 2. 타입 체크

```javascript
// 값이 null/undefined일 수 있는 경우 항상 체크
if (value != null) {
  // 사용
}
```

### 3. 기본값 제공

```javascript
// 항상 기본값 제공
const value = safeLocalStorage.getItem("key", "default");
const num = safeParseInt(input, 0);
```

### 4. 에러 로깅

유틸리티 함수들은 자동으로 에러를 로깅하지만, 중요한 부분에서는 추가 로깅을 고려하세요.

### 5. 테스트

다양한 브라우저에서 테스트:
- Chrome (Desktop)
- Safari (Desktop)
- Chrome (Mobile)
- Safari (iOS)
- Firefox (Desktop)

## 마이그레이션 체크리스트

기존 코드를 마이그레이션할 때:

- [ ] `localStorage` → `safeLocalStorage`
- [ ] `parseInt/parseFloat` → `safeParseInt/safeParseFloat`
- [ ] `.toLocaleString()` → `formatNumber()`
- [ ] `window.xxx` → `safeWindow.get('xxx')`
- [ ] `document.querySelector` → `safeQuerySelector`
- [ ] Switch 문 내부 const 선언 → 블록 스코프 추가
- [ ] 이벤트 리스너 → `safeAddEventListener` (cleanup 함수 반환)

## 추가 리소스

- [MDN: Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API)
- [Can I Use](https://caniuse.com/) - 브라우저 호환성 확인
- [Safari Web Content Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/)

