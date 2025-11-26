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
  entrypoints: ['./src/App.js'],
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

// 2. public 폴더를 dist/public으로 복사
console.log('📁 Copying public folder to dist/public...');
cpSync('./public', './dist/public', { recursive: true });

// 3. fonts.css 경로 수정 (BASE_PATH 반영)
if (basePath) {
  console.log('🎨 Processing fonts.css...');
  let fontsCss = readFileSync('./dist/public/fonts.css', 'utf8');
  // /fonts/ → /coffee-kiosk/public/fonts/
  fontsCss = fontsCss.replace(/url\("\/fonts\//g, `url("${basePath}/public/fonts/`);
  writeFileSync('./dist/public/fonts.css', fontsCss);
}

// 4. index.html 빌드 시점에 생성
console.log('📄 Generating index.html...');
// dist 폴더 안에 있으므로 상대 경로 사용
// public 폴더는 dist/public으로 복사되므로 ./public/fonts.css
// App.css, App.js는 dist 루트에 있으므로 ./App.css, ./App.js
const fontsPath = './public/fonts.css';
const cssPath = './App.css';
const jsPath = './App.js';

const html = `<!DOCTYPE html>
<html lang="en" oncontextmenu="return false;">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>coffee-kiosk</title>
    <link rel="stylesheet" href="${fontsPath}" />
    <link rel="stylesheet" href="${cssPath}" />
  </head>
  <body>
    <script type="module" src="${jsPath}"></script>
  </body>
</html>`;

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

