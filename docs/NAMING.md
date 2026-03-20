# 리소스 네이밍 컨벤션 (Next.js App Router 기준)

이 문서는 **Next.js 15 App Router** 공식 파일·라우팅 규칙을 우선하고, 본 저장소(`src/`, `@/` 별칭) 구조에 맞춘 **엄격한** 규칙을 정의한다.

참고: [Next.js — Project structure and organization](https://nextjs.org/docs/app/building-your-application/routing), [File conventions](https://nextjs.org/docs/app/api-reference/file-conventions).

---

## 1. `src/app/` (라우트·특수 파일)

### 1.1 특수 파일 이름 (변경 금지)

다음은 **프레임워크가 인식하는 예약 파일명**이다. **소문자·정확한 철자**만 허용한다 (`Page.js`, `Layout.tsx` 등 **금지**).

| 파일 | 역할 |
|------|------|
| `page.js` | 해당 세그먼트의 UI |
| `layout.js` | 공통 레이아웃 |
| `loading.js` | 로딩 UI |
| `error.js` | 에러 경계 |
| `not-found.js` | 404 |
| `global-error.js` | 루트 에러 (선택) |
| `template.js` | 레이아웃과 별도 리마운트가 필요할 때 |
| `default.js` | Parallel Routes 기본값 |
| `route.js` | Route Handler (HTTP API) |

메타데이터·이미지 등은 공식 문서의 파일명 규칙을 그대로 따른다 (`opengraph-image`, `icon`, `sitemap` 등).

### 1.2 라우트 세그먼트(폴더) 이름

- **URL에 노출되는 세그먼트**: **소문자**, 단어 구분은 **하이픈(`kebab-case`)** 권장.  
  예: `order-complete`, `receipt-print`
- **URL에 포함하지 않는 그룹**: **Route Group** — 소괄호, 짧은 소문자/케밥 이름.  
  예: `(marketing)`, `(kiosk)`
- **라우트에서 제외할 폴더**: **Private folder** — 접두 `_`.  
  예: `_components`, `_lib` (같은 `app/` 트리 안에서만 사용; 프로젝트 전역 공용은 `src/components`, `src/lib` 우선)

### 1.3 동적·포괄 세그먼트

- 동적: `[id]`, `[slug]`
- Catch-all: `[...slug]`
- Optional catch-all: `[[...slug]]`

대괄호·점 개수는 Next.js 규칙을 **그대로** 따른다.

### 1.4 `app` 안 컴포넌트 배치

- **해당 라우트에만 쓰는 UI**: `app/세그먼트/` 아래에 `page.js`와 **같이 두는 것(colocation)** 을 허용한다.
- **여러 라우트에서 쓰는 UI**: `src/components/` (또는 `src/features/…` 도입 시 해당 기능 폴더).

---

## 2. `src/components/` (React 컴포넌트)

- **파일명**: **PascalCase** + `.js`.  
  예: `ProcessMenu.js`, `ModalTimeout.js`, `Pagination.js` (컴포넌트 파일명)
- **default export 컴포넌트명**: 파일명과 **동일**하게 맞춘다 (`ProcessMenu` ↔ `ProcessMenu.js`).
- **폴더**: 기능/영역별 하위 폴더는 **소문자**·케밥·복수형 등 일관되게 (`modals/`, `processes/`와 동일 선상).  
  현재: `modals/`, `processes/`, `screens/`, `pagination/` (폴더만 소문자; 내부 파일은 여전히 `Pagination.js` 등 PascalCase)
- **index.js**: 해당 폴더의 **공개 API**만 re-export; 내부 전용 파일은 폴더 안에 두고 index에서 선택적으로 노출.

---

## 3. `src/hooks/`

- **파일명**: **`use` + PascalCase** 관례에 맞춰 **camelCase**로 통일.  
  예: `useTimeoutCountdown.js`, `useFocusTrap.js`
- 훅 함수명은 파일명과 동일: `useTimeoutCountdown`.

---

## 4. `src/contexts/`

- **파일명**: **PascalCase** + `Context` 권장.  
  예: `OrderContext.js`, `ModalContext.js`
- Provider 컴포넌트는 파일 내에서 `XxxProvider`로 명명.

---

## 5. `src/lib/` · `src/constants/`

- **유틸·헬퍼·데이터 맵**: **camelCase** 파일명.  
  예: `orderUtils.js`, `format.js`, `storage.js`, `processTts.js` (화면 문구 맵 등 비-UI 로직은 `components/`가 아니라 **`lib/`** 에 둔다)
- **상수 모음**: **camelCase** 또는 **의미 있는 단일 이름** (`constants.js`, `processes.js`).  
  export는 `UPPER_SNAKE` 또는 `as const` 객체 등 한 가지 스타일로 통일.

---

## 6. 스타일 (`*.css`)

- **전역**: `src/app/globals.css` — App Router에서 전역 스타일로 두는 관례에 맞춤.
- **CSS Modules** (도입 시): `ComponentName.module.css` — **PascalCase** 접두 + `.module.css`.

---

## 7. `public/` 정적 자산

- **경로는 URL에 그대로 반영**되므로 **소문자·kebab-case** 권장.  
  예: `images/order-icon.svg`
- Next.js **이미지 최적화** 사용 시 `public` 기준 경로로 참조.

---

## 8. import 경로

- **별칭**: `jsconfig.json` 기준 **`@/` = `src/`** 만 사용한다.  
  예: `import { x } from '@/lib/format'`
- **상대 경로**: 같은 폴더·같은 기능 묶음(`processes/` 내부 `ProcessConfig` → `./ProcessStart` 등)에서만 `./` 허용.  
  **`components/` 루트끼리**, **`components/` ↔ `hooks/`**, **`app/` ↔ `src/`** 등은 **`@/`** 로 통일한다.

---

## 9. 스크립트·설정 (프로젝트 루트)

- `next.config.*`, `jsconfig.json`, `package.json` — 도구가 요구하는 이름 고정.
- `scripts/` 유틸: **kebab-case** 또는 **camelCase** 중 하나로 통일 (현재: `start-full.js`, `svg-to-react.js` 유지 가능).

---

## 10. 요약 체크리스트

| 구분 | 규칙 |
|------|------|
| `app/` 특수 파일 | 소문자 예약명만 (`page.js`, `layout.js`, …) |
| 라우트 폴더 | 소문자, kebab-case 권장 |
| Route group / private | `(name)`, `_name` |
| 컴포넌트 파일 | PascalCase.js |
| 훅 파일 | use로 시작하는 camelCase.js |
| lib / utils | camelCase.js |
| 전역 CSS | `app/globals.css` |
| import | `@/` 별칭 우선 |

새 코드는 위 표를 **우선**하고, 기존 코드와 불일치하면 리팩터링 시 이 문서에 맞춘다.

---

## 11. 이 저장소에 반영된 구조 (참고)

| 항목 | 위치 |
|------|------|
| 통합 아이콘 생성 | `scripts/svg-to-react.js` → `src/components/Icon.js` |
| 화면별 TTS 문구 맵 | `src/lib/processTts.js` (`@/lib/processTts`) |
| 페이지네이션 UI 폴더 | `src/components/pagination/` |
| 파비콘 (public) | `public/favicon.png` → 메타데이터 `icon: '/favicon.png'` |
| 사운드 | `public/sounds/sound-on-pressed.mp3`, `sound-note.wav` |
| 폰트 | `public/fonts/pretendard-gov-semibold.otf` |
