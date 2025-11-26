# 버튼 어트리뷰트 및 스키마 문서

## 📋 개요
프로젝트 전체에서 사용되는 버튼 요소의 어트리뷰트와 스키마를 정리한 문서입니다.

---

## 🔘 Button 컴포넌트 스키마

### Props
```typescript
{
  styleClass?: string;        // 추가 클래스 (palette, size 등)
  icon?: ReactNode;           // 아이콘 컴포넌트
  label?: string;             // 버튼 텍스트
  onPressed?: Function;       // 통합 입력 핸들러 (클릭, 터치, 키보드 모두 처리)
  onKeyDown?: Function;       // 키다운 핸들러 (선택적, 키보드 네비게이션 등)
  ttsText?: string;          // TTS 음성 안내 텍스트 (data-tts-text에 설정됨)
  disabled?: boolean;        // 비활성 상태 (기본값: false)
  style?: object;            // 인라인 스타일
  children?: ReactNode;      // 자식 요소
  ...rest                     // 기타 HTML button 속성
}
```

### 생성되는 DOM 구조
```html
<button
  className="button {styleClass}"
  data-tts-text="{ttsText}"
  onClick={handlePressed}
  onTouchEnd={handlePressed}
  onKeyDown={handleKeyDown}
  disabled={disabled}
  aria-disabled={disabled}
  style={style}
  {...rest}
>
  <div className="background dynamic">
    {icon && (
      <span className="content icon" aria-hidden="true">
        {icon}
      </span>
    )}
    {label && (
      <span className="content label">{label}</span>
    )}
    {children}
  </div>
</button>
```

---

## 🏷️ 일반 button 태그 스키마

### 필수 어트리뷰트
```html
<button
  className="button {추가클래스}"
  data-tts-text="TTS 텍스트"
  aria-disabled="true|false"  // 비활성 상태 (선택적)
  aria-pressed="true|false"   // 토글 버튼 상태 (선택적)
  onClick={핸들러}
  onKeyDown={핸들러}
>
  <div className="background dynamic">
    <span className="content icon" aria-hidden="true">
      {/* 아이콘 */}
    </span>
    <span className="content label">
      {/* 라벨 텍스트 */}
    </span>
  </div>
</button>
```

---

## 📊 어트리뷰트 상세

### 1. `data-tts-text`
- **용도**: TTS(Text-to-Speech) 음성 안내 텍스트
- **형식**: 문자열
- **예시**: 
  - `"포장하기"`
  - `"먹고가기"`
  - `"취소,"`
  - `"주문하기,  ${isDisabledBtn ? "비활성" : ""}"`
  - `"주스, ${selectedTab === "주스" ? "선택됨, " : "선택가능, "}"`
- **처리**: `useMultiModalButtonHandler`의 전역 핸들러가 자동으로 읽어서 TTS 재생
- **폴백**: 없으면 `"실행, "` 사용

### 2. `aria-disabled`
- **용도**: 접근성을 위한 비활성 상태 표시
- **형식**: `"true"` | `"false"`
- **사용처**: 
  - Button 컴포넌트: `disabled` prop과 동기화
  - 일반 button: `aria-disabled={item.id === DISABLED_MENU_ID}`
- **CSS 선택자**: `[aria-disabled="true"]`

### 3. `aria-pressed`
- **용도**: 토글 버튼의 선택 상태 표시
- **형식**: `"true"` | `"false"`
- **사용처**: 토글 버튼 (`.button.toggle`)
- **관리**: `toggleButtonPressedState` 함수로 동적 설정

### 4. `aria-hidden`
- **용도**: 아이콘을 스크린 리더에서 숨김
- **형식**: `"true"`
- **사용처**: `<span className="content icon" aria-hidden="true">`

### 5. `className` 패턴

#### 기본 클래스
- `button` (필수)

#### 상태 클래스
- `pressed` - 눌린 상태 (토글 버튼)
- `disabled` - 비활성 상태
- `toggle` - 토글 버튼

