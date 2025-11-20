// 빌드 스크립트
// set-base-path.js를 먼저 실행하여 BASE_PATH와 NODE_ENV 설정
// 그 다음 bun build 실행

import './set-base-path.js';

// set-base-path.js가 환경 변수를 설정했으므로, 그 값을 사용
const nodeEnv = process.env.NODE_ENV || 'production';
const basePath = process.env.BASE_PATH || '';

// bun build API 직접 사용 (프로세스 체이닝 제거)
import { build } from 'bun';

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

