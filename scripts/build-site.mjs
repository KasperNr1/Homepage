import { access, cp, mkdir, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { buildNotes } from "./build-notes.mjs"

const scriptPath = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(scriptPath), "..")
const siteFiles = [
  "index.html",
  "contact.html",
  "impressum.html",
  "datenschutz.html",
  "style.css",
  "components.js",
  "theme.js",
  "navigation.js",
  "components",
  "gonzales",
]

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

export async function buildSite(options = {}) {
  const outputDirectory = path.resolve(options.outputDirectory ?? path.join(projectRoot, ".site"))
  const cacheDirectory = path.resolve(
    options.cacheDirectory ?? path.join(projectRoot, ".cache", "homepage"),
  )
  const notesDirectory = await buildNotes({
    workDirectory: path.join(cacheDirectory, "notes-work"),
    outputDirectory: path.join(cacheDirectory, "notes-public"),
    force: options.force,
  })

  await rm(outputDirectory, { recursive: true, force: true })
  await mkdir(outputDirectory, { recursive: true })

  for (const entry of siteFiles) {
    const source = path.join(projectRoot, entry)
    if (!(await exists(source))) {
      throw new Error(`Required site source is missing: ${source}`)
    }
    await cp(source, path.join(outputDirectory, entry), { recursive: true })
  }

  await cp(notesDirectory, path.join(outputDirectory, "notes"), { recursive: true })

  for (const requiredPath of ["index.html", path.join("notes", "index.html")]) {
    if (!(await exists(path.join(outputDirectory, requiredPath)))) {
      throw new Error(`Site build is missing ${requiredPath}.`)
    }
  }

  console.log(`Built complete site into ${outputDirectory}.`)
  return outputDirectory
}

function readCliOption(name, fallback) {
  const index = process.argv.indexOf(name)
  if (index === -1) {
    return fallback
  }
  const value = process.argv[index + 1]
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`)
  }
  return value
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""
if (invokedPath === import.meta.url) {
  await buildSite({
    outputDirectory: readCliOption("--output"),
    cacheDirectory: readCliOption("--cache"),
    force: process.argv.includes("--force"),
  })
}