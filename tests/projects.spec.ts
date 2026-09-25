import { expect, test } from "@playwright/test"

// The hero doubles as a click target, which only works if it stays a second link
// to the same page without becoming a second stop for keyboards and screen readers.
for (const { name, path } of [
  { name: "home", path: "/" },
  { name: "portfolio", path: "/projects" },
]) {
  test(`the ${name} project cards make the hero clickable`, async ({ page }) => {
    await page.goto(path)

    const heroLinks = page.locator(".project-hero-link")
    await expect(heroLinks).not.toHaveCount(0)

    for (const link of await heroLinks.all()) {
      const href = await link.getAttribute("href")
      expect(href).toMatch(/^\/projects\/.+/)
      expect(await link.getAttribute("aria-hidden")).toBe("true")
      expect(await link.evaluate((el) => el.tabIndex)).toBe(-1)
      // An announced alt next to the card's own title link would only be an echo.
      expect(await link.locator("img").getAttribute("alt")).toBe("")
    }

    const target = await heroLinks.first().getAttribute("href")
    await heroLinks.first().click()
    await expect(page).toHaveURL(target!)
  })
}

test("the hero links stay out of the tab order", async ({ page }) => {
  await page.goto("/projects")

  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .filter((link) => link.tabIndex >= 0 && !link.textContent?.trim())
      .map((link) => link.getAttribute("href")),
  )
  expect(unnamed).toEqual([])
})

test("a project page leads with its download and keeps the reading measure", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/projects/blablatex")

  const card = page.locator(".download-card")
  const hero = page.locator("#hero")
  await expect(card).toBeVisible()

  // The whole point of the aside: it uses the margin instead of the text column.
  const cardBox = (await card.boundingBox())!
  const heroBox = (await hero.boundingBox())!
  expect(heroBox.width).toBe(720)
  expect(cardBox.x).toBeGreaterThanOrEqual(heroBox.x + heroBox.width)

  await expect(page.locator("main > section#installation")).toBeVisible()
  await expect(page.locator("main > section#changelog")).toBeVisible()
})

test("a command line project sends its button to the installation", async ({ page }) => {
  await page.goto("/projects/blablatex")

  const button = page.locator(".download-button")
  await expect(button).toHaveAttribute("href", "#installation")
  await button.click()

  // Landing under the sticky navigation would hide the heading it jumped to.
  await expect(page).toHaveURL(/#installation$/)
  const heading = page.locator("#installation h2")
  const navBottom = (await page.locator(".site-navigation").boundingBox())!.height
  await expect
    .poll(async () => (await heading.boundingBox())!.y >= navBottom)
    .toBe(true)
})

test("an unreleased project shows its status instead of a dead button", async ({ page }) => {
  await page.goto("/projects/gonzales")

  const button = page.locator(".download-button")
  await expect(button).toHaveClass(/is-pending/)
  await expect(button).toHaveText("Bald im App-Store verfügbar")
  expect(await button.evaluate((el) => el.tagName)).toBe("P")
})
