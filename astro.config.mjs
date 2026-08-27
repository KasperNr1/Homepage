// @ts-check
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

// Pages that carry a noindex robots tag, plus the redirect stubs that replace them.
const unlistedPaths = ["/gonzales/", "/gonzales/privacy/", "/policies/gonzales/", "/datenschutz/"]

// https://astro.build/config
export default defineConfig({
  site: "https://magnusbos.com",
  integrations: [
    react(),
    sitemap({
      filter: (page) => !unlistedPaths.includes(new URL(page).pathname),
    }),
  ],
  // The legacy privacy URLs are published externally (App Store review, legal notices).
  redirects: {
    "/datenschutz": "/policies/datenschutz",
    "/gonzales/privacy": "/policies/gonzales",
  },
})
