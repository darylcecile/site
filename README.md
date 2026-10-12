# darylcecile.net

A personal website and blog built with TanStack Start and React, deployed to Cloudflare Workers with the native `cf` CLI.

## Overview

This is the source code for [darylcecile.net](https://darylcecile.net), a personal website showcasing:

- **Notes** - Blog posts and articles on software development, technology, and personal experiences
- **Projects** - A portfolio of personal and professional projects
- **Ideas** - Long-form explorations with code examples and interactive experiments
- **Photography** - Visual content and creative work

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) and TanStack Router
- **Build tooling**: [Vite](https://vite.dev/), [Bun](https://bun.sh), and Node.js
- **Runtime**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Content**: Markdown and MDX compiled into React modules before development and builds
- **Syntax Highlighting**: [Shiki](https://shiki.style/), compiled at build time
- **Animations**: [Motion](https://motion.dev/)
- **Deployment**: Native Cloudflare Build Output with `cf build` and `cf deploy`

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.3+ for dependencies and content generation
- Node.js 22.18+ for Vite and Cloudflare's typed configuration loader
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/darylcecile/site.git
   cd site
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure build-time variables and local Worker secrets:

   ```bash
   cp .env.example .env
   cp .dev.vars.example .dev.vars
   ```

   Set `GITHUB_TOKEN` where GitHub-backed features need it. See [Environment variables and secrets](#environment-variables-and-secrets).

### Development

Start the development server:

```bash
bun run dev
```

The site will be available at [http://localhost:3000](http://localhost:3000). The Cloudflare Vite plugin runs server-side code in the Workers runtime with local bindings.

Vite first runs `scripts/contentBuilder.ts`, then `scripts/feedBuilder.ts`. This also happens when `cf build` invokes Vite directly, so content generation does not depend on a package-manager lifecycle hook. If either script fails, startup/build stops.

### Building for Production

Build the project:

```bash
bun run build
```

Preview the built Worker locally:

```bash
bun run preview
```

Preview reuses the existing build and does not regenerate content. Cloudflare Workers is the supported deployment target; the former Next.js standalone Docker deployment has been removed.

## Available scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Generate content and start Vite/Workers development on port 3000 |
| `bun run content` | Regenerate content modules, feeds, and search data |
| `bun run build` | Generate content and create production Build Output with `cf build` |
| `bun run preview` | Preview the existing production build on port 3000 |
| `bun run deploy` | Build and deploy with `cf`, using the `daryl` profile |
| `bun run typecheck` | Generate Worker binding types, then run TypeScript |
| `bun run lint` | Run ESLint |

Run development or a build before the first typecheck so TanStack Router has generated `src/routeTree.gen.ts`. Worker types are generated in `.cloudflare/types/`. Both are generated files; do not edit them by hand.

## Environment variables and secrets

| Variable | Location | Purpose |
|----------|----------|---------|
| `GITHUB_TOKEN` | `.env` or the build environment | Credentials for build-time tooling that requests GitHub data |
| `GITHUB_TOKEN` | `.dev.vars` | Credentials for GitHub activity and repository statistics in the local Worker |
| `GITHUB_TOKEN` | Deployed Worker secret | Credentials for GitHub activity and repository statistics in production |
| `CLOUDFLARE_API_TOKEN` | Deployment environment, usually CI | Cloudflare CLI authentication; takes precedence over OAuth profiles |

Build-time variables are not automatically deployed as Worker secrets. Keep GitHub tokens out of `VITE_*` variables, which are public. `.env` and `.dev.vars` are gitignored; their example files contain no credentials.

The canonical site URL is configured in `src/lib/site.ts`.

## Cloudflare deployment

`cloudflare.config.ts` is the deployment source of truth:

- Account: `a8f7a4b5985cc49fd440ab9f564a7cec` (personal account).
- Worker: `darylcecile-site`, serving `darylcecile.net` and `darylcecile-site.darylcecile.workers.dev`.
- `www.darylcecile.net` is also bound to the Worker; `src/server.ts` preserves its redirect to the canonical domain.
- `ASSETS` serves built static assets; hashed `/assets/*` files receive immutable caching headers from `public/_headers`.
- `IMAGES` provides runtime image transforms.
- `SITE_CACHE` is the configured KV namespace for upstream application data. Local development uses local binding state.
- `GITHUB_TOKEN` is a secret binding. Supply its value separately.
- Observability is enabled.

Social images pin `@vercel/og` 0.7.2, whose edge build imports precompiled Yoga and
Resvg WebAssembly modules. Its bundled fallback font is inlined by
`scripts/ogFontPlugin.ts` because Workers cannot fetch it during module initialization.
The newer renderer's HarfBuzz loader relies on browser/Node APIs unavailable in Workers.

Custom domains are declared in the typed configuration and applied by `cf deploy`.

### Personal account authentication

Create the profile when setting up a machine, then confirm its identity:

```bash
bunx cf auth create daryl
bunx cf auth whoami --profile daryl
```

Complete authorization as `darylcecile@gmail.com` and confirm the returned account matches the configured account. A profile name does not select a Cloudflare identity. If `CLOUDFLARE_API_TOKEN` is set, unset it before creating an OAuth profile; environment-token authentication takes precedence over profiles.

Optionally bind the profile to this checkout:

```bash
bunx cf auth activate daryl .
```

### Build, preview, and deploy

```bash
bun run build
bun run preview
```

When ready to publish the inspected build:

```bash
bunx cf deploy --prebuilt --profile daryl --mode production
```

For the first deployment, supply the runtime secret using a gitignored `.env`-format secrets file, such as the local `.dev.vars` containing `GITHUB_TOKEN`:

```bash
bunx cf deploy --prebuilt --profile daryl --mode production --secrets-file .dev.vars
```

`bun run deploy` builds and deploys in one command. `bun run deploy --secrets-file .dev.vars` also supplies secret values. Keep secrets files untracked and pass file paths rather than token values on the command line.

The equivalent direct build is `bunx cf build`. Vite defaults to production mode and records that mode in Build Output under `.cloudflare/output/`; `--prebuilt` deploys that output without rebuilding it. In cf beta.14, the TanStack detector rejects `--mode` on build commands, so pass `--mode production` only to the prebuilt deploy.

### GitHub Actions CI

Once `.github/workflows/deploy.yml` is pushed or merged to `main`, pushes to `main` (including merged pull requests) automatically build, typecheck, and deploy to [darylcecile.net](https://darylcecile.net). **Run workflow** also supports manual deployment from `main` only. Production deployments are serialized, with in-progress deployments allowed to finish.

Configure the GitHub repository secret `CLOUDFLARE_API_TOKEN` with a deployment token for the account in `cloudflare.config.ts`. The runner uses Node.js 24 and Bun 1.3.14, installs with `bun install --frozen-lockfile`, runs `bun run build` before `bun run typecheck`, then deploys with `bunx cf deploy --prebuilt --mode production`. Only the deploy step receives the Cloudflare token; no personal OAuth profile is used on the runner.

The existing deployed Worker `GITHUB_TOKEN` is retained. CI requires no runtime GitHub secret and does not send GitHub Actions' `github.token` to the Worker.

## Project Structure

```
src/
├── routes/                 # TanStack Start pages and server routes
├── router.tsx              # Router setup
├── routeTree.gen.ts        # Generated by TanStack Router (gitignored)
├── components/             # React components
│   ├── header/             # Site header
│   ├── nav/                # Navigation
│   ├── notes/              # Notes components
│   ├── projects/           # Projects components
│   └── ui/                 # Shared UI components
├── lib/                    # Utility functions and helpers
├── generated/content/      # Build-generated content modules (gitignored)
├── ideas_markdown/          # Ideas and interactive essays (MDX)
├── notes_markdown/         # Blog post content (Markdown)
└── projects_markdown/      # Project descriptions (Markdown)
```

## Writing an idea

Add an `.mdx` file to `src/ideas_markdown/`. Its filename becomes the URL:
`my-idea.mdx` → `/ideas/my-idea`. The content builder reads the Studio collection,
compiles its MDX, and generates the data used by `/ideas`, the homepage's latest-idea card, and site search.

```yaml
---
title: "An idea worth exploring"
snippet: "The question at the heart of the idea."
date: "2026-09-24"
status: "Exploring"
topics: ["Developer tools"]
---
```

Statuses are `Exploring`, `Prototyping`, and `Revisited`. Optional metadata:
`lastUpdated` (ISO date), `repository` (URL), `icon` (`sprout`, `fish`, `database`,
or `package`, defaults to `sprout`), and `hidden` (boolean). Hidden ideas are
excluded from listings, search, and article routes. Use unique plain-text
`##` headings for the automatically generated contents. Fenced code blocks use
the site's syntax highlighting and copy button.

Interactive components live in `src/components/ideas/`. Register them in
`IdeaMarkdown.tsx`, then embed them directly in MDX, e.g. `<MyExperiment />`.
Keep state in a small client component so the surrounding essay renders on the
server. `Experiment` supplies an accessible labeled frame and reset action.
Label explanatory simulations and distinguish proposed behavior from implemented
features in technical explorations. No MDX imports are needed.

Run `bun run content` after editing Markdown or MDX to regenerate the content
modules, feeds, and search data. The production build also runs these steps.
Restart the dev server after adding or removing a file so the generated content
imports and Studio's slug map are refreshed. `src/generated/` is build output and
should not be edited or committed.

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and passes linting checks.
