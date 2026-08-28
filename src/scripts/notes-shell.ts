// Bundled standalone and injected into the generated Quartz notes so the shell
// there behaves exactly like the Astro pages.
import { initNavigation } from "./navigation"
import { applyTheme, initThemeSwitcher, readThemePreference } from "./theme"

function start(): void {
  applyTheme(readThemePreference())
  initNavigation()
  initThemeSwitcher()
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true })
} else {
  start()
}
