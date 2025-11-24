/**
 * 버튼 스타일 자동 생성기
 * 27 프로젝트의 "강철 스타일" - 비례 기반 자동 스타일링
 */
import { CSSInjector } from './cssInjector';

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
   * 모든 버튼의 원본 크기를 저장하고 가로/세로 배율 적용
   */
  _originalSizes: new WeakMap(),
  
  /**
   * 스타일 캐시 (27 시스템)
   */
  _styleCache: new WeakMap(),

  calculateButtonSizes() {
    const widthScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--button-width-scale') || '1');
    const heightScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--button-height-scale') || '1');
    
    document.querySelectorAll('button').forEach(btn => {
      // 원본 크기 저장 (첫 실행 시에만)
      if (!this._originalSizes.has(btn)) {
        const { width, height } = btn.getBoundingClientRect();
        this._originalSizes.set(btn, { width, height });
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
      
      // 27 상수 시스템 적용
      this.apply27Constants(btn, shortSize);
    });
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
   * 기존 CSS의 고정값을 분석하고 비율로 변환하는 CSS 생성
   * 강철 스타일: 디자이너의 의도(비율)를 추출하여 자동 적용
   */
  generateLegacyCompatibilityStyles() {
    const buttonConfigs = [
      // 버튼별 설정 (클래스, 너비, 높이, 원래 값들)
      { selector: '.home-btn', w: 285, h: 285, br: 18, pd: 20, gap: 50 },
      { selector: '.summary-btn', w: 185, h: 135, br: 10, gap: 5 },
      { selector: '.return-btn-cancel', w: 280, h: 100, br: 5 },
      { selector: '.return-btn-confirm', w: 280, h: 100, br: 5 },
      { selector: '.accessibility-btn-cancel', w: 290, h: 105, br: 10 },
      { selector: '.accessibility-btn-confirm', w: 290, h: 105, br: 10 },
      { selector: '.down-footer-button', w: 198, h: 70, br: 35 },
    ];

    let css = `/* 강철 스타일: 기존 버튼 자동 비율 변환 */\n`;

    buttonConfigs.forEach(config => {
      const shortSize = Math.min(config.w, config.h);
      const ratioBr = config.br ? (config.br / shortSize).toFixed(4) : null;
      const ratioPd = config.pd ? (config.pd / shortSize).toFixed(4) : null;
      const ratioGap = config.gap ? (config.gap / shortSize).toFixed(4) : null;

      css += `
      ${config.selector} {`;
      if (ratioBr) css += `\n        --ratio-border-radius: ${ratioBr};`;
      if (ratioPd) css += `\n        --ratio-padding: ${ratioPd};`;
      if (ratioGap) css += `\n        --ratio-gap: ${ratioGap};`;
      css += `\n      }\n`;
    });

    CSSInjector.inject('button-legacy-ratios', css);
  },

  /**
   * MutationObserver로 동적 버튼 감지
   */
  watchDynamicButtons() {
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
          this.calculateButtonSizes();
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
   */
  init() {
    console.log('🔘 [ButtonStyleGenerator] 강철 스타일 시스템 초기화');
    const initStart = performance.now();
    
    // 1단계: 버튼 템플릿 CSS 생성
    console.log('  ├─ 1단계: 버튼 템플릿 CSS 생성');
    this.generateButtonTemplate();
    
    // 2단계: 기존 버튼 비율 자동 계산
    console.log('  ├─ 2단계: 기존 버튼 비율 자동 변환');
    this.generateLegacyCompatibilityStyles();
    
    // 3단계: 초기 버튼 크기 계산
    console.log('  ├─ 3단계: 버튼 크기 변수 계산');
    this.calculateButtonSizes();
    
    // 4단계: 리사이즈 시 재계산 (쓰로틀링)
    console.log('  ├─ 4단계: 리사이즈 리스너 설정');
    let resizeScheduled = false;
    window.addEventListener('resize', () => {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(() => {
        this.calculateButtonSizes();
        resizeScheduled = false;
      });
    });
    
    // 5단계: 동적 버튼 감지
    console.log('  ├─ 5단계: 동적 버튼 감지 시작');
    this.watchDynamicButtons();
    
    const initEnd = performance.now();
    console.log(`🎉 [ButtonStyleGenerator] 강철 스타일 적용 완료 (총 ${(initEnd - initStart).toFixed(2)}ms)`);
  }
};

