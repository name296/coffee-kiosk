/**
 * GitHub Pages 프로젝트 사이트(basePath)와 로컬(빈 base) 모두에서 public 자산 URL을 맞춤.
 * 빌드 시 NEXT_PUBLIC_BASE_PATH=/저장소명 형태로 설정 (CI).
 */
const raw = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 선행 슬래시, 후행 슬래시 없음. 예: "/coffee-kiosk" 또는 "" */
export const basePath = raw.replace(/\/$/, "");

/**
 * @param {string} path - "/images/foo.png" 형태
 * @returns {string} basePath가 있으면 "/coffee-kiosk/images/foo.png"
 */
export function publicAsset(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${p}`;
}
