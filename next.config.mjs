import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 배포 시에만 정적 export (환경 변수로 제어)
  output: process.env.NEXT_OUTPUT_EXPORT === "1" ? "export" : undefined,
  // username.github.io/저장소명/ — 자산·라우트가 저장소 경로 아래에 있도록 함
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
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
