---
name: Sakoa
startYear: 2026
link: https://github.com/darylcecile/sakoa
tokens: [language, tooling]
repo: darylcecile/sakoa
---

Sakoa is a progressive systems and application language designed to be approachable for scripts, structured enough for services, and built around explicit safety, effects, and strong tooling. It aims to feel familiar at the surface (braces, no semicolons, type inference, types after names) while making the dangerous parts of programming visible — unsafe operations, host effects, borrowing, and mutation are all explicit by design.

The repository ships a complete toolchain in a single binary: a Rust-based compiler frontend with trait/generic/effect/ownership checking, an MIR interpreter, a deterministic package manager with workspace lockfiles, a formatter, linter, test runner with property-based tests and snapshots, a markdown docs generator, structured phase profiling, an LSP server, and a VSCode extension. Build targets include native, JavaScript, WebAssembly, and embedded artifacts.

### Motivation

Most languages either optimise for ergonomics at the cost of safety, or for safety at the cost of approachability. With Sakoa, I wanted to explore a middle path — a language where you can write a small script in a few lines, but that scales up to services and systems code without changing tools or rewriting in a "real" language later. Effects, ownership, and unsafety should be visible in the source, not hidden behind conventions, so that the cost of a piece of code is something you can read off the page.

The other goal is tooling. Too often the language is one project, the package manager another, the formatter a third, and the editor support a fourth. Sakoa is built so a single `sakoa` CLI owns the full lifecycle — `init`, `add`, `check`, `test`, `run`, `build`, `fmt`, `lint`, `docs`, `profile`, `explain` — and the editor experience comes from the same compiler that runs your build.
