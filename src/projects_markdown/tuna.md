---
name: Tuna
startYear: 2026
link: https://tuna.darylcecile.net
image: https://tuna.darylcecile.net/og
tokens: [tooling]
repo: darylcecile/tuna
---

Tuna keeps my coding agents' instructions current from the feedback I give while working, so I can stop repeating expectations and maintaining `AGENTS.md` by hand.

## Why I built it

I was tired of telling my agents the same things and having them forget my expectations and habits. I started keeping those expectations in `AGENTS.md`, but the file grew. Each new unwanted behaviour meant another edit, and I was spending time every day maintaining the instructions that were supposed to save me time.

I wanted that upkeep handled for me: keep the file current and concise, reconcile duplicates and contradictions, and clear out guidance that had gone stale.

## Let everyday feedback do the upkeep

Tuna listens in the background as I work with my agents. It retains useful corrections and preferences with their supporting feedback, then consolidates them and refreshes the shared instructions automatically. That maintenance includes merging equivalent preferences, reconciling changed expectations and retiring stale notes.

Learning a preference and publishing the updated instructions happen in separate stages. Once Tuna is running, the everyday workflow is simply to work normally and give feedback when something needs correcting. I can inspect what it has learned, remove an unwanted preference or request an immediate refresh when I need to.

Tuna also gives agents in each supported harness a preference lookup. They can ask for the expectations relevant to the task at hand, alongside the shared instructions they already read. It works across OpenCode V2, Copilot CLI, Codex and Claude Code.

The aim is less repetition and less file-tending: the corrections I make today should keep being useful in the next conversation.

The [Tuna website](https://tuna.darylcecile.net) follows one correction through to the maintained instructions and a future agent's lookup, with installation and usage guidance.
