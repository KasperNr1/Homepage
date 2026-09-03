// Bundled standalone and injected into the generated Quartz notes so the shell
// there behaves exactly like the Astro pages.
import { initNavigation } from "./navigation"
import { initLuckyButton } from "./notes-lucky"
import { applyTheme, initThemeSwitcher, readThemePreference } from "./theme"

function start(): void {
  applyTheme(readThemePreference())
  initNavigation()
  initThemeSwitcher()
  initLuckyButton()
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true })
} else {
  start()
}
