// basename: BASE_PATH 환경 변수로 명시적으로 설정 (개발/배포 모두 .env에서 관리)
// 빌드 시점에 process.env가 번들러에 의해 값으로 치환됨
export const getBasename = () => {
  // 빌드 시 define으로 주입됨: process.env.BASE_PATH는 실제 값으로 치환됨
  // 예: "/coffee-kiosk" 또는 undefined
  // Bun 번들러가 확실하게 치환할 수 있도록 단순하게 작성
  try {
    return process.env.BASE_PATH || "";
  } catch {
    // 개발 모드에서 process가 undefined인 경우
    return "";
  }
};

// 정적 자원 경로 헬퍼 함수 (BASE_PATH 포함)
export const getAssetPath = (path) => {
  const basePath = getBasename();
  // 이미 절대 경로인 경우 그대로, 상대 경로면 basePath 추가
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // ./public/... → /public/... 정규화
  let normalizedPath = path.replace(/^\.\/public\//, '/public/').replace(/^\.\//, '/');
  
  // /images/, /sound/, /fonts/, /data/ 등은 /public/ 접두사 추가 (빌드 시 public 폴더가 dist/public으로 복사됨)
  if (!normalizedPath.startsWith('/public/')) {
    if (normalizedPath.startsWith('/images/') || 
        normalizedPath.startsWith('/sound/') || 
        normalizedPath.startsWith('/fonts/') ||
        normalizedPath.startsWith('/data/')) {
      normalizedPath = `/public${normalizedPath}`;
    }
  }
  
  return `${basePath}${normalizedPath}`;
};