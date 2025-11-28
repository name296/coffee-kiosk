import { build, serve } from "bun";
import { watch, existsSync, cpSync, mkdirSync, rmSync } from "fs";
import { config } from "./config.js";

// ============================================================================
// 서버 모드 설정
// ============================================================================
console.log(`🚀 Starting Bun development server`);
console.log(`⚙️  Bundler + watcher active`);
console.log(`   Access at: http://localhost:${config.port}/`);

// ============================================================================
// 자동 의존성 설치
// ============================================================================
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

// ============================================================================
// 개발 환경 초기 설정 (dist 폴더 생성 + 정적 파일 복사)
// ============================================================================
const setupDevDist = () => {
  try {
    mkdirSync("./dist", { recursive: true });
    
    // 정적 파일들 복사 (images, fonts, sounds)
    if (existsSync("./src/images")) {
      cpSync("./src/images", "./dist/images", { recursive: true });
    }
    if (existsSync("./src/fonts")) {
      cpSync("./src/fonts", "./dist/fonts", { recursive: true });
    }
    if (existsSync("./src/sounds")) {
      cpSync("./src/sounds", "./dist/sounds", { recursive: true });
    }
    
    // index.html 복사
    if (existsSync("./src/index.html")) {
      cpSync("./src/index.html", "./dist/index.html");
    }
    
    console.log("📁 Static files copied to dist/");
  } catch (error) {
    console.error("⚠️  Failed to setup dev dist:", error);
  }
};

setupDevDist();

// ============================================================================
// 번들링 파이프라인
// ============================================================================
let isBuilding = false;

// dist 폴더 삭제 확인 대기
const waitForDelete = async (path, maxRetries = 10) => {
  for (let i = 0; i < maxRetries; i++) {
    if (!existsSync(path)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return !existsSync(path);
};

const bundleOnce = async (tag = "manual") => {
  if (isBuilding) return;
  isBuilding = true;

  console.log(`📦 Bundling with Bun (${tag})...`);
  try {
    // 빌드 전 dist 폴더 정리
    if (existsSync("./dist")) {
      console.log("🗑️  Cleaning dist folder...");
      rmSync("./dist", { recursive: true, force: true });
      
      // 삭제 완료 확인
      const deleted = await waitForDelete("./dist");
      if (deleted) {
        console.log("✅ dist folder cleaned");
      } else {
        console.warn("⚠️  dist folder may not be fully deleted");
      }
    }
    
    // 정적 파일 복사
    setupDevDist();
    
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

// 초기 번들링 실행
await bundleOnce("initial");

// ============================================================================
// 파일 감시
// ============================================================================
const startWatcher = () => {
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

// ============================================================================
// 아이콘 인덱스 자동 갱신
// ============================================================================
let isUpdatingIcons = false;

const runIconIndexer = async () => {
  if (isUpdatingIcons) return;
  isUpdatingIcons = true;

  console.log("🎨 Regenerating icon index...");
  
  const proc = Bun.spawn(["bun", "run", "scripts/svg-to-react.js"], {
    stdout: "inherit",
    stderr: "inherit",
  });
  
  proc.exited
    .then((exitCode) => {
      if (exitCode === 0) {
        console.log("✅ Icon index updated.");
      } else {
        console.error(`❌ Icon index script failed with code ${exitCode}.`);
      }
      isUpdatingIcons = false;
    })
    .catch((error) => {
      console.error("❌ Icon index script threw an error:", error);
      isUpdatingIcons = false;
    });
};

const startIconWatcher = () => {
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

// ============================================================================
// 헬퍼 함수
// ============================================================================
const serveStatic = async (pathname) => {
  // dist/ 폴더에서 정적 파일 서빙 (Bun이 MIME 타입 자동 감지)
  const file = Bun.file(`./dist${pathname}`);
  if (await file.exists()) {
    return new Response(file);
  }
  return null;
};

// ============================================================================
// HTTP 서버
// ============================================================================
const server = serve({
  port: config.port,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;

    // HTML 서빙: / 또는 /index.html
    if (pathname === "/" || pathname === "/index.html") {
      const htmlFile = Bun.file(config.htmlEntry);
      if (!(await htmlFile.exists())) {
        return new Response("index.html not found", { status: 500 });
      }
      return new Response(htmlFile, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 정적 파일 서빙
    const staticResponse = await serveStatic(pathname);
    if (staticResponse) return staticResponse;

    // SPA Fallback: 다른 모든 경로는 index.html로 (클라이언트 라우팅)
    const htmlFile = Bun.file(config.htmlEntry);
    if (await htmlFile.exists()) {
      return new Response(htmlFile, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🌐 Server running at http://localhost:${server.port}`);
