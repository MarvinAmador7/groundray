# Groundray website

The product landing page for [Groundray](https://github.com/MarvinAmador7/groundray).
Scaffolded with **Better T Stack 3.47.0**, using React 19, React Router, Vite,
TypeScript, Tailwind CSS 4, and shadcn/ui (Base UI). This is a standalone npm
workspace inside the Python repository; the CLI does not depend on it.

## Develop

Use Node.js 24 and npm 11.16+ (the scaffold uses npm's `allowScripts` policy).
From this directory:

```sh
npm ci
npm run dev:web
```

Open the Local URL printed by Vite. To preview from another device on the same
network, run `npm run dev:web -- --host 0.0.0.0`. Clipboard copy needs HTTPS or
localhost; if access is denied, the page provides a manual-copy message.

```sh
npm run check-types
npm run build
npm run preview
```

The build prerenders the home page, including its copy and metadata, to
`apps/web/build/client/index.html`. Upload **`apps/web/build/client/`** to any
static host. No server, database, environment variables, or runtime secrets are
required. Preview serves that production output locally.

## Structure

- `apps/web/src/components/groundray-page.tsx`: the production landing page.
  Dark, dithered artwork, self-hosted Geist/Geist Mono, setup-prompt copying,
  a compact GitHub brain-install command, architecture, the review/publish/sync
  workflow, ownership, and FAQ. The approved design is served at `/`.
- `apps/web/src/routes/_index.tsx`: exports the homepage and its search/social
  metadata. `/signal` renders the same design for existing links, with `noindex`
  and a canonical URL pointing to the homepage. Both routes are prerendered.
- `apps/web/src/components/signal-evidence-demo.tsx`: an animated fictional
  agent session. It shows sync, indexing, querying, source inspection, a grounded
  answer, and a proactively suggested fact previewed after illustrative consent.
  Chapter controls pause for inspection; playback pauses offscreen or in hidden
  tabs, supports replay, and provides a static reduced-motion view. No commands
  or model calls run, and no company knowledge is saved.
- `apps/web/src/components/hero-setup.tsx`: one agent-neutral setup prompt,
  clipboard copying, a modal preview, and manual-copy fallback. Codex and Claude
  Code have plugin access; Cursor, Gemini CLI, and OpenCode use the CLI through
  terminal access. Self-hosted monochrome marks identify the supported tools.
- `apps/web/src/signal.css`: the production design, responsive layout, and demo
  styles. `index.css` supplies shared base styles and the setup-prompt control.
- `packages/ui/`: checked-in shadcn/ui components.
- `bts.jsonc`: retained Better T Stack scaffold configuration.

The primary hero action copies setup instructions into the clipboard for an
agent with terminal access. It does not install software in the browser. The
page has no analytics, model connections, or automatic data collection.

## Artwork and fonts

The architectural archive landscape was generated for Groundray and exported
to WebP. Live HTML supplies the typography. Geist and Geist Mono are self-hosted
Latin variable WOFF2 fonts under the SIL Open Font License; notices are retained
in `apps/web/public/fonts/`. See [ASSETS.md](ASSETS.md). Earlier courtyard artwork
and fonts remain in the repository for historical designs.

## Vercel production

Import `MarvinAmador7/groundray` and set **Root Directory** to `website`.
The tracked `vercel.json` selects a static deployment, installs with npm 11.16.0,
builds the workspace, and serves `apps/web/build/client/`. Node is pinned to
24.x. Keep production on the `main` branch and keep files outside the root
directory excluded; all website workspaces live inside `website/`.

Attach `groundray.com` under the Vercel project's Domains settings. The page's
canonical URL, social metadata, robots file, and sitemap use that exact domain.
Vercel will show whether the existing domain needs assignment or a DNS change.
Do not replace unrelated DNS records. The domain should serve only the production
deployment after the build succeeds.
