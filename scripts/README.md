# Scripts

## 📁 포함된 스크립트

### update-icons.js
아이콘 인덱스 자동 생성 스크립트

**기능:**
- `src/assets/icons/` 디렉토리의 모든 `.svg` 파일 스캔
- `src/assets/icons/index.js` 자동 생성
- 메타데이터 포함 (개수, 일시, 목록)

**사용법:**
```bash
bun run update-icons
# 또는
bun run scripts/update-icons.js
```

**언제 실행하나요?**
- 새 아이콘 추가 시
- 아이콘 삭제 시
- 아이콘 이름 변경 시

**자동 실행:**
- 개발 서버 실행 중 아이콘 파일 변경 시 자동 실행됨 (`server.js`에서 감시)

**출력:**
- `src/assets/icons/index.js` (자동 생성/갱신)

**주의사항:**
- `src/assets/icons/index.js`를 직접 수정하지 마세요 (자동 생성됨)
- Git commit 전에 실행하여 최신 상태 유지