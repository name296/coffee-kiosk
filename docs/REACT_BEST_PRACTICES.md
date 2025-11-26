# React 최대 활용 가이드

이 프로젝트에서 React를 최대한 활용하기 위한 가이드입니다.

## 📋 목차

1. [성능 최적화](#성능-최적화)
2. [커스텀 훅](#커스텀-훅)
3. [에러 처리](#에러-처리)
4. [컴포넌트 설계](#컴포넌트-설계)
5. [상태 관리](#상태-관리)

## 성능 최적화

### 1. useMemo - 계산된 값 메모이제이션

**사용 시기**: 비용이 큰 계산이나 객체/배열 생성 시

```javascript
// ❌ 나쁜 예 - 매 렌더마다 재계산
const totalSum = calculateTotal(quantities, totalMenuItems);

// ✅ 좋은 예 - 의존성 변경 시에만 재계산
const totalSum = useMemo(
  () => calculateTotal(quantities, totalMenuItems),
  [quantities, totalMenuItems]
);
```

**현재 적용 위치**:
- `AppContext.js`: `menuItems`, `totalCount`, `totalSum`, `accessibility`, `contextValue`
- `Frame.js`: `pageText`

### 2. useCallback - 함수 메모이제이션

**사용 시기**: 자식 컴포넌트에 props로 전달되는 함수, useEffect의 의존성

```javascript
// ❌ 나쁜 예 - 매 렌더마다 새 함수 생성
const handleIncrease = (id) => {
  setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }));
};

// ✅ 좋은 예 - 함수 메모이제이션
const handleIncrease = useCallback((id) => {
  setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }));
}, []);
```

**현재 적용 위치**:
- `AppContext.js`: `setCurrentPage`, `goBack`, `handleIncrease`, `handleDecrease`, `readCurrentPage`

### 3. React.memo - 컴포넌트 메모이제이션

**사용 시기**: props가 자주 변경되지 않는 순수 컴포넌트

```javascript
// ❌ 나쁜 예
export const Top = () => {
  // ...
};

// ✅ 좋은 예
export const Top = memo(() => {
  // ...
});
```

**현재 적용 위치**:
- `Frame.js`: `Top`, `Step`, `Summary`, `Bottom`

### 4. Context API 최적화

**문제**: Context value 객체가 매번 새로 생성되면 모든 Consumer가 리렌더링됨

**해결책**: useMemo로 value 객체 메모이제이션

```javascript
// ❌ 나쁜 예
<AppContext.Provider value={{ ... }}>

// ✅ 좋은 예
const contextValue = useMemo(() => ({
  // ...
}), [의존성들]);

<AppContext.Provider value={contextValue}>
```

**현재 적용**: `AppContext.js`의 `contextValue`

## 커스텀 훅

### 사용 가능한 커스텀 훅

#### 1. useBodyClass
body 요소에 클래스를 추가/제거

```javascript
import { useBodyClass } from '../hooks/useBodyClass';

function MyComponent() {
  useBodyClass('dark', isDark);
  // ...
}
```

#### 2. useLocalStorage
localStorage와 동기화되는 상태

```javascript
import { useLocalStorage } from '../hooks/useLocalStorage';

function MyComponent() {
  const [value, setValue] = useLocalStorage('key', 'defaultValue');
  // ...
}
```

#### 3. useDebounce
값을 디바운스

```javascript
import { useDebounce } from '../hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    // debouncedSearchTerm으로 검색 실행
  }, [debouncedSearchTerm]);
}
```

#### 4. usePrevious
이전 값 추적

```javascript
import { usePrevious } from '../hooks/usePrevious';

function MyComponent({ count }) {
  const prevCount = usePrevious(count);
  
  useEffect(() => {
    if (prevCount !== count) {
      console.log('Count changed from', prevCount, 'to', count);
    }
  }, [count, prevCount]);
}
```

## 에러 처리

### ErrorBoundary 사용

에러 바운더리는 하위 컴포넌트 트리에서 발생한 JavaScript 에러를 캐치합니다.

**현재 적용**: `App.js`에서 전체 앱과 AppContent를 감쌈

```javascript
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </ErrorBoundary>
  );
}
```

**커스텀 폴백 UI**:

```javascript
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h2>에러 발생</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

## 컴포넌트 설계

### 1. 단일 책임 원칙

각 컴포넌트는 하나의 명확한 책임을 가져야 합니다.

```javascript
// ✅ 좋은 예
export const Top = memo(() => {
  // 페이지 텍스트만 관리
});

export const Summary = memo(() => {
  // 주문 요약만 관리
});
```

### 2. Props 타입 정의

TypeScript를 사용하지 않는 경우, PropTypes를 사용하세요.

```javascript
import PropTypes from 'prop-types';

MyComponent.propTypes = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number,
};
```

### 3. 조건부 렌더링 최적화

```javascript
// ❌ 나쁜 예 - 불필요한 계산
{items.map(item => (
  <Item key={item.id} data={expensiveCalculation(item)} />
))}

// ✅ 좋은 예 - useMemo 사용
const processedItems = useMemo(
  () => items.map(item => ({
    ...item,
    processed: expensiveCalculation(item)
  })),
  [items]
);

{processedItems.map(item => (
  <Item key={item.id} data={item.processed} />
))}
```

## 상태 관리

### 1. Context API 최적화

- 관련된 상태만 함께 묶기
- 필요시 Context 분리 (예: `ThemeContext`, `CartContext`)

### 2. useState vs useReducer

**useState**: 단순한 상태
```javascript
const [count, setCount] = useState(0);
```

**useReducer**: 복잡한 상태 로직
```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

### 3. 상태 끌어올리기 (Lifting State Up)

공통 상태는 가장 가까운 공통 조상으로 끌어올리기

## 추가 개선 사항

### 1. Suspense 활용 (향후)

```javascript
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### 2. useTransition (React 18+)

긴급하지 않은 업데이트를 지연

```javascript
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setLargeList(newList);
});
```

### 3. useDeferredValue (React 18+)

값의 업데이트를 지연

```javascript
const deferredValue = useDeferredValue(value);
```

## 체크리스트

새 컴포넌트를 만들 때:

- [ ] 불필요한 리렌더링이 발생하지 않는가?
- [ ] useMemo/useCallback이 필요한가?
- [ ] React.memo로 감쌀 수 있는가?
- [ ] 커스텀 훅으로 추출할 수 있는 로직이 있는가?
- [ ] 에러 처리가 되어 있는가?
- [ ] Props 타입이 명확한가?

## 참고 자료

- [React 공식 문서](https://react.dev/)
- [React Hooks 공식 문서](https://react.dev/reference/react)
- [React 성능 최적화](https://react.dev/learn/render-and-commit)

