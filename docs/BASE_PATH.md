# BASE_PATH 자동 설정 가이드

## 개요

BASE_PATH는 GitHub Pages 배포 시 필요한 라우팅 경로입니다. 리포지토리 이름을 기반으로 자동으로 설정됩니다.

## GitHub Actions 워크플로우

### 빌드 전 BASE_PATH 환경 변수 자동 설정

- `${{ github.event.repository.name }}`로 리포지토리 이름 자동 감지
- `bun run build` 실행 시 `set-base-path.js`도 함께 실행

### 동작 방식

**GitHub Actions에서:**

```yaml
- name: Build with BASE_PATH
  env:
    BASE_PATH: /${{ github.event.repository.name }}  # /27 또는 /coffee-kiosk
    NODE_ENV: production
  run: bun run build
```

**로컬 빌드에서:**

```bash
bun run build
# → set-base-path.js가 Git 리포지토리 이름을 자동 감지
# → BASE_PATH 환경 변수 설정
# → 빌드 실행
```

## 결과

- **GitHub Actions**: 리포지토리 이름을 자동으로 감지해 BASE_PATH 설정
- **로컬 빌드**: `set-base-path.js`가 Git 정보를 읽어 자동 설정
- **수동 설정**: `.env` 파일에 `BASE_PATH`를 명시하면 우선 사용

## 사용 방법

### 자동 설정 (권장)

리포지토리 이름이 자동으로 감지되어 BASE_PATH가 설정됩니다.

```bash
# GitHub Actions에서 자동으로 /coffee-kiosk로 설정
bun run build
```

### 수동 설정

`.env` 파일에 명시적으로 설정할 수 있습니다:

```bash
# .env
BASE_PATH=/custom-path
```

## 우선순위

1. **환경 변수** (`.env` 파일 또는 GitHub Actions에서 설정)
2. **자동 감지** (`set-base-path.js`가 Git 리포지토리 이름 감지)
3. **기본값** (빈 문자열)

## 참고

- 개발 환경에서는 기본적으로 빈 문자열(`""`)을 사용합니다.
- 프로덕션 환경에서는 리포지토리 이름을 기반으로 자동 설정됩니다.
- GitHub Pages 배포 시 올바른 경로로 자동 설정되어 라우팅이 정상 작동합니다.

