// @ts-check
import { defineConfig } from "astro/config"
import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  site: "https://magnusbos.com",
  integrations: [react()],
  // The legacy privacy URLs are published externally (App Store review, legal notices).
  redirects: {
    "/datenschutz": "/policies/datenschutz",
    "/gonzales/privacy": "/policies/gonzales",
  },
})
