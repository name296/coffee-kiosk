/* ==============================
  🎨 SVG → React 컴포넌트 자동 변환 스크립트
  SVG 파일을 감시하고 React 컴포넌트로 자동 변환
  ============================== */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 경로 설정
const svgDir = path.join(__dirname, '../src/assets/icons/');
const componentDir = path.join(__dirname, '../src/components/icons/');
const indexFile = path.join(componentDir, 'index.js');

// 컴포넌트 이름 변환 (kebab-case → PascalCase)
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// SVG 파일을 React 컴포넌트로 변환
function convertSvgToReact(svgContent, componentName) {
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
  // <path ... /> → <path ...></path>
  innerContent = innerContent.replace(/<([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)\s*\/\s*>/g, '<$1$2></$1>');

  // React DOM 속성 변환 (kebab-case → camelCase) - 먼저 변환
  // fill-rule → fillRule
  innerContent = innerContent.replace(/fill-rule=/gi, 'fillRule=');
  // clip-rule → clipRule
  innerContent = innerContent.replace(/clip-rule=/gi, 'clipRule=');
  // stroke-width → strokeWidth
  innerContent = innerContent.replace(/stroke-width=/gi, 'strokeWidth=');
  // stroke-linecap → strokeLinecap
  innerContent = innerContent.replace(/stroke-linecap=/gi, 'strokeLinecap=');
  // stroke-linejoin → strokeLinejoin
  innerContent = innerContent.replace(/stroke-linejoin=/gi, 'strokeLinejoin=');

  // path의 fill 속성을 currentColor로 변환
  let processedContent = innerContent
    .replace(/fill=["'](?!none)[^"']+["']/gi, 'fill="currentColor"')
    .replace(/fill=(?!["']none["'])[^\s>]+/gi, 'fill="currentColor"');
  
  // 들여쓰기 정리 (각 태그를 새 줄에, 단일 라인 SVG도 처리)
  processedContent = processedContent
    .replace(/>\s*</g, '>\n      <')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n      ');

  // React 컴포넌트 생성
  const componentCode = `import React from "react";

/**
 * ${componentName} 아이콘
 * 자동 생성됨 - 직접 수정하지 마세요!
 * 원본: src/assets/icons/${componentName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}.svg
 * 
 * 주의: span 없이 SVG만 반환합니다.
 * 필요시 사용하는 곳에서 span으로 감싸거나 직접 사용할 수 있습니다.
 */
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
);

export default ${componentName};
`;

  return componentCode;
}

// 단일 SVG 파일 처리
function processSvgFile(filePath) {
  const fileName = path.basename(filePath);
  if (!fileName.endsWith('.svg')) {
    return;
  }

  const iconName = fileName.replace('.svg', '');
  const componentName = toPascalCase(iconName) + 'Icon';
  const componentFileName = `${componentName}.jsx`;
  const componentPath = path.join(componentDir, componentFileName);

  try {
    // SVG 파일 읽기
    const svgContent = fs.readFileSync(filePath, 'utf8');
    
    // React 컴포넌트로 변환
    const componentCode = convertSvgToReact(svgContent, componentName);
    
    // 컴포넌트 파일 생성
    fs.writeFileSync(componentPath, componentCode, 'utf8');
    
    console.log(`✅ ${fileName} → ${componentFileName}`);
    return { iconName, componentName, componentFileName };
  } catch (error) {
    console.error(`❌ ${fileName} 변환 실패:`, error.message);
    return null;
  }
}

// 모든 SVG 파일 처리
function processAllSvgs() {
  console.log('🔍 SVG 파일 스캔 중...\n');
  
  // 컴포넌트 디렉토리 확인 및 생성
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  const files = fs.readdirSync(svgDir)
    .filter(f => f.endsWith('.svg'))
    .sort();

  const components = [];
  
  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    const result = processSvgFile(filePath);
    if (result) {
      components.push(result);
    }
  });

  // index.js 생성
  generateIndexFile(components);
  
  console.log(`\n✅ 총 ${components.length}개 컴포넌트 생성 완료!`);
}

// index.js 파일 생성
function generateIndexFile(components) {
  const exports = components
    .map(({ componentName, componentFileName }) => {
      return `export { default as ${componentName} } from './${componentFileName.replace('.jsx', '')}';`;
    })
    .join('\n');

  const content = `/* ==============================
  🎨 아이콘 컴포넌트 인덱스
  자동 생성됨 - 직접 수정하지 마세요!
  스크립트: bun run scripts/svg-to-react.js
  ============================== */

${exports}

/* ==============================
  📊 메타데이터
  ============================== */
// 총 컴포넌트 개수: ${components.length}
// 생성 일시: ${new Date().toISOString()}
`;

  fs.writeFileSync(indexFile, content, 'utf8');
  console.log(`\n📝 index.js 생성 완료!`);
}

// 감시 모드 (Bun 사용)
function watchMode() {
  console.log('👀 SVG 파일 감시 모드 시작...\n');
  
  // 초기 처리
  processAllSvgs();

  // Bun의 파일 감시 사용
  const watcher = Bun.file(svgDir).watch();
  
  watcher.on('change', (event, filename) => {
    if (!filename || !filename.endsWith('.svg')) {
      return;
    }

    const filePath = path.join(svgDir, filename);
    
    if (event === 'rename') {
      // 파일이 삭제되었는지 확인
      if (!fs.existsSync(filePath)) {
        console.log(`\n🗑️  ${filename} 삭제됨`);
        // 컴포넌트 파일도 삭제
        const iconName = filename.replace('.svg', '');
        const componentName = toPascalCase(iconName) + 'Icon';
        const componentFileName = `${componentName}.jsx`;
        const componentPath = path.join(componentDir, componentFileName);
        
        if (fs.existsSync(componentPath)) {
          fs.unlinkSync(componentPath);
          console.log(`   → ${componentFileName} 삭제됨`);
        }
        
        // index.js 재생성
        const files = fs.readdirSync(svgDir)
          .filter(f => f.endsWith('.svg'))
          .sort();
        const components = files.map(file => {
          const iconName = file.replace('.svg', '');
          const componentName = toPascalCase(iconName) + 'Icon';
          return {
            iconName,
            componentName,
            componentFileName: `${componentName}.jsx`
          };
        });
        generateIndexFile(components);
      } else {
        console.log(`\n📝 ${filename} 변경됨`);
        processSvgFile(filePath);
        // index.js 재생성
        const files = fs.readdirSync(svgDir)
          .filter(f => f.endsWith('.svg'))
          .sort();
        const components = files.map(file => {
          const iconName = file.replace('.svg', '');
          const componentName = toPascalCase(iconName) + 'Icon';
          return {
            iconName,
            componentName,
            componentFileName: `${componentName}.jsx`
          };
        });
        generateIndexFile(components);
      }
    } else if (event === 'change') {
      console.log(`\n📝 ${filename} 변경됨`);
      processSvgFile(filePath);
      // index.js 재생성
      const files = fs.readdirSync(svgDir)
        .filter(f => f.endsWith('.svg'))
        .sort();
      const components = files.map(file => {
        const iconName = file.replace('.svg', '');
        const componentName = toPascalCase(iconName) + 'Icon';
        return {
          iconName,
          componentName,
          componentFileName: `${componentName}.jsx`
        };
      });
      generateIndexFile(components);
    }
  });

  console.log('\n✨ 감시 모드 실행 중... (Ctrl+C로 종료)');
}

// 메인 실행
const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch') || args.includes('-w');

if (isWatchMode) {
  watchMode();
} else {
  processAllSvgs();
}

