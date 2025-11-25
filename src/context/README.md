# Context 구조

AppContext를 관심사 분리(separation of concerns)를 통해 여러 Context로 분리했습니다.

## 구조

```
AppContext (통합)
├── AccessibilityContext (접근성 설정)
├── OrderContext (주문/결제 프로세스)
└── UIContext (UI 상태 관리)
```

## 각 Context의 역할

### 1. AccessibilityContext (`AccessibilityContext.js`)
**접근성 설정 관리**
- `isDark`, `setisDark` - 고대비 모드
- `isLow`, `setisLow` - 낮은화면 모드
- `isLarge`, `setisLarge` - 큰글씨 모드
- `volume`, `setVolume` - 볼륨 설정
- `accessibility`, `setAccessibility` - 통합 접근성 객체

### 2. OrderContext (`OrderContext.js`)
**주문 및 결제 프로세스 관리 (서비스 프로세스 핵심)**
- 메뉴 관련: `tabs`, `totalMenuItems`, `menuItems`, `selectedTab`
- 주문 관련: `quantities`, `handleIncrease`, `handleDecrease`, `totalCount`, `totalSum`
- 결제 관련: `isCreditPayContent`, `setisCreditPayContent`
- 유틸리티: `filterMenuItems`, `createOrderItems`, `convertToKoreanQuantity`, `calculateSum`, `calculateTotal`

### 3. UIContext (`UIContext.js`)
**UI 상태 관리**
- 모달 상태: `isReturnModal`, `isAccessibilityModal`, `isResetModal`, `isDeleteModal`, `isDeleteCheckModal`, `isCallModal`
- 삭제 관련: `deleteItemId`, `setDeleteItemId`
- 페이지 네비게이션: `currentPage`, `setCurrentPage`, `goBack`, `history`
- 기타 UI: `intervalTime`, `introFlag`
- DOM 참조: `sections` (refs)

### 4. AppContext (`AppContext.js`)
**통합 Context 및 공통 유틸리티**
- 모든 하위 Context를 통합하여 제공
- 공통 유틸리티: `commonScript`, `readCurrentPage`

## 사용 방법

기존과 동일하게 `AppContext`를 사용하면 됩니다. 모든 하위 Context의 값들이 자동으로 통합되어 제공됩니다.

```javascript
import { AppContext } from "../context/AppContext";

const MyComponent = () => {
  const {
    // AccessibilityContext
    isDark, setisDark, volume,
    // OrderContext
    quantities, handleIncrease, totalSum,
    // UIContext
    currentPage, setCurrentPage, sections,
    // AppContext 공통
    commonScript, readCurrentPage
  } = useContext(AppContext);
  
  // ...
};
```

## 장점

1. **관심사 분리**: 각 Context가 명확한 책임을 가짐
2. **유지보수성**: 특정 기능 수정 시 해당 Context만 수정
3. **재사용성**: 각 Context를 독립적으로 사용 가능
4. **테스트 용이성**: 각 Context를 개별적으로 테스트 가능
5. **성능 최적화**: 필요한 Context만 구독하여 불필요한 리렌더링 방지

