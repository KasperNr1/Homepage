import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import {
  access,
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const quartzRepository = "https://github.com/jackyzha0/quartz.git"
const volcanoRepository = "https://github.com/KasperNr1/Volcano.git"
const vendorPackages = [
  { name: "katex", version: "0.16.11", directory: ".katex", archive: "katex-0.16.11.tgz" },
  { name: "d3", version: "7.9.0", directory: ".d3", archive: "d3-7.9.0.tgz" },
  { name: "pixi.js", version: "8.19.0", directory: ".pixi", archive: "pixi.js-8.19.0.tgz" },
  { name: "mermaid", version: "11.4.0", directory: ".mermaid", archive: "mermaid-11.4.0.tgz" },
]

const scriptPath = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(scriptPath), "..")

function commandInvocation(command, args) {
  if (process.platform !== "win32" || command !== "npm") {
    return { executable: command, args }
  }

  const npmCliPath = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")
  if (!existsSync(npmCliPath)) {
    throw new Error(`Could not find npm CLI at ${npmCliPath}. Reinstall Node.js with npm included.`)
  }

  return { executable: process.execPath, args: [npmCliPath, ...args] }
}

function run(command, args, options = {}) {
  const invocation = commandInvocation(command, args)
  const result = spawnSync(invocation.executable, invocation.args, {
    cwd: options.cwd,
    encoding: "utf8",
    shell: false,
    stdio: options.capture ? "pipe" : "inherit",
  })

  if (result.error) {
    throw new Error(`Could not run ${command}: ${result.error.message}`)
  }

  if (result.status !== 0) {
    const details = options.capture ? `\n${(result.stderr || result.stdout).trim()}` : ""
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}.${details}`)
  }

  return result.stdout?.trim() ?? ""
}

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function readRef(filePath) {
  const value = (await readFile(filePath, "utf8")).trim()
  if (!/^[0-9a-f]{40}$/.test(value)) {
    throw new Error(`Invalid Git commit in ${filePath}: ${value || "(empty)"}`)
  }
  return value
}

async function calculateBuildKey(files, values) {
  const hash = createHash("sha256")
  hash.update("homepage-notes-build-v1\0")

  for (const value of values) {
    hash.update(value)
    hash.update("\0")
  }

  for (const filePath of files) {
    hash.update(await readFile(filePath))
    hash.update("\0")
  }

  return hash.digest("hex")
}

async function prepareRepository(directory, repository, commit) {
  if (!(await exists(path.join(directory, ".git")))) {
    await rm(directory, { recursive: true, force: true })
    await mkdir(directory, { recursive: true })
    run("git", ["init", "."], { cwd: directory })
    run("git", ["remote", "add", "origin", repository], { cwd: directory })
  } else {
    run("git", ["remote", "set-url", "origin", repository], { cwd: directory })
  }

  run("git", ["fetch", "--depth", "1", "origin", commit], { cwd: directory })
  run("git", ["checkout", "--detach", "--force", "FETCH_HEAD"], { cwd: directory })
  run("git", ["clean", "-fdx"], { cwd: directory })
}

async function extractVault(vaultDirectory, quartzDirectory, temporaryDirectory) {
  const contentDirectory = path.join(quartzDirectory, "content")
  const archivePath = path.join(temporaryDirectory, "volcano.tar")

  await mkdir(temporaryDirectory, { recursive: true })
  await rm(contentDirectory, { recursive: true, force: true })
  await mkdir(contentDirectory, { recursive: true })
  await rm(archivePath, { force: true })

  run("git", ["archive", "HEAD", "--output", archivePath], { cwd: vaultDirectory })
  run("tar", ["-xf", archivePath, "-C", contentDirectory])
  await rm(archivePath, { force: true })
}

async function prepareVendorPackages(quartzDirectory, temporaryDirectory) {
  await mkdir(temporaryDirectory, { recursive: true })

  for (const vendor of vendorPackages) {
    const archivePath = path.join(temporaryDirectory, vendor.archive)
    const destination = path.join(quartzDirectory, vendor.directory)

    await rm(archivePath, { force: true })
    await rm(destination, { recursive: true, force: true })
    await mkdir(destination, { recursive: true })

    run(
      "npm",
      ["pack", `${vendor.name}@${vendor.version}`, "--pack-destination", temporaryDirectory],
      { cwd: quartzDirectory, capture: true },
    )
    run("tar", ["-xzf", archivePath, "-C", destination, "--strip-components=1"])
  }
}

export async function buildNotes(options = {}) {
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10)
  if (nodeMajor < 22) {
    throw new Error(`Building notes requires Node.js 22 or newer; found ${process.version}.`)
  }

  const workDirectory = path.resolve(
    options.workDirectory ?? path.join(projectRoot, ".cache", "homepage", "notes-work"),
  )
  const outputDirectory = path.resolve(
    options.outputDirectory ?? path.join(projectRoot, ".cache", "homepage", "notes-public"),
  )
  const quartzDirectory = path.join(workDirectory, "quartz")
  const vaultDirectory = path.join(workDirectory, "volcano")
  const temporaryDirectory = path.join(workDirectory, "packages")
  const quartzCliPath = path.join(quartzDirectory, "quartz", "bootstrap-cli.mjs")
  const quartzRefPath = path.join(projectRoot, "notes", "quartz.ref")
  const volcanoRefPath = path.join(projectRoot, "notes", "volcano.ref")
  const configPath = path.join(projectRoot, "notes", "quartz.config.yaml")
  const indexPath = path.join(projectRoot, "notes", "index.md")
  const patchPath = path.join(projectRoot, "notes", "patch-quartz.mjs")
  // Kept outside the output directory so it is never published with the site.
  const buildKeyPath = path.join(workDirectory, "build-key")
  const quartzRef = await readRef(quartzRefPath)
  const volcanoRef = await readRef(volcanoRefPath)
  const buildKey = await calculateBuildKey(
    [scriptPath, configPath, indexPath, patchPath],
    [process.version, quartzRef, volcanoRef, ...vendorPackages.map(({ name, version }) => `${name}@${version}`)],
  )

  if (!options.force && await exists(path.join(outputDirectory, "index.html"))) {
    const existingKey = await readFile(buildKeyPath, "utf8").catch(() => "")
    if (existingKey.trim() === buildKey) {
      console.log(`Notes build is current at Volcano ${volcanoRef.slice(0, 8)}.`)
      return outputDirectory
    }
  }

  console.log(`Building notes from Volcano ${volcanoRef.slice(0, 8)}...`)
  await mkdir(workDirectory, { recursive: true })
  await prepareRepository(quartzDirectory, quartzRepository, quartzRef)
  await prepareRepository(vaultDirectory, volcanoRepository, volcanoRef)
  await extractVault(vaultDirectory, quartzDirectory, temporaryDirectory)
  await cp(configPath, path.join(quartzDirectory, "quartz.config.yaml"))
  await cp(indexPath, path.join(quartzDirectory, "content", "index.md"))

  run("npm", ["ci", "--no-audit", "--no-fund"], { cwd: quartzDirectory })
  run(process.execPath, [quartzCliPath, "plugin", "install", "--from-config"], {
    cwd: quartzDirectory,
  })
  await prepareVendorPackages(quartzDirectory, temporaryDirectory)
  run(process.execPath, [patchPath], { cwd: quartzDirectory })
  run(process.execPath, [quartzCliPath, "build"], { cwd: quartzDirectory })

  await rm(outputDirectory, { recursive: true, force: true })
  await cp(path.join(quartzDirectory, "public"), outputDirectory, { recursive: true })
  await writeFile(buildKeyPath, `${buildKey}\n`, "utf8")

  console.log(`Built notes into ${outputDirectory}.`)
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
  await buildNotes({
    workDirectory: readCliOption("--work-directory"),
    outputDirectory: readCliOption("--output"),
    force: process.argv.includes("--force"),
  })
}