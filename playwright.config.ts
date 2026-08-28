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
    // Builds first so the suite can never run against a stale dist.
    command: `npm run build && npm run preview -- --port ${port}`,
    url: baseURL,
    // Never adopt whatever already holds the port. A stray astro dev server would
    // otherwise be tested instead, silently, dev toolbar and all.
    reuseExistingServer: false,
    timeout: 300_000,
  },
})
