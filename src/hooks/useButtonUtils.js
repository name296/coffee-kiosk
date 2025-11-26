// ============================================================================
// 버튼 유틸리티 커스텀 훅
// ============================================================================

import { useCallback, useRef } from "react";

/**
 * 버튼 관련 공통 기능을 제공하는 커스텀 훅
 */
export const useButtonUtils = () => {
  const BEEP_SOUND_VOLUME = 0.5;

  /**
   * 비프음 재생
   */
  const playBeepSound = useCallback(() => {
    const beapSound = document.querySelector("#beapSound");
    if (beapSound) {
      beapSound.volume = BEEP_SOUND_VOLUME;
      beapSound.play();
    }
  }, []);

  /**
   * 버튼의 pressed 상태를 토글하고 포커스를 유지
   */
  const toggleButtonPressedState = useCallback(
    (button, wasPressed, iconPressed) => {
      if (wasPressed) {
        // pressed 상태 해제
        if (iconPressed) iconPressed.style.display = "none";
        button.classList.remove("pressed");
        button.setAttribute("aria-pressed", "false");
        requestAnimationFrame(() => {
          if (iconPressed) iconPressed.style.removeProperty("display");
          if (button instanceof HTMLElement) {
            button.focus();
          }
        });
      } else {
        // pressed 상태 설정 (동기적으로 먼저 설정)
        button.classList.add("pressed");
        button.setAttribute("aria-pressed", "true");
        if (iconPressed) iconPressed.style.removeProperty("display");
        // 포커스는 requestAnimationFrame으로 처리
        requestAnimationFrame(() => {
          if (button instanceof HTMLElement) {
            button.focus();
          }
        });
      }
    },
    []
  );

  /**
   * 버튼의 TTS 텍스트 가져오기 (data-tts-text만 확인)
   */
  const getButtonTTS = useCallback((button, prefixOpt) => {
    const ttsText = button?.dataset.ttsText;

    if (ttsText) {
      return prefixOpt ? `${prefixOpt}${ttsText}` : ttsText;
    }

    return "실행, ";
  }, []);

  /**
   * 같은 그룹 내 다른 버튼의 pressed 상태 제거
   */
  const clearOtherButtonsInGroup = useCallback((button, group) => {
    group.querySelectorAll(".button.toggle").forEach((btn) => {
      if (btn !== button && btn.classList.contains("pressed")) {
        const otherIconPressed = btn.querySelector(".content.icon.pressed");
        if (otherIconPressed) {
          otherIconPressed.style.display = "none";
        }
        btn.classList.remove("pressed");
        btn.setAttribute("aria-pressed", "false");
        requestAnimationFrame(() => {
          if (otherIconPressed) {
            otherIconPressed.style.removeProperty("display");
          }
        });
      }
    });
  }, []);

  /**
   * 버튼이 비활성화되어 있는지 확인
   */
  const isButtonDisabled = useCallback((button) => {
    if (!button) return true;
    return button.getAttribute("aria-disabled") === "true";
  }, []);

  /**
   * 버튼이 토글 버튼인지 확인
   */
  const isToggleButton = useCallback((button) => {
    return button.classList.contains("toggle");
  }, []);

  /**
   * 포커스 가능한 버튼 배열 생성 및 정렬
   */
  const getFocusableButtons = useCallback(() => {
    return Array.from(document.querySelectorAll(".button"))
      .filter((btn) => {
        if (btn.offsetParent === null) return false;
        if (isButtonDisabled(btn)) return false;
        return true;
      })
      .sort((a, b) => {
        const aTabIndex = a.tabIndex;
        const bTabIndex = b.tabIndex;

        if (aTabIndex > 0 && bTabIndex > 0) {
          return aTabIndex - bTabIndex;
        }
        if (aTabIndex > 0) return -1;
        if (bTabIndex > 0) return 1;

        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
  }, [isButtonDisabled]);

  return {
    playBeepSound,
    toggleButtonPressedState,
    getButtonTTS,
    clearOtherButtonsInGroup,
    isButtonDisabled,
    isToggleButton,
    getFocusableButtons,
  };
};

