/* ==============================
  🎮 버튼 이벤트 핸들러 시스템 (27 구조)
  ============================== */

import { updateTimer } from "../assets/timer";

export const ButtonEventHandler = {
  /**
   * 버튼 이벤트 시스템 초기화 (27 구조 - 정확히 동일)
   */
  init() {
    // 윈도우 리사이즈 시 버튼 스타일 재계산 (쓰로틀링)
    let resizeScheduled = false;
    window.addEventListener("resize", () => {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(() => {
        if (window.ButtonStyleGenerator) {
          window.ButtonStyleGenerator.calculateButtonSizes();
        }
        resizeScheduled = false;
      });
    });

    // 클릭 및 사운드 처리 (비프음 재생 및 타이머 업데이트)
    const handleClick = (event) => {
      const target = event.target;
      updateTimer();
      if (
        target.tagName === "BUTTON" ||
        target.getAttribute("role") === "button"
      ) {
        // 마우스 또는 터치로 클릭된 경우만 실행
        if (event.detail !== 0) {
          const beapSound = document.querySelector("#beapSound");
          if (beapSound) {
            beapSound.volume = 0.5;
            beapSound.play();
          }
        }
      }
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("touchend", handleClick);

    // 토글 버튼 클릭 처리
    document.addEventListener('click', (event) => {
      const button = event.target?.closest?.('.button');
      if (!button || button.getAttribute('aria-disabled') === 'true' || 
          button.dataset.isToggleButton !== 'true') return;

      const wasPressed = button.classList.contains('pressed');
      const iconPressed = button.querySelector('.content.icon.pressed');

      if (wasPressed) {
        if (iconPressed) iconPressed.style.display = 'none';
        requestAnimationFrame(() => {
          button.classList.remove('pressed');
          button.setAttribute('aria-pressed', 'false');
          if (iconPressed) iconPressed.style.removeProperty('display');
        });
      } else {
        if (iconPressed) iconPressed.style.removeProperty('display');
        button.classList.add('pressed');
        button.setAttribute('aria-pressed', 'true');
      }
    }, false);

    // 비활성 버튼 이벤트 차단
    const blockDisabledButtonEvents = (event) => {
      const disabledButton = event.target?.closest?.('.button[aria-disabled="true"]');
      if (disabledButton) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        return true;
      }
      return false;
    };
    document.addEventListener('click', blockDisabledButtonEvents, true);

    // 키보드 입력 처리 (비활성 버튼)
    document.addEventListener('keydown', (event) => {
      const disabledButton = event.target?.closest?.('.button[aria-disabled="true"]');
      if (disabledButton && (event.key === ' ' || event.key === 'Enter' || event.key === 'NumpadEnter')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const enabledButton = event.target?.closest?.('.button');
      if (enabledButton && enabledButton.getAttribute('aria-disabled') !== 'true') {
        if (event.key === 'Enter' || event.key === 'NumpadEnter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          
          const isToggleButton = enabledButton.classList.contains('toggle');
          
          if (isToggleButton) {
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              button: 0
            });
            enabledButton.dispatchEvent(clickEvent);
          } else {
            enabledButton.classList.add('pressed');
            setTimeout(() => {
              enabledButton.classList.remove('pressed');
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                button: 0
              });
              enabledButton.dispatchEvent(clickEvent);
            }, 100);
          }
        }
      }
    }, true);

    // 방향키 네비게이션 (초점 이동)
    document.addEventListener('keydown', (event) => {
      const focusedButton = document.activeElement;
      const isArrowKey = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key);
      
      if ((!focusedButton || !focusedButton.classList.contains('button')) && isArrowKey) {
        event.preventDefault();
        const firstButton = document.querySelector('.button');
        if (firstButton) {
          firstButton.focus();
        }
        return;
      }

      if (!focusedButton || !focusedButton.classList.contains('button')) {
        return;
      }

      let targetButton = null;
      const allButtons = Array.from(document.querySelectorAll('.button')).filter(btn => 
        btn.offsetParent !== null
      );

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          const currentIndex = allButtons.indexOf(focusedButton);
          const nextIndex = (currentIndex + 1) % allButtons.length;
          targetButton = allButtons[nextIndex];
          break;
          
        case 'ArrowLeft':
          event.preventDefault();
          const currentIndex2 = allButtons.indexOf(focusedButton);
          const prevIndex = currentIndex2 === 0 ? allButtons.length - 1 : currentIndex2 - 1;
          targetButton = allButtons[prevIndex];
          break;

        case 'ArrowDown':
          event.preventDefault();
          const currentContainer = focusedButton.closest('.showcase');
          const currentIndexForDown = allButtons.indexOf(focusedButton);
          
          for (let i = 1; i < allButtons.length; i++) {
            const nextIndex = (currentIndexForDown + i) % allButtons.length;
            const nextButton = allButtons[nextIndex];
            const nextContainer = nextButton.closest('.showcase');
            
            if (nextContainer !== currentContainer) {
              targetButton = nextButton;
              break;
            }
          }
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          const currentContainerUp = focusedButton.closest('.showcase');
          const currentIndexUp = allButtons.indexOf(focusedButton);
          
          for (let i = 1; i < allButtons.length; i++) {
            const prevIndex = (currentIndexUp - i + allButtons.length) % allButtons.length;
            const prevButton = allButtons[prevIndex];
            const prevContainer = prevButton.closest('.showcase');
            
            if (prevContainer !== currentContainerUp) {
              const buttonsInPrevContainer = allButtons.filter(btn => btn.closest('.showcase') === prevContainer);
              targetButton = buttonsInPrevContainer[0];
              break;
            }
          }
          break;
        
        case 'Home':
          event.preventDefault();
          targetButton = allButtons[0];
          break;
        
        case 'End':
          event.preventDefault();
          targetButton = allButtons[allButtons.length - 1];
          break;
      }

      if (targetButton) {
        targetButton.focus();
      }
    }, true);

    // 마우스 다운 - pressed 상태 추가
    document.addEventListener('mousedown', (event) => {
      const button = event.target?.closest?.('.button');
      if (button && button.getAttribute('aria-disabled') !== 'true' && !button.classList.contains('toggle')) {
        button.classList.add('pressed');
      }
    }, true);

    // 마우스 업 - pressed 상태 제거
    document.addEventListener('mouseup', (event) => {
      const button = event.target?.closest?.('.button');
      if (button && button.classList.contains('pressed') && !button.classList.contains('toggle')) {
        button.classList.remove('pressed');
      }
    }, true);

    // 마우스 영역 벗어남 - pressed 상태 제거
    document.addEventListener('mouseleave', (event) => {
      if (event.target && typeof event.target.closest === 'function') {
        const button = event.target?.closest?.('.button');
        if (button && button.classList.contains('pressed') && !button.classList.contains('toggle')) {
          button.classList.remove('pressed');
        }
      }
    }, true);

    // 터치 시작 - pressed 상태 추가
    document.addEventListener('touchstart', (event) => {
      const button = event.target?.closest?.('.button');
      if (button && button.getAttribute('aria-disabled') !== 'true' && !button.classList.contains('toggle')) {
        button.classList.add('pressed');
      }
    }, { passive: true });

    // 터치 종료 - pressed 상태 제거
    document.addEventListener('touchend', (event) => {
      const button = event.target?.closest?.('.button');
      if (button && button.classList.contains('pressed') && !button.classList.contains('toggle')) {
        button.classList.remove('pressed');
      }
    }, { passive: true });

    // 터치 취소 - pressed 상태 제거
    document.addEventListener('touchcancel', (event) => {
      const button = event.target?.closest?.('.button');
      if (button && button.classList.contains('pressed') && !button.classList.contains('toggle')) {
        button.classList.remove('pressed');
      }
    }, { passive: true });
  }
};

