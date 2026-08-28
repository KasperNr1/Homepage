/** Runs before first paint, so it cannot be a module import. Kept as source text
    that both BaseLayout and the notes injector inline verbatim. */
export const themeBootstrapScript = `(() => {
  var preference = "system"
  try {
    var stored = localStorage.getItem("theme-preference")
    if (stored === "light" || stored === "dark" || stored === "system") {
      preference = stored
    }
  } catch (error) {
    // Storage can be blocked by browser privacy settings.
  }
  var theme = preference === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference
  var root = document.documentElement
  root.setAttribute("data-theme", theme)
  root.setAttribute("saved-theme", theme)
  root.style.colorScheme = theme
})()`
