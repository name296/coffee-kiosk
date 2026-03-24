# 빠른 체험
name296.github.io/coffee-kiosk

# coffee-kiosk

Next.js 15(App Router) 기반 키오스크 UI 프로젝트입니다.  
키패드 중심 조작(방향키/숫자키)과 TTS 안내를 통해 접근성을 강화한 주문 플로우를 제공합니다.

## 프로젝트 목적

- 터치 없이도 키패드만으로 주문 가능
- 화면/섹션 이동 시 일관된 포커스 네비게이션 제공
- 문맥 기반 TTS(섹션, 버튼, 상태 안내) 제공
- 주문/탭/페이지 이동 등 사용자 반응에 대한 실행취소(Undo) 지원

## 기술 스택

- Next.js 15 (App Router)
- React
- Bun
- CSS Layers (`reset`, `root`, `layout`, `components`, `utilities`)

## 빠른 시작

```bash
bun start
```

- 개발 서버: `http://localhost:3000`
- 빌드: `bun run build`
- 프로덕션 실행: `bun run start`

## 디렉터리 구조

- `src/app` - 앱 엔트리 및 전역 스타일(`globals.css`)
- `src/components` - 화면/위젯/모달 UI 컴포넌트
  - `processes` - 단계별 프로세스 화면
  - `modals` - 공통/기능 모달
  - `screens` - 초기화/포커스/인젝터 실행 컴포넌트
- `src/contexts` - 전역 상태(Context)
  - 주문, 라우트, 모달, TTS, 히스토리 등
- `src/hooks` - 포커스, TTS, 핫키, 페이지 슬라이싱 등 로직
- `src/constants` - 프로세스 흐름/상수
- `src/lib` - 포맷/유틸 함수
- `docs/NAMING.md` - 네이밍/경로 규칙

## 키패드 키맵(현재 기준)

- `↑/↓/←/→` - 포커스 이동
- `Enter` / `NumpadEnter` / `Numpad5` - 현재 포커스 실행
- `*` - 키패드 사용법 TTS 재생
- `#` - 현재 포커스(또는 상위 포커서블 부모) 문맥 TTS 재생
- `0` / `Numpad0` - 실행취소(Undo)
  - 모달 열림 시: 최상단 모달 닫기
  - 그 외: 통합 히스토리 기준 실행취소
  - 프로세스 단계 후진은 `0`으로 수행하지 않음
- `Backspace` - 작업 단계 뒤로 이동
  - 결제 완료 이후 단계에서는 뒤로 이동 불가 안내 TTS 재생
- `Home` - 처음으로(재시작) 모달
- `H` - 호출 모달

## 핵심 동작 메모

- 포커스 이동은 섹션/부모 단위 탐색을 우선합니다.
- 버튼 카운트 TTS는 `ButtonCountInjector`에서 자동 주입됩니다.
- 통합 히스토리는 `HistoryContext`에서 관리되며, `0` 키 Undo에서 사용됩니다.
- 결제 완료 이후에는 환불 정책상 임의 단계 후진을 제한합니다.

## 운영 규칙

- 네이밍/경로/파일 규칙: [`docs/NAMING.md`](docs/NAMING.md)
- 자산 경로는 `images/...` 형태 사용 (`/images/...` 지양)

## 배포 참고 (GitHub Pages)

- `next.config.mjs`의 `basePath` + `trailingSlash: true`를 사용합니다.
  - 이건 **GitHub Pages 같은 “서브 경로 배포”**에서 깨지지 않게 하는 Next.js 설정입니다.
  - basePath
      앱이 /가 아니라 /coffee-kiosk 같은 경로 아래서 동작하도록 기준 경로를 붙입니다.
      예: 실제 URL이 https://username.github.io/coffee-kiosk/
  - trailingSlash: true
      URL 끝에 /를 붙여서 정적 호스팅과 경로 해석을 안정화합니다.
      예: /menu 대신 /menu/
  -왜 필요하냐면:
      GitHub Pages는 보통 저장소명 하위 경로로 서비스돼서,
      이 설정이 없으면 JS/CSS/이미지 경로가 루트(/) 기준으로 풀려 404가 나기 쉽습니다.
- 정적 자산 참조는 루트 절대경로보다 상대(`images/...`)를 권장합니다.
