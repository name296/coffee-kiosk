/* ==============================
  🎨 SVG → 통합 React 컴포넌트 자동 변환 스크립트
  SVG 파일들을 하나의 Icon.js 컴포넌트로 통합 생성 (개별 파일 없음)
  ============================== */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 경로 설정
const svgDir = path.join(__dirname, '../src/svg/');  // 모든 SVG
const srcDir = path.join(__dirname, '../src/');
const iconFile = path.join(srcDir, 'Icon.js');

// 컴포넌트 이름 변환 (kebab-case → PascalCase)
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// SVG 파일을 React 컴포넌트 코드로 변환 (인라인 정의)
function convertSvgToReactComponent(svgContent, componentName) {
  // SVG 내용 정리
  let cleanedSvg = svgContent
    .replace(/<\?xml[^>]*>/gi, '') // XML 선언 제거
    .replace(/<!--[\s\S]*?-->/g, '') // 주석 제거
    .trim();

  // SVG 태그에서 속성 추출
  const svgMatch = cleanedSvg.match(/<svg([^>]*)>/i);
  if (!svgMatch) {
    throw new Error('Invalid SVG format');
  }

  const svgAttributes = svgMatch[1];
  
  // width, height, viewBox 추출
  const widthMatch = svgAttributes.match(/width=["']([^"']+)["']/i);
  const heightMatch = svgAttributes.match(/height=["']([^"']+)["']/i);
  const viewBoxMatch = svgAttributes.match(/viewBox=["']([^"']+)["']/i);
  
  const width = widthMatch ? widthMatch[1] : '24';
  const height = heightMatch ? heightMatch[1] : '24';
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${width} ${height}`;

  // SVG 내부 내용 추출
  let innerContent = cleanedSvg
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>/i, '')
    .trim();

  // self-closing 태그를 먼저 닫는 태그로 변환 (JSX 호환)
  innerContent = innerContent.replace(/<([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)\s*\/\s*>/g, '<$1$2></$1>');

  // React DOM 속성 변환 (kebab-case → camelCase)
  innerContent = innerContent.replace(/fill-rule=/gi, 'fillRule=');
  innerContent = innerContent.replace(/clip-rule=/gi, 'clipRule=');
  innerContent = innerContent.replace(/clip-path=/gi, 'clipPath=');
  innerContent = innerContent.replace(/stroke-width=/gi, 'strokeWidth=');
  innerContent = innerContent.replace(/stroke-linecap=/gi, 'strokeLinecap=');
  innerContent = innerContent.replace(/stroke-linejoin=/gi, 'strokeLinejoin=');
  innerContent = innerContent.replace(/stroke-dasharray=/gi, 'strokeDasharray=');
  innerContent = innerContent.replace(/stroke-dashoffset=/gi, 'strokeDashoffset=');
  innerContent = innerContent.replace(/stroke-miterlimit=/gi, 'strokeMiterlimit=');
  innerContent = innerContent.replace(/stroke-opacity=/gi, 'strokeOpacity=');
  innerContent = innerContent.replace(/fill-opacity=/gi, 'fillOpacity=');
  innerContent = innerContent.replace(/stop-color=/gi, 'stopColor=');
  innerContent = innerContent.replace(/stop-opacity=/gi, 'stopOpacity=');
  innerContent = innerContent.replace(/font-family=/gi, 'fontFamily=');
  innerContent = innerContent.replace(/font-size=/gi, 'fontSize=');
  innerContent = innerContent.replace(/font-weight=/gi, 'fontWeight=');
  innerContent = innerContent.replace(/text-anchor=/gi, 'textAnchor=');
  innerContent = innerContent.replace(/dominant-baseline=/gi, 'dominantBaseline=');
  innerContent = innerContent.replace(/alignment-baseline=/gi, 'alignmentBaseline=');
  innerContent = innerContent.replace(/xlink:href=/gi, 'xlinkHref=');
  innerContent = innerContent.replace(/xmlns:xlink=/gi, 'xmlnsXlink=');
  
  // style 문자열을 React 객체로 변환
  // style="mask-type:alpha" → style={{maskType: "alpha"}}
  innerContent = innerContent.replace(/style="([^"]+)"/gi, (match, styleString) => {
    const styleObj = styleString.split(';')
      .filter(s => s.trim())
      .map(s => {
        const [key, value] = s.split(':').map(p => p.trim());
        // kebab-case를 camelCase로 변환
        const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        return `${camelKey}: "${value}"`;
      })
      .join(', ');
    return `style={{${styleObj}}}`;
  });

  // path의 fill 속성을 currentColor로 변환
  let processedContent = innerContent
    .replace(/fill=["'](?!none)[^"']+["']/gi, 'fill="currentColor"')
    .replace(/fill=(?!["']none["'])[^\s>]+/gi, 'fill="currentColor"');
  
  // 들여쓰기 정리
  processedContent = processedContent
    .replace(/>\s*</g, '>\n      <')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n      ');

  // React 컴포넌트 코드 반환 (인라인 정의)
  return `// ${componentName} 아이콘
const ${componentName} = (props) => (
  <svg
    width="${width}"
    height="${height}"
    viewBox="${viewBox}"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    ${processedContent}
  </svg>
);`;
}

// 모든 SVG 파일을 읽어서 통합 Icon.js 생성
function generateIconComponent() {
  console.log('🔍 SVG 파일 스캔 중...\n');
  
  // src 디렉토리 확인
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  const iconComponents = [];
  const iconMapEntries = [];

  // 메인 SVG 폴더 처리
  const files = fs.readdirSync(svgDir)
    .filter(f => f.endsWith('.svg'))
    .sort();

  console.log(`📁 ${svgDir} (${files.length}개)\n`);
  
  files.forEach(file => {
    const iconName = file.replace('.svg', '');
    const componentName = toPascalCase(iconName) + 'Icon';
    const filePath = path.join(svgDir, file);

    try {
      const svgContent = fs.readFileSync(filePath, 'utf8');
      const componentCode = convertSvgToReactComponent(svgContent, componentName);
      
      iconComponents.push({ iconName, componentName, componentCode });
      iconMapEntries.push(`  '${iconName}': ${componentName}`);
      console.log(`✅ ${file} → ${componentName}`);
    } catch (error) {
      console.error(`❌ ${file} 변환 실패:`, error.message);
}
  });


  // Icon.jsx 파일 생성 (모든 컴포넌트를 인라인으로 정의)
  const componentDefinitions = iconComponents
    .map(({ componentCode }) => componentCode)
    .join('\n\n');

  const iconMap = `// 아이콘 맵
const iconMap = {
${iconMapEntries.join(',\n')}
};`;

  const iconComponentCode = `// 통합 아이콘 컴포넌트
const Icon = ({ name, ...props }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(\`⚠️ Icon "\${name}" not found, using placeholder\`);
    return <PlaceholderIcon {...props} />;
  }
  
  return <IconComponent {...props} />;
};

export default Icon;`;

  // named exports 생성
  const namedExports = iconComponents
    .map(({ componentName }) => componentName)
    .join(',\n  ');

  const content = `import React from "react";

/**
 * 통합 아이콘 컴포넌트
 * 자동 생성됨 - 직접 수정하지 마세요!
 * 스크립트: bun run scripts/svg-to-react.js
 * 
 * 사용법:
 *   import Icon from './components/Icon';
 *   <Icon name="toggle" />
 *   
 *   // 또는 개별 아이콘 import
 *   import { ToggleIcon } from './components/Icon';
 */

// 모든 아이콘 컴포넌트 정의 (인라인)
${componentDefinitions}

${iconMap}

${iconComponentCode}

// Named exports (개별 아이콘)
export {
  ${namedExports}
};
`;

  fs.writeFileSync(iconFile, content, 'utf8');
  console.log(`\n📝 Icon.js 생성 완료! (${iconComponents.length}개 아이콘)`);
}

// 전체 SVG 파일 수 계산
function getTotalSvgCount() {
  if (!fs.existsSync(svgDir)) return 0;
  return fs.readdirSync(svgDir).filter(f => f.endsWith('.svg')).length;
}

// 감시 모드
function watchMode() {
  console.log('👀 SVG 파일 감시 모드 시작...\n');
  
  // 초기 처리
  generateIconComponent();

  // 파일 감시 (간단한 polling 방식)
  setInterval(() => {
    const currentCount = getTotalSvgCount();
    const lastCount = watchMode.lastCount || 0;
    
    if (currentCount !== lastCount) {
      console.log('\n📝 SVG 파일 변경 감지, 재생성 중...');
      generateIconComponent();
      watchMode.lastCount = currentCount;
    }
  }, 1000);

  console.log('\n✨ 감시 모드 실행 중... (Ctrl+C로 종료)');
}

// 메인 실행
const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch') || args.includes('-w');

if (isWatchMode) {
  watchMode();
} else {
  generateIconComponent();
  console.log(`\n✅ 총 ${getTotalSvgCount()}개 아이콘 처리 완료!`);
}
