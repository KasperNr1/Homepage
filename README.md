# Homepage

Static homepage with a Quartz-generated copy of the public
[Volcano Obsidian vault](https://github.com/KasperNr1/Volcano) under `/notes/`.

## Requirements

- Node.js 22 or newer (including npm)
- Git
- `tar` (included with current macOS and Windows installations)
- An internet connection for the first notes build

## Local preview

Use the same command on macOS, Windows, and Linux:

```sh
npm run preview
```

This builds the homepage and the pinned Vault snapshot into `.site/`, then serves everything from one
origin:

- Homepage: <http://127.0.0.1:8765/>
- Notes: <http://127.0.0.1:8765/notes/>

The first run downloads Quartz and the Vault. Later runs reuse `.cache/` until a ref or notes build
configuration changes. Use `npm run preview -- --force` to force a clean notes rebuild.

Do not use `python -m http.server`, VS Code Live Preview, or another source-folder server for this
project. Those tools expose `notes/` as configuration files and cannot resolve Quartz's generated clean
URLs.

Press `Ctrl+C` to stop the preview.

## Updating the Vault snapshot

```sh
npm run notes:update
npm run preview
```

The first command only updates the pinned commit in `notes/volcano.ref`. The second command rebuilds and
previews that snapshot. Review the result, then commit the changed ref with the homepage changes.

## Production-equivalent Docker preview

```sh
docker build -t magnusbos-homepage .
docker run --rm -p 8765:8080 magnusbos-homepage
```

Docker invokes the same `scripts/build-site.mjs` pipeline and serves the result with the production
Nginx configuration. Stop `npm run preview` first because both commands use local port 8765.

## Live deployment

The hosting service must build the root `Dockerfile`. It generates the pinned notes snapshot during the
image build and serves the homepage and `/notes/` from one Nginx container using the platform's `PORT`.
On NodioN, confirm the deployment log selects the Dockerfile rather than an Nginx/static buildpack.

After running `npm run notes:update`, commit `notes/volcano.ref` and push the repository. The next Docker
deployment publishes that exact snapshot.