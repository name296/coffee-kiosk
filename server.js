import { build, serve } from "bun";
import { watch, existsSync, cpSync, mkdirSync, rmSync, statSync } from "fs";
import { resolve } from "path";
import { z } from "zod";

// ============================================================================
// 환경 설정
// ============================================================================
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  ENTRY_FILE: z.string().default("./src/App.js"),
  BUNDLE_OUTPUT_DIR: z.string().default("./dist"),
  ICONS_DIR: z.string().default("./src/svg"),
  BUILD_MINIFY: z.coerce.boolean().default(true),
  BUILD_SOURCEMAP: z.string().default("external"),
});

const env = envSchema.parse(process.env);

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
    const indexCandidates = ["index.js", "index.jsx", "index.ts", "index.tsx"];
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
  name: "alias",
  setup(builder) {
    const aliases = [
      { prefix: "@shared", path: "src/shared" },
      { prefix: "@features", path: "src/features" },
    ];

    aliases.forEach((aliasConfig) => {
      const filter = new RegExp(`^${aliasConfig.prefix}(\\/.*)?$`);
      builder.onResolve({ filter }, (args) => {
        const suffix = args.path.slice(aliasConfig.prefix.length);
        const cleanSuffix = suffix.startsWith("/") ? suffix.slice(1) : suffix;
        return { path: resolveAliasPath(aliasConfig.path, cleanSuffix) };
      });
    });
  },
};

const config = {
  port: env.PORT,
  entry: env.ENTRY_FILE,
  outdir: env.BUNDLE_OUTPUT_DIR,
  htmlEntry: `${env.BUNDLE_OUTPUT_DIR}/index.html`,
  iconsDir: env.ICONS_DIR,
  watchExtensions: [".js", ".jsx", ".ts", ".tsx", ".css"],
  buildOptions: {
    target: "browser",
    format: "esm",
    minify: env.BUILD_MINIFY,
    sourcemap: env.BUILD_SOURCEMAP,
    define: { "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV) },
    plugins: [aliasPlugin],
  },
};

// ============================================================================
// 유틸리티
// ============================================================================
const copyStatic = () => {
  mkdirSync(config.outdir, { recursive: true });
  ["images", "fonts", "sounds"].forEach((dir) => {
    const src = `./src/${dir}`;
    if (existsSync(src)) cpSync(src, `${config.outdir}/${dir}`, { recursive: true });
  });
  
  // 사운드 파일 복사 (개별 파일 - src 루트에 있는 경우)
  if (existsSync("./src/SoundOnPressed.mp3")) {
    cpSync("./src/SoundOnPressed.mp3", `${config.outdir}/SoundOnPressed.mp3`);
  }
  if (existsSync("./src/SoundNote.wav")) {
    cpSync("./src/SoundNote.wav", `${config.outdir}/SoundNote.wav`);
  }
  
  if (existsSync("./src/index.html")) cpSync("./src/index.html", config.htmlEntry);
};

const waitDelete = async (path, retries = 10) => {
  for (let i = 0; i < retries && existsSync(path); i++) {
    await Bun.sleep(100);
  }
};

// ============================================================================
// 번들러
// ============================================================================
let building = false;

const bundle = async (tag = "manual") => {
  if (building) return;
  building = true;
  console.log(`📦 Building (${tag})...`);

  try {
    if (existsSync(config.outdir)) {
      rmSync(config.outdir, { recursive: true, force: true });
      await waitDelete(config.outdir);
    }
    copyStatic();

    const result = await build({
      entrypoints: [config.entry],
      outdir: config.outdir,
      ...config.buildOptions,
    });

    console.log(result.success ? "✅ Build successful!" : `❌ Build failed: ${result.logs}`);
  } catch (e) {
    console.error("❌ Build error:", e);
  } finally {
    building = false;
  }
};

// ============================================================================
// 아이콘 생성기
// ============================================================================
let updatingIcons = false;

const generateIcons = async () => {
  if (updatingIcons) return;
  updatingIcons = true;
  console.log("🎨 Generating icons...");

  try {
    const proc = Bun.spawn(["bun", "run", "scripts/svg-to-react.js"], { stdout: "inherit", stderr: "inherit" });
    const code = await proc.exited;
    console.log(code === 0 ? "✅ Icons generated!" : `❌ Icon generation failed (${code})`);
  } catch (e) {
    console.error("❌ Icon error:", e);
  } finally {
    updatingIcons = false;
  }
};

// ============================================================================
// 파일 감시
// ============================================================================
const startWatchers = () => {
  // 소스 파일 감시
  watch("./src", { recursive: true }, async (_, file) => {
    if (file && (config.watchExtensions.some((ext) => file.endsWith(ext)) || 
                 file.endsWith('.mp3') || file.endsWith('.wav'))) {
      console.log(`🔄 Changed: ${file}`);
      await bundle("watch");
    }
  });

  // 아이콘 감시
  if (existsSync(config.iconsDir)) {
    watch(config.iconsDir, { recursive: true }, async (_, file) => {
      if (file?.endsWith(".svg")) {
        console.log(`🎨 Icon changed: ${file}`);
        await generateIcons();
      }
    });
  }

  console.log("👀 Watching for changes...");
};

// ============================================================================
// HTTP 서버
// ============================================================================
const serveStatic = async (pathname) => {
  const file = Bun.file(`${config.outdir}${pathname}`);
  if (!(await file.exists())) return null;
  
  // MIME 타입 설정 (오디오 파일 등)
  const ext = pathname.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'svg': 'image/svg+xml',
    'otf': 'font/otf',
    'ttf': 'font/ttf',
    'woff': 'font/woff',
    'woff2': 'font/woff2'
  };
  
  const contentType = mimeTypes[ext] || file.type || 'application/octet-stream';
  
  return new Response(file, {
    headers: { 'Content-Type': contentType }
  });
};

const startServer = () => {
  const server = serve({
    port: config.port,
    async fetch(req) {
      const { pathname } = new URL(req.url);

      // HTML
      if (pathname === "/" || pathname === "/index.html") {
        const html = Bun.file(config.htmlEntry);
        return (await html.exists())
          ? new Response(html, { headers: { "Content-Type": "text/html" } })
          : new Response("index.html not found", { status: 500 });
      }

      // Static files
      const staticRes = await serveStatic(pathname);
      if (staticRes) return staticRes;

      // SPA fallback
      const html = Bun.file(config.htmlEntry);
      return (await html.exists())
        ? new Response(html, { headers: { "Content-Type": "text/html" } })
        : new Response("Not Found", { status: 404 });
    },
  });

  console.log(`🌐 http://localhost:${server.port}`);
};

// ============================================================================
// 시작
// ============================================================================
const main = async () => {
  console.log(`🚀 Bun Dev Server (port ${config.port})`);

  // 의존성 확인
  if (!existsSync("./node_modules")) {
    console.log("📦 Installing dependencies...");
    await Bun.spawn(["bun", "install"], { stdout: "inherit", stderr: "inherit" }).exited;
  }

  await generateIcons();
  await bundle("initial");
  startWatchers();
  startServer();
};

main();