#### 기능별 클래스
- `start` - 시작 버튼
- `summary-btn` - 요약 버튼
- `qty-btn` - 수량 버튼
- `delete-btn` - 삭제 버튼
- `pay` - 결제 버튼
- `no` - 취소 버튼
- `return-btn-cancel` - 모달 취소 버튼
- `return-btn-confirm` - 모달 확인 버튼
- `forth-main-btn2` - 결제 페이지 메인 버튼
- `forth-main-two-btn1` - 결제 페이지 두 버튼 중 첫 번째
- `forth-main-two-btn2` - 결제 페이지 두 버튼 중 두 번째
- `down-footer-button` - 하단 푸터 버튼
- `btn-home` - 홈 버튼
- `btn-confirm` - 확인 버튼
- `tab-pagination` - 탭 페이지네이션 버튼
- `tab-button-prev` - 탭 이전 버튼
- `menu-item` - 메뉴 아이템 버튼
- `accessibility-down-content-div-btn` - 접근성 설정 버튼
- `accessibility-down-content-div-btn1` - 접근성 설정 버튼 1
- `accessibility-down-content-div-btn2` - 접근성 설정 버튼 2
- `accessibility-btn-cancel` - 접근성 취소 버튼
- `accessibility-btn-confirm` - 접근성 확인 버튼

#### 팔레트 클래스
- `primary1`, `primary2`, `primary3`
- `secondary1`, `secondary2`, `secondary3`
- `custom`

---

## 🎯 버튼 타입별 스키마

### 1. 일반 버튼
```html
<button 
  className="button {기능클래스}"
  data-tts-text="버튼명,"
  onClick={핸들러}
>
  <div className="background dynamic">
    <span className="content label">버튼명</span>
  </div>
</button>
```

### 2. 아이콘 버튼
```html
<button 
  className="button {기능클래스}"
  data-tts-text="버튼명,"
  onClick={핸들러}
>
  <div className="background dynamic">
    <span className="content icon" aria-hidden="true">
      <IconComponent />
    </span>
    <span className="content label">버튼명</span>
  </div>
</button>
```

### 3. 토글 버튼
```html
<button 
  className="button toggle {selectedTab === "값" ? "pressed" : ""}"
  data-tts-text="값, ${selectedTab === "값" ? "선택됨, " : "선택가능, "}"
  aria-pressed={selectedTab === "값" ? "true" : "false"}
  onClick={핸들러}
>
  <div className="background dynamic">
    <span className="content icon pressed" aria-hidden="true">
      {/* 토글 아이콘 (동적 삽입) */}
    </span>
    <span className="content label">값</span>
  </div>
</button>
```

### 4. 비활성 버튼
```html
<button 
  className="button {기능클래스} disabled"
  data-tts-text="버튼명, 비활성,"
  aria-disabled="true"
  onClick={핸들러}
>
  <div className="background dynamic">
    <span className="content label">버튼명</span>
  </div>
</button>
```

---

## 🔍 상태 관리

### Pressed 상태
- **클래스**: `.pressed`
- **어트리뷰트**: `aria-pressed="true"`
- **아이콘**: `.content.icon.pressed` (토글 버튼만)
- **관리 함수**: `toggleButtonPressedState(button, wasPressed, iconPressed)`

### Disabled 상태
- **클래스**: `.disabled` 또는 없음
- **어트리뷰트**: `aria-disabled="true"`
- **HTML 속성**: `disabled={true}` (Button 컴포넌트)
- **확인 함수**: `isButtonDisabled(button)`

### Toggle 상태
- **클래스**: `.toggle`
- **확인 함수**: `isToggleButton(button)`
- **그룹 관리**: `clearOtherButtonsInGroup(button, group)`

---

## 📝 TTS 텍스트 패턴

### 기본 패턴
```
"{버튼명},"
```

