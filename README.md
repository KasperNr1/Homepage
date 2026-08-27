# Homepage

Personal website built with [Astro](https://astro.build), served together with a Quartz-generated
copy of the public [Volcano Obsidian vault](https://github.com/KasperNr1/Volcano) under `/notes/`.

## Requirements

- Node.js 22 or newer (including npm)
- Git and `tar` (both needed for the notes build)
- An internet connection for the first notes build

## Local development

```sh
npm install
npm run dev
```

The dev server runs at <http://localhost:4321>. It serves `public/` as-is, so `/notes/` only works
after the notes have been generated at least once:

```sh
npm run notes:build
```

Astro backgrounds the dev server when it detects an agentic terminal. Use `npx astro dev stop` to
shut one down; closing the terminal is not enough.

## Production build

```sh
npm run build
npm run preview
```

`build` generates the pinned notes snapshot into `public/notes/`, then builds the whole site into
`dist/`. The notes step is cached and only re-runs when a pinned ref or the notes configuration
changes. Use `node scripts/build-notes.mjs --output public/notes --force` to force a clean rebuild.

## Content

Projects and privacy policies live in `src/content/` as Markdown with Zod-validated frontmatter
(`src/content.config.ts`). Adding a Markdown file is enough to publish a new `/projects/<slug>` or
`/policies/<slug>` page and, for projects, a card on the homepage.

## Updating the Vault snapshot

```sh
npm run notes:update
npm run build
npm run preview
```

The first command only updates the pinned commit in `notes/volcano.ref`. Review the result, then
commit the changed ref together with any homepage changes.

`notes/quartz.ref` pins the Quartz source separately. Only advance it together with a full local
build check, because Quartz updates can change configuration and rendering behaviour.

## Testing

```sh
npm run test:unit           # Vitest
npm run test:visual         # Playwright visual regression
npm run test:visual:update  # accept new snapshots
```

Vitest covers plain modules and React islands (`tests/unit/`, `*.test.ts`). Playwright drives a real
browser against `npm run preview`, so run `npm run build` first. It captures full-page snapshots at
1280x720 and 375x667 (`tests/visual.spec.ts`, `*.spec.ts`).

Snapshots are per platform: Playwright writes `*-win32.png` on Windows and `*-darwin.png` on macOS.
Generate the missing set once per machine with `npm run test:visual:update` and commit it. Browsers
are installed separately with `npx playwright install chromium`.

## Docker

```sh
docker compose up --build
```

The site is then available at <http://localhost:8080>. The multi-stage `Dockerfile` builds the notes
and the Astro site with Node, then serves `dist/` from Nginx using the production `nginx.conf`.

## Live deployment

The hosting service must build the root `Dockerfile`. It generates the pinned notes snapshot during
the image build and serves the homepage and `/notes/` from one Nginx container using the platform's
`PORT`. On NodioN, confirm the deployment log selects the Dockerfile rather than an Nginx/static
buildpack.

After running `npm run notes:update`, commit `notes/volcano.ref` and push. The next deployment
publishes that exact snapshot.

## A note on the npm lockfile

`package-lock.json` must resolve against `https://registry.npmjs.org`. If you run `npm install`
behind a corporate proxy registry, npm rewrites the `resolved` URLs to that internal host. That
leaks the hostname into this public repository and breaks the Docker build, which has no access to
it. Check before committing:

```sh
Select-String -Path package-lock.json -Pattern '"resolved": "https://(?!registry\.npmjs\.org)'
```
