/**
 * CSSOM 생성기 - 동적 CSS 주입
 * 27 프로젝트에서 가져옴
 */
export const CSSInjector = {
  /**
   * CSS를 동적으로 주입
   * @param {string} id - style 태그 ID
   * @param {string} content - CSS 내용
   */
  inject(id, content) {
    const existingStyle = document.getElementById(id);
    if (existingStyle) existingStyle.remove();
    
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.textContent = content;
    document.head.appendChild(styleElement);
  },

  /**
   * 특정 ID의 CSS 제거
   * @param {string} id - style 태그 ID
   */
  remove(id) {
    const existingStyle = document.getElementById(id);
    if (existingStyle) existingStyle.remove();
  }
};

