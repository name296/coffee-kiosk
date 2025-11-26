// ============================================================================
// 버튼 스타일 자동 생성기
// 27 프로젝트의 "강철 스타일" - 비례 기반 자동 스타일링
// ============================================================================

import { ToggleIcon } from '../components/Icon';

// ============================================================================
// 팔레트 관리자 (27 프로젝트 방식)
// ============================================================================

export const PaletteManager = {
  /**
   * 훅 인스턴스 저장 (generateCSS에서 설정)
   */
  _injectCSS: null,

  /**
   * 기본 팔레트 클래스 목록
   * 27 프로젝트의 표준 팔레트들
   */
  DEFAULT_PALETTES: ['primary1', 'primary2', 'primary3', 'secondary1', 'secondary2', 'secondary3'],

  /**
   * 팔레트 클래스가 없는 버튼에 기본 팔레트 클래스 자동 할당
   * 기본 팔레트는 primary2로 고정
   * @param {NodeList|Array|string} targetButtons - 대상 버튼들 (선택자 문자열, NodeList, 또는 배열)
   * @param {string} startPalette - 시작 팔레트 (무시됨, 항상 'primary2' 사용)
   * @returns {number} 처리된 버튼 개수
   */
  assignDefaultPalettes(targetButtons = null, startPalette = 'primary2') {
    // 기본 팔레트는 항상 primary2로 고정
    const DEFAULT_PALETTE = 'primary2';
    
    // 대상 버튼 결정
    let buttons;
    if (!targetButtons) {
      buttons = document.querySelectorAll('.button');
    } else if (typeof targetButtons === 'string') {
      buttons = document.querySelectorAll(targetButtons);
    } else if (targetButtons instanceof NodeList || Array.isArray(targetButtons)) {
      buttons = targetButtons;
    } else {
      console.warn('⚠️ [assignDefaultPalettes] Invalid targetButtons type');
      return 0;
    }

    if (buttons.length === 0) {
      console.log('ℹ️ [assignDefaultPalettes] No buttons found');
      return 0;
    }

    // 팔레트 클래스가 아닌 클래스들 (제외 목록)
    const excludedClasses = ['button', 'pressed', 'toggle', 'dynamic'];
    let processedCount = 0;

    buttons.forEach((button) => {
      const classList = Array.from(button.classList);
      
      // 이미 팔레트 클래스가 있는지 확인
      // DEFAULT_PALETTES 배열에 있는 클래스만 팔레트로 인식
      const existingPalette = classList.find(cls => {
        // 제외 목록에 있으면 스킵
        if (excludedClasses.includes(cls)) return false;
        // 기본 팔레트 목록에 있는 클래스만 팔레트로 인식
        return this.DEFAULT_PALETTES.includes(cls) || cls === 'custom';
      });
      
      // 팔레트 클래스가 없으면 primary2 할당
      if (!existingPalette) {
        button.classList.add(DEFAULT_PALETTE);
        processedCount++;
      }
    });

    console.log(`✅ [assignDefaultPalettes] Assigned '${DEFAULT_PALETTE}' to ${processedCount} buttons`);
    return processedCount;
  },

  /**
   * 버튼에 팔레트 클래스 적용
   * 27 프로젝트 방식: 버튼에 팔레트 클래스를 동적으로 추가/제거
   * @param {string} paletteName - 적용할 팔레트 이름 (예: 'primary1', 'custom')
   * @param {NodeList|Array|string} targetButtons - 대상 버튼들 (선택자 문자열, NodeList, 또는 배열)
   * @returns {number} 처리된 버튼 개수
   */
  applyPaletteClass(paletteName, targetButtons = null) {
    if (!paletteName) {
      console.warn('⚠️ [applyPaletteClass] paletteName is required');
      return 0;
    }

    // 대상 버튼 결정
    let buttons;
    if (!targetButtons) {
      // 모든 버튼에 적용
      buttons = document.querySelectorAll('.button');
    } else if (typeof targetButtons === 'string') {
      // 선택자 문자열
      buttons = document.querySelectorAll(targetButtons);
    } else if (targetButtons instanceof NodeList || Array.isArray(targetButtons)) {
      // NodeList 또는 배열
      buttons = targetButtons;
    } else {
      console.warn('⚠️ [applyPaletteClass] Invalid targetButtons type');
      return 0;
    }

    if (buttons.length === 0) {
      console.log('ℹ️ [applyPaletteClass] No buttons found');
      return 0;
    }

    const excludedClasses = ['button', 'pressed', 'toggle', 'dynamic'];
    let processedCount = 0;

    buttons.forEach(button => {
      const classList = Array.from(button.classList);
      
      // 기존 팔레트 클래스 찾기 (DEFAULT_PALETTES 또는 custom만 팔레트로 인식)
      const oldPalette = classList.find(cls => {
        if (excludedClasses.includes(cls)) return false;
        return this.DEFAULT_PALETTES.includes(cls) || cls === 'custom';
      });
      
      // 기존 팔레트 클래스 제거 (다른 팔레트인 경우만)
      if (oldPalette && oldPalette !== paletteName) {
        button.classList.remove(oldPalette);
      }
      
      // 새 팔레트 클래스 추가
      if (!button.classList.contains(paletteName)) {
        button.classList.add(paletteName);
        processedCount++;
      }
    });

    console.log(`✅ [applyPaletteClass] Applied '${paletteName}' to ${processedCount} buttons`);
    return processedCount;
  },

  /**
   * 버튼에서 팔레트 클래스 제거
   * @param {NodeList|Array|string} targetButtons - 대상 버튼들
   * @returns {number} 처리된 버튼 개수
   */
  removePaletteClass(targetButtons = null) {
    const excludedClasses = ['button', 'pressed', 'toggle', 'dynamic'];
    
    // 대상 버튼 결정
    let buttons;
    if (!targetButtons) {
      buttons = document.querySelectorAll('.button');
    } else if (typeof targetButtons === 'string') {
      buttons = document.querySelectorAll(targetButtons);
    } else if (targetButtons instanceof NodeList || Array.isArray(targetButtons)) {
      buttons = targetButtons;
    } else {
      console.warn('⚠️ [removePaletteClass] Invalid targetButtons type');
      return 0;
    }

    let processedCount = 0;

    buttons.forEach(button => {
      const classList = Array.from(button.classList);
      // DEFAULT_PALETTES 또는 custom만 팔레트로 인식
      const palette = classList.find(cls => {
        if (excludedClasses.includes(cls)) return false;
        return this.DEFAULT_PALETTES.includes(cls) || cls === 'custom';
      });
      
      if (palette) {
        button.classList.remove(palette);
        processedCount++;
      }
    });

    console.log(`✅ [removePaletteClass] Removed palette classes from ${processedCount} buttons`);
    return processedCount;
  },

  generateCSS(injectCSS) {
    // 훅 인스턴스 저장
    this._injectCSS = injectCSS;
    const buttons = document.querySelectorAll('.button');
    const discoveredPalettes = new Set();
    
    // 토글 버튼으로 처리할 클래스 목록 (팔레트로 인식하지 않음)
    const toggleButtonClasses = ['toggle'];
    
    buttons.forEach(button => {
      const classList = Array.from(button.classList);
      const excludedClasses = ['button', 'pressed', 'dynamic', ...toggleButtonClasses];
      // DEFAULT_PALETTES 또는 custom만 팔레트로 인식
      const palette = classList.find(cls => {
        if (excludedClasses.includes(cls)) return false;
        return this.DEFAULT_PALETTES.includes(cls) || cls === 'custom';
      });
      if (palette) discoveredPalettes.add(palette);
    });
    
    let lightThemeCSS = '', darkThemeCSS = '', selectorsCSS = '';
    
    discoveredPalettes.forEach(palette => {
      const isExisting = ['primary1', 'primary2', 'primary3', 'secondary1', 'secondary2', 'secondary3', 'custom'].includes(palette);
      
      [
        { name: 'default', selector: '', disabled: false },
        { name: 'pressed', selector: '.pressed:not(.toggle)', disabled: false, isToggle: false },
        { name: 'pressed', selector: '.pressed.toggle', disabled: false, isToggle: true },
        { name: 'disabled', selector: '[aria-disabled="true"]', disabled: true, isToggle: false }
      ].forEach(({name: state, selector: stateSelector, disabled, isToggle = false}) => {
        const baseSelector = palette === 'primary1' && state === 'default' && !disabled ? `&${stateSelector}` : null;
        const paletteSelector = `&.${palette}${stateSelector}`;
        
        if (baseSelector) {
          selectorsCSS += `
    ${baseSelector} {
      & .background.dynamic {
        background: var(--${palette}-background-color-${state});
        outline-color: var(--${palette}-border-color-${state});
        outline-style: var(--border-style-default);
        
        & .content {
          color: var(--${palette}-content-color-${state});
        }
      }
    }`;
        }
        
        const backgroundProperty = (palette === 'primary3' || palette === 'secondary3') 
          ? `var(--${palette}-background1-color-${state})` 
          : `var(--${palette}-background-color-${state})`;
        
        selectorsCSS += `
    ${paletteSelector} {
      & .background.dynamic {
        background: ${backgroundProperty};
        outline-color: var(--${palette}-border-color-${state});
        ${state === 'default' ? 'outline-style: var(--border-style-default);' : ''}
        ${state === 'pressed' ? 'outline-style: var(--border-style-pressed); outline-width: var(--border-style-pressed);' : ''}
        ${state === 'disabled' ? 'outline-style: var(--border-style-disabled);' : ''}
        
        & .content {
          color: var(--${palette}-content-color-${state});
        }
      }
      ${state === 'pressed' && isToggle ? '&.toggle { & .content.icon.pressed { display: var(--content-icon-display-pressed-toggle); } }' : ''}
      ${disabled ? 'cursor: var(--button-cursor-disabled);' : ''}
    }`;
      });
      
      if (!isExisting) {
        const customProperties = [
          'content-color-default', 'content-color-pressed', 'content-color-disabled',
          'background-color-default', 'background-color-pressed', 'background-color-disabled',
          'border-color-default', 'border-color-pressed', 'border-color-disabled'
        ];
        
        customProperties.forEach(property => {
          lightThemeCSS += `  --${palette}-${property}: var(--custom-${property});\n`;
          darkThemeCSS += `  --${palette}-${property}: var(--custom-${property});\n`;
        });
      }
    });
    
    // 팔레트 클래스가 없어도 toggle 버튼은 작동해야 하므로 기본 toggle CSS 추가
    const toggleCSS = `
  /* toggle 버튼 기본 처리 (팔레트 클래스 없이도 작동) */
  &.toggle.pressed {
    & .content.icon.pressed {
      display: var(--content-icon-display-pressed-toggle);
    }
  }
`;
    
    const cssContent = `
/* HTML 클래스 기반 수정자 시스템 - CSS 상속 활용 */
${lightThemeCSS ? `:root {\n${lightThemeCSS}}` : ''}

${darkThemeCSS ? `.dark {\n${darkThemeCSS}}` : ''}

@layer components {
  .button {${selectorsCSS}${toggleCSS}
  }
}
`;
    
    if (this._injectCSS) {
      this._injectCSS('palette-system-styles', cssContent);
    }
    return discoveredPalettes;
  }
};

