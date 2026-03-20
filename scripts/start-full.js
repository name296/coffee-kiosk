#!/usr/bin/env bun
import { spawnSync, spawn } from "child_process";
import { watch } from "fs";
import { resolve } from "path";

const cwd = process.cwd();

console.log("[coffee-kiosk] 1/5 의존성 설치 중...");
const install = spawnSync("bun", ["install"], {
  cwd,
  stdio: "inherit",
  shell: false,
});
if (install.status !== 0) {
  console.error("[coffee-kiosk] bun install 실패");
  process.exit(install.status ?? 1);
}

const runSvgGen = () => {
  console.log("[coffee-kiosk] SVG 아이콘 생성 중...");
  const svgGen = spawnSync("bun", ["run", "scripts/svg-to-react.js"], {
    cwd,
    stdio: "inherit",
    shell: false,
  });
  if (svgGen.status !== 0) {
    console.warn("[coffee-kiosk] SVG 생성 실패 (계속 진행)");
  }
};

// 초기 SVG 생성
runSvgGen();

console.log("[coffee-kiosk] 2/5 서버 시작 중 (watch 모드)...");
const server = spawn("bunx", ["next", "dev"], {
  cwd,
  stdio: "inherit",
  shell: false,
  detached: false,
});

// 서버가 시작될 때까지 잠시 대기
await new Promise((resolve) => setTimeout(resolve, 4000));

console.log("[coffee-kiosk] 3/5 브라우저 열기...");
const isWindows = process.platform === "win32";
if (isWindows) {
  spawn("cmd", ["/c", "start", "chrome", "http://localhost:3000"], {
    detached: true,
    stdio: "ignore",
  });
} else {
  spawn("open", ["-a", "Google Chrome", "http://localhost:3000"], {
    detached: true,
    stdio: "ignore",
  });
}

console.log("[coffee-kiosk] ✅ 완료! http://localhost:3000");
console.log("[coffee-kiosk] 📁 파일 변경 감시 중... (watch 모드)");
console.log("[coffee-kiosk] 서버 종료: Ctrl+C");

// SVG 파일 변경 감시 (watch 모드)
const svgDir = resolve(cwd, "src/svg");
watch(svgDir, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith(".svg")) {
    console.log(`[coffee-kiosk] 🔄 SVG 변경 감지: ${filename}`);
    runSvgGen();
  }
});

// 서버 프로세스 종료 시 같이 종료
process.on("SIGINT", () => {
  server.kill();
  process.exit(0);
});

server.on("exit", (code) => {
  process.exit(code ?? 0);
});
