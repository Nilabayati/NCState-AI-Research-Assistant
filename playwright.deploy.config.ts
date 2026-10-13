import { defineConfig, devices } from "@playwright/test";

const deploymentUrl = process.env.DEPLOYMENT_BASE_URL;
if (!deploymentUrl || !/^https?:\/\//.test(deploymentUrl)) {
  throw new Error("Set DEPLOYMENT_BASE_URL to the complete HTTP(S) application URL, including its path and trailing slash.");
}

export default defineConfig({
  testDir: "./tests",
  testMatch: "deployment.spec.ts",
  fullyParallel: true,
  workers: 2,
  timeout: 60000,
  use: { baseURL: deploymentUrl, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: {
    ...devices["Desktop Chrome"],
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  } }],
  // The target is an already-running static server or the public deployment.
  // No local development server is started by this configuration.
});
