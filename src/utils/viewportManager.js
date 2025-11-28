// ============================================================================
// 뷰포트 관리 유틸리티
// 고정 해상도를 뷰포트에 맞춰 스케일링하는 기능
// ============================================================================

import { SCREEN_CONFIG } from "../config/appConfig";

/**
 * 뷰포트에 맞춰 body를 스케일링하는 함수
 * 고정 해상도를 뷰포트 크기에 맞춰 자동으로 조절
 */
export function setViewportZoom() {
  const { BASE_WIDTH: bodyWidth, BASE_HEIGHT: bodyHeight } = SCREEN_CONFIG;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  
  // 가로 기준 줌 배율
  const zoomByWidth = vw / bodyWidth;
  // 세로 기준 줌 배율
  const zoomByHeight = vh / bodyHeight;
  
  // 둘 중 작은 값을 선택 (뷰포트에 완전히 들어가도록)
  const zoom = Math.min(zoomByWidth, zoomByHeight);
  
  const body = document.body;
  
  if (body) {
    // body에 scale 적용
    body.style.transform = `scale(${zoom})`;
    body.style.transformOrigin = 'top left';
    
    // 스케일 후 실제 크기 계산
    const scaledWidth = bodyWidth * zoom;
    const scaledHeight = bodyHeight * zoom;
    
    // 중앙 정렬을 위한 위치 조정
    const offsetX = (vw - scaledWidth) / 2;
    const offsetY = (vh - scaledHeight) / 2;
    
    body.style.position = 'fixed';
    body.style.top = `${offsetY}px`;
    body.style.left = `${offsetX}px`;
    body.style.width = `${bodyWidth}px`;
    body.style.height = `${bodyHeight}px`;
  }
}

/**
 * 리사이즈 이벤트 핸들러 생성 (간격 없이 즉시 적용)
 * @returns {Function} cleanup 함수
 */
export function setupViewportResize() {
  // 즉시 적용 (debounce 없음)
  const handleResize = () => {
    setViewportZoom();
  };
  
  window.addEventListener("resize", handleResize);
  
  // cleanup 함수 반환
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}

