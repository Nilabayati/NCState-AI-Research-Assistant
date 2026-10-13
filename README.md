# Research Design Assistant

A local demo of the **Research Design Tutor**, built with Next.js, TypeScript, Tailwind CSS, and an NC State-inspired red, white, and gray interface. No official university logos are used, and no university affiliation or approval is implied.

## Run and preview locally

Requires Node.js 22.12 or newer for the full development toolchain. Node 24 is recommended; `.node-version` pins the version used here.

The server started in this cloud workspace runs on the cloud machine. Opening `localhost:3000` on your Mac connects to your Mac, so it cannot reach that cloud server. This cloud setup chat has no browser-preview or port-forwarding tool. To preview on your Mac, first transfer the complete application source to your Mac and run it there. See [Mac preview instructions](docs/mac-preview.md).

After obtaining the project on your computer, open Terminal in the folder containing `package.json` and run:

```bash
npm ci
npm run dev
```

Leave Terminal running, wait for the server's `Ready` message, and open `http://localhost:3000` in a browser on that same computer. If it reports another port, use the address printed by the server.

For the cloud workspace's internal development and validation:

```bash
cd /workspace/NCState-AI-Research-Assistant
npm ci --cache /tmp/research-design-npm-cache
npm run dev
```

The server binds to `0.0.0.0`, which permits port forwarding in development environments that actually provide that feature. Starting it here does not create a public URL or make it accessible through your Mac's localhost. No hosted deployment is configured.

For a local production preview, stop the development server first:

```bash
npm run build
npm run start
```

Both servers use port 3000 by default. Use `npm run dev -- --port 3001` for another port. Do not run a build and development server simultaneously against the same `.next` directory.

## What works

- Welcome page and an exact educational acknowledgement notice, with working **I Agree** and **I Disagree** buttons.
- The tutor is inaccessible until agreement. Disagreement or withdrawal closes tutoring. Agreement and messages live only in React memory for the current conversation: reload, a new conversation, or another tab starts unacknowledged.
- The first question is exactly: “What is the purpose of your research—what do you hope to understand or find out?” Re-agreement after shared thinking resumes that thinking instead of repeating intake.
- A clearly labelled, deterministic **demo tutor** asks focused questions, probes reasons behind choices, explains selected concepts, and redirects requests for completed academic work. It uses no model, API key, or paid API calls. The rules demonstrate selected behaviors; they do not provide the complete judgment or capabilities of an AI tutor.
- Each substantive response includes the original PDF transcript offer. **No thanks** suppresses future offers for that conversation. **Create PDF** and **No thanks** also work as typed replies. The permanent PDF export remains available after dismissing offers.
- PDFs include only the supplied current-conversation notice, agreement, chat messages, offers, and choices in their original order. Pages are rendered as images to make casual text editing difficult; PDFs can still be altered. No transcript retrieval from other chats is implemented. An accessible plain-text companion preserves the same conversation content.
- Keyboard operation, visible focus, skip navigation, focus-managed native dialogs, live announcements, reduced-motion support, and responsive layouts.

## The original plugin is the source of truth

[`docs/research-design-tutor-plugin.txt`](docs/research-design-tutor-plugin.txt) is a byte-for-byte copy of the uploaded instructions. The same source is viewable and downloadable inside the app and is served from `public/research-design-tutor-plugin.txt`. `src/lib/plugin-copy.ts` contains the verbatim acknowledgement extracted from that source, not a paraphrase. Browser tests compare the rendered notice directly against the preserved source.

The source instructions are **not replaced by generic AI instructions**. The local demo rules in `src/lib/demo-tutor.ts` intentionally have limited coverage. Any future model integration must use the complete original source and preserve its acknowledgement, reasoning-first teaching, academic-integrity, ethics, citation, and transcript requirements. See [`docs/architecture.md`](docs/architecture.md).

The acknowledgement is educational conditions, **not IRB approval, research participation consent, or institutional permission to share data**. Do not enter identifying or confidential records. The demo does not guarantee institutional confidentiality or screen every possible sensitive input.

## Authentication and AI are deliberately disabled

`src/lib/auth.ts` defines a replaceable `AuthProvider` boundary and a disabled `chatGptAuth` adapter. It returns no session and throws on sign-in. No OAuth endpoints, tokens, credentials, login routes, or AI requests are implemented. The UI explains that Sign in with ChatGPT is planned.

A future integration must first verify that an officially supported Sign in with ChatGPT mechanism is available for this application. A ChatGPT account or subscription must not be assumed to supply an API credential or inference entitlement. No personal OpenAI API key is requested, read, or used.

## Development checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Browser checks cover the acknowledgement gates, resets, keyboard navigation, demo reasoning, offer suppression, actual PDF download and exact canvas rendering, mobile reflow, and automated WCAG A/AA scans:

```bash
# If Playwright Chromium is not already installed:
npx playwright install chromium
npm run test:e2e
```

In this cloud workspace, system Chromium is available; use:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

The browser suite starts the dev server if needed. Automated accessibility checks are evidence, not formal WCAG certification; manual assistive-technology review remains appropriate before institutional use.
