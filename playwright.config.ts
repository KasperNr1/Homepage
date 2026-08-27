import { defineConfig, devices } from "@playwright/test"

const port = 4321
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: "./tests",
  // Keeps Playwright out of the Vitest files, which use the .test.ts suffix.
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL,
    // The layout picks a theme from prefers-color-scheme, so pin it for stable snapshots.
    colorScheme: "light",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 667 } },
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
