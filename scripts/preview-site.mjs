import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildSite } from "./build-site.mjs"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".mp4", "video/mp4"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
])

function readOption(name, fallback) {
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

async function fileStats(filePath) {
  try {
    const details = await stat(filePath)
    return details.isFile() ? details : null
  } catch {
    return null
  }
}

async function resolveRequest(siteRoot, requestPath) {
  let decodedPath
  try {
    decodedPath = decodeURIComponent(requestPath)
  } catch {
    return null
  }

  const relativePath = decodedPath.replace(/^\/+/, "")
  const candidates = relativePath
    ? [relativePath, `${relativePath}.html`, path.join(relativePath, "index.html")]
    : ["index.html"]

  for (const candidate of candidates) {
    const absolutePath = path.resolve(siteRoot, candidate)
    const relativeToRoot = path.relative(siteRoot, absolutePath)
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      continue
    }

    const details = await fileStats(absolutePath)
    if (details) {
      return { absolutePath, details }
    }
  }

  return null
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
  })
  response.end(text)
}

function streamFile(request, response, file) {
  const contentType = contentTypes.get(path.extname(file.absolutePath).toLowerCase())
    ?? "application/octet-stream"
  const rangeHeader = request.headers.range
  const commonHeaders = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
    "Content-Type": contentType,
  }

  if (rangeHeader) {
    const rangeMatch = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader)
    if (!rangeMatch) {
      response.writeHead(416, { "Content-Range": `bytes */${file.details.size}` })
      response.end()
      return
    }

    var start
    var end

    if (!rangeMatch[1]) {
      const suffixLength = Number.parseInt(rangeMatch[2], 10)
      start = Math.max(0, file.details.size - suffixLength)
      end = file.details.size - 1
    } else {
      start = Number.parseInt(rangeMatch[1], 10)
      end = rangeMatch[2]
        ? Math.min(Number.parseInt(rangeMatch[2], 10), file.details.size - 1)
        : file.details.size - 1
    }

    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= file.details.size) {
      response.writeHead(416, { "Content-Range": `bytes */${file.details.size}` })
      response.end()
      return
    }

    response.writeHead(206, {
      ...commonHeaders,
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${file.details.size}`,
    })
    if (request.method === "HEAD") {
      response.end()
    } else {
      createReadStream(file.absolutePath, { start, end }).pipe(response)
    }
    return
  }

  response.writeHead(200, {
    ...commonHeaders,
    "Content-Length": file.details.size,
  })
  if (request.method === "HEAD") {
    response.end()
  } else {
    createReadStream(file.absolutePath).pipe(response)
  }
}

const host = readOption("--host", "127.0.0.1")
const port = Number.parseInt(readOption("--port", "8765"), 10)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid port: ${port}`)
}

const siteRoot = await buildSite({
  outputDirectory: path.join(projectRoot, ".site"),
  cacheDirectory: path.join(projectRoot, ".cache", "homepage"),
  force: process.argv.includes("--force"),
})

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendText(response, 405, "Method not allowed")
    return
  }

  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`)
  const file = await resolveRequest(siteRoot, requestUrl.pathname)
  if (!file) {
    sendText(response, 404, "Not found")
    return
  }

  streamFile(request, response, file)
})

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the old preview and run this command again.`)
    process.exit(1)
  }
  throw error
})

server.listen(port, host, () => {
  console.log(`Unified preview: http://${host}:${port}/`)
  console.log(`Notes:           http://${host}:${port}/notes/`)
})

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)))
}