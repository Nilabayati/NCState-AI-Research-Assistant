<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Research Design Assistant

Read `docs/research-design-tutor-plugin.txt` and `docs/architecture.md` before changing tutoring behavior. The uploaded plugin is the source of truth. Preserve its full text, the exact acknowledgement notice, the exact opening question and transcript offer, reasoning-first teaching, and academic-integrity boundaries.

The primary flow starts tutoring in the student's own ChatGPT account by copying the complete original instructions and opening ChatGPT. The user selected this no-paid-API path; practice mode is secondary. Website authentication/API inference remain disabled. Do not enable paid calls, use a personal key, or invent OAuth/inference endpoints. GitHub Pages publication is authorized.

Never claim this website receives ChatGPT replies, credentials, or subscription-backed API access. Agreement does not carry into ChatGPT. Website transcripts contain only practice messages. Preserve the full source in the starter; do not add prior answers or profiles.

Acknowledgement and conversation state belong only to the current conversation. Do not persist or carry acknowledgement across conversations. Keep PDF exports accurate and current-conversation-only; never promise tamper-proof PDFs. Maintain the accessible plain-text export alongside image-rendered PDF pages.

Use the existing checkout. Each cloud task already runs in an isolated environment; do not create a worktree unless the user requests one. Run the relevant unit/browser tests and production build after behavior changes. See README.md for local commands.
