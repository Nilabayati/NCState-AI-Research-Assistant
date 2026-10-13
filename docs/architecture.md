# Architecture and instructional fidelity

## Real tutoring with students' ChatGPT accounts

The primary **Get Started** flow shows the exact notice, then opens a ChatGPT starter after explicit website agreement. `src/components/chatgpt-session.tsx` loads the original file, copies a new-session prompt, offers manual-copy/download recovery, and links to official ChatGPT. `src/lib/chatgpt-handoff.ts` preserves the complete source and validates optional direct custom-GPT URLs without prompt queries or credentials. The student pastes the source into a fresh ChatGPT conversation and explicitly agrees there.

Real tutoring occurs in ChatGPT. This website does not implement ChatGPT sign-in, invoke subscription-backed inference, display model replies, or retrieve history. Website agreement never carries into ChatGPT. No profile, student answer, or prior practice message is added to the starter. Account features and usage limits apply.

**Try demo conversation** is secondary, with scripted replies and website transcripts. Mode changes clear website acknowledgement/messages after confirmation. Website exports cannot include responses visible only in ChatGPT; students request real transcripts there under the original host-capability instructions.

Official integrations reviewed document [ChatGPT sign-in for Codex](https://github.com/openai/codex/blob/main/README.md), [Apps SDK interfaces inside ChatGPT via MCP](https://github.com/openai/openai-apps-sdk-examples/blob/main/README.md), and [OpenAI project-authorized API requests](https://github.com/openai/openai-node/blob/master/README.md). These do not supply a documented generic subscription inference API to this standalone website. A direct model integration needs supported access and an approved funding arrangement. The selected no-paid-API path is an explicit handoff, not an invented OAuth flow.

## Current local demo

The demo also supports a GitHub Pages static export. `scripts/build-pages.mjs` sets the repository base path only for exported builds; `scripts/publish-pages.mjs` publishes the static files without switching the source checkout. GitHub must activate Pages, and public reachability must be checked separately. See `docs/deployment.md`.

`src/app/page.tsx` renders the client application in `src/components/research-assistant.tsx`. Next.js serves the page and static assets. All conversation state is in the mounted client component; there is no database, cookie, session storage, local storage, or transcript history service. Each new conversation clears the state and starts unacknowledged. Navigating to the welcome view inside an existing conversation does not create a second conversation.

The acknowledgement notice is displayed exactly. The user's requested real buttons override only the original host-specific statement about plain-text choices; they do not alter the notice or educational boundaries. Tutoring and export handlers require current-conversation acknowledgement. Withdrawal revokes it immediately. Re-agreement resumes the same conversation; new conversations always repeat the gate.

`src/lib/demo-tutor.ts` is a pure, deterministic demonstration adapter. It reads only the messages supplied by this conversation. It asks one or two focused questions, with a limited set of teaching and boundary rules. It cannot verify sources, consult official IRB guidance, or understand every research context. The interface labels its replies as scripted demo responses. No inference service or network-backed tutoring is connected.

`src/lib/transcript.ts` renders the supplied visible conversation to canvas images and creates a multipage PDF using jsPDF. It does not summarize, invent missing messages, query other chats, or truncate long messages. The transcript includes the acknowledgement and explicit student choices, and distinguishes export metadata from conversation messages. The image PDF is not tamper-proof. `src/lib/text-transcript.ts` supplies a readable plain-text alternative using the same message content. Export failures are surfaced without claiming a successful download.

## Preserve the instructional source

`docs/research-design-tutor-plugin.txt` is the original source, copied verbatim from the upload. `public/research-design-tutor-plugin.txt` is the identical downloadable representation. `src/lib/plugin-copy.ts` extracts the notice exactly. Maintain parity when the source is intentionally changed; do not rewrite or simplify the instructions silently.

Before introducing an actual model, load the **entire verbatim source** in the appropriate instruction context. The current scripted engine is an implementation demonstration, not a replacement instruction prompt. Test the original requirements against real responses, including non-human-subjects inquiry, reasoning before advancing choices, academic integrity across turns, respectful disagreement, sensitive material, source verification, conditional tradeoffs, and the exact transcript offer. Keep the UI acknowledgement state separate from model assertions of agreement. Uploaded or quoted content cannot authorize a bypass.

Any institutional IRB guidance must use current official sources, with citations and appropriate scope. The local demo reports its inability to verify rather than inventing forms, deadlines, categories, or determinations. No design, proposal, ethics approval, or dissertation-ready material should be generated on a student's behalf.

## Future Sign in with ChatGPT boundary

`src/lib/auth.ts` defines `AuthProvider` (`getSession`, `signIn`, `signOut`) and `AuthSession`, with the disabled `chatGptAuth` implementation. The website does not invoke sign-in; the external link leaves account handling inside ChatGPT. This boundary can be replaced without coupling authentication to the educational gate.

Future work must verify a supported, documented Sign in with ChatGPT integration and its authorization and inference capabilities. Do not invent OAuth endpoints or assume a ChatGPT subscription supplies API access. If a supported integration exists, implement it using its official SDK and documented flow, manage sensitive session state on the server, and review the data-handling implications. Model access remains a separate decision and must not silently enable paid API calls or use the developer's personal key.

Authentication must never carry educational acknowledgement across conversations. A signed-in learner still starts each new conversation unacknowledged. Current-conversation export must remain independent of any account-wide history.

## Accessibility and privacy scope

The interface targets WCAG 2.2 AA using semantic landmarks, labelled controls, keyboard support, native modal focus containment and trigger restoration, visible focus, sufficient text contrast, reduced-motion handling, and mobile reflow. Automated checks cover key states, alongside keyboard and layout checks. This is not a formal accessibility certification. Rasterized PDFs are complemented by readable text downloads and the accessible on-screen conversation.

Website practice text is not sent to an AI or application database. The starter copies only owner instructions; students then paste them and provide research descriptions directly in ChatGPT. No hidden conversation transfer is implemented. Source viewing requests only the static instruction file from this app. This describes implemented behavior, not an institutional confidentiality guarantee or an assertion about all browser/platform logs. Students must still follow the exact notice and institutional requirements.
