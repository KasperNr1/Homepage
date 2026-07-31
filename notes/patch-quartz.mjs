import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

async function replaceExactlyOnce(filePath, original, replacement, description) {
  const source = await readFile(filePath, "utf8")
  const occurrences = source.split(original).length - 1

  if (occurrences !== 1) {
    throw new Error(
      `Expected one ${description} in ${filePath}, found ${occurrences}. Review the Quartz upgrade before building.`,
    )
  }

  await writeFile(filePath, source.replace(original, replacement), "utf8")
}

const root = process.cwd()
const headPath = path.join(root, "quartz", "components", "Head.tsx")
const latexPluginPath = path.join(
  root,
  "node_modules",
  "@quartz-community",
  "latex",
  "dist",
  "index.js",
)
const graphPluginPath = path.join(
  root,
  "node_modules",
  "@quartz-community",
  "graph",
  "dist",
  "components",
  "index.js",
)
const obsidianPluginPath = path.join(
  root,
  "node_modules",
  "@quartz-community",
  "obsidian-flavored-markdown",
  "dist",
  "index.js",
)

await replaceExactlyOnce(
  headPath,
  '        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />\n',
  "",
  "unconditional CDN preconnect",
)
await replaceExactlyOnce(
  latexPluginPath,
  "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
  "/notes/static/katex/katex.min.css",
  "KaTeX CDN stylesheet URL",
)
await replaceExactlyOnce(
  latexPluginPath,
  "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/copy-tex.min.js",
  "/notes/static/katex/copy-tex.min.js",
  "KaTeX CDN script URL",
)
await replaceExactlyOnce(
  graphPluginPath,
  "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js",
  "/notes/static/graph/d3.min.js",
  "D3 CDN script URL",
)
await replaceExactlyOnce(
  graphPluginPath,
  "https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.js",
  "/notes/static/graph/pixi.js",
  "Pixi CDN script URL",
)
await replaceExactlyOnce(
  obsidianPluginPath,
  "https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.esm.min.mjs",
  "/notes/static/mermaid/mermaid.esm.min.mjs",
  "Mermaid CDN module URL",
)

const katexDist = path.join(root, ".katex", "dist")
const staticDist = path.join(root, "quartz", "static", "katex")
await rm(staticDist, { recursive: true, force: true })
await mkdir(staticDist, { recursive: true })
await cp(path.join(katexDist, "katex.min.css"), path.join(staticDist, "katex.min.css"))
await cp(
  path.join(katexDist, "contrib", "copy-tex.min.js"),
  path.join(staticDist, "copy-tex.min.js"),
)
await cp(path.join(katexDist, "fonts"), path.join(staticDist, "fonts"), { recursive: true })

const staticGraphDist = path.join(root, "quartz", "static", "graph")
await rm(staticGraphDist, { recursive: true, force: true })
await mkdir(staticGraphDist, { recursive: true })
await cp(path.join(root, ".d3", "dist", "d3.min.js"), path.join(staticGraphDist, "d3.min.js"))
await cp(path.join(root, ".pixi", "dist", "pixi.js"), path.join(staticGraphDist, "pixi.js"))
await cp(path.join(root, ".pixi", "transcoders"), path.join(staticGraphDist, "transcoders"), {
  recursive: true,
})

const localPixiPath = path.join(staticGraphDist, "pixi.js")
const pixiTranscoderUrls = [
  [
    "https://cdn.jsdelivr.net/npm/pixi.js/transcoders/basis/basis_transcoder.js",
    "/notes/static/graph/transcoders/basis/basis_transcoder.js",
  ],
  [
    "https://cdn.jsdelivr.net/npm/pixi.js/transcoders/basis/basis_transcoder.wasm",
    "/notes/static/graph/transcoders/basis/basis_transcoder.wasm",
  ],
  [
    "https://cdn.jsdelivr.net/npm/pixi.js/transcoders/ktx/libktx.js",
    "/notes/static/graph/transcoders/ktx/libktx.js",
  ],
  [
    "https://cdn.jsdelivr.net/npm/pixi.js/transcoders/ktx/libktx.wasm",
    "/notes/static/graph/transcoders/ktx/libktx.wasm",
  ],
]

for (const [remoteUrl, localUrl] of pixiTranscoderUrls) {
  await replaceExactlyOnce(localPixiPath, remoteUrl, localUrl, "Pixi transcoder CDN URL")
}

const staticMermaidDist = path.join(root, "quartz", "static", "mermaid")
await rm(staticMermaidDist, { recursive: true, force: true })
await cp(path.join(root, ".mermaid", "dist"), staticMermaidDist, { recursive: true })

await rm(path.join(root, "quartz", ".quartz-cache"), { recursive: true, force: true })

console.log("Replaced Quartz CDN resources with local KaTeX, graph, and Mermaid assets.")