import { build } from "esbuild"
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { shells, siteConfig } from "../src/config/site.ts"
import { themeBootstrapScript } from "../src/scripts/theme-bootstrap.ts"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const shell = shells.site

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  )
}

/** Mirrors src/components/SiteNavigation.astro and ThemeSwitcher.astro. */
function navigationHtml() {
  const links = shell.navigation
    .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
    .join("")
  const themeOptions = [
    ["system", "System"],
    ["light", "Hell"],
    ["dark", "Dunkel"],
  ]
    .map(
      ([value, label]) =>
        `<button type="button" class="theme-option" data-theme-value="${value}" aria-pressed="false">${label}</button>`,
    )
    .join("")

  return (
    `<nav class="site-navigation">` +
    `<span class="nav-name"><a href="${escapeHtml(shell.brandHref)}">${escapeHtml(shell.brand)}</a></span>` +
    `<button class="nav-toggle" type="button" aria-controls="site-navigation-links" aria-expanded="false" aria-label="Navigation öffnen" hidden>` +
    `<span class="nav-toggle-icon" aria-hidden="true"></span></button>` +
    `<ul id="site-navigation-links" class="nav-links">${links}` +
    `<li class="theme-switcher">` +
    `<button type="button" class="theme-toggle" aria-label="Darstellung umschalten" aria-expanded="false" aria-haspopup="true">` +
    `<span class="theme-glyph" aria-hidden="true"></span><span class="sr-only">Darstellung öffnen</span></button>` +
    `<div class="theme-menu" hidden>${themeOptions}</div>` +
    `</li></ul></nav>`
  )
}

/** Mirrors src/components/SiteFooter.astro. */
function footerHtml() {
  const links = shell.footer
    .map(
      (link, index) =>
        `${index > 0 ? '<span aria-hidden="true">|</span>' : ""}` +
        `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
    )
    .join("")

  return (
    `<footer class="site-footer">` +
    `<p>&copy; ${new Date().getFullYear()} ${escapeHtml(siteConfig.owner)}</p>` +
    `<p class="legal-links">${links}</p></footer>`
  )
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(entryPath)))
    } else if (entry.name.endsWith(".html")) {
      files.push(entryPath)
    }
  }

  return files
}

export async function injectNotesShell(options = {}) {
  const sourceDirectory = path.resolve(
    options.sourceDirectory ?? path.join(projectRoot, ".cache", "homepage", "notes-public"),
  )
  const outputDirectory = path.resolve(
    options.outputDirectory ?? path.join(projectRoot, "public", "notes"),
  )

  await rm(outputDirectory, { recursive: true, force: true })
  await mkdir(path.dirname(outputDirectory), { recursive: true })
  await cp(sourceDirectory, outputDirectory, { recursive: true })

  const styles = await Promise.all(
    ["shell.css", "notes-shell.css"].map((name) =>
      readFile(path.join(projectRoot, "src", "styles", name), "utf8"),
    ),
  )
  await writeFile(path.join(outputDirectory, "site-shell.css"), styles.join("\n"), "utf8")

  await build({
    entryPoints: [path.join(projectRoot, "src", "scripts", "notes-shell.ts")],
    outfile: path.join(outputDirectory, "site-shell.js"),
    bundle: true,
    minify: true,
    format: "iife",
    target: "es2020",
    logLevel: "warning",
  })

  const navigation = navigationHtml()
  const footer = footerHtml()
  const headExtra =
    `<link rel="stylesheet" href="/notes/site-shell.css">` +
    `<script>${themeBootstrapScript}</script>`
  const bodyExtra = `<script src="/notes/site-shell.js" defer></script>`

  const files = await collectHtmlFiles(outputDirectory)
  for (const file of files) {
    let html = await readFile(file, "utf8")

    html = html.replace("</head>", `${headExtra}</head>`)
    html = html.replace(/<body[^>]*>/, (bodyTag) => `${bodyTag}${navigation}`)
    // Drop Quartz's own footer and append ours outside #quartz-root so it spans the full width.
    html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/, "")
    html = html.replace("</body>", `${footer}${bodyExtra}</body>`)
    await writeFile(file, html, "utf8")
  }

  console.log(`Injected the site shell into ${files.length} notes pages.`)
  return outputDirectory
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await injectNotesShell()
}
