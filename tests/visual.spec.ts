import { expect, test } from "@playwright/test"

const routes = [
  { name: "home", path: "/" },
  { name: "contact", path: "/contact" },
  { name: "project-detail", path: "/projects/blablatex" },
  { name: "policy-detail", path: "/policies/datenschutz" },
  { name: "notes", path: "/notes/" },
]

for (const route of routes) {
  test(`${route.name} matches its snapshot`, async ({ page }) => {
    await page.goto(route.path)
    await page.waitForLoadState("networkidle")

    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
      animations: "disabled",
      // The notes graph is a force simulation that never settles.
      mask: [page.locator(".graph-container"), page.locator(".global-graph-outer")],
    })
  })
}
