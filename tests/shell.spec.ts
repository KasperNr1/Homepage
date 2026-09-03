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

test("the theme menu stays usable inside the collapsed navigation", async ({ page }) => {
  await page.goto("/")
  await openThemeMenu(page)

  const menu = page.locator(".theme-menu")
  await expect(menu).toBeVisible()
  // The collapsed navigation scrolls; a popover escapes that container instead of
  // being clipped by it and merely adding to the scroll extent.
  await expect(menu).toBeInViewport()

  // If the UA inset edges survive, the popover stretches into the viewport corner
  // and the grid rows blow up, which is what Safari did.
  const box = (await menu.boundingBox())!
  const viewport = page.viewportSize()!
  expect(box.height).toBeLessThan(viewport.height / 2)
  expect(box.width).toBeLessThan(viewport.width / 2)

  // No force: this only passes if the option is genuinely the hit target.
  await page.locator('button[data-theme-value="dark"]').click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  await expect(menu).toBeHidden()
})

test("the navigation marks the current section", async ({ page }) => {
  await page.goto("/about")
  await expect(page.locator('.nav-links > li > a[aria-current="page"]')).toHaveText("Über mich")

  // Section aware: a project detail page still marks the Projekte entry.
  await page.goto("/projects/blablatex")
  const active = page.locator('.nav-links > li > a[aria-current="page"]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveText("Projekte")

  await page.goto("/notes/")
  await expect(page.locator('.nav-links > li > a[aria-current="page"]')).toHaveText("Notizen")
})

test("the notes navigation renders with the same metrics as the site", async ({ page }) => {
  async function linkMetrics(path: string) {
    await page.goto(path)
    return page.evaluate(() => {
      // The current entry is bold in the collapsed menu, so compare an idle one.
      const link = document.querySelector(".nav-links > li > a:not([aria-current])")
      const style = getComputedStyle(link as Element)
      return {
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        fontFamily: style.fontFamily,
      }
    })
  }

  // Quartz styles bare links, so this guards the shell against inheriting them.
  const site = await linkMetrics("/")
  const notes = await linkMetrics("/notes/")
  expect(notes).toEqual(site)
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

test("the lucky button opens a random note", async ({ page }) => {
  await page.goto("/notes/")

  const lucky = page.locator(".lucky-button")
  const reader = page.locator(".readermode")
  const luckyBox = (await lucky.boundingBox())!
  const readerBox = (await reader.boundingBox())!

  // It has to read as a sibling of Quartz's reader mode button, just left of it.
  expect(luckyBox.x + luckyBox.width).toBeLessThanOrEqual(readerBox.x)
  expect(luckyBox.width).toBe(readerBox.width)
  expect(luckyBox.height).toBe(readerBox.height)
  expect(luckyBox.y).toBe(readerBox.y)

  await lucky.click()
  await page.waitForURL((url) => url.pathname !== "/notes/")
  expect(page.url()).toContain("/notes/")
  // Some notes are stubs with an empty body, so assert on Quartz's title instead.
  await expect(page.locator("h1.article-title")).toBeVisible()
})
