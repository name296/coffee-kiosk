# 레이아웃 디버그

배포(테스트 겸용 프로덕션)에서도 `FocusDebugOverlay`가 동작합니다.  
모드는 **Shift + 단축키**로 켜고 끌 수 있으며, 상태는 **localStorage**에 저장됩니다.

## 단축키

| 단축키 | 모드 | 설명 |
|--------|------|------|
| **Shift+B** | bbox | 상호작용 개체(버튼·입력 등) bounding box |
| **Shift+G** | gap | 개체 간 간격(가로·세로) |
| **Shift+T** | text | 텍스트 라인(잉크 높이·대비) |
| **Shift+F** | focus | 포커스 탐색 순서·TTS 라벨 |
| **Shift+I** | image | 그래픽(이미지·아이콘·SVG 등) bbox |

- **Shift**만 함께 누릅니다. Ctrl / Alt / Meta 와 조합하면 동작하지 않습니다.
- bbox / gap / text / focus / image 는 **동시에** 켤 수 있습니다(각각 독립 토글).

## URL · 리다이렉트

| 경로 | 동작 |
|------|------|
| `/?debug=bbox` | bbox (구 `layout` 도 동일) |
| `/?debug=gap` | gap (기본 표시 상한 32px) |
| `/?debug=gap=48` | gap, 상한 48px 등 |
| `/?debug=text` | text |
| `/?debug=focus` | focus |
| `/?debug=image` | image |
| `/debug/bbox` | `/?debug=bbox` 로 리다이렉트 |
| `/debug/gap` | `/?debug=gap` |
| `/debug/text` | `/?debug=text` |
| `/debug/focus` | `/?debug=focus` |
| `/debug/image` | `/?debug=image` |

쿼리 `?debug=` 는 **한 가지** 값만 지정합니다. bbox 등은 URL과 별도로 localStorage 토글과 겹칠 수 있습니다.

## 라벨 — 바닥 기준 y

1920px 캔버스 **하단(바닥) → 객체 상단** 거리(px)를 라벨 **맨 앞**에 표시합니다. `y:` 접두어는 없습니다.

| 모드 | 라벨 예 | y **초과 시 볼드** |
|------|---------|-------------------|
| bbox | `312, 120×48, s, p` | **640** |
| text | `1216, 52px, 4.521` | **1216** |
| image | `1216, 48×48` | **1216** |

- bbox 우하단: 크기·버튼 지원 상태(`s` selected, `p` press, `d` disabled).
- text: 대비 배경색(합격/실패 등)은 기존과 동일.
- image: 종류별 테두리 색(이미지 / 아이콘 / symbol).

## 구현 위치

- 단축키·리페인트: `src/components/screens/FocusDebugOverlay.js`
- 모드·URL·storage: `src/lib/debugQuery.js`
- y 좌표·볼드 한도: `src/lib/layoutDebugUtils.js` (`DEBUG_Y_BOLD_LIMIT`, `appendDebugYSpan`)

창 크기·scale 변경 시 `coffee-kiosk:viewport-change` 로 오버레이가 다시 그려집니다.
