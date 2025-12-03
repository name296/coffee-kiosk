// 빌드 스크립트
// src/ 폴더를 dist/로 복사 + JS/CSS 번들링

import { build } from 'bun';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'fs';

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
// 존재하는 폴더/파일만 복사 (에러 방지)
console.log('📁 Copying static assets...');

// images 폴더 복사
if (existsSync('./src/images')) {
  cpSync('./src/images', './dist/images', { recursive: true });
  console.log('  ✅ Copied images folder');
} else {
  console.log('  ⚠️  images folder not found, skipping');
}

// fonts 폴더 복사
if (existsSync('./src/fonts')) {
  cpSync('./src/fonts', './dist/fonts', { recursive: true });
  console.log('  ✅ Copied fonts folder');
} else {
  console.log('  ⚠️  fonts folder not found, skipping');
}

// sounds 폴더 복사 (존재하는 경우에만)
if (existsSync('./src/sounds')) {
  cpSync('./src/sounds', './dist/sounds', { recursive: true });
  console.log('  ✅ Copied sounds folder');
} else {
  console.log('  ⚠️  sounds folder not found, skipping');
}

// 사운드 파일 복사 (개별 파일)
if (existsSync('./src/SoundOnPressed.mp3')) {
  cpSync('./src/SoundOnPressed.mp3', './dist/SoundOnPressed.mp3');
  console.log('  ✅ Copied SoundOnPressed.mp3');
}
if (existsSync('./src/SoundNote.wav')) {
  cpSync('./src/SoundNote.wav', './dist/SoundNote.wav');
  console.log('  ✅ Copied SoundNote.wav');
}

// 3. JavaScript/CSS 빌드
console.log('📦 Building JavaScript and CSS...');
try {
  const buildResult = await build({
    entrypoints: ['./src/App.js'],
    outdir: './dist',
    target: 'browser',
    minify: true,
    sourcemap: 'external',
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    }
  });

  if (!buildResult.success) {
    console.error('❌ Build failed!');
    console.error(buildResult.logs);
    process.exit(1);
  }
  console.log('  ✅ JavaScript and CSS built successfully');
} catch (error) {
  console.error('❌ Build error:', error);
  process.exit(1);
}

// 4. index.html 복사
console.log('📄 Copying index.html...');
if (!existsSync('./src/index.html')) {
  console.error('❌ Error: src/index.html not found!');
  process.exit(1);
}
const html = readFileSync('./src/index.html', 'utf8');
writeFileSync('./dist/index.html', html);
console.log('  ✅ Copied index.html');

// 5. 404.html 생성 (SPA 라우팅 지원)
console.log('📄 Creating 404.html...');
writeFileSync('./dist/404.html', html);
console.log('  ✅ Created 404.html');

// 6. .nojekyll 파일 생성 (Jekyll 처리 방지)
writeFileSync('./dist/.nojekyll', '');
console.log('  ✅ Created .nojekyll');

console.log('\n✅ Build complete!');
console.log('📦 Output: ./dist');
