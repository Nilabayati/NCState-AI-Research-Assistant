import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "out");
for (const filename of ["index.html", ".nojekyll", "research-design-tutor-plugin.txt"]) {
  if (!existsSync(path.join(output, filename))) throw new Error(`Missing out/${filename}; run npm run build:pages first.`);
}
if (!readFileSync(path.join(output, "index.html"), "utf8").includes("/NCState-AI-Research-Assistant/_next/")) {
  throw new Error("This output was not built for the repository's GitHub Pages path. Run npm run build:pages.");
}

const git = (args, env = process.env) => execFileSync("git", args, { cwd: root, env, encoding: "utf8" }).trim();
const origin = git(["remote", "get-url", "origin"]);
// Guard against accidentally publishing this prepared site to another repository.
if (!/(?:github\.com[:/])Nilabayati\/NCState-AI-Research-Assistant(?:\.git)?$/i.test(origin)) {
  throw new Error("Origin must identify Nilabayati/NCState-AI-Research-Assistant on GitHub.");
}
const gitDirectory = git(["rev-parse", "--absolute-git-dir"]);
const remote = git(["ls-remote", "origin", "refs/heads/gh-pages"]);
let parent;
if (remote) {
  git(["fetch", "--no-tags", "origin", "refs/heads/gh-pages"]);
  parent = git(["rev-parse", "FETCH_HEAD"]);
  const existing = git(["ls-tree", "--name-only", parent]);
  if (existing.split("\n").includes("CNAME")) {
    throw new Error("The existing Pages branch has a custom domain. Preserve and review it before publishing.");
  }
}

const temporary = mkdtempSync(path.join(tmpdir(), "research-design-pages-"));
const env = { ...process.env, GIT_INDEX_FILE: path.join(temporary, "index"), GIT_DIR: gitDirectory, GIT_WORK_TREE: output };
try {
  // Use a temporary Git index to publish output without switching or resetting
  // the source checkout, changing its real index, or creating a worktree.
  git(["read-tree", "--empty"], env);
  git(["add", "--all", "--", "."], env);
  const tree = git(["write-tree"], env);
  const sourceCommit = git(["rev-parse", "HEAD"]);
  const args = ["commit-tree", tree, ...(parent ? ["-p", parent] : []), "-m", `Publish Research Design Assistant demo from ${sourceCommit}`];
  const commit = git(args, env);
  execFileSync("git", ["push", "origin", `${commit}:refs/heads/gh-pages`], { cwd: root, stdio: "inherit" });
  const saved = git(["ls-remote", "origin", "refs/heads/gh-pages"]).split(/\s/)[0];
  if (saved !== commit) throw new Error("The published branch could not be verified.");
  console.log(`Verified gh-pages source at ${commit}.`);
  console.log("GitHub repository Settings → Pages must publish from gh-pages / (root).");
  console.log("Expected URL after GitHub Pages activation: https://nilabayati.github.io/NCState-AI-Research-Assistant/");
  console.log("Pushing files alone does not prove the public site is active; verify the deployed URL.");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
