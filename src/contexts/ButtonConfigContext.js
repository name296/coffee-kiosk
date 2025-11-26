// ============================================================================
// 버튼 설정 Context
// JSON 파일에서 버튼 설정을 로드하여 전역으로 제공
// ============================================================================

import { createJsonContext } from "./jsonContextMaker";

/**
 * 버튼 설정 Context 생성
 * /button_config.json 파일을 자동으로 로드하여 Context로 제공
 */
export const {
  Context: ButtonConfigContext,
  Provider: ButtonConfigProvider,
  useHook: useButtonConfig,
} = createJsonContext('/button_config.json', 'ButtonConfig', { buttons: {} });

