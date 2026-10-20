# Groundray website

The product landing page for [Groundray](https://github.com/MarvinAmador7/groundray).
Scaffolded with **Better T Stack 3.47.0**, using React 19, React Router, Vite,
TypeScript, Tailwind CSS 4, and shadcn/ui (Base UI). This is a standalone npm
workspace inside the Python repository; the CLI does not depend on it.

## Develop

Use Node.js 24+ and npm 11.16+ (the scaffold uses npm's `allowScripts` policy).
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

- `apps/web/src/routes/_index.tsx`: landing page, evidence illustration,
  installation commands, and FAQ.
- `apps/web/src/index.css`: responsive layout and Groundray design tokens.
- `apps/web/src/components/value-visuals.tsx` and `value-visuals.css`: interactive
  continuity scenarios, workflow illustrations, and the
  portable brain with host-specific prompt examples.
- `apps/web/src/components/fact-graph.tsx` and `fact-graph.css`: the conceptual
  fact lifecycle graph, including source records, reviewed versions, reusable
  guidance, and a selectable node inspector. Connectors follow the layout
  through responsive changes.
- `packages/ui/`: checked-in shadcn/ui Button, Tabs, Accordion, and Sheet.
- `bts.jsonc`: retained Better T Stack scaffold configuration.

The hero uses a separate image asset with live HTML typography. Installation
commands point to Groundray's current GitHub release. The evidence interaction
uses clearly labeled fictional sample records; it does not call a model or read
company data. The page has no analytics or automatic data collection.

## Artwork and fonts

The courtyard image was generated for this design from the user-approved hero,
then exported to WebP for the page. Instrument Serif and Manrope are self-hosted
Latin WOFF2 files from Google Fonts. Their SIL Open Font License notices are in
`apps/web/public/fonts/`. See [ASSETS.md](ASSETS.md).
