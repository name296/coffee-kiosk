/**
 * 크기 조절 관리자
 * 27 프로젝트 방식: 가로/세로 독립적으로 배율 조절
 * 모든 버튼의 width/height CSS를 배율로 곱해서 조절
 */

export const SizeControlManager = {
  DEFAULT_WIDTH_SCALE: 1.0,
  DEFAULT_HEIGHT_SCALE: 1.0,
  MIN_SCALE: 0.5,
  MAX_SCALE: 2.0,
  currentWidthScale: 1.0,
  currentHeightScale: 1.0,
  
  /**
   * 초기화
   */
  init() {
    console.log('📐 [SizeControlManager] 초기화');
    this.currentWidthScale = this.DEFAULT_WIDTH_SCALE;
    this.currentHeightScale = this.DEFAULT_HEIGHT_SCALE;
    this.applyScaleToButtons();
  },
  
  /**
   * 가로 배율 설정
   * @param {number} scale - 배율 (0.5 ~ 2.0)
   */
  setWidthScale(scale) {
    this.currentWidthScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, scale));
    this.applyScaleToButtons();
  },
  
  /**
   * 세로 배율 설정
   * @param {number} scale - 배율 (0.5 ~ 2.0)
   */
  setHeightScale(scale) {
    this.currentHeightScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, scale));
    this.applyScaleToButtons();
  },
  
  /**
   * 모든 버튼의 실제 width/height CSS를 배율로 조절
   */
  applyScaleToButtons() {
    // CSS 변수로 전역 배율 설정
    document.documentElement.style.setProperty('--button-width-scale', this.currentWidthScale);
    document.documentElement.style.setProperty('--button-height-scale', this.currentHeightScale);
    
    console.log(`📐 [SizeControlManager] 배율 적용: W ${this.currentWidthScale}x, H ${this.currentHeightScale}x`);
    
    // ButtonStyleGenerator의 크기 재계산 트리거
    if (window.ButtonStyleGenerator) {
      requestAnimationFrame(() => {
        window.ButtonStyleGenerator.calculateButtonSizes();
      });
    }
  },
  
  /**
   * 기본 크기로 리셋
   */
  reset() {
    this.setWidthScale(this.DEFAULT_WIDTH_SCALE);
    this.setHeightScale(this.DEFAULT_HEIGHT_SCALE);
  },
  
  /**
   * 현재 배율 가져오기
   */
  getScales() {
    return {
      width: this.currentWidthScale,
      height: this.currentHeightScale
    };
  }
};