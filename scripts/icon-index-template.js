/* ==============================
  🎨 아이콘 중앙 관리 시스템
  자동 생성됨 - 직접 수정하지 마세요!
  스크립트: .\scripts\update-icons.ps1
  ============================== */

// 아이콘 경로 정의 (자동 생성됨)
export const iconPaths = {
{{ICON_PATHS}}
};

// 선택자 맵핑 (특수한 경우만 정의, 나머지는 기본 선택자 사용)
export const iconSelectors = {
  default: '.content.icon:not(.pressed)',
  toggle: '.content.icon.pressed',
  contrast: '[data-icon="contrast"]',
  large: '[data-icon="large"]'
};

// 기본 선택자 생성 함수
export function getSelector(iconKey) {
  return iconSelectors[iconKey] || `[data-icon="${iconKey}"]`;
}

// 전체 경로 생성 함수
export function getIconPath(iconKey) {
  const filename = iconPaths[iconKey];
  if (!filename) {
    console.warn(`⚠️ Icon "${iconKey}" not found in iconPaths, using placeholder`);
    return 'src/assets/icons/placeholder.svg';
  }
  return `src/assets/icons/${filename}`;
}

// iconMap 생성 함수
export function createIconMap() {
  const map = {};
  
  // default는 placeholder로 매핑
  map['default'] = {
    path: getIconPath('placeholder'),
    selector: getSelector('default')
  };
  
  for (const [key, filename] of Object.entries(iconPaths)) {
    if (key === 'placeholder') continue; // default로 이미 추가됨
    
    map[key] = {
      path: getIconPath(key),
      selector: getSelector(key)
    };
  }
  
  return map;
}

// 폴백 아이콘
export const fallbackIcon = 'placeholder';

/* ==============================
  📊 메타데이터
  ============================== */
// 총 아이콘 개수: {{ICON_COUNT}}
// 생성 일시: {{TIMESTAMP}}
// 아이콘 목록: {{ICON_NAMES}}

