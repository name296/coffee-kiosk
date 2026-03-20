import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GitHub Pages 프로젝트 사이트: /저장소명
 * - 워크플로에서 NEXT_PUBLIC_BASE_PATH를 주거나
 * - Actions에서는 GITHUB_REPOSITORY(자동)로 복구 (Bun/환경에 따라 PUBLIC이 누락되는 경우 대비)
 */
function resolveBasePathString() {
  const explicit = process.env.NEXT_PUBLIC_BASE_PATH?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.NEXT_OUTPUT_EXPORT === "1" && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split("/")[1];
    if (repo) return `/${repo.toLowerCase()}`;
  }
  return "";
}

const basePathStr = resolveBasePathString();
const basePath = basePathStr || undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT_EXPORT === "1" ? "export" : undefined,
  basePath,
  assetPrefix: basePath,
  // 클라이언트 번들의 publicAsset()과 동일 값 보장 (CI에서 PUBLIC 누락 시에도)
  env: {
    NEXT_PUBLIC_BASE_PATH: basePathStr,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;
