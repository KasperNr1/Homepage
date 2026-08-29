// @ts-check
import { existsSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

const publicDirectory = fileURLToPath(new URL("./public/", import.meta.url))

/**
 * astro dev serves public/ by exact path only, so /notes/ and /notes/page 404 even
 * though the files exist. Mirror the try_files chain from nginx.conf in dev.
 */
function serveNotesDirectoryIndex() {
  return {
    name: "serve-notes-directory-index",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const url = request.url ?? ""
        if (!url.startsWith("/notes")) {
          return next()
        }

        const [pathname, query] = url.split("?")
        let decoded
        try {
          decoded = decodeURIComponent(pathname)
        } catch {
          return next()
        }

        const candidates = decoded.endsWith("/")
          ? [`${decoded}index.html`]
          : [decoded, `${decoded}.html`, `${decoded}/index.html`]

        for (const candidate of candidates) {
          const resolved = path.resolve(publicDirectory, `.${candidate}`)
          // Keep a crafted path from escaping public/.
          if (!resolved.startsWith(publicDirectory)) {
            continue
          }
          if (existsSync(resolved) && statSync(resolved).isFile()) {
            request.url = query ? `${candidate}?${query}` : candidate
            break
          }
        }

        return next()
      })
    },
  }
}

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
  vite: {
    plugins: [serveNotesDirectoryIndex()],
  },
  // The legacy privacy URLs are published externally (App Store review, legal notices).
  redirects: {
    "/datenschutz": "/policies/datenschutz",
    "/gonzales": "/projects/gonzales",
    "/gonzales/privacy": "/policies/gonzales",
  },
})
