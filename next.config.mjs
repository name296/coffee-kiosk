import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GitHub Pages 프로젝트 사이트: /저장소명
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
  // 상대경로(images/...)가 항상 /coffee-kiosk/ 기준으로 풀리도록 (슬래시 없는 URL은 상대경로 깨짐)
  trailingSlash: true,
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
