# Public hosting with GitHub Pages

The current demo works entirely in the browser. GitHub Pages can serve its static HTML, CSS, JavaScript, and plugin instruction file over HTTPS. Visitors need only the public site address; your Mac can be turned off. This deployment does not enable AI inference, authentication, account history, or paid API calls.

## Activate the prepared website

1. Sign in to GitHub and open [this repository's Pages settings](https://github.com/Nilabayati/NCState-AI-Research-Assistant/settings/pages).
2. Under **Build and deployment → Source**, select **Deploy from a branch**.
3. Select the **gh-pages** branch and **/(root)** folder, then click **Save**.
4. Wait for the GitHub Pages deployment to finish. Use GitHub's **Visit site** link to obtain the actual published address.
5. Open that link in a private browser window to verify visitors can access it without your account. Try Get Started, I Agree, a demo chat message, and PDF export.

The expected address for the default GitHub Pages domain is:

```text
https://nilabayati.github.io/NCState-AI-Research-Assistant/
```

Treat this as an expected address until GitHub confirms publication and the website loads. Pushing the prepared files does not by itself enable Pages, establish a successful deployment, or verify public reachability. Do not use localhost or the GitHub source branch as the website link.

GitHub Pages availability depends on your GitHub plan and repository visibility. If GitHub says Pages is unavailable for your private repository, use a plan that supports it or another host such as Vercel. Do not change the repository's visibility automatically. No hosting purchase has been configured or authorized by the build scripts.

The official guide is [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Build and publish updates

From a Git checkout of the `research-design-assistant` source branch, with Node.js 24 and GitHub write access:

```bash
npm ci
npm run build:pages
npm run publish:pages
```

Or use `npm run deploy:pages` to build and publish the files together. Stop any Next development server before building against the same `.next` directory. Commit your source changes to the source branch separately so they are retained.

`build:pages` sets `NEXT_STATIC_EXPORT=1` and `NEXT_PUBLIC_BASE_PATH=/NCState-AI-Research-Assistant` for the build only. Next.js writes `out/`, including correctly prefixed bundle URLs; the source-file viewer and download use the same prefix. `.nojekyll` keeps GitHub from excluding `_next` assets. The ordinary `npm run build` and `npm run start` retain the local Next server workflow.

`publish:pages` publishes the static output to the existing repository's `gh-pages` branch using a temporary Git index. It keeps the current source branch and index, creates no worktree, does not force-push, and verifies the remote branch SHA. It refuses output built for the wrong path, refuses another origin repository, and leaves an existing custom-domain configuration for explicit review. It does not access secret values, change repository visibility, or change Pages settings.

## Verify a deployment

Run the browser deployment checks against the actual public address:

```bash
DEPLOYMENT_BASE_URL=https://nilabayati.github.io/NCState-AI-Research-Assistant/ npm run test:deployment
```

Install Playwright Chromium first with `npx playwright install chromium` if needed. In the cloud workspace, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` to select installed Chromium. The deployment checks start no local app server; they test the supplied site. They cover assets, exact acknowledgement and plugin downloads, demo replies, PDF/text files, conversation resets, mobile layout, and automated accessibility scans.

## Future authentication or AI

Static hosting supports this demo. A future supported Sign in with ChatGPT integration or model-backed tutoring may require backend infrastructure and a different deployment configuration. That is separate work; preserve the full plugin instructions and do not silently add paid API use.
