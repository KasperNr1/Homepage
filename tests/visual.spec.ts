import { expect, test } from "@playwright/test"

const routes = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "projects", path: "/projects" },
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
      mask: [
        // The notes graph is a force simulation that never settles.
        page.locator(".graph-container"),
        page.locator(".global-graph-outer"),
        // Scaling a photo is not bit exact once it arrives after first paint, and
        // the frame around it is fixed by aspect-ratio anyway.
        page.locator(".project-hero"),
      ],
    })
  })
}
