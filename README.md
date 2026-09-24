# darylcecile.net

A personal website and blog built with Next.js, featuring notes, projects, and more.

## Overview

This is the source code for [darylcecile.net](https://darylcecile.net), a personal website showcasing:

- **Notes** - Blog posts and articles on software development, technology, and personal experiences
- **Projects** - A portfolio of personal and professional projects
- **Ideas** - Long-form explorations with code examples and interactive experiments
- **Photography** - Visual content and creative work

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 with Turbopack
- **Runtime**: [Bun](https://bun.sh)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Content**: MDX with [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- **Syntax Highlighting**: [Shiki](https://shiki.style/)
- **Animations**: [Motion](https://motion.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
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

### Development

Start the development server:

```bash
bun run dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the project:

```bash
bun run build
```

Start the production server:

```bash
bun run start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with Turbopack |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run Biome linter |
| `bun run fix` | Auto-fix linting issues |

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── notes/              # Notes/blog section
│   └── projects/           # Projects section
├── components/             # React components
│   ├── header/             # Site header
│   ├── nav/                # Navigation
│   ├── notes/              # Notes components
│   ├── projects/           # Projects components
│   └── ui/                 # Shared UI components
├── lib/                    # Utility functions and helpers
├── notes_markdown/         # Blog post content (Markdown)
└── projects_markdown/      # Project descriptions (Markdown)
```

## Writing an idea

Add an `.mdx` file to `src/ideas_markdown/`. Its filename becomes the URL:
`my-idea.mdx` → `/ideas/my-idea`. Ideas use the existing Studio collection and MDX
renderer, and appear in `/ideas`, the homepage's latest-idea card, and site search.

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
`lastUpdated` (ISO date), `repository` (URL), `icon` (`sprout` or `fish`, defaults
to `sprout`), and `hidden` (boolean). Hidden ideas
are excluded from listings, search, and article routes. Use unique plain-text
`##` headings for the automatically generated contents. Fenced code blocks use
the site's syntax highlighting and copy button.

Interactive components live in `src/components/ideas/`. Register them in
`IdeaMarkdown.tsx`, then embed them directly in MDX, e.g. `<MyExperiment />`.
Keep state in a small client component so the surrounding essay renders on the
server. `Experiment` supplies an accessible labeled frame and reset action.
Label explanatory simulations and distinguish proposed behavior from implemented
features in technical explorations. No MDX imports are needed.

Run `bun run prebuild` to refresh the search index during local authoring; the
production build also runs this step. Restart the dev server after adding a new
file so Studio refreshes its slug map.

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and passes linting checks.
