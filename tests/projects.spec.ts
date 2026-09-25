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
