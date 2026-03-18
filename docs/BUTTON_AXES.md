# 버튼 축 (base / skel / skin / state)

## 적용 형태

```
.button.skel-inline.skin-primary.state-pressing
```

| 계층 | 접두 | 예 |
|------|------|-----|
| 베이스 | `.button` | 변수, 포커스 링, 토글 마스크, `state-pressing` 트랜스폼 |
| 스켈레톤 | `.skel-*` | `skel-inline` · `skel-stacked` · `skel-access` |
| 스킨 | `.skin-*` | `skin-primary` · `skin-secondary` · `skin-menu` · `skin-neutral` · `skin-access` · `skin-danger` |
| 상태 | `.state-*` | `state-pressed` · `state-pressing` (+ `toggle` + `aria-pressed`) |

`Button`에 `className`으로 `skel-*` `skin-*`를 넣는다. 생략 시 **`skel-inline` + `skin-neutral`** (`--button2-*`).

### 토큰 층 (App.css `:root` · `.dark`)

1. **프리미티브** — `--color-*`, `--color-system-*` 등
2. **시맨틱(버튼)** — `--button1-*` … `--button6-*`, `--button-delete-*` : 값은 **프리미티브만** 참조 (시맨틱→시맨틱 금지)
3. **스킨** — `.skin-neutral` → `--button2-*`, `.skin-secondary` → `--button4-*` … **시맨틱 토큰만** 참조

- **`skin-neutral`**: `--button2-*` (다크: 눌림 = `gray-09` #BFBFBF 면)
- **`skin-secondary`**: `--button4-*` (다크: 기본 = neutral 눌림과 동일 면)

## `.task-manager` 버튼 스킨

- **1번째** `skin-secondary`, **2번째** `skin-primary`. (3개일 때: 1·secondary → 2·primary → 3·secondary)
- **단일** 버튼은 `skin-secondary` (결제 경고 등 `skin-danger` 예외).
- 토글 행(접근성 설정)은 스킨 규칙 미적용.

## 직교 규칙

- **skel**: 배치·크기·곡률. 배경색/보더색 없음.
- **skin**: 색·보더색. flex/gap 변경 없음.
- **state**: 눌림·프레스 중 등 (토글은 `.toggle.state-pressed::after`).

## 레거시 매핑 (참고)

| 예전 | 현재 className |
|------|----------------|
| button1 | `skel-inline skin-primary` |
| button2 | (기본) `skel-inline skin-neutral` |
| button3 | `skel-stacked skin-menu` |
| button4 | `skel-inline skin-secondary` |
| button6 | `skel-access skin-access` |
| warning | `skel-inline skin-danger` |
