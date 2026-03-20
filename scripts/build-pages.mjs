/**
 * GitHub Pages용 정적 export (`out/`).
 * CI와 동일: svg-to-react → NEXT_OUTPUT_EXPORT=1 → next build
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const env = {
  ...process.env,
  NEXT_OUTPUT_EXPORT: "1",
  NODE_ENV: "production",
};

function run(cmd, args) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("bun", ["run", "scripts/svg-to-react.js"]);
run("bun", ["x", "next", "build"]);
