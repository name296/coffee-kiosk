// ============================================================================
// 서버 환경 설정
// ============================================================================

import { z } from "zod";

// 기본값 상수 정의
const DEFAULTS = {
  PORT: "3000",
  ENTRY_FILE: "./src/App.js",
  HTML_ENTRY: "dist/index.html",
  BUNDLE_PUBLIC_PATH: "/dist",
  BUNDLE_OUTPUT_DIR: "./dist",
  ICONS_DIR: "./src/svg",
  BUILD_TARGET: "browser",
  BUILD_FORMAT: "esm",
};

// 환경 변수 스키마 정의
const envSchema = z.object({
  // 서버 설정
  PORT: z.string().regex(/^\d+$/).transform(Number).optional().default(DEFAULTS.PORT),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  
  // 파일 경로
  ENTRY_FILE: z.string().optional().default(DEFAULTS.ENTRY_FILE),
  HTML_ENTRY: z.string().optional().default(DEFAULTS.HTML_ENTRY),
  
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
}).passthrough();

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

const nodeEnv = env.NODE_ENV || "development";

export const config = {
  // 서버 설정
  port: env.PORT,
  
  // 파일 경로
  entryFile: env.ENTRY_FILE,
  htmlEntry: env.HTML_ENTRY,
  
  // 번들링 설정
  bundlePublicPath: env.BUNDLE_PUBLIC_PATH,
  bundleOutputDir: env.BUNDLE_OUTPUT_DIR,
  
  // 감시 설정
  watchedExtensions: env.WATCHED_EXTENSIONS ? env.WATCHED_EXTENSIONS.split(',') : [".js", ".jsx", ".ts", ".tsx", ".css"],
  iconsDir: env.ICONS_DIR,
  
  // 번들 옵션
  buildOptions: {
    target: env.BUILD_TARGET,
    format: env.BUILD_FORMAT,
    minify: env.BUILD_MINIFY ? env.BUILD_MINIFY === 'true' : true,
    sourcemap: env.BUILD_SOURCEMAP || "external",
    splitting: env.BUILD_SPLITTING === 'true' || false,
    define: {
      "process.env.NODE_ENV": JSON.stringify(nodeEnv)
    }
  }
};
