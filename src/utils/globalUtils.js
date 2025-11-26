// ============================================================================
// 전역 유틸리티 설정
// window 객체에 유틸리티를 노출하여 전역 접근 가능하도록 설정
// ============================================================================

import { ButtonStyleGenerator } from "./buttonStyleGenerator";
import { SizeControlManager } from "./sizeControlManager";

/**
 * 전역 유틸리티를 window 객체에 등록
 * Footer 등 비-React 영역에서도 접근 가능하도록 함
 */
export function setupGlobalUtils() {
  window.ButtonStyleGenerator = ButtonStyleGenerator;
  window.SizeControlManager = SizeControlManager;
  window.BUTTON_CONSTANTS = ButtonStyleGenerator.CONSTANTS;
}

