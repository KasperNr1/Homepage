export type ThemePreference = "system" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

export const themeStorageKey = "theme-preference"

export function readThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(themeStorageKey)
    if (value === "light" || value === "dark" || value === "system") {
      return value
    }
  } catch {
    // Storage can be blocked by browser privacy settings.
  }
  return "system"
}

function storeThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(themeStorageKey, preference)
  } catch {
    // Preference cannot be persisted; apply it for this page view only.
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") {
    return preference
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(preference: ThemePreference): void {
  const theme = resolveTheme(preference)
  const root = document.documentElement

  root.setAttribute("data-theme", theme)
  root.style.colorScheme = theme

  // Quartz styles the notes off its own attribute and body classes.
  root.setAttribute("saved-theme", theme)
  document.body?.classList.remove("theme-light", "theme-dark")
  document.body?.classList.add(`theme-${theme}`)
}

export function initThemeSwitcher(): void {
  const media = window.matchMedia("(prefers-color-scheme: dark)")

  media.addEventListener("change", () => {
    if (readThemePreference() === "system") {
      applyTheme("system")
    }
  })

  const switcher = document.querySelector<HTMLElement>(".theme-switcher")
  const toggle = switcher?.querySelector<HTMLButtonElement>(".theme-toggle")
  const menu = switcher?.querySelector<HTMLElement>(".theme-menu")
  if (!switcher || !toggle || !menu) {
    applyTheme(readThemePreference())
    return
  }

  const options = menu.querySelectorAll<HTMLButtonElement>("button[data-theme-value]")

  function markActive(preference: ThemePreference): void {
    options.forEach((option) => {
      const isActive = option.dataset.themeValue === preference
      option.setAttribute("aria-pressed", isActive ? "true" : "false")
      option.classList.toggle("is-active", isActive)
    })
  }

  function setMenuOpen(isOpen: boolean): void {
    menu!.hidden = !isOpen
    toggle!.setAttribute("aria-expanded", isOpen ? "true" : "false")
  }

  applyTheme(readThemePreference())
  markActive(readThemePreference())

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const choice = (option.dataset.themeValue ?? "system") as ThemePreference
      storeThemePreference(choice)
      applyTheme(choice)
      markActive(choice)
      setMenuOpen(false)
    })
  })

  toggle.addEventListener("click", () => setMenuOpen(menu.hidden))

  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !switcher.contains(event.target)) {
      setMenuOpen(false)
    }
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false)
    }
  })
}
