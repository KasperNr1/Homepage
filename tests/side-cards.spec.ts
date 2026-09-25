import { expect, test } from "@playwright/test"

// The three side cards are meant to look and behave like one component, so this
// compares them against each other rather than against fixed numbers.
const railed = [
  { name: "project", path: "/projects/blablatex" },
  { name: "contact", path: "/contact" },
  { name: "about", path: "/about" },
]

test("every side card sits in the margin and centres itself", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })

  const measurements = []
  for (const { name, path } of railed) {
    await page.goto(path)
    const card = page.locator(".side-card")
    await expect(card).toBeVisible()

    const box = (await card.boundingBox())!
    const content = (await page.locator("main > section").first().boundingBox())!
    const nav = (await page.locator(".site-navigation").boundingBox())!
    const viewport = page.viewportSize()!

    // Clear of the text column rather than carved out of it.
    expect(box.x, name).toBeGreaterThanOrEqual(content.x + content.width)
    const above = box.y - (nav.y + nav.height)
    const below = viewport.height - (box.y + box.height)
    expect(Math.abs(above - below), `${name} is off centre`).toBeLessThanOrEqual(2)

    measurements.push({ name, x: Math.round(box.x), width: Math.round(box.width) })
  }

  const [first, ...rest] = measurements
  for (const other of rest) {
    expect({ ...other, name: first.name }).toEqual(first)
  }
})

test("side cards stack above the content on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  for (const { name, path } of railed) {
    await page.goto(path)
    const rail = page.locator(".side-rail")
    expect(await rail.evaluate((el) => getComputedStyle(el).position), name).toBe("static")

    const card = (await page.locator(".side-card").boundingBox())!
    const sections = await page.locator("main > section").all()
    const prose = (await sections[sections.length - 1].boundingBox())!
    expect(card.y, name).toBeLessThan(prose.y)
  }
})
