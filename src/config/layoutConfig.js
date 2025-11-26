/**
 * 레이아웃 조립 컨텍스트 설정
 * BOM (Bill of Materials)과 조립 순서/조건을 명시적으로 정의
 */

/**
 * 레이아웃 부품 목록 (BOM)
 */
export const LAYOUT_COMPONENTS = {
  STEP: 'Step',
  CONTENT: 'Content',
  SUMMARY: 'Summary',
  BOTTOM: 'Bottom',
  MODALS: 'Modals',
};

/**
 * 조립 순서 정의
 */
export const ASSEMBLY_ORDER = [
  LAYOUT_COMPONENTS.STEP,
  LAYOUT_COMPONENTS.CONTENT,
  LAYOUT_COMPONENTS.SUMMARY,
  LAYOUT_COMPONENTS.BOTTOM,
  LAYOUT_COMPONENTS.MODALS,
];

/**
 * 컴포넌트별 렌더링 조건
 * @param {Object} context - AppContext에서 가져온 상태
 * @returns {boolean} 렌더링 여부
 */
export const COMPONENT_CONDITIONS = {
  [LAYOUT_COMPONENTS.STEP]: (context) => {
    // Step은 항상 표시 (first 페이지에서도 빈 상태로 표시 가능)
    return true;
  },
  
  [LAYOUT_COMPONENTS.SUMMARY]: (context) => {
    // Summary는 second, third 페이지에서만 표시
    return ['second', 'third'].includes(context.currentPage);
  },
  
  [LAYOUT_COMPONENTS.BOTTOM]: (context) => {
    // Bottom은 항상 표시
    return true;
  },
  
  [LAYOUT_COMPONENTS.MODALS]: (context) => {
    // Modals는 항상 렌더링 (조건부 표시는 각 모달 내부에서 처리)
    return true;
  },
  
  [LAYOUT_COMPONENTS.CONTENT]: (context) => {
    // Content는 항상 표시
    return true;
  },
};

/**
 * 페이지별 Step 컴포넌트 표시 조건
 */
export const STEP_VISIBILITY = {
  first: false,  // first 페이지에서는 Step 숨김
  second: true,
  third: true,
  forth: true,
};

/**
 * 레이아웃 조립 컨텍스트
 * 조립 순서와 조건을 중앙에서 관리
 */
export const LAYOUT_ASSEMBLY_CONTEXT = {
  order: ASSEMBLY_ORDER,
  conditions: COMPONENT_CONDITIONS,
  stepVisibility: STEP_VISIBILITY,
};

