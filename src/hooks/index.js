// ============================================================================
// 커스텀 훅 모음
// ============================================================================

export { useBodyClass } from "./useBodyClass";
export { useLocalStorage } from "./useLocalStorage";
export { useDebounce } from "./useDebounce";
export { usePrevious } from "./usePrevious";
export { usePagination } from "./usePagination";
export { usePageTTS, useActiveElementTTS } from "./usePageTTS";
export { useSafeDocument } from "./useSafeDocument";
export { useButtonTTS, useMultiModalButtonHandler } from "./useButtonStyleSystem";
export { useTimer } from "./useSingletonTimer";
export { useMenuUtils } from "./useMenuUtils";
// tabs, totalMenuItems는 useMenuData 훅에서 동적으로 제공됨
export { useTextHandler } from "./useTTS";
export { useReactMount } from "./useReactMount";
export { useMenuData } from "./useMenuData";
export { useCategoryLayout } from "./useCategoryLayout";
export { usePaymentCountdown } from "./usePaymentCountdown";
export { useWebViewMessage } from "./useWebViewMessage";
export { useOrderNumber } from "./useOrderNumber";
export { usePageScript } from "./usePageScript";
export { useIdleTimeout, useAppIdleTimeout } from "./useIdleTimeout";
export { useFocusTrap } from "./useFocusTrap";
export { useSound } from "./useSound";

// 버튼 스타일 시스템 (통합 훅)
export { 
  useButtonStyleSystem,
  BUTTON_CONSTANTS,
  applyButtonDynamicStyles
} from "./useButtonStyleSystem";

export { 
  useAccessibilitySettings, 
  VOLUME_MAP, 
  VOLUME_VALUES,
  DEFAULT_ACCESSIBILITY 
} from "./useAccessibilitySettings";