// ============================================================================
// 버튼 시스템 상수 (27 프로젝트)
// ============================================================================

export const BUTTON_CONSTANTS = {
  BASE: 0.03125,
  get BACKGROUND_BORDER_RADIUS() { return this.BASE; },
  get BUTTON_BORDER_RADIUS() { return 2 * this.BACKGROUND_BORDER_RADIUS; },
  get BACKGROUND_OUTLINE_WIDTH() { return this.BASE; },
  get BUTTON_PADDING() { return this.BACKGROUND_OUTLINE_WIDTH; },
  get BUTTON_OUTLINE_WIDTH() { return 3 * this.BACKGROUND_OUTLINE_WIDTH; },
  get BUTTON_OUTLINE_OFFSET() { return -1 * this.BACKGROUND_OUTLINE_WIDTH; },
  get SELECTED_ICON_SIZE() { return 4 * this.BASE; }
};

// ============================================================================
// 토글 버튼 관리자 클래스
// ============================================================================

class ToggleButtonManager {
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
        // React 렌더링이 비동기이므로 약간의 지연 후 확인
        requestAnimationFrame(() => {
          const svg = iconPressedSpan.querySelector('svg');
          if (!svg) {
            // SVG가 없으면 다시 마운트 (React 렌더링이 완료되지 않았을 수 있음)
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
        });
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
// 버튼 스타일 생성기
// ============================================================================

export const ButtonStyleGenerator = {
  /**
   * 버튼 상수 (27 시스템)
   */
  CONSTANTS: BUTTON_CONSTANTS,
  
  /**
   * 팔레트 관리자 (27 시스템)
   */
  PaletteManager,
  
  /**
   * 모든 버튼의 원본 크기를 저장하고 가로/세로 배율 적용
   */
  _originalSizes: new WeakMap(),
  
  /**
   * 스타일 캐시 (27 시스템)
   */
  _styleCache: new WeakMap(),

  /**
   * 훅 인스턴스 저장 (init에서 설정)
   */
  _injectCSS: null,
  _mountComponent: null,

  /**
   * 토글 버튼 관리자 인스턴스
   */
  _toggleButtonManager: null,

  /**
   * Observer 인스턴스 저장 (정리용)
   */
  _observers: null,
  _intervalId: null,
  
  /**
   * 토글 버튼 관리자 가져오기
   */
  get ToggleButtonManager() {
    if (!this._toggleButtonManager) {
      this._toggleButtonManager = new ToggleButtonManager();
    }
    return this._toggleButtonManager;
  },

  /**
   * 27 프로젝트 방식: 동적 스타일 적용 (모든 버튼의 아이콘 배치 및 스케일링)
   */
  applyDynamicStyles() {
    const allButtons = document.querySelectorAll('.button');
    if (allButtons.length === 0) return;
    
    let processedCount = 0;
    
    for (const button of allButtons) {
      const background = button.querySelector(".background.dynamic") || button.querySelector(".background");
      if (!background) continue;

      const rect = button.getBoundingClientRect();
      
      // 버튼이 아직 렌더링되지 않았거나 크기가 0이면 스킵
      if (rect.width === 0 || rect.height === 0) {
        continue;
      }
      
      const minSide = Math.min(rect.width, rect.height);

      const buttonPadding = minSide * this.CONSTANTS.BUTTON_PADDING;
      const buttonBorderRadius = minSide * this.CONSTANTS.BUTTON_BORDER_RADIUS;
      const buttonOutlineWidth = minSide * this.CONSTANTS.BUTTON_OUTLINE_WIDTH;
      const buttonOutlineOffset = minSide * this.CONSTANTS.BUTTON_OUTLINE_OFFSET;
      const backgroundBorderRadius = minSide * this.CONSTANTS.BACKGROUND_BORDER_RADIUS;
      const backgroundOutlineWidth = minSide * this.CONSTANTS.BACKGROUND_OUTLINE_WIDTH;
      const iconSelectedSize = minSide * this.CONSTANTS.SELECTED_ICON_SIZE;

      const cached = this._styleCache.get(button) || {};
      const needsUpdate = (
        (cached.minSide || 0) !== minSide || 
        (cached.buttonPadding || 0) !== buttonPadding ||
        (cached.buttonBorderRadius || 0) !== buttonBorderRadius || 
        (cached.buttonOutlineWidth || 0) !== buttonOutlineWidth ||
        (cached.buttonOutlineOffset || 0) !== buttonOutlineOffset || 
        (cached.backgroundBorderRadius || 0) !== backgroundBorderRadius ||
        (cached.backgroundOutlineWidth || 0) !== backgroundOutlineWidth || 
        (cached.iconSelectedSize || 0) !== iconSelectedSize
      );

      if (!needsUpdate) continue;

      button.style.padding = `${buttonPadding}px`;
      button.style.borderRadius = `${buttonBorderRadius}px`;
      button.style.outlineWidth = `${buttonOutlineWidth}px`;
      button.style.outlineOffset = `${buttonOutlineOffset}px`;

      background.style.borderRadius = `${backgroundBorderRadius}px`;
      background.style.outlineWidth = `${backgroundOutlineWidth}px`;

      // 토글 버튼의 토글 상태 표시 아이콘 자동 생성 (상수 체계 사용)
      const iconPressed = button.querySelector('.content.icon.pressed');
      if (button.classList.contains('toggle') && iconPressed) {
        const minSide = Math.min(rect.width, rect.height);
        // ICON_TOGGLED_SIZE = 32/256 = 4 * BASE = 0.125
        const toggleIconSize = minSide * this.CONSTANTS.SELECTED_ICON_SIZE;
        // PADDING = 8/256 = 1 * BASE = 0.03125
        const togglePadding = minSide * this.CONSTANTS.BUTTON_PADDING;
        iconPressed.style.width = `${toggleIconSize}px`;
        iconPressed.style.height = `${toggleIconSize}px`;
        iconPressed.style.top = `${togglePadding}px`;
        iconPressed.style.right = `${togglePadding}px`;
      } else if (iconPressed && !button.classList.contains('toggle')) {
        // 일반 버튼의 pressed 아이콘은 기존 방식 유지
        iconPressed.style.width = `${iconSelectedSize}px`;
        iconPressed.style.height = `${iconSelectedSize}px`;
        iconPressed.style.top = `${buttonPadding}px`;
        iconPressed.style.right = `${buttonPadding}px`;
      }

      this._styleCache.set(button, {
        minSide, buttonPadding, buttonBorderRadius, buttonOutlineWidth, buttonOutlineOffset,
        backgroundBorderRadius, backgroundOutlineWidth, iconSelectedSize
      });
      
      processedCount++;
    }
  },

  calculateButtonSizes() {
    const widthScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--button-width-scale') || '1');
    const heightScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--button-height-scale') || '1');
    
    // 현재 스케일 배율 가져오기 (transform: scale() 기준)
    const bodyElement = document.body;
    let currentScale = 1;
    
    if (bodyElement) {
      const bodyStyle = getComputedStyle(bodyElement);
      const transform = bodyStyle.transform;
      
      // transform: scale(x) 또는 scale(x, y) 파싱
      if (transform && transform !== 'none') {
        const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
        if (matrixMatch) {
          const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
          // matrix(a, b, c, d, e, f)에서 scale은 a와 d 값
          // scale(x, y)일 경우 a와 d가 다를 수 있지만, 일반적으로 같음
          currentScale = Math.abs(values[0]) || 1;
        } else {
          const scaleMatch = transform.match(/scale\(([^)]+)\)/);
          if (scaleMatch) {
            const scaleValues = scaleMatch[1].split(',').map(v => parseFloat(v.trim()));
            currentScale = scaleValues[0] || 1;
          }
        }
      }
    }
    
    const buttons = document.querySelectorAll('button');
    if (buttons.length === 0) {
      console.warn('⚠️ [calculateButtonSizes] No buttons found');
      return;
    }
    
    buttons.forEach(btn => {
      // 원본 크기 저장 (첫 실행 시에만)
      if (!this._originalSizes.has(btn)) {
        const { width, height } = btn.getBoundingClientRect();
        // scale이 적용된 크기를 원본으로 변환
        const originalWidth = width / currentScale;
        const originalHeight = height / currentScale;
        this._originalSizes.set(btn, { width: originalWidth, height: originalHeight });
      }
      
      // 원본 크기 가져오기
      const original = this._originalSizes.get(btn);
      
      // 가로/세로 배율 독립 적용
      const scaledWidth = original.width * widthScale;
      const scaledHeight = original.height * heightScale;
      const shortSize = Math.min(scaledWidth, scaledHeight);
      
      // CSS 변수 설정
      btn.style.setProperty('--short-size', `${shortSize}px`);
      btn.style.setProperty('--long-size', `${Math.max(scaledWidth, scaledHeight)}px`);
      btn.style.setProperty('--btn-width', `${scaledWidth}px`);
      btn.style.setProperty('--btn-height', `${scaledHeight}px`);
      
      // 실제 크기 적용
      btn.style.width = `${scaledWidth}px`;
      btn.style.height = `${scaledHeight}px`;
    });
    
    // 동적 스타일은 init()에서 별도로 호출
  },
  
  /**
   * 27 상수 시스템을 버튼에 적용
   */
  apply27Constants(button, minSide) {
    const background = button.querySelector('.background.dynamic');
    if (!background) return;
    
    const cached = this._styleCache.get(button) || {};
    
    // 27 상수로 계산된 값들
    const buttonPadding = minSide * this.CONSTANTS.BUTTON_PADDING;
    const buttonBorderRadius = minSide * this.CONSTANTS.BUTTON_BORDER_RADIUS;
    const buttonOutlineWidth = minSide * this.CONSTANTS.BUTTON_OUTLINE_WIDTH;
    const buttonOutlineOffset = minSide * this.CONSTANTS.BUTTON_OUTLINE_OFFSET;
    const backgroundBorderRadius = minSide * this.CONSTANTS.BACKGROUND_BORDER_RADIUS;
    const backgroundOutlineWidth = minSide * this.CONSTANTS.BACKGROUND_OUTLINE_WIDTH;
    const iconSelectedSize = minSide * this.CONSTANTS.SELECTED_ICON_SIZE;
    
    // 캐시 확인 (변경사항이 없으면 스킵)
    const needsUpdate = (
      (cached.minSide || 0) !== minSide ||
      (cached.buttonPadding || 0) !== buttonPadding ||
      (cached.buttonBorderRadius || 0) !== buttonBorderRadius ||
      (cached.buttonOutlineWidth || 0) !== buttonOutlineWidth ||
      (cached.buttonOutlineOffset || 0) !== buttonOutlineOffset ||
      (cached.backgroundBorderRadius || 0) !== backgroundBorderRadius ||
      (cached.backgroundOutlineWidth || 0) !== backgroundOutlineWidth ||
      (cached.iconSelectedSize || 0) !== iconSelectedSize
    );
    
    if (!needsUpdate) return;
    
    // 버튼에 27 상수 적용 (27 구조 정확히 준수)
    button.style.padding = `${buttonPadding}px`;
    button.style.borderRadius = `${buttonBorderRadius}px`;
    // outlineWidth는 항상 설정 (27 구조와 동일)
    // CSS의 outline: 0은 width를 0으로 설정하지만, JavaScript의 inline style이 우선순위가 높음
    // 기본 상태에서는 CSS의 outline: none이 적용되어 outline이 보이지 않음
    button.style.outlineWidth = `${buttonOutlineWidth}px`;
    button.style.outlineOffset = `${buttonOutlineOffset}px`;
    
    // background에 27 상수 적용 (27 구조 정확히 준수)
    background.style.borderRadius = `${backgroundBorderRadius}px`;
    background.style.outlineWidth = `${backgroundOutlineWidth}px`;
    
    // 토글 버튼의 토글 상태 표시 아이콘 자동 생성 (상수 체계 사용)
    const iconPressed = button.querySelector('.content.icon.pressed');
    if (button.classList.contains('toggle') && iconPressed) {
      // ICON_TOGGLED_SIZE = 32/256 = 4 * BASE = 0.125
      const toggleIconSize = minSide * this.CONSTANTS.SELECTED_ICON_SIZE;
      // PADDING = 8/256 = 1 * BASE = 0.03125
      const togglePadding = minSide * this.CONSTANTS.BUTTON_PADDING;
      iconPressed.style.width = `${toggleIconSize}px`;
      iconPressed.style.height = `${toggleIconSize}px`;
      iconPressed.style.top = `${togglePadding}px`;
      iconPressed.style.right = `${togglePadding}px`;
    } else if (iconPressed && !button.classList.contains('toggle')) {
      // 일반 버튼의 pressed 아이콘은 기존 방식 유지
      iconPressed.style.width = `${iconSelectedSize}px`;
      iconPressed.style.height = `${iconSelectedSize}px`;
      iconPressed.style.top = `${buttonPadding}px`;
      iconPressed.style.right = `${buttonPadding}px`;
    }
    
    // 27 구조: 항상 outlineWidth 설정 (상태와 관계없이)
    // CSS의 outline: 0은 width를 0으로 설정하지만, JavaScript의 inline style이 우선순위가 높음
    // 기본 상태에서는 CSS의 outline: none이 적용되어 outline이 보이지 않음
    // hover/focus 시에는 CSS의 outline: 0 ...이 적용되어 style과 color만 변경됨
    
    // 캐시 저장
    this._styleCache.set(button, {
      minSide,
      buttonPadding,
      buttonBorderRadius,
      buttonOutlineWidth,
      buttonOutlineOffset,
      backgroundBorderRadius,
      backgroundOutlineWidth,
      iconSelectedSize
    });
  },

  /**
   * 버튼 기본 템플릿 CSS 생성 (강철 스타일)
   * 모든 버튼이 하나의 템플릿을 공유
   */
  generateButtonTemplate() {
    const css = `
      /* ========================================
         🎯 버튼 컴포넌트 시스템 (JavaScript 연동)
         ======================================== */
      /* 기본 버튼 스타일은 App.css에 정의됨 (27 구조) */
      /* 여기서는 동적 스타일만 추가 */

      /* 세로 배치 */
      .button.vertical .background.dynamic {
        flex-direction: column;
      }

      /* 가로 배치 */
      .button.horizontal .background.dynamic {
        flex-direction: row;
      }
    `;

    if (this._injectCSS) {
      this._injectCSS('button-template-system', css);
    }
  },



  /**
   * ToggleIcon을 마운트하는 헬퍼 함수
   * @param {HTMLElement} iconPressedSpan - 아이콘을 마운트할 span 요소
   * @param {HTMLElement} button - 버튼 요소 (로깅용)
   */
  mountToggleIcon(iconPressedSpan, button) {
    return this.ToggleButtonManager.mountToggleIcon(iconPressedSpan, button);
  },

  /**
   * toggle 버튼에 체크 심볼 자동 주입
   */
  setupIconInjection() {
    return this.ToggleButtonManager.setupIconInjection();
  },

  /**
   * MutationObserver로 동적 버튼 감지
   * 버튼이 추가되면 자동으로 토글 아이콘 주입 및 스타일 적용
   */
  /**
   * 버튼 스타일 강제 재적용 (더 견고한 방식)
   * 여러 프레임에 걸쳐 레이아웃 완료를 보장
   */
  _forceApplyStyles(maxRetries = 3, delay = 100) {
    let retryCount = 0;
    
    const apply = () => {
      const buttons = document.querySelectorAll('.button');
      if (buttons.length === 0) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(apply, delay);
        }
        return;
      }

      // 버튼이 실제로 렌더링되었는지 확인 (크기가 0이 아닌지)
      const renderedButtons = Array.from(buttons).filter(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (renderedButtons.length === 0 && retryCount < maxRetries) {
        retryCount++;
        setTimeout(apply, delay);
        return;
      }

      // 여러 프레임에 걸쳐 적용하여 레이아웃 완료 보장
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // 1. 팔레트 클래스 자동 할당
          this.PaletteManager.assignDefaultPalettes();
          // 2. 토글 아이콘 주입
          if (this.ToggleButtonManager && this._mountComponent) {
            this.ToggleButtonManager.setupIconInjection();
          }
          // 3. 크기 계산 및 스타일 적용
          this.calculateButtonSizes();
          this.applyDynamicStyles();
          // 4. 팔레트 CSS 생성
          if (this._injectCSS) {
            this.PaletteManager.generateCSS(this._injectCSS);
          }
        });
      });
    };

    apply();
  },

  watchDynamicButtons() {
    // 초기 버튼 처리 (더 견고한 방식)
    this._forceApplyStyles();

    // MutationObserver: DOM 변경 감지
    const mutationObserver = new MutationObserver((mutations) => {
      let needsUpdate = false;
      const newButtons = [];
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 직접 추가된 버튼
            if (node.classList?.contains('button')) {
              needsUpdate = true;
              newButtons.push(node);
            }
            // 자식 요소 중 버튼
            const childButtons = node.querySelectorAll?.('.button');
            if (childButtons && childButtons.length > 0) {
              needsUpdate = true;
              childButtons.forEach(btn => newButtons.push(btn));
            }
          }
        });
      });

      if (needsUpdate) {
        // 여러 프레임에 걸쳐 적용
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 1. 새로 추가된 버튼에 팔레트 클래스 자동 할당
            if (newButtons.length > 0) {
              this.PaletteManager.assignDefaultPalettes(newButtons);
            } else {
              this.PaletteManager.assignDefaultPalettes();
            }
            // 2. 새로 추가된 toggle 버튼에도 아이콘 주입
            if (this._mountComponent) {
              this.ToggleButtonManager.setupIconInjection();
            }
            // 3. 새로 추가된 버튼의 크기 계산 및 스타일 적용
            this.calculateButtonSizes();
            this.applyDynamicStyles();
            // 4. 새로 추가된 버튼의 팔레트 CSS 재생성
            if (this._injectCSS) {
              this.PaletteManager.generateCSS(this._injectCSS);
            }
          });
        });
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // ResizeObserver: 버튼 크기 변경 감지 (이미지 로드 등으로 인한 크기 변경)
    const resizeObserver = new ResizeObserver((entries) => {
      let needsUpdate = false;
      
      entries.forEach((entry) => {
        const target = entry.target;
        if (target.classList?.contains('button') || target.closest?.('.button')) {
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        requestAnimationFrame(() => {
          this.calculateButtonSizes();
          this.applyDynamicStyles();
        });
      }
    });

    // 모든 버튼 관찰
    const observeButtons = () => {
      const buttons = document.querySelectorAll('.button');
      buttons.forEach(btn => {
        resizeObserver.observe(btn);
        // background.dynamic도 관찰 (내부 요소 크기 변경 감지)
        const background = btn.querySelector('.background.dynamic');
        if (background) {
          resizeObserver.observe(background);
        }
      });
    };

    // 초기 관찰 설정
    observeButtons();

    // MutationObserver와 연동하여 새 버튼도 관찰
    const buttonMutationObserver = new MutationObserver(() => {
      observeButtons();
    });

    buttonMutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 주기적 체크 (debounced, 최후의 수단)
    let checkTimeout = null;
    const periodicCheck = () => {
      if (checkTimeout) clearTimeout(checkTimeout);
      checkTimeout = setTimeout(() => {
        const buttons = document.querySelectorAll('.button');
        const unprocessedButtons = Array.from(buttons).filter(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && !this._styleCache.has(btn);
        });

        if (unprocessedButtons.length > 0) {
          console.log(`🔄 [watchDynamicButtons] Periodic check found ${unprocessedButtons.length} unprocessed buttons, reapplying styles`);
          this._forceApplyStyles();
        }
      }, 1000); // 1초마다 체크
    };

    // 주기적 체크 시작
    periodicCheck();
    const intervalId = setInterval(periodicCheck, 2000); // 2초마다 체크

    return {
      mutationObserver,
      resizeObserver,
      buttonMutationObserver,
      intervalId
    };
  },

  /**
   * 버튼 시스템 초기화 (강철 스타일 시스템)
   * 27 프로젝트 방식 기반, 논리적으로 최적화된 순서
   * 동기 처리 - 버튼이 이미 렌더링된 상태에서 실행됨
   * @param {Object} options - 초기화 옵션
   * @param {Function} options.injectCSS - CSS 인젝션 함수
   * @param {Function} options.mountComponent - React 컴포넌트 마운트 함수
   */
  init({ injectCSS, mountComponent } = {}) {
    console.log('🔘 [ButtonStyleGenerator] 강철 스타일 시스템 초기화');
    const initStart = performance.now();
    
    // 훅 인스턴스 저장
    if (injectCSS) {
      this._injectCSS = injectCSS;
    }
    if (mountComponent) {
      this._mountComponent = mountComponent;
    }
    
    // ToggleButtonManager 초기화
    if (this._mountComponent) {
      this.ToggleButtonManager.init(this._mountComponent);
    } else {
      console.warn('⚠️ [init] mountComponent is not provided, ToggleButtonManager will not be initialized');
    }
    
    // 1단계: CSS 생성 (버튼 불필요, 먼저 실행)
    console.log('  ├─ 1단계: 버튼 템플릿 CSS 생성');
    this.generateButtonTemplate();
    
    // 2단계: 팔레트 클래스 자동 할당 (버튼에 기본 팔레트 클래스 부여)
    console.log('  ├─ 2단계: 팔레트 클래스 자동 할당');
    const assignedCount = this.PaletteManager.assignDefaultPalettes();
    console.log(`  ✅ 팔레트 클래스 할당 완료 (${assignedCount}개 버튼)`);
    
    // 3단계: 팔레트 CSS 생성 (27 프로젝트: 3단계)
    // 주의: 버튼이 없으면 빈 CSS가 생성되지만, watchDynamicButtons에서 다시 생성됨
    console.log('  ├─ 3단계: 팔레트 CSS 생성');
    if (!this._injectCSS) {
      console.warn('⚠️ [init] injectCSS is not provided, skipping palette CSS generation');
    } else {
        const discoveredPalettes = this.PaletteManager.generateCSS(this._injectCSS);
    console.log(`  ✅ 팔레트 CSS 생성 완료 (${discoveredPalettes.size}개 팔레트 발견)`);
    }
    
    // 4단계: 동적 스타일 적용 (27 프로젝트: 4단계)
    // 여러 프레임에 걸쳐 적용하여 레이아웃 완료 보장
    console.log('  ├─ 4단계: 동적 스타일 적용');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.applyDynamicStyles();
        console.log('  ✅ 동적 스타일 적용 완료');
        
        // 5단계: 버튼 크기 계산 (coffee-kiosk 전용 기능)
        console.log('  ├─ 5단계: 버튼 크기 변수 계산');
        this.calculateButtonSizes();
        console.log('  ✅ 버튼 크기 계산 완료');
      });
    });
    
    // 6단계: 이벤트 리스너 및 자동 업데이트 설정
    console.log('  ├─ 6단계: 이벤트 리스너 및 자동 업데이트 설정');
    
    // 리사이즈 시 재계산 (쓰로틀링)
    let resizeScheduled = false;
    window.addEventListener('resize', () => {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(() => {
        this.calculateButtonSizes();
        this.applyDynamicStyles();
        resizeScheduled = false;
      });
    });
    
    // 동적 버튼 감지 (27 프로젝트: 5단계 setupUpdateManager와 유사)
    // 토글 버튼 아이콘 감지는 ToggleButtonManager에서 처리
    if (this._mountComponent) {
      this.ToggleButtonManager.watchDynamicButtons();
    }
    // 일반 버튼 스타일링 감지는 여기서 처리
    this._observers = this.watchDynamicButtons();
    console.log('  ✅ 이벤트 리스너 및 자동 업데이트 설정 완료');
    
    const initEnd = performance.now();
    console.log(`🎉 [ButtonStyleGenerator] 강철 스타일 적용 완료 (총 ${(initEnd - initStart).toFixed(2)}ms)`);
  },

  /**
   * Observer 및 리스너 정리
   */
  cleanup() {
    if (this._observers) {
      if (this._observers.mutationObserver) {
        this._observers.mutationObserver.disconnect();
      }
      if (this._observers.resizeObserver) {
        this._observers.resizeObserver.disconnect();
      }
      if (this._observers.buttonMutationObserver) {
        this._observers.buttonMutationObserver.disconnect();
      }
      if (this._observers.intervalId) {
        clearInterval(this._observers.intervalId);
      }
      this._observers = null;
    }
  }
};

