import { expect, test } from "@playwright/test"

// The notes shell is injected by scripts/inject-notes-shell.mjs rather than rendered by
// Astro, so these guard against the two copies drifting apart.
async function shellLinks(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    nav: [...document.querySelectorAll(".site-navigation .nav-links > li > a")].map((a) => ({
      href: a.getAttribute("href"),
      label: a.textContent?.trim(),
    })),
    footer: [...document.querySelectorAll(".site-footer .legal-links a")].map((a) => ({
      href: a.getAttribute("href"),
      label: a.textContent?.trim(),
    })),
    themeOptions: [...document.querySelectorAll(".theme-menu .theme-option")].map((b) =>
      b.getAttribute("data-theme-value"),
    ),
  }))
}

test("the notes shell matches the site shell", async ({ page }) => {
  await page.goto("/")
  const site = await shellLinks(page)

  await page.goto("/notes/")
  const notes = await shellLinks(page)

  expect(notes).toEqual(site)
  expect(site.nav.length).toBeGreaterThan(0)
  expect(site.themeOptions).toEqual(["system", "light", "dark"])
})

/** At narrow widths the switcher sits inside the collapsed navigation menu. */
async function openThemeMenu(page: import("@playwright/test").Page) {
  const navToggle = page.locator(".nav-toggle")
  if (await navToggle.isVisible()) {
    await navToggle.click()
  }
  await page.locator(".theme-toggle").click()
}

test("the theme preference carries between the site and the notes", async ({ page }) => {
  await page.goto("/")
  await openThemeMenu(page)
  await page.locator('button[data-theme-value="dark"]').click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")

  await page.goto("/notes/")
  const root = page.locator("html")
  await expect(root).toHaveAttribute("data-theme", "dark")
  // Quartz styles itself from its own attribute, so both have to agree.
  await expect(root).toHaveAttribute("saved-theme", "dark")
  await expect(page.locator(".theme-option.is-active")).toHaveText("Dunkel")
})

test("the notes drop Quartz's own chrome", async ({ page }) => {
  await page.goto("/notes/")

  await expect(page.locator(".site-navigation")).toBeVisible()
  await expect(page.locator(".site-footer")).toBeVisible()
  await expect(page.locator("footer:not(.site-footer)")).toHaveCount(0)
  await expect(page.locator(".darkmode")).toHaveCount(0)
  // Quartz's own search and explorer stay.
  await expect(page.locator(".search-button").first()).toBeVisible()
})
