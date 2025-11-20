import { build, serve } from "bun";
import { watch, existsSync } from "fs";
import { config } from "./config.js";

// ---------------------------------------------------------------------------
// 모드 설정
// ---------------------------------------------------------------------------
// BASE_PATH를 기준으로 개발/배포 구분
const isPreview = config.isProduction;
const MODE = isPreview ? "production" : "dev";

console.log(`🚀 Starting Bun server in ${MODE.toUpperCase()} mode`);
if (config.isProduction) {
  console.log(`📦 Production mode: serving pre-built files from ./dist`);
  console.log(`   Run 'bun run build' first if assets are missing.`);
} else {
  console.log(`⚙️  Development mode: bundler + watcher active`);
}

// ---------------------------------------------------------------------------
// 자동 의존성 설치
// ---------------------------------------------------------------------------
const ensureDependencies = async () => {
  if (!existsSync("./node_modules")) {
    console.log("📦 node_modules not found. Installing dependencies...");
    try {
      const proc = Bun.spawn(["bun", "install"], {
        stdout: "inherit",
        stderr: "inherit",
      });
      const exitCode = await proc.exited;
      if (exitCode === 0) {
        console.log("✅ Dependencies installed successfully!");
      } else {
        console.error(`❌ Installation failed with code ${exitCode}`);
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Failed to install dependencies:", error);
      process.exit(1);
    }
  }
};

await ensureDependencies();

// ---------------------------------------------------------------------------
// 번들링 파이프라인
// ---------------------------------------------------------------------------
let isBuilding = false;

const bundleOnce = async (tag = "manual") => {
  if (isPreview) {
    console.log("ℹ️ Preview 모드에서는 번들 작업을 건너뜁니다. 먼저 'bun run build'를 실행하세요.");
    return;
  }

  if (isBuilding) return;
  isBuilding = true;

  console.log(`📦 Bundling with Bun (${tag})...`);
  try {
    const result = await build({
      entrypoints: [config.entryFile],
      outdir: config.bundleOutputDir,
      ...config.buildOptions,
    });

    if (result.success) {
      console.log("✅ Build successful!");
    } else {
      console.error("❌ Build failed:", result.logs);
    }
  } catch (error) {
    console.error("❌ build() threw an error:", error);
  } finally {
    isBuilding = false;
  }
};

if (!isPreview) {
  await bundleOnce("initial");
}

// ---------------------------------------------------------------------------
// 파일 감시
// ---------------------------------------------------------------------------
const startWatcher = () => {
  if (isPreview) return;

  try {
    watch("./src", { recursive: true }, async (_, filename) => {
      if (!filename) return;
      if (!config.watchedExtensions.some((ext) => filename.endsWith(ext))) return;
      console.log(`🔄 File changed: ${filename}, rebuilding...`);
      await bundleOnce("watch");
    });
    console.log("👀 Watching for file changes...");
  } catch (error) {
    console.error("❌ Failed to start file watcher:", error);
  }
};

startWatcher();

// ---------------------------------------------------------------------------
// 아이콘 인덱스 자동 갱신
// ---------------------------------------------------------------------------
let isUpdatingIcons = false;

const runIconIndexer = async () => {
  if (isPreview || isUpdatingIcons) return;
  isUpdatingIcons = true;

  console.log("🎨 Regenerating icon index...");
  
  // spawn으로 비동기 실행 (감시 블록 방지)
  const proc = Bun.spawn(["bun", "run", "scripts/update-icons.js"], {
    stdout: "inherit",
    stderr: "inherit",
  });
  
  // 메인 흐름을 막지 않도록 별도로 처리
  proc.exited.then((exitCode) => {
    if (exitCode === 0) {
      console.log("✅ Icon index updated.");
    } else {
      console.error(`❌ Icon index script failed with code ${exitCode}.`);
    }
    isUpdatingIcons = false;
  }).catch((error) => {
    console.error("❌ Icon index script threw an error:", error);
    isUpdatingIcons = false;
  });
};

const startIconWatcher = () => {
  if (isPreview) return;

  try {
    watch(config.iconsDir, { recursive: true }, async (_, filename) => {
      if (!filename?.endsWith(".svg")) return;
      console.log(`🎨 Icon file changed: ${filename}`);
      await runIconIndexer();
    });

    console.log("👀 Watching icon assets for changes...");
  } catch (error) {
    console.error("❌ Failed to start icon watcher:", error);
  }
};

await runIconIndexer();
startIconWatcher();

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------
// HTML을 그대로 사용 (rewriteHtml 제거)

const serveStatic = async (pathname) => {
  // public/ 디렉터리 (폰트, 이미지 등)
  if (pathname.startsWith('/public/')) {
    const file = Bun.file(`.${pathname}`);
    if (await file.exists()) {
      return new Response(file);
    }
  }
  
  // src/ 디렉터리 (아이콘 등)
  if (pathname.startsWith('/src/')) {
    const file = Bun.file(`.${pathname}`);
    if (await file.exists()) {
      return new Response(file);
    }
  }
  
  // 기존 STATIC_PREFIXES, STATIC_FILES 처리
  if (config.staticFiles.includes(pathname) || config.staticPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    const file = Bun.file(`public${pathname}`);
    if (await file.exists()) {
      return new Response(file);
    }
  }
  
  return null;
};

const serveBundleAsset = async (pathname) => {
  if (!pathname.startsWith(`${config.bundlePublicPath}/`)) return null;
  const filePath = pathname.slice(1); // remove leading slash
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = {};
  if (filePath.endsWith(".css")) headers["Content-Type"] = "text/css";
  if (filePath.endsWith(".js")) headers["Content-Type"] = "application/javascript";

  return new Response(file, { headers });
};

// ---------------------------------------------------------------------------
// HTTP 서버
// ---------------------------------------------------------------------------
const server = serve({
  port: config.port,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;

    if (pathname === "/" || pathname === "/index.html") {
      const htmlFile = Bun.file(config.htmlEntry);
      if (!(await htmlFile.exists())) {
        return new Response("index.html not found", { status: 500 });
      }
      const html = await htmlFile.text();
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    const staticResponse = await serveStatic(pathname);
    if (staticResponse) return staticResponse;

    const bundleResponse = await serveBundleAsset(pathname);
    if (bundleResponse) return bundleResponse;

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🌐 Server running at http://localhost:${server.port}`);