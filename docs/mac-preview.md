# Preview Research Design Assistant on your Mac

## Why localhost refused the connection

`localhost` means the computer where your browser runs. A server started inside the cloud workspace is on a different computer from your Mac. This cloud setup chat does not expose a browser preview or a port-forwarding tool. Starting the cloud server does not start anything on your Mac.

The app must be running on your Mac before Chrome on your Mac can open `http://localhost:3000`. Running locally is not deployment and requires no AI key or sign-in.

## Obtain the complete project

Get the application source from the [`research-design-assistant` branch on GitHub](https://github.com/Nilabayati/NCState-AI-Research-Assistant/tree/research-design-assistant). Click **Code → Download ZIP**, or use this [source ZIP download](https://github.com/Nilabayati/NCState-AI-Research-Assistant/archive/refs/heads/research-design-assistant.zip). If the repository is private, sign in to GitHub with an account that can access it.

Extract the ZIP in Finder. The folder will normally be called `NCState-AI-Research-Assistant-research-design-assistant`. Confirm it contains `package.json`, `package-lock.json`, `src/`, `public/`, `docs/`, and the configuration files. Dependencies are installed in the next steps.

A folder containing only `README.md` does not contain the application. Make sure you download the `research-design-assistant` branch, which contains the app, rather than a different branch. The source ZIP does not include dependency caches, build outputs, or credentials.

## Install Node.js

Install Node.js 24 from the official Node.js site, `https://nodejs.org/`, if it is not already installed. Close and reopen Terminal after installation. In Terminal, check:

```bash
node --version
npm --version
```

Use Node.js 24, or at least Node.js 22.12 for this project's development toolchain.

## Start the app

1. Open Terminal. You can press Command + Space, type `Terminal`, and press Return.
2. Type `cd `, including the space, then drag the extracted project folder from Finder into Terminal. Press Return. This selects the actual folder on your Mac; do not use the cloud-only `/workspace/...` path.
3. Run:

   ```bash
   npm ci
   npm run dev
   ```

4. Keep that Terminal window open. Wait for the `Ready` message.
5. In Chrome, enter the `Local` address printed by the server, normally `http://localhost:3000`.

If port 3000 is already in use, the development server may select another port. Use the address it prints. To select port 3001 explicitly, use `npm run dev -- --port 3001`.

To stop the server, press Control + C in its Terminal window. To start it again later, run `npm run dev` from the same project folder. Reinstall dependencies with `npm ci` when the lockfile changes.

## If the browser still cannot connect

Check Terminal first:

- `npm: command not found`: install Node.js and reopen Terminal.
- A `package.json` missing-file error: select the extracted application folder with `cd`.
- An installation or startup error: resolve the error before opening the browser. The server must print `Ready`.
- The Terminal window is closed or the server was stopped: run `npm run dev` again and leave it running.
- The server prints port 3001 or another port: use that address in Chrome.

The main flow starts tutoring in the student's own ChatGPT account with the full original instructions. Practice mode stays scripted. No personal API key or paid API call is needed to preview the website; real tutoring uses sign-in inside ChatGPT.
