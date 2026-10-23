# Groundwork

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users and purpose
Developers who use coding agents and find that continually checking their work consumes the attention they hoped to save. Groundwork is a framework for verification and trust: establish the task, outcome and guardrails; delegate and step away; return to a report and its proof to decide what is supported and what remains.

## User-confirmed origin
Daryl built Groundwork after increasing use of agents for development made constant supervision overwhelming and led to burnout. Every context switch carried a large mental load. Behaviour mapping, task tracking, enforceable project checks, verification and proof reports give him a return point without reconstructing the agent’s transcript or reading every line of output.

His product principle is: **“Because I trust the framework, I don't need to trust the agent.”** This is the maker’s stated philosophy, not a testimonial or a guarantee of correct code. The website must sell the relief of confident delegation; the implementation details support that purpose.

## Mechanism
Groundwork combines agent skills for exploration, explanation, implementation, judgement and verification with a Bun CLI that executes project-owned checks. Projects supply a behaviour guide, a check catalogue and optionally plans, maps, invariants and richer drivers. Requirements close as verified, failed or unverified. CLI runs finish passed, failed or inconclusive.

## Operating context
Tasks begin in normal agent chat. Bun, Git and Bash run Groundwork; checked projects can use other languages/toolchains. The CLI retains local run evidence and fingerprints Git HEAD, tracked local changes and non-ignored untracked files. The CLI does not choose models, launch judges or certify agent verdicts.

## Evidence and limits
Authority: [public main at b5c89c4d34421f2442ce176000f86b63c0e5bced](https://github.com/darylcecile/groundwork/tree/b5c89c4d34421f2442ce176000f86b63c0e5bced). [RESEARCH.md](RESEARCH.md) connects concrete claims to that source and the owned [recordings](recording/runs.json) and [example](examples/README.md). The repository was observed as public through GitHub GraphQL; the pinned README's private-access wording is stale. No invented customers, testimonials, comparative benchmarks, license or cross-platform guarantees.

## Website constraints
Use the existing React/Vite architecture and root next-themes provider. Own navigation/footer and styles under `.groundwork-site`. Support keyboard, focus, reduced motion, light/dark themes and 390px/1440px layouts. Keep these development documents out of browser imports. Parent owns host routing, icons, social images, shared dependencies and final integrated checks.

## Primary demonstration
The user rejected the initial four-scenario inspector as hard to follow. Lead with one ordinary request, the proof agreed before implementation, and the successful report the user returns to. The sample CLI stores a theme preference; its check writes dark in one process and reads dark in a fresh process. Use the genuine fixed recording as the opening payoff. Keep the causal chain together and the result persistent while the visitor expands its saved observation. Raw output, IDs, source freshness and other outcomes belong in optional technical detail. Label the handoff as illustrated and the CLI result as recorded; do not simulate agent activity or invent screen evidence.

## Confirmed visual direction
The user rejected the original yellow/forest-green identity as uncomfortable. Replace it with comfortable cool-neutral surfaces, dark neutral ink and restrained blue interaction accents, in both light and dark themes. Purpose and composition must change with the palette: lead with attention reclaimed, the trust process and the return-to-report moment.

## Product principles
- Reduce the need for continuous supervision and expensive context switching.
- Build trust in a repeatable process with explicit outcomes and project-owned guardrails.
- Bring the user back to a legible report and inspectable evidence.
- Make missing coverage visible so the next decision is clear.
- Reuse project tools and start with one real journey.
