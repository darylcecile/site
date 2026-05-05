---
name: Plim
startYear: 2025
link: https://github.com/darylcecile/plim
image: https://raw.githubusercontent.com/darylcecile/Plim/main/preview.png
tokens: [web, library]
repo: darylcecile/plim
---

Plim is a Notion-inspired block editor for the web, built as a TypeScript monorepo. It ships a framework-agnostic core, a DOM view layer, a Markdown parser/serializer, and React bindings — all small, composable, and designed to be embedded in your own product. A live [example](https://plim-editor.vercel.app/) is available, and the project is currently in pre-1.0 (`0.0.x`) — the public API is mostly stable but may shift before `1.0`.

The repo is split into four packages: `@plim/core` provides the schema, document model, transactions, validation rules, action/extension/trigger system, history, and the built-in block & mark descriptors (runtime-agnostic, no DOM); `@plim/markdown` parses Markdown into a Plim document and serializes back; `@plim/editor` is the view layer that mounts a Plim document into a `contenteditable`, owning the floating toolbar, block-handle gutter, paste/clipboard handling, drag-and-drop, and the keyboard pipeline; and `@plim/react` provides React bindings including `<PlimEditor>`, `useEditorHandle()`, slash-command and mention extensions, and a bridge for defining blocks with `toComponent` so real React components can be persisted into the document.

### Motivation

I'd been playing around with [ProseMirror](https://prosemirror.net) and [Tiptap](https://tiptap.dev) and kept getting frustrated by how un-opinionated they were. Every project ended up rebuilding the same scaffolding — toolbars, slash menus, block handles, paste handling — before I could get to the part I actually cared about. So I started toying with what an API for an *opinionated* editor could look like while still leaving room for extensibility. That experimentation became the first version of Plim (Mauritian Creole for *pen*).

Once I had an initial vision, I leaned heavily on <Abbr title="GitHub Copilot" link="https://github.com/features/copilot">GitHub Copilot</Abbr> and <Abbr title="OpenCode" link="https://opencode.ai">OpenCode</Abbr> (using GPT-5.5 and Opus 4.7) to research Notion, ProseMirror, and what a future block editor could look like — including filling in gaps in my initial design. After many hours of tweaking, testing, and polishing the API surface, I ended up with something noticeably more capable than what I'd originally set out to build: a small, embeddable editor that's opinionated where it should be, and gets out of the way where it shouldn't.
