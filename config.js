// ---------------------------------------------------------------------------
// 서버 환경 설정
// ---------------------------------------------------------------------------

import { z } from "zod";
import { existsSync } from "fs";

// 기본값 상수 정의
const DEFAULTS = {
  PORT: "3000",
  ENTRY_FILE: "./src/index.js",
  HTML_ENTRY: "index.html",
  BUNDLE_PUBLIC_PATH: "/dist",
  BUNDLE_OUTPUT_DIR: "./dist",
  ICONS_DIR: "./src/assets/icons",
  BUILD_TARGET: "browser",
  BUILD_FORMAT: "esm",
};

// 환경 변수 스키마 정의
const envSchema = z.object({
  // 서버 설정
  PORT: z.string().regex(/^\d+$/).transform(Number).optional().default(DEFAULTS.PORT),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  
  // URL 설정
  BASE_PATH: z.string().optional(),
  
  // 파일 경로
  ENTRY_FILE: z.string().optional().default(DEFAULTS.ENTRY_FILE),
  HTML_ENTRY: z.string().optional().default(DEFAULTS.HTML_ENTRY),
  HTML_PLACEHOLDER: z.string().optional(),
  
  // 정적 파일 설정
  STATIC_PREFIXES: z.string().optional(),
  STATIC_FILES: z.string().optional(),
  
  // 번들링 설정
  BUNDLE_PUBLIC_PATH: z.string().optional().default(DEFAULTS.BUNDLE_PUBLIC_PATH),
  BUNDLE_OUTPUT_DIR: z.string().optional().default(DEFAULTS.BUNDLE_OUTPUT_DIR),
  
  // 감시 설정
  WATCHED_EXTENSIONS: z.string().optional(),
  ICONS_DIR: z.string().optional().default(DEFAULTS.ICONS_DIR),
  
  // 빌드 옵션
  BUILD_TARGET: z.string().optional().default(DEFAULTS.BUILD_TARGET),
  BUILD_FORMAT: z.string().optional().default(DEFAULTS.BUILD_FORMAT),
  BUILD_MINIFY: z.string().optional(),
  BUILD_SOURCEMAP: z.string().optional(),
  BUILD_SPLITTING: z.string().optional(),
  BUILD_EXTERNAL: z.string().optional(),
}).passthrough(); // 알 수 없는 환경 변수도 허용

// 환경 변수 검증 및 파싱
let env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ 환경 변수 검증 실패:");
    error.errors.forEach((err) => {
      console.error(`   - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// BASE_PATH 설정 (개발/배포 모두 동일하게 처리)
// BASE_PATH가 없으면 빈 문자열 (루트), 있으면 해당 경로 사용
// 서버는 항상 실시간 번들링 모드로 동작
const basename = env.BASE_PATH || "";

// NODE_ENV는 빌드 시 번들러에 주입
const nodeEnv = env.NODE_ENV || "development";

export const config = {
  // 서버 설정
  port: env.PORT,
  
  // URL 설정
  // BASE_PATH 환경 변수로 명시적으로 설정 (빌드 스크립트나 CI/CD에서 주입)
  // 예: BASE_PATH=/coffee-kiosk npm start
  basename,
  
  // 파일 경로
  entryFile: env.ENTRY_FILE,
  htmlEntry: env.HTML_ENTRY,
  htmlPlaceholder: env.HTML_PLACEHOLDER || '<script type="module" src="/src/index.js"></script>',
  
  // 정적 파일 설정
  staticPrefixes: env.STATIC_PREFIXES ? env.STATIC_PREFIXES.split(',') : ["/images/", "/sound/"],
  staticFiles: env.STATIC_FILES ? env.STATIC_FILES.split(',') : ["/menu_data.json"],
  
  // 번들링 설정
  bundlePublicPath: env.BUNDLE_PUBLIC_PATH,
  bundleOutputDir: env.BUNDLE_OUTPUT_DIR,
  
  // 감시 설정
  watchedExtensions: env.WATCHED_EXTENSIONS ? env.WATCHED_EXTENSIONS.split(',') : [".js", ".jsx", ".ts", ".tsx", ".css"],
  iconsDir: env.ICONS_DIR,
  
  // 번들 옵션 (배포 기준으로 빌드)
  buildOptions: {
    target: env.BUILD_TARGET,
    format: env.BUILD_FORMAT,
    minify: env.BUILD_MINIFY ? env.BUILD_MINIFY === 'true' : true,
    sourcemap: env.BUILD_SOURCEMAP || "external",
    splitting: env.BUILD_SPLITTING === 'true' || false,
    external: env.BUILD_EXTERNAL ? env.BUILD_EXTERNAL.split(',') : ["/images/*", "/sound/*", "/fonts/*"],
    define: {
      "process.env.NODE_ENV": JSON.stringify(nodeEnv)
    }
  }
};

