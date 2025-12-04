# darylcecile.net

A personal website and blog built with Next.js, featuring notes, projects, and more.

## Overview

This is the source code for [darylcecile.net](https://darylcecile.net), a personal website showcasing:

- **Notes** - Blog posts and articles on software development, technology, and personal experiences
- **Projects** - A portfolio of personal and professional projects
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

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and passes linting checks.
