# 설정 관리 가이드

하드코딩된 값들을 구조화하고 중앙에서 관리하는 방법에 대한 가이드입니다.

## 📋 목차

1. [설정 구조](#설정-구조)
2. [설정 파일 사용법](#설정-파일-사용법)
3. [데이터 로딩](#데이터-로딩)
4. [DB/API 연동 (향후 확장)](#dbapi-연동-향후-확장)
5. [마이그레이션 가이드](#마이그레이션-가이드)

## 설정 구조

### 1. `src/config/appConfig.js` - 애플리케이션 설정

하드코딩된 숫자, 상수값들을 관리합니다.

```javascript
import { SCREEN_CONFIG, TIMER_CONFIG, PAYMENT_STEPS } from '../config';

// 화면 크기
const { BASE_WIDTH, BASE_HEIGHT } = SCREEN_CONFIG;

// 타이머 설정
const delay = TIMER_CONFIG.TTS_DELAY; // 500ms

// 결제 단계
if (step === PAYMENT_STEPS.SELECT_METHOD) {
  // ...
}
```

**포함된 설정**:
- `SCREEN_CONFIG`: 화면 크기, 줌 설정
- `TIMER_CONFIG`: 모든 타이머 관련 설정
- `PAGE_CONFIG`: 페이지 이름 상수
- `PAYMENT_STEPS`: 결제 단계 상수
- `PAGINATION_CONFIG`: 페이지네이션 설정
- `WEBVIEW_COMMANDS`: 웹뷰 명령어
- `STORAGE_KEYS`: 로컬스토리지 키
- `FOCUS_SECTIONS`: 포커스 섹션 이름
- `DEFAULT_SETTINGS`: 기본 설정값

### 2. `src/config/messages.js` - 메시지/텍스트

모든 사용자에게 표시되는 텍스트를 관리합니다.

```javascript
import { PAGE_MESSAGES, PAYMENT_MESSAGES } from '../config';

// 페이지 메시지
const firstPageText = PAGE_MESSAGES.FIRST.FULL();

// 결제 메시지 (동적 값 포함)
const paymentText = PAYMENT_MESSAGES.SELECT_METHOD(totalSum, formatNumber);
```

**포함된 메시지**:
- `PAGE_MESSAGES`: 페이지별 안내 메시지
- `PAYMENT_MESSAGES`: 결제 단계별 메시지
- `BUTTON_MESSAGES`: 버튼 텍스트
- `SUMMARY_MESSAGES`: 요약 텍스트
- `SYSTEM_MESSAGES`: 시스템 메시지
- `ERROR_MESSAGES`: 에러 메시지

### 3. `public/data/menu-data.json` - 메뉴 데이터

메뉴 정보를 JSON 파일로 분리했습니다.

```json
{
  "tabs": ["전체메뉴", "커피", ...],
  "menuItems": [
    {
      "id": 1,
      "name": "아메리카노 (아이스)",
      "price": "2500",
      "img": "./public/images/item-아메리카노.svg",
      "category": "커피"
    }
  ],
  "categoryFilters": {
    "커피": ["아메리카노", "콜드브루", "마끼아또"]
  }
}
```

## 설정 파일 사용법

### 기본 사용

```javascript
// ❌ 나쁜 예
const delay = 500;
const width = 1080;
const height = 1920;

// ✅ 좋은 예
import { TIMER_CONFIG, SCREEN_CONFIG } from '../config';
const delay = TIMER_CONFIG.TTS_DELAY;
const { BASE_WIDTH, BASE_HEIGHT } = SCREEN_CONFIG;
```

### 메시지 사용

```javascript
// ❌ 나쁜 예
return "작업 안내, 시작화면 단계...";

// ✅ 좋은 예
import { PAGE_MESSAGES } from '../config';
return PAGE_MESSAGES.FIRST.FULL();
```

### 동적 메시지

```javascript
// ❌ 나쁜 예
return `작업 안내, 결제 선택 단계. 결제 금액, ${totalSum}원...`;

// ✅ 좋은 예
import { PAYMENT_MESSAGES } from '../config';
return PAYMENT_MESSAGES.SELECT_METHOD(totalSum, formatNumber);
```

## 데이터 로딩

### JSON 파일에서 로드

```javascript
import { loadMenuData } from '../utils/dataLoader';

// 컴포넌트에서 사용
useEffect(() => {
  const loadData = async () => {
    const menuData = await loadMenuData();
    setMenuItems(menuData.menuItems);
    setTabs(menuData.tabs);
  };
  loadData();
}, []);
```

### API에서 로드 (향후 확장)

```javascript
import { loadDataFromAPI } from '../utils/dataLoader';

useEffect(() => {
  const loadData = async () => {
    try {
      const menuData = await loadDataFromAPI('/api/menu');
      setMenuItems(menuData.menuItems);
    } catch (error) {
      console.error('Failed to load menu:', error);
      // 폴백 데이터 사용
    }
  };
  loadData();
}, []);
```

### 로컬스토리지에서 로드

```javascript
import { loadDataFromStorage, saveDataToStorage } from '../utils/dataLoader';

// 로드
const savedData = loadDataFromStorage('menuCache', null);

// 저장
saveDataToStorage('menuCache', menuData);
```

## DB/API 연동 (향후 확장)

### 1. API 엔드포인트 설정

`src/config/apiConfig.js` 파일 생성:

```javascript
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  ENDPOINTS: {
    MENU: '/menu',
    ORDERS: '/orders',
    SETTINGS: '/settings',
  },
  TIMEOUT: 5000,
};
```

### 2. API 서비스 생성

`src/services/apiService.js`:

```javascript
import { API_CONFIG } from '../config/apiConfig';
import { loadDataFromAPI } from '../utils/dataLoader';

export const menuService = {
  async getMenu() {
    return loadDataFromAPI(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MENU}`);
  },
  
  async createOrder(orderData) {
    return loadDataFromAPI(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`,
      {
        method: 'POST',
        body: JSON.stringify(orderData),
      }
    );
  },
};
```

### 3. React Query 사용 (선택사항)

```javascript
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/apiService';

function MenuComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['menu'],
    queryFn: menuService.getMenu,
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <MenuList items={data.menuItems} />;
}
```

## 마이그레이션 가이드

### 단계별 마이그레이션

1. **설정 상수 마이그레이션**
   ```bash
   # 하드코딩된 숫자 찾기
   grep -r "1080\|1920\|500\|300\|60\|4" src/
   
   # 각 파일에서 설정 파일로 교체
   ```

2. **메시지 텍스트 마이그레이션**
   ```bash
   # 하드코딩된 문자열 찾기
   grep -r "작업 안내" src/
   
   # messages.js로 이동
   ```

3. **메뉴 데이터 마이그레이션**
   - 메뉴 데이터는 JSON 파일로 관리 (레거시 `menuUtils.js`는 제거됨, `useMenuUtils` 훅 사용)
   - `loadMenuData()` 함수로 로드

### 체크리스트

- [ ] 모든 하드코딩된 숫자를 `appConfig.js`로 이동
- [ ] 모든 하드코딩된 텍스트를 `messages.js`로 이동
- [ ] 메뉴 데이터를 JSON 파일로 분리
- [ ] 설정 파일 import 경로 통일
- [ ] 타입 안정성 확인 (TypeScript 사용 시)

## 환경 변수 활용

### 개발/프로덕션 설정 분리

`.env.development`:
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_DEBUG=true
```

`.env.production`:
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_DEBUG=false
```

### 설정 파일에서 사용

```javascript
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  DEBUG: process.env.REACT_APP_DEBUG === 'true',
};
```

## 베스트 프랙티스

1. **중앙 집중식 관리**: 모든 설정을 `config/` 디렉토리에서 관리
2. **타입 안정성**: 상수는 객체로 그룹화하여 오타 방지
3. **폴백 제공**: API 실패 시 기본값 제공
4. **환경별 설정**: 개발/프로덕션 환경 분리
5. **문서화**: 각 설정의 용도와 기본값 문서화

## 추가 리소스

- [React 환경 변수](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [JSON 데이터 로딩](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [API 설계 가이드](https://restfulapi.net/)

