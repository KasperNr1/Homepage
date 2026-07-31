# Volcano notes build

The notes at `/notes/` are generated from the public
[Volcano vault](https://github.com/KasperNr1/Volcano) with Quartz 5.

## Refresh model

`volcano.ref` contains the exact Volcano commit published by the next deployment. This makes every
deployment reproducible and keeps the live notes stable while the vault is being edited.

To move the snapshot to the latest commit on Volcano's `main` branch, run the same command on
Windows, macOS, or Linux:

```sh
node scripts/refresh-notes.mjs
```

This requires Node.js and Git. The existing `scripts/refresh-notes.ps1` remains available as a
Windows convenience wrapper and calls the same Node implementation.

Review and commit the changed `notes/volcano.ref`, then redeploy the homepage. Docker will fetch that
commit, build the vault, and copy only Quartz's static output into the Nginx runtime image.

`quartz.ref` pins the Quartz source independently. It should only be advanced together with a full
local build check because Quartz updates can change configuration and rendering behavior.

## Local browser assets

`patch-quartz.mjs` removes Quartz's runtime CDN dependencies and fails if an upstream upgrade changes
the expected source locations. The Docker build packages these versions and serves them from `/notes/static/`:

- KaTeX 0.16.11
- D3 7.9.0
- Pixi 8.19.0
- Mermaid 11.4.0

This keeps the notes compatible with the homepage privacy policy: analytics are disabled and page views
do not load resources from third-party origins.

## Automatic updates

The same refresh command can later run in GitHub Actions on a schedule or after a repository dispatch
from Volcano. Until then, updates are intentionally manual.