import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const result = spawnSync(process.execPath, [next, "build"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_STATIC_EXPORT: "1",
    NEXT_PUBLIC_BASE_PATH: "/NCState-AI-Research-Assistant",
  },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
writeFileSync(new URL("../out/.nojekyll", import.meta.url), "");
console.log("GitHub Pages files built in out/. No application server or AI key is needed to host this demo.");
