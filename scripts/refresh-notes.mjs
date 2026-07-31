import { spawnSync } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const defaultRepository = "https://github.com/KasperNr1/Volcano.git"
const defaultBranch = "main"

function readOption(name, fallback) {
  const optionIndex = process.argv.indexOf(name)
  if (optionIndex === -1) {
    return fallback
  }

  const value = process.argv[optionIndex + 1]
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`)
  }

  return value
}

const repository = readOption("--repository", defaultRepository)
const branch = readOption("--branch", defaultBranch)
const remoteRef = `refs/heads/${branch}`
const gitResult = spawnSync("git", ["ls-remote", repository, remoteRef], {
  encoding: "utf8",
  shell: false,
})

if (gitResult.error) {
  throw new Error(`Could not run Git: ${gitResult.error.message}`)
}

if (gitResult.status !== 0) {
  throw new Error(
    `Could not read ${remoteRef} from ${repository}.\n${gitResult.stderr.trim()}`,
  )
}

const latestCommit = gitResult.stdout.trim().split(/\s+/)[0]
if (!/^[0-9a-f]{40}$/.test(latestCommit)) {
  throw new Error(`Git returned an invalid commit for ${remoteRef}: ${latestCommit || "(empty)"}`)
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const refPath = path.resolve(scriptDirectory, "..", "notes", "volcano.ref")
const currentCommit = (await readFile(refPath, "utf8")).trim()

if (currentCommit === latestCommit) {
  console.log(`Notes snapshot is already current at ${latestCommit}.`)
  process.exit(0)
}

await writeFile(refPath, `${latestCommit}\n`, "utf8")

console.log("Updated notes snapshot:")
console.log(`  ${currentCommit}`)
console.log(`  ${latestCommit}`)
console.log("Commit notes/volcano.ref and redeploy the homepage to publish it.")