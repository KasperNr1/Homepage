export type ThemePreference = "system" | "light" | "dark" | "unicorn"
export type ResolvedTheme = "light" | "dark" | "unicorn"

export const themeStorageKey = "theme-preference"

export function readThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(themeStorageKey)
    if (value === "light" || value === "dark" || value === "system" || value === "unicorn") {
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
  // Unicorn is never picked automatically, only chosen.
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(preference: ThemePreference): void {
  const theme = resolveTheme(preference)
  const scheme = theme === "dark" ? "dark" : "light"
  const root = document.documentElement

  root.setAttribute("data-theme", theme)
  root.style.colorScheme = scheme

  // Quartz styles the notes off its own attribute and body classes, and only
  // knows the two schemes, so unicorn rides on the light one and overrides it.
  root.setAttribute("saved-theme", scheme)
  document.body?.classList.remove("theme-light", "theme-dark", "theme-unicorn")
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

  /** Top layer elements are not laid out next to their button, so place it here. */
  function positionMenu(): void {
    const anchor = toggle!.getBoundingClientRect()
    const width = menu!.offsetWidth
    const left = Math.min(Math.max(8, anchor.right - width), window.innerWidth - width - 8)
    menu!.style.left = `${left}px`
    menu!.style.top = `${anchor.bottom + 8}px`
  }

  applyTheme(readThemePreference())
  markActive(readThemePreference())

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const choice = (option.dataset.themeValue ?? "system") as ThemePreference
      storeThemePreference(choice)
      applyTheme(choice)
      markActive(choice)
      menu.hidePopover()
    })
  })

  // Opening, closing and light dismiss are handled by the popover itself.
  menu.addEventListener("toggle", (event) => {
    const isOpen = (event as ToggleEvent).newState === "open"
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false")
    if (isOpen) {
      positionMenu()
    }
  })

  // The collapsed navigation scrolls, so keep the popover attached to its button.
  for (const type of ["scroll", "resize"] as const) {
    window.addEventListener(
      type,
      () => {
        if (menu.matches(":popover-open")) {
          positionMenu()
        }
      },
      true,
    )
  }
}
