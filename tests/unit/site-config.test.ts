import { describe, expect, it } from "vitest"
import { shells, siteConfig } from "../../src/config/site"

const shellEntries = Object.entries(shells)

describe("document shells", () => {
  it.each(shellEntries)("%s exposes a brand and a title suffix", (_name, shell) => {
    expect(shell.brand.trim()).not.toBe("")
    expect(shell.titleSuffix.trim()).not.toBe("")
    expect(shell.brandHref.startsWith("/")).toBe(true)
  })

  it.each(shellEntries)("%s links are absolute paths, mail or external URLs", (_name, shell) => {
    const links = [...shell.navigation, ...shell.footer]
    expect(links.length).toBeGreaterThan(0)

    for (const link of links) {
      expect(link.label.trim()).not.toBe("")
      expect(link.href).toMatch(/^(\/|https?:\/\/|mailto:)/)
      expect(link.href).not.toMatch(/\.html($|#|\?)/)
    }
  })

  it("only hides the Gonzales shell from search engines", () => {
    expect(shells.site.noindex).toBe(false)
    expect(shells.gonzales.noindex).toBe(true)
  })

  it("gives every shell its own description", () => {
    const descriptions = shellEntries.map(([, shell]) => shell.description)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })
})

describe("site metadata", () => {
  it("keeps the default description within meta description length", () => {
    expect(siteConfig.description.length).toBeGreaterThan(50)
    expect(siteConfig.description.length).toBeLessThanOrEqual(200)
  })

  it("separates the contact address from the legal address", () => {
    expect(siteConfig.contactEmail).not.toBe(siteConfig.legalEmail)
  })
})
