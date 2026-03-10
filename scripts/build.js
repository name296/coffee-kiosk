// 빌드 스크립트
// src/ 폴더를 dist/로 복사 + JS/CSS 번들링

import { build } from 'bun';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';

const nodeEnv = process.env.NODE_ENV || 'production';

const resolveAliasPath = (basePath, aliasSuffix) => {
  const resolvedBase = resolve(process.cwd(), basePath, aliasSuffix);
  const fileCandidates = [
    resolvedBase,
    `${resolvedBase}.js`,
    `${resolvedBase}.jsx`,
    `${resolvedBase}.ts`,
    `${resolvedBase}.tsx`,
  ];

  for (const candidate of fileCandidates) {
    if (existsSync(candidate) && !statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  if (existsSync(resolvedBase) && statSync(resolvedBase).isDirectory()) {
    const indexCandidates = ['index.js', 'index.jsx', 'index.ts', 'index.tsx'];
    for (const indexFile of indexCandidates) {
      const indexPath = resolve(resolvedBase, indexFile);
      if (existsSync(indexPath)) {
        return indexPath;
      }
    }
  }

  return resolvedBase;
};

const aliasPlugin = {
  name: 'alias',
  setup(builder) {
    const aliases = [
      { prefix: '@shared', path: 'src/shared' },
      { prefix: '@processes', path: 'src/processes' },
      { prefix: '@components', path: 'src/components' },
      { prefix: '@modals', path: 'src/modals' },
    ];

    const SHARED_SUBPATHS = ['constants', 'contexts', 'hooks', 'initializers', 'utils'];
    aliases.forEach((aliasConfig) => {
      const filter = new RegExp(`^${aliasConfig.prefix}(\\/.*)?$`);
      builder.onResolve({ filter }, (args) => {
        const suffix = args.path.slice(aliasConfig.prefix.length);
        const cleanSuffix = suffix.startsWith('/') ? suffix.slice(1) : suffix;
        if (aliasConfig.prefix === '@shared' && !cleanSuffix) {
          return { path: resolve(process.cwd(), 'src/index.js') };
        }
        const basePath =
          aliasConfig.prefix === '@shared' && SHARED_SUBPATHS.includes(cleanSuffix)
            ? 'src'
            : aliasConfig.path;
        const suffixPath =
          aliasConfig.prefix === '@shared' && SHARED_SUBPATHS.includes(cleanSuffix)
            ? cleanSuffix
            : cleanSuffix;
        return { path: resolveAliasPath(basePath, suffixPath) };
      });
    });
  },
};

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
if (existsSync('./src/Favicon.png')) {
  cpSync('./src/Favicon.png', './dist/Favicon.png');
  console.log('  ✅ Copied Favicon.png');
}

// 3. JavaScript/CSS 빌드
console.log('📦 Building JavaScript and CSS...');
try {
  const buildResult = await build({
    entrypoints: ['./src/App.js'],
    outdir: './dist',
    target: 'browser',
    minify: false, // CSS 미니파이 시 unicode-range 등 깨짐 방지
    sourcemap: 'external',
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    },
    alias: {
      '@components': resolve(process.cwd(), 'src/components'),
      '@modals': resolve(process.cwd(), 'src/modals'),
      '@processes': resolve(process.cwd(), 'src/processes'),
      '@shared': resolve(process.cwd(), 'src/index.js'),
    },
    plugins: [aliasPlugin],
  });

  if (!buildResult.success) {
    console.error('❌ Build failed!');
    console.error(buildResult.logs);
    process.exit(1);
  }

  const cssPath = resolve(process.cwd(), 'dist', 'App.css');
  if (existsSync(cssPath)) {
    let css = readFileSync(cssPath, 'utf8');
    css = css
      .replace(/\s*U\s*\+\s*/g, 'U+')
      .replace(/unicode-range:\s*([^;]+);/g, (_, value) => {
        const pad = (h) => (h.length >= 4 ? h : h.padStart(4, '0'));
        const fixed = value.split(',').map((part) => {
          part = part.trim();
          const m = part.match(/U\+?([0-9A-Fa-f]+)-?([0-9A-Fa-f]*)/);
          if (!m) return part;
          const [, start, end] = m;
          if (start === '4' && end === '9FFF') return 'U+4E00-9FFF';
          return 'U+' + pad(start) + (end ? '-' + pad(end) : '');
        }).join(', ');
        return `unicode-range: ${fixed};`;
      });
    writeFileSync(cssPath, css);
    console.log('  ✅ CSS unicode-range 복구');
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
