import { build } from "esbuild"
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/** Node only strips types natively from 22.18 on, so transpile instead of importing directly. */
async function loadTypeScriptModule(relativePath) {
  const result = await build({
    entryPoints: [path.join(projectRoot, relativePath)],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    target: "node20",
    logLevel: "warning",
  })
  const source = Buffer.from(result.outputFiles[0].text).toString("base64")
  return import(`data:text/javascript;base64,${source}`)
}

const { shells, siteConfig, isActiveNavLink } = await loadTypeScriptModule("src/config/site.ts")
const { themeBootstrapScript } = await loadTypeScriptModule("src/scripts/theme-bootstrap.ts")
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
    .map((link) => {
      // Every injected page lives under /notes/, so the active entry is fixed.
      const current = isActiveNavLink(link.href, "/notes/") ? ' aria-current="page"' : ""
      return `<li><a href="${escapeHtml(link.href)}"${current}>${escapeHtml(link.label)}</a></li>`
    })
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
    `<button type="button" class="theme-toggle" popovertarget="theme-menu" aria-label="Darstellung umschalten" aria-expanded="false" aria-haspopup="true">` +
    `<span class="theme-glyph" aria-hidden="true"></span><span class="sr-only">Darstellung öffnen</span></button>` +
    `<div id="theme-menu" class="theme-menu" popover>${themeOptions}</div>` +
    `</li></ul></nav>`
  )
}

/** Sits next to Quartz's reader mode button and is wired up by src/scripts/notes-lucky.ts. */
function luckyButtonHtml() {
  return (
    `<button class="lucky-button" type="button" title="Feeling Lucky" aria-label="Zufällige Notiz öffnen">` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `<rect x="2.2" y="5.4" width="14.4" height="16.4" rx="2"></rect>` +
    `<rect x="4.8" y="8.2" width="9.2" height="5.2" rx="1"></rect>` +
    `<path d="M7.9 8.2v5.2M10.9 8.2v5.2"></path>` +
    `<path d="M5.3 18h8.2"></path>` +
    `<path d="M16.6 10.4h2.6a1.4 1.4 0 0 0 1.4-1.4V5.6"></path>` +
    `<circle cx="20.6" cy="3.9" r="1.7"></circle>` +
    `</svg></button>`
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

/** Quartz's search index doubles as the note list the lucky button draws from. */
async function writeRandomNoteSlugs(outputDirectory) {
  const indexPath = path.join(outputDirectory, "static", "contentIndex.json")
  const contentIndex = JSON.parse(await readFile(indexPath, "utf8"))
  // Folder overviews are navigation, not notes.
  const slugs = Object.keys(contentIndex).filter(
    (slug) => slug !== "index" && !slug.endsWith("/index"),
  )

  if (slugs.length === 0) {
    throw new Error(`No note slugs in ${indexPath}. Review the Quartz build before publishing.`)
  }

  await writeFile(path.join(outputDirectory, "random-notes.json"), JSON.stringify(slugs), "utf8")
  return slugs.length
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
  const lucky = luckyButtonHtml()
  const readerModeButton = '<button class="readermode"'
  const headExtra =
    `<link rel="stylesheet" href="/notes/site-shell.css">` +
    `<script>${themeBootstrapScript}</script>`
  const bodyExtra = `<script src="/notes/site-shell.js" defer></script>`

  const noteCount = await writeRandomNoteSlugs(outputDirectory)
  const files = await collectHtmlFiles(outputDirectory)
  let luckyButtons = 0
  for (const file of files) {
    let html = await readFile(file, "utf8")

    html = html.replace("</head>", `${headExtra}</head>`)
    html = html.replace(/<body[^>]*>/, (bodyTag) => `${bodyTag}${navigation}`)
    // Drop Quartz's own footer and append ours outside #quartz-root so it spans the full width.
    html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/, "")
    html = html.replace("</body>", `${footer}${bodyExtra}</body>`)
    if (html.includes(readerModeButton)) {
      html = html.replace(readerModeButton, `${lucky}${readerModeButton}`)
      luckyButtons += 1
    }
    await writeFile(file, html, "utf8")
  }

  // Quartz's 404 page ships without the sidebar, so it carries no reader mode button.
  const sidebarPages = files.filter((file) => path.basename(file) !== "404.html").length
  if (luckyButtons !== sidebarPages) {
    throw new Error(
      `Placed the lucky button on ${luckyButtons} of ${sidebarPages} notes pages with a sidebar. ` +
        "Review the Quartz upgrade before building.",
    )
  }

  console.log(
    `Injected the site shell into ${files.length} notes pages; ${noteCount} notes are in the lucky draw.`,
  )
  return outputDirectory
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await injectNotesShell()
}
