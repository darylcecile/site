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
