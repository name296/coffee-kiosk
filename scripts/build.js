// 빌드 스크립트
// src/ 폴더를 dist/로 복사 + JS/CSS 번들링

import { build } from 'bun';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'fs';

const nodeEnv = process.env.NODE_ENV || 'production';

console.log('🏗️  Building...');
console.log(`   NODE_ENV: ${nodeEnv}`);

// 1. dist 폴더 초기화
try {
  rmSync('./dist', { recursive: true, force: true });
  console.log('🗑️  Cleaned dist folder');
} catch (error) {}

mkdirSync('./dist', { recursive: true });

// 2. 정적 자원 복사 (images, fonts, sounds)
console.log('📁 Copying static assets...');
cpSync('./src/images', './dist/images', { recursive: true });
cpSync('./src/fonts', './dist/fonts', { recursive: true });
cpSync('./src/sounds', './dist/sounds', { recursive: true });
cpSync('./src/SoundOnPressed.mp3', './dist/SoundOnPressed.mp3');
cpSync('./src/SoundNote.wav', './dist/SoundNote.wav');

// 3. JavaScript/CSS 빌드
console.log('📦 Building JavaScript and CSS...');
await build({
  entrypoints: ['./src/App.js'],
  outdir: './dist',
  target: 'browser',
  minify: true,
  sourcemap: 'external',
  define: {
    'process.env.NODE_ENV': JSON.stringify(nodeEnv)
  }
});

// 4. index.html 복사
console.log('📄 Copying index.html...');
const html = readFileSync('./src/index.html', 'utf8');
writeFileSync('./dist/index.html', html);

// 6. 404.html 생성 (SPA 라우팅)
console.log('📄 Creating 404.html...');
writeFileSync('./dist/404.html', html);

// 6. .nojekyll 파일 생성
writeFileSync('./dist/.nojekyll', '');

console.log('✅ Build complete!');
console.log('📦 Output: ./dist');
