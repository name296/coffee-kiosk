import { build, serve } from "bun";
import { watch } from "fs";
import { updateIconIndex } from "./scripts/update-icons.js";

// ---------------------------------------------------------------------------
// 환경 설정
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT ?? 3000);
const ENTRY_FILE = "./src/index.js";
const HTML_ENTRY = "index.html";
const HTML_PLACEHOLDER = '<script type="module" src="/src/index.js"></script>';
const STATIC_PREFIXES = ["/images/", "/sound/"];
const STATIC_FILES = ["/menu_data.json"];
const WATCHED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".css"];
const ICONS_DIR = "./src/assets/icons";

const args = new Set(process.argv.slice(2));
const MODE = args.has("--preview") ? "preview" : "dev";
const isPreview = MODE === "preview";
const bundlePublicPath = "/dist";
const bundleOutputDir = "./dist";

console.log(`🚀 Starting Bun server in ${MODE.toUpperCase()} mode`);

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
      entrypoints: [ENTRY_FILE],
      outdir: bundleOutputDir,
      target: "browser",
      format: "esm",
      minify: false,
      sourcemap: "inline",
      splitting: false,
      external: ["/images/*", "/sound/*", "/fonts/*"],
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
      if (!WATCHED_EXTENSIONS.some((ext) => filename.endsWith(ext))) return;
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
    watch(ICONS_DIR, { recursive: true }, async (_, filename) => {
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
const rewriteHtml = (rawHtml) =>
  rawHtml.replace(
    HTML_PLACEHOLDER,
    `<script type="module" src="${bundlePublicPath}/index.js"></script>`
  );

const serveStatic = async (pathname) => {
  if (STATIC_FILES.includes(pathname) || STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const file = Bun.file(`public${pathname}`);
    if (await file.exists()) {
      return new Response(file);
    }
  }
  return null;
};

const serveBundleAsset = async (pathname) => {
  if (!pathname.startsWith(`${bundlePublicPath}/`)) return null;
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
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;

    if (pathname === "/" || pathname === "/index.html") {
      const htmlFile = Bun.file(HTML_ENTRY);
      if (!(await htmlFile.exists())) {
        return new Response("index.html not found", { status: 500 });
      }
      const html = await htmlFile.text();
      return new Response(rewriteHtml(html), {
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
if (isPreview) {
  console.log("🔎 Preview mode: serving ./dist (run 'bun run build' if assets are missing).");
} else {
  console.log("⚙️  Dev mode: bundler + watcher active (output -> dist/).");
}