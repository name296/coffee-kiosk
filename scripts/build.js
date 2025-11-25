// 빌드 스크립트
// set-base-path.js를 먼저 실행하여 BASE_PATH와 NODE_ENV 설정
// 그 다음 bun build 실행 + 정적 파일 복사

import './set-base-path.js';
import { build } from 'bun';
import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

// set-base-path.js가 환경 변수를 설정했으므로, 그 값을 사용
const nodeEnv = process.env.NODE_ENV || 'production';
const basePath = process.env.BASE_PATH || '';

console.log('🏗️  Building for GitHub Pages...');
console.log(`   BASE_PATH: ${basePath || '(none)'}`);
console.log(`   NODE_ENV: ${nodeEnv}`);

// dist 폴더 초기화
try {
  rmSync('./dist', { recursive: true, force: true });
  console.log('🗑️  Cleaned dist folder');
} catch (error) {
  // 폴더가 없는 경우 무시
}

mkdirSync('./dist', { recursive: true });

// 1. JavaScript/CSS 빌드
console.log('📦 Building JavaScript and CSS...');
await build({
  entrypoints: ['./src/index.js'],
  outdir: './dist',
  target: 'browser',
  minify: true,
  sourcemap: 'external',
  define: {
    'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    'process.env.BASE_PATH': JSON.stringify(basePath)
  },
  external: ['/images/*', '/sound/*', '/fonts/*']
});

// 2. public 폴더 복사
console.log('📁 Copying public folder...');
cpSync('./public', './dist/public', { recursive: true });

// 3. fonts.css 경로 수정 (BASE_PATH 반영)
if (basePath) {
  console.log('🎨 Processing fonts.css...');
  let fontsCss = readFileSync('./dist/public/fonts.css', 'utf8');
  // /fonts/ → /coffee-kiosk/public/fonts/
  fontsCss = fontsCss.replace(/url\("\/fonts\//g, `url("${basePath}/public/fonts/`);
  writeFileSync('./dist/public/fonts.css', fontsCss);
}

// 4. index.html 복사 및 경로 수정
console.log('📄 Processing index.html...');
let html = readFileSync('./index.html', 'utf8');

// 경로를 BASE_PATH 포함하도록 수정
// basePath가 비어있으면 "/" 유지, 있으면 "/coffee-kiosk" prefix 추가
const publicPath = basePath ? `${basePath}/public/fonts.css` : '/public/fonts.css';
const cssPath = basePath ? `${basePath}/index.css` : '/index.css';
const jsPath = basePath ? `${basePath}/index.js` : '/index.js';

html = html.replace('./public/fonts.css', publicPath);
html = html.replace('./dist/index.css', cssPath);
html = html.replace('./dist/index.js', jsPath);

writeFileSync('./dist/index.html', html);

// 5. 404.html 생성 (SPA 라우팅을 위해 index.html과 동일)
console.log('📄 Creating 404.html for SPA routing...');
writeFileSync('./dist/404.html', html);

// 6. .nojekyll 파일 생성 (Jekyll 처리 방지)
console.log('📄 Creating .nojekyll...');
writeFileSync('./dist/.nojekyll', '');

console.log('✅ Build complete!');
console.log('📦 Output directory: ./dist');
console.log('🚀 Deploy the ./dist folder to GitHub Pages');

