# Scripts

## 📁 포함된 스크립트

### update-icons.ps1
아이콘 인덱스 자동 생성 스크립트

**기능:**
- `src/assets/icons/` 디렉토리의 모든 `.svg` 파일 스캔
- `src/assets/icons/index.js` 자동 생성
- 메타데이터 포함 (개수, 일시, 목록)

**사용법:**
```powershell
.\scripts\update-icons.ps1
```

**언제 실행하나요?**
- 새 아이콘 추가 시
- 아이콘 삭제 시
- 아이콘 이름 변경 시

**출력:**
- `src/assets/icons/index.js` (자동 생성/갱신)

**주의사항:**
- `svg/icon/index.js`를 직접 수정하지 마세요 (자동 생성됨)
- Git commit 전에 실행하여 최신 상태 유지

## 🔄 Git Hook (선택사항)

아이콘 변경 시 자동 실행하려면:

**.git/hooks/pre-commit** (생성)
```bash
#!/bin/sh
# 아이콘이 변경되었는지 확인
if git diff --cached --name-only | grep -q "^src/assets/icons/.*\.svg$"; then
  echo "🔄 아이콘 변경 감지, index.js 갱신 중..."
  powershell.exe -File ./scripts/update-icons.ps1
  git add src/assets/icons/index.js
fi
```

## 📦 Node.js 버전 (선택사항)

Node.js가 설치되어 있다면:

**scripts/update-icons.js** 사용
```bash
npm run update-icons
```