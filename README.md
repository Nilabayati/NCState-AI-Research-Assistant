# Research Design Assistant

A **Research Design Tutor** starter for students' own ChatGPT accounts, with a separate scripted practice conversation, built with Next.js, TypeScript, Tailwind CSS, and an NC State-inspired red, white, and gray interface. No official university logos are used, and no university affiliation or approval is implied.

## Start real tutoring

1. Click **Get Started** and read and agree to the exact educational conditions.
2. Click **Copy complete tutor instructions**. The entire original plugin is copied unchanged, with a short request to begin a new conversation and repeat its acknowledgement gate.
3. Click **Open ChatGPT**, sign in there with your own account, and start a new chat.
4. Paste the copied instructions as your first message. Read the tutor's exact notice and explicitly agree in that ChatGPT conversation before tutoring begins.
5. Discuss your purpose and reasoning there. Request that conversation's transcript through its **Create PDF** offer when the host can generate a file.

**Real responses take place in ChatGPT.** The website does not receive ChatGPT credentials, use subscription-backed inference, display ChatGPT replies, or retrieve ChatGPT history. No paid AI API calls are made. ChatGPT account features and usage limits apply. Website agreement never carries into the new ChatGPT conversation.

If copying is denied, expand **Full session instructions and manual copy**, select and copy manually, or download the original file. **Try demo conversation** is a secondary practice option with clearly labelled scripted responses.

## Public website hosting

**Live website: [Research Design Assistant](https://nilabayati.github.io/NCState-AI-Research-Assistant/)**

The website runs on GitHub Pages without a local computer, application server, AI key, or website login. Students use their own ChatGPT account for real tutoring. The `research-design-assistant` branch contains the source; `gh-pages` contains the prepared website files.

GitHub Pages is configured to publish **gh-pages → /(root)** with HTTPS enforced. The public site has passed functional and mobile browser checks. See [deployment instructions](docs/deployment.md) to publish updates, restore these settings if they change, and verify a new deployment. A future branch push must still complete GitHub's deployment before the new files are live.

The public version offers the ChatGPT session starter first and labels practice mode separately. Website acknowledgement and practice messages stay per conversation; no website authentication or paid AI API calls are enabled.

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

The server binds to `0.0.0.0`, which permits port forwarding in development environments that actually provide that feature. Starting it here does not create a public URL or make it accessible through your Mac's localhost. Use the GitHub Pages steps above for public hosting.

For a local production preview, stop the development server first:

```bash
npm run build
npm run start
```

Both servers use port 3000 by default. Use `npm run dev -- --port 3001` for another port. Do not run a build and development server simultaneously against the same `.next` directory.

## What works

- Exact educational notice with working **I Agree** and **I Disagree** buttons. Disagreement blocks the session; reload/new conversation resets acknowledgement.
- Primary ChatGPT starter preserving the complete original instructions. Its external link carries no student answer, agreement, credential, or prompt query.
- The original tutor requires fresh agreement in ChatGPT and the exact opening purpose question. The practice tutor also demonstrates that question.
- Separate **Try demo conversation** with focused scripted questions, reasoning probes, integrity boundaries, and exact PDF offers. These rules have limited coverage, not an AI tutor's full judgment.
- Website PDF/text files contain only the current practice conversation. PDF pages are images and remain alterable. The website cannot export ChatGPT replies; request real transcripts there according to the original host-capability rules.
- Mode changes require confirmation and fresh website acknowledgement. Prior practice answers are never copied into the ChatGPT starter.
- Keyboard operation, visible focus, skip navigation, focus-managed dialogs, manual clipboard recovery, mobile reflow, and automated accessibility checks.

## The original plugin is the source of truth

[`docs/research-design-tutor-plugin.txt`](docs/research-design-tutor-plugin.txt) is a byte-for-byte copy of the uploaded instructions. The same source is viewable and downloadable inside the app and is served from `public/research-design-tutor-plugin.txt`. `src/lib/plugin-copy.ts` contains the verbatim acknowledgement extracted from that source, not a paraphrase. Browser tests compare the rendered notice directly against the preserved source.

The source instructions are **not replaced by generic AI instructions**. `src/lib/chatgpt-handoff.ts` includes the full original source unchanged after a short session-start request. The practice rules in `src/lib/demo-tutor.ts` intentionally have limited coverage. Any future model integration must use the complete original source and preserve its acknowledgement, reasoning-first teaching, academic-integrity, ethics, citation, and transcript requirements. See [`docs/architecture.md`](docs/architecture.md).

The acknowledgement is educational conditions, **not IRB approval, research participation consent, or institutional permission to share data**. Do not enter identifying or confidential records. The demo does not guarantee institutional confidentiality or screen every possible sensitive input.

## ChatGPT access and website authentication

Students sign in on the official ChatGPT site, not this website. `src/lib/auth.ts` retains a disabled future website-auth boundary; no OAuth endpoints, tokens, login routes, or inference requests are implemented. A ChatGPT subscription is not treated as an API credential for this site. No personal OpenAI key is requested, read, or used.

The default is a fresh ChatGPT conversation. An optional build setting `NEXT_PUBLIC_CHATGPT_TUTOR_URL` can use an owner-provided direct HTTPS `chatgpt.com/g/g-...` tutor URL. Other hosts, credentials, prompt queries, and invalid links fall back safely to official ChatGPT home. See the integration rationale in [architecture.md](docs/architecture.md).

## Development checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Browser checks cover the real-session starter and exact clipboard source, copy/source failures and retry, mode changes, fresh gates, keyboard operation, practice reasoning, PDF/text files, mobile reflow, and automated WCAG A/AA scans. They validate the handoff, not authenticated ChatGPT responses:

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
