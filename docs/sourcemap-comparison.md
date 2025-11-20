# 소스맵 비교: inline vs external

## 개요

소스맵은 압축/변환된 코드를 원본 코드로 매핑해 디버깅을 돕는 파일입니다.

## inline (인라인)

### 특징
- 소스맵이 JavaScript 파일 **안에** 포함됨
- 별도 파일 생성 안 함
- Base64로 인코딩되어 파일 끝에 추가됨

### 예시

**생성되는 파일:**
```
dist/index.js (예: 100KB)
├─ 압축된 코드 (50KB)
└─ //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbXSwibWFwcGluZ3MiOiIifQ== (50KB)
```

### 장점
- ✅ **디버깅 빠름**: 별도 파일 요청 불필요
- ✅ **설정 간단**: 파일 하나만 관리
- ✅ **개발 환경에 적합**: 빠른 피드백

### 단점
- ❌ **파일 크기 증가**: 소스맵이 코드에 포함됨
- ❌ **원본 코드 노출**: Base64 디코딩 가능
- ❌ **배포에 부적합**: 불필요한 크기 증가

## external (외부)

### 특징
- 소스맵이 **별도 파일**로 분리됨
- `.map` 확장자 파일 생성
- JavaScript 파일에 소스맵 경로만 참조

### 예시

**생성되는 파일:**
```
dist/
├─ index.js (예: 50KB)
│  └─ //# sourceMappingURL=index.js.map
└─ index.js.map (예: 200KB)
   └─ 원본 코드 매핑 정보
```

### 장점
- ✅ **파일 크기 작음**: 배포 파일만 작음
- ✅ **원본 코드 보호**: `.map` 파일 배포 안 하면 숨김
- ✅ **배포에 적합**: 프로덕션 환경에 최적화

### 단점
- ❌ **디버깅 느림**: 별도 파일 요청 필요
- ❌ **파일 관리 복잡**: 두 파일 관리 필요
- ❌ **개발 환경에 불편**: 추가 요청으로 느림

## 비교표

| 항목 | inline | external |
|------|--------|----------|
| **파일 수** | 1개 | 2개 |
| **배포 파일 크기** | 큼 (소스맵 포함) | 작음 (소스맵 제외) |
| **디버깅 속도** | 빠름 | 느림 (추가 요청) |
| **원본 코드 노출** | 노출됨 | 숨길 수 있음 |
| **개발 환경** | ✅ 적합 | ❌ 불편 |
| **배포 환경** | ❌ 부적합 | ✅ 적합 |

## 실제 사용 예시

### 개발 환경 (inline 권장)

```javascript
// config.js
buildOptions: {
  sourcemap: "inline"  // 빠른 디버깅
}
```

**결과:**
- `dist/index.js` (100KB) - 소스맵 포함
- 브라우저에서 즉시 원본 코드 확인 가능
- 디버깅 빠름

### 배포 환경 (external 권장)

```javascript
// config.js
buildOptions: {
  sourcemap: "external"  // 작은 파일 크기
}
```

**결과:**
- `dist/index.js` (50KB) - 압축된 코드만
- `dist/index.js.map` (200KB) - 소스맵 (선택적 배포)
- 배포 파일 크기 작음

## 권장 설정

### 개발 서버 (`bun dev`)
```javascript
sourcemap: "inline"  // 빠른 디버깅
```

### 배포 빌드 (`bun run build`)
```javascript
sourcemap: "external"  // 작은 파일 크기
```

## 참고

- **소스맵 없이 배포**: `.map` 파일을 배포하지 않으면 원본 코드 숨김 가능
- **GitHub Pages**: `.map` 파일도 함께 배포하면 디버깅 가능
- **프로덕션 디버깅**: 필요시 `.map` 파일만 추가 배포 가능