### 상태 포함 패턴
```
"{버튼명}, ${조건 ? "상태1, " : "상태2, "}"
```

### 예시
- `"포장하기"` - 단순 버튼명
- `"주스, ${selectedTab === "주스" ? "선택됨, " : "선택가능, "}"` - 상태 포함
- `"주문하기,  ${isDisabledBtn ? "비활성" : ""}"` - 비활성 상태 포함
- `"취소,"` - 쉼표 포함
- `"작업관리, 버튼 두 개,"` - 섹션 안내

---

## 🎨 팔레트 시스템

### 팔레트 종류
1. **primary1** - 기본 팔레트 (Brown 계열)
2. **primary2** - 보조 팔레트 (Gray 계열)
3. **primary3** - 중첩 배경 팔레트
4. **secondary1** - 보조 팔레트 1
5. **secondary2** - 보조 팔레트 2
6. **secondary3** - 보조 팔레트 3
7. **custom** - 커스텀 팔레트

### 상태별 CSS 변수
```css
--{palette}-background-color-{state}
--{palette}-border-color-{state}
--{palette}-content-color-{state}
```

**state 값**: `default`, `pressed`, `disabled`

---

## 🔧 유틸리티 함수

### `getButtonTTS(button, prefixOpt)`
- 버튼의 `data-tts-text` 값을 가져옴
- prefix가 있으면 앞에 추가
- 없으면 `"실행, "` 반환

### `toggleButtonPressedState(button, wasPressed, iconPressed)`
- 버튼의 pressed 상태 토글
- `aria-pressed` 어트리뷰트 업데이트
- 토글 아이콘 표시/숨김

### `isButtonDisabled(button)`
- `aria-disabled="true"` 확인

### `isToggleButton(button)`
- `.toggle` 클래스 확인

### `clearOtherButtonsInGroup(button, group)`
- 같은 그룹 내 다른 토글 버튼의 pressed 상태 제거

---

## 📌 주의사항

1. **Button 컴포넌트 사용 시**:
   - `ttsText` prop 사용 (자동으로 `data-tts-text` 설정)
   - `disabled` prop 사용 (자동으로 `aria-disabled` 설정)
   - `onPressed` prop 사용 (클릭, 터치, 키보드 통합 처리)

2. **일반 button 태그 사용 시**:
   - `data-tts-text` 직접 설정 필수
   - `aria-disabled` 직접 설정 (비활성 시)
   - `aria-pressed` 직접 설정 (토글 버튼 시)
   - DOM 구조 일치 필요 (`<div className="background dynamic">`)

3. **토글 버튼**:
   - `.toggle` 클래스 필수
   - `.pressed` 클래스로 상태 표시
   - `aria-pressed` 어트리뷰트 동기화 필수
   - 그룹 내 다른 버튼과 상호 배타적

4. **TTS 텍스트**:
   - 항상 쉼표(`,`)로 끝나는 것이 권장됨
   - 상태 정보 포함 시 조건부 텍스트 사용
   - 전역 핸들러가 자동으로 처리하므로 하드코딩 불필요

---

## 🔄 마이그레이션 가이드

### Button 컴포넌트로 전환
```jsx
// Before (일반 button)
<button 
  className="button start"
  data-tts-text="포장하기"
  onClick={handleClick}
>
  <div className="background dynamic">
    <span className="content label">포장하기</span>
  </div>
</button>

// After (Button 컴포넌트)
<Button
  styleClass="button start"
  ttsText="포장하기"
  label="포장하기"
  onPressed={handleClick}
/>
```

---

## 📚 참고 파일
- `src/components/Button.js` - Button 컴포넌트
- `src/hooks/useButtonUtils.js` - 버튼 유틸리티 함수
- `src/hooks/useMultiModalButtonHandler.js` - 전역 버튼 핸들러
- `src/utils/paletteManager.js` - 팔레트 관리
- `src/utils/toggleButtonManager.js` - 토글 버튼 관리

