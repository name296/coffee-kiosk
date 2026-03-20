# coffee-kiosk

Next.js 15 (App Router) 키오스크 UI.

## 개발

- `bun run dev` — 개발 서버
- `bun run build` — 프로덕션 빌드

## 규칙

- **네이밍·경로·폴더 구조**: [`docs/NAMING.md`](docs/NAMING.md) (Next.js 공식 규칙 기준)
- Cursor: `.cursor/rules/naming.mdc` (항상 적용)

## GitHub Pages (`username.github.io/저장소/`)

- `next.config`에 **`basePath`** + **`trailingSlash: true`** (상대경로 `images/...`가 항상 저장소 URL 기준으로 풀리게).
- `public/` 자산은 코드에서 **`images/foo.png`** 처럼 쓰지 **`/images/foo.png`** 로 쓰지 않기.
