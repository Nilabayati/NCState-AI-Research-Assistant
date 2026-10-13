<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Research Design Assistant

Read `docs/research-design-tutor-plugin.txt` and `docs/architecture.md` before changing tutoring behavior. The uploaded plugin is the source of truth. Preserve its full text, the exact acknowledgement notice, the exact opening question and transcript offer, reasoning-first teaching, and academic-integrity boundaries.

This is a local scripted demo. Authentication and AI inference are disabled. Do not enable paid AI calls, use a developer's personal API key, add assumed ChatGPT OAuth endpoints, or deploy the application unless a subsequent user task explicitly authorizes that work.

Acknowledgement and conversation state belong only to the current conversation. Do not persist or carry acknowledgement across conversations. Keep PDF exports accurate and current-conversation-only; never promise tamper-proof PDFs. Maintain the accessible plain-text export alongside image-rendered PDF pages.

Use the existing checkout. Each cloud task already runs in an isolated environment; do not create a worktree unless the user requests one. Run the relevant unit/browser tests and production build after behavior changes. See README.md for local commands.
