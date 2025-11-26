// ============================================================================
// 토글 버튼 관리자
// 토글 버튼의 아이콘 삽입 및 상태 관리를 담당
// ============================================================================

import { ToggleIcon } from '../components/icons';

// ============================================================================
// 토글 버튼 관리자 클래스
// ============================================================================

export class ToggleButtonManager {
  /**
   * 훅 인스턴스 저장
   */
  _mountComponent = null;

  /**
   * 초기화
   * @param {Function} mountComponent - React 컴포넌트 마운트 함수
   */
  init(mountComponent) {
    if (!mountComponent) {
      console.warn('⚠️ [ToggleButtonManager] mountComponent is not provided');
      return;
    }
    this._mountComponent = mountComponent;
    console.log('✅ [ToggleButtonManager] Initialized');
  }

  /**
   * ToggleIcon을 마운트하는 헬퍼 함수
   * @param {HTMLElement} iconPressedSpan - 아이콘을 마운트할 span 요소
   * @param {HTMLElement} button - 버튼 요소 (로깅용)
   * @returns {boolean} 마운트 성공 여부
   */
  mountToggleIcon(iconPressedSpan, button) {
    if (!this._mountComponent) {
      console.warn('⚠️ [mountToggleIcon] mountComponent is not initialized');
      return false;
    }

    if (iconPressedSpan._reactMounted) {
      console.log('ℹ️ [mountToggleIcon] Already mounted, skipping:', button);
      return true;
    }
    
    try {
      console.log('🔧 [mountToggleIcon] Attempting to mount ToggleIcon to:', iconPressedSpan);
      const mountResult = this._mountComponent(ToggleIcon, iconPressedSpan);
      
      if (mountResult && mountResult.root) {
        iconPressedSpan._reactMounted = true;
        console.log('✅ [mountToggleIcon] ToggleIcon mounted successfully for button:', button);
        return true;
      } else {
        console.warn('⚠️ [mountToggleIcon] mountComponent returned null or no root for button:', button);
        return false;
      }
    } catch (error) {
      console.error('❌ [mountToggleIcon] Failed to mount ToggleIcon:', error);
      console.error('Error stack:', error.stack);
      return false;
    }
  }

  /**
   * toggle 버튼에 체크 심볼 자동 주입
   * React 컴포넌트를 사용하여 아이콘을 마운트
   * @returns {number} 처리된 토글 버튼 개수
   */
  setupIconInjection() {
    if (!this._mountComponent) {
      console.warn('⚠️ [setupIconInjection] ToggleButtonManager is not initialized');
      return 0;
    }

    const allButtons = document.querySelectorAll('.button.toggle');
    if (allButtons.length === 0) {
      console.log('ℹ️ [setupIconInjection] No toggle buttons found');
      return 0;
    }
    
    console.log(`🔍 [setupIconInjection] Found ${allButtons.length} toggle buttons`);
    
    let processedCount = 0;

    for (const button of allButtons) {
      const background = button.querySelector('.background.dynamic') || button.querySelector('.background');
      if (!background) {
        console.warn('⚠️ [setupIconInjection] No background found for button:', button);
        continue;
      }
      
      // .content.icon.pressed가 없으면 생성
      let iconPressedSpan = background.querySelector('.content.icon.pressed');
      
      if (!iconPressedSpan) {
        iconPressedSpan = document.createElement('span');
        iconPressedSpan.className = 'content icon pressed';
        iconPressedSpan.setAttribute('aria-hidden', 'true');
        
        // 기존 아이콘 앞에 삽입
        const iconEl = background.querySelector('.content.icon:not(.pressed)');
        if (iconEl && iconEl.parentNode) {
          background.insertBefore(iconPressedSpan, iconEl);
        } else {
          // label 앞에 삽입
          const labelEl = background.querySelector('.content.label');
          if (labelEl && labelEl.parentNode) {
            background.insertBefore(iconPressedSpan, labelEl);
          } else {
            background.insertBefore(iconPressedSpan, background.firstChild);
          }
        }
      }
      
      // React 컴포넌트로 ToggleIcon 마운트
      if (!iconPressedSpan._reactMounted) {
        // DOM에 삽입된 후 마운트
        requestAnimationFrame(() => {
          try {
            // DOM에 연결되어 있는지 다시 확인
            if (!iconPressedSpan.isConnected) {
              console.warn('⚠️ [setupIconInjection] iconPressedSpan not connected, retrying...');
              setTimeout(() => {
                if (iconPressedSpan.isConnected && !iconPressedSpan._reactMounted) {
                  if (this.mountToggleIcon(iconPressedSpan, button)) {
                    processedCount++;
                  }
                }
              }, 16);
              return;
            }
            
            if (this.mountToggleIcon(iconPressedSpan, button)) {
              processedCount++;
            }
          } catch (error) {
            console.error('❌ [setupIconInjection] Failed to mount ToggleIcon:', error);
            console.error('Error stack:', error.stack);
          }
        });
      } else {
        // 이미 마운트되어 있으면 확인만
        const svg = iconPressedSpan.querySelector('svg');
        if (!svg) {
          // SVG가 없으면 다시 마운트
          console.warn('⚠️ [setupIconInjection] ToggleIcon mounted but SVG not found, remounting...');
          iconPressedSpan._reactMounted = false;
          requestAnimationFrame(() => {
            if (this.mountToggleIcon(iconPressedSpan, button)) {
              processedCount++;
            }
          });
        } else {
          processedCount++;
        }
      }
      
      // data 속성 설정
      button.dataset.isToggleButton = 'true';
      const isInitiallyPressed = button.classList.contains('pressed');
      button.setAttribute('aria-pressed', isInitiallyPressed ? 'true' : 'false');
    }

    console.log(`✅ [setupIconInjection] Processed ${processedCount} toggle buttons`);
    return processedCount;
  }

  /**
   * MutationObserver로 동적 버튼 감지
   * 버튼이 추가되면 자동으로 토글 아이콘 주입
   */
  watchDynamicButtons() {
    if (!this._mountComponent) {
      console.warn('⚠️ [watchDynamicButtons] ToggleButtonManager is not initialized');
      return;
    }

    // 초기 버튼 처리
    const initialButtons = document.querySelectorAll('button');
    if (initialButtons.length > 0) {
      requestAnimationFrame(() => {
        this.setupIconInjection();
      });
    }
    
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'BUTTON' || node.querySelector?.('button')) {
            needsUpdate = true;
          }
        });
      });

      if (needsUpdate) {
        requestAnimationFrame(() => {
          // 새로 추가된 toggle 버튼에도 아이콘 주입
          this.setupIconInjection();
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log('👀 [watchDynamicButtons] Watching for dynamic toggle buttons');
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let toggleButtonManagerInstance = null;

/**
 * 토글 버튼 관리자 싱글톤 인스턴스 가져오기
 * @returns {ToggleButtonManager} 토글 버튼 관리자 인스턴스
 */
export const getToggleButtonManager = () => {
  if (!toggleButtonManagerInstance) {
    toggleButtonManagerInstance = new ToggleButtonManager();
  }
  return toggleButtonManagerInstance;
};

