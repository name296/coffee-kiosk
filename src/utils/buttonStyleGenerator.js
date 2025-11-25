/**
 * 버튼 스타일 자동 생성기
 * 27 프로젝트의 "강철 스타일" - 비례 기반 자동 스타일링
 */
import { CSSInjector } from './cssInjector';
import { PaletteManager } from './paletteManager';
import { mountReactComponent } from './reactMount';
import { ToggleIcon } from '../components/icons';

/* ==============================
  🔘 버튼 시스템 상수 (27에서 가져옴)
  ============================== */
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

      // 토글 아이콘 배치 및 스케일링 (27 프로젝트 방식)
      const iconPressed = button.querySelector('.content.icon.pressed');
      if (iconPressed) {
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
    
    // pressed 아이콘 크기 적용
    const iconPressed = button.querySelector('.content.icon.pressed');
    if (iconPressed) {
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
      /* 기본 버튼 스타일은 index.css에 정의됨 (27 구조) */
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

    CSSInjector.inject('button-template-system', css);
  },



  /**
   * ToggleIcon을 마운트하는 헬퍼 함수
   * @param {HTMLElement} iconPressedSpan - 아이콘을 마운트할 span 요소
   * @param {HTMLElement} button - 버튼 요소 (로깅용)
   */
  mountToggleIcon(iconPressedSpan, button) {
    if (iconPressedSpan._reactMounted) return;
    
    try {
      console.log('🔧 [mountToggleIcon] Attempting to mount ToggleIcon to:', iconPressedSpan);
      const mountResult = mountReactComponent(ToggleIcon, iconPressedSpan);
      if (mountResult && mountResult.root) {
        iconPressedSpan._reactMounted = true;
        console.log('✅ [mountToggleIcon] ToggleIcon mounted successfully for button:', button);
      } else {
        console.warn('⚠️ [mountToggleIcon] mountReactComponent returned null or no root for button:', button);
      }
    } catch (error) {
      console.error('❌ [mountToggleIcon] Failed to mount ToggleIcon:', error);
      console.error('Error stack:', error.stack);
    }
  },

  /**
   * toggle 버튼에 체크 심볼 자동 주입 (27 프로젝트 방식)
   * React 컴포넌트를 사용하여 아이콘을 마운트
   * 동기 처리 - 버튼이 이미 렌더링된 상태에서 실행됨
   */
  setupIconInjection() {
    const allButtons = document.querySelectorAll('.button.toggle');
    if (allButtons.length === 0) {
      console.log('ℹ️ [setupIconInjection] No toggle buttons found');
      return;
    }
    
    console.log(`🔍 [setupIconInjection] Found ${allButtons.length} toggle buttons`);
    
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
      // 이미 마운트되어 있으면 다시 마운트하지 않음
      if (!iconPressedSpan._reactMounted) {
        // DOM에 삽입된 후 마운트 (isConnected 체크를 통과하기 위해)
        requestAnimationFrame(() => {
          try {
            // DOM에 연결되어 있는지 다시 확인
            if (!iconPressedSpan.isConnected) {
              console.warn('⚠️ [setupIconInjection] iconPressedSpan not connected, retrying...');
              setTimeout(() => {
                if (iconPressedSpan.isConnected && !iconPressedSpan._reactMounted) {
                  this.mountToggleIcon(iconPressedSpan, button);
                }
              }, 16);
              return;
            }
            
            this.mountToggleIcon(iconPressedSpan, button);
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
            this.mountToggleIcon(iconPressedSpan, button);
    });
        }
      }
      
      // data 속성 설정
      button.dataset.isToggleButton = 'true';
      const isInitiallyPressed = button.classList.contains('pressed');
      button.setAttribute('aria-pressed', isInitiallyPressed ? 'true' : 'false');
    }
  },

  /**
   * MutationObserver로 동적 버튼 감지
   * 버튼이 추가되면 자동으로 토글 아이콘 주입 및 스타일 적용
   */
  watchDynamicButtons() {
    // 초기 버튼이 있으면 즉시 처리
    const initialButtons = document.querySelectorAll('button');
    if (initialButtons.length > 0) {
      requestAnimationFrame(() => {
        this.setupIconInjection();
        this.calculateButtonSizes();
        this.applyDynamicStyles();
        // 초기 버튼이 있으면 팔레트 CSS도 생성
        this.PaletteManager.generateCSS();
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
          // 새로 추가된 버튼의 크기 계산 및 스타일 적용
          this.calculateButtonSizes();
          this.applyDynamicStyles();
          // 새로 추가된 버튼의 팔레트도 재생성
          this.PaletteManager.generateCSS();
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  },

  /**
   * 버튼 시스템 초기화 (강철 스타일 시스템)
   * 27 프로젝트 방식 기반, 논리적으로 최적화된 순서
   * 동기 처리 - 버튼이 이미 렌더링된 상태에서 실행됨
   */
  init() {
    console.log('🔘 [ButtonStyleGenerator] 강철 스타일 시스템 초기화');
    const initStart = performance.now();
    
    // 1단계: CSS 생성 (버튼 불필요, 먼저 실행)
    console.log('  ├─ 1단계: 버튼 템플릿 CSS 생성');
    this.generateButtonTemplate();
    
    // 2단계: 팔레트 CSS 생성 (27 프로젝트: 3단계)
    // 주의: 버튼이 없으면 빈 CSS가 생성되지만, watchDynamicButtons에서 다시 생성됨
    console.log('  ├─ 2단계: 팔레트 CSS 생성');
    const discoveredPalettes = this.PaletteManager.generateCSS();
    console.log(`  ✅ 팔레트 CSS 생성 완료 (${discoveredPalettes.size}개 팔레트 발견)`);
    
    // 3단계: 동적 스타일 적용 (27 프로젝트: 4단계)
    console.log('  ├─ 3단계: 동적 스타일 적용');
    this.applyDynamicStyles();
    console.log('  ✅ 동적 스타일 적용 완료');
    
    // 4단계: 버튼 크기 계산 (coffee-kiosk 전용 기능)
    console.log('  ├─ 4단계: 버튼 크기 변수 계산');
    this.calculateButtonSizes();
    console.log('  ✅ 버튼 크기 계산 완료');
    
    // 5단계: 이벤트 리스너 및 자동 업데이트 설정
    console.log('  ├─ 5단계: 이벤트 리스너 및 자동 업데이트 설정');
    
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
    this.watchDynamicButtons();
    console.log('  ✅ 이벤트 리스너 및 자동 업데이트 설정 완료');
    
    const initEnd = performance.now();
    console.log(`🎉 [ButtonStyleGenerator] 강철 스타일 적용 완료 (총 ${(initEnd - initStart).toFixed(2)}ms)`);
  }
};

