# Tuna

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users and purpose
Developers using OpenCode V2, Copilot CLI, Codex, or Claude Code who are tired of repeating expectations and manually tending an ever-growing AGENTS.md. Tuna listens while they work, learns useful preferences from conversation, and automatically keeps shared instructions current and concise. Harness-provided tools let agents look up relevant working preferences when needed.

## Maker origin
Daryl began keeping his expectations and habits in AGENTS.md because agents kept needing the same corrections. The file grew; each new unwanted behavior led to another daily edit. Tuna was built to take over that maintenance: retain useful feedback, consolidate it, and clean up duplicate, conflicting, or stale instructions in the background. The website's first-person maker passage is an edited account of this user-confirmed origin, not a testimonial or a verbatim quotation.

## Capabilities and constraints
- macOS/Linux, ARM64/AMD64. Installation via Binzo or release binary. `tuna start` installs discovered integrations and launches a detached process; rerun after reboot.
- New textual prompts only. Optional bounded recent assistant context. No historical-session import, unavailable UI reactions, or OpenCode child-session capture.
- One actionable durable correction can qualify. Unique observed events can reinforce a stable ID when the model judges intent and conditions equivalent. Explicit later conflicting intent can supersede the old preference; model judgments remain fallible.
- Defaults: 30-second analysis ticks; 23:00 local consolidation, after the queue drains; 180 days since last confirmation before expiry during consolidation.
- Consolidation reassesses evidence, can narrow overbroad wording, merge equivalent preferences, and reconcile duplicate or conflicting passages in existing instructions. Exact-text edits must match once and cite a kept preference; relevance is model judgment. Changed files are backed up. This maintains AGENTS.md, not a Git-commit workflow.
- Integrations expose `preferences` and instruct agents to look up relevant expectations before substantial work. Query is literal text in rules/evidence, with optional category/source-model filters. Active records are available between instruction refreshes; tool use and adherence depend on the agent/harness.
- SQLite is local storage, not offline inference. Analysis sends captured messages, available assistant context, source metadata (including working-directory path), and active preferences/evidence to the selected harness/provider. Consolidation also sends existing shared instructions. This uses the provider's normal allowance.
- CLI/MCP reads work when stopped; capture, removal and consolidation require the service. Removal clears quote/history/published line but retains ID/status/rule and does not erase backups or undo prior handwritten-instruction edits.
- MCP instructions direct agents to use `remember` only on explicit user/skill direction; the runtime does not verify that direction. `queued: true` acknowledges queue storage, not a retained or published preference.

## Evidence on hand
Public source at `darylcecile/tuna`, revision `1d273ab98b041425b59af961adbf1e65a8e3dc28`. Source and tests traced in `RESEARCH.md`. No live provider analysis or conversations are used by this website. The walkthrough is authored illustrative data, not recorded model output. Release metadata validation is owned by the parent session.

## Product principles
Lead with less repetition and less manual instruction upkeep. Show normal work → feedback learning → automatic maintenance → timely lookup. Keep analysis and publication timing distinct without making either a daily user chore. Getting started ends in working normally; inspection and `tuna consolidate` are optional. Preserve source truth, meaningful evidence, and user controls without letting implementation details overwhelm the benefit. Keep the established lavender identity.

## Accessibility & inclusion
Keyboard-operated demonstration; visible focus; reduced motion; light/dark themes; 390px mobile and 1440px desktop. No account or conversation input required.
