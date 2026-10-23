# Groundwork source and recording provenance

Inspected 23 October 2026. Authority: [Groundwork public main at b5c89c4d34421f2442ce176000f86b63c0e5bced](https://github.com/darylcecile/groundwork/tree/b5c89c4d34421f2442ce176000f86b63c0e5bced). All upstream file/line references below refer to that pinned revision. Experimental benchmark-branch content is outside this website’s scope.

## Maker-provided purpose
The maker supplied the origin directly in the website brief on 23 October 2026: increasingly using coding agents made continuous checking and context switching overwhelming and led to burnout. Groundwork was built around verification and trust so he could set guardrails, delegate and return to reports and artifacts. The principle quoted on the page—“Because I trust the framework, I don't need to trust the agent.”—is his own statement. These are attributable product-purpose facts from the maker, separate from the source-inspected mechanics below. They are not independent efficacy measurements or testimonials.

## Source-read trace
- [README](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/README.md):3–5,30–47 and [WORKFLOW](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/WORKFLOW.md):5–33 establish the normal-chat workflow, project-owned checks, and requirement outcomes versus CLI status. README:43 introduces `explain` as a separately invoked skill.
- [Explore](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/skills/explore/SKILL.md):17–40 traces entrypoints, ownership, data/state, callers and constraints, separating source findings from runtime observations. [Explain](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/skills/explain/SKILL.md):26–53 specifies precision, source-backed claims and layered explanations.
- [Implement](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/skills/implement/SKILL.md):59–85 and README:82–96 cover task files, definitions of done and the implementation/judge workflow. Model selection and judgement are agent responsibilities.
- `package.json:10–12` → [CLI entrypoint](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/skills/verify-work/verify.mjs):181–226 parses selection, loads config/plan, adds invariants, fingerprints source, initializes latest before execution, saves updates and renders a report.
- [Configuration](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/lib/config.mjs):169–203 defines explicit, required, change-aware and invariant selection. `dependsOn` does not expand selection. Local `--plan` binds coverage without scheduling checks.
- [Runner](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/lib/runner.mjs):82–168 owns fresh per-trial evidence, candidate-owned commands, optional setup/cleanup, structured observations, artifacts, budgets and source stability. [Model](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/lib/model.mjs):77–109,195–219 requires observation evidence and computes coverage from bindings. Labels cannot establish a check’s semantic correctness.
- Runner:15–28 includes Git HEAD, tracked diff and non-ignored untracked files in the fingerprint. [Layout](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/lib/layout.mjs):5–7 excludes runtime paths. CLI:101–137 and Model:268–290 recheck source and evidence without rerunning commands. A source edit makes the overall result inconclusive while historical coverage can still read verified.
- Runner:171–258 and Model:155–192 implement opted-in `--base` drivers using a detached worktree and `GROUNDWORK_SOURCE_DIR`. Regression requires a usable baseline assertion failure and candidate pass with equal declared context. Measurement comparisons use medians. No baseline comparison is claimed for the website recording.
- [Distribution](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/lib/distribution.mjs):46–68 and CLI:55–65 register bundled skill symlinks, validate ownership and update Copilot/OpenCode instructions. Distribution:79–108 resolves the default-branch commit using package repository metadata, currently SSH, and removes the installed package before adding its replacement.

## Targeted assertions inspected
These are source-read assertions, not claims that the website ran the upstream test suite:
- [verify.test.mjs](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/test/verify.test.mjs):240–283 covers failed/fixed persistence, retained evidence and source freshness; 532–585 covers missing/changed evidence and interrupted latest attempts.
- [runner.test.mjs](https://github.com/darylcecile/groundwork/blob/b5c89c4d34421f2442ce176000f86b63c0e5bced/test/runner.test.mjs):78–99 covers missing/partial requirement bindings; 264–296 covers source-aware comparisons and unusable baselines; 324–333 covers changed observation evidence.

## Runtime recording
[recording/runs.json](recording/runs.json) contains actual CLI output, saved coverage, observations, evidence contents, source fingerprints, run IDs, runtime/context and canonical input hashes. Its `recordedAt` identifies the recording time. The executable sources are [examples/preferences.mjs](examples/preferences.mjs), [examples/theme-check.mjs](examples/theme-check.mjs), [examples/verify.json](examples/verify.json) and [examples/task.json](examples/task.json).

The driver writes `dark` in one app process, reads it in a second, compares `actual === 'dark'`, and saves the expected/actual values plus structured observation. The broken variant hardcodes `light`. Observed outcomes: failure exit 1; fixed exit 0; report after source edit exit 2; extra unbound rendering requirement exit 2 despite a passing persistence check. The browser presents the fixed record in an illustrated request-to-proof handoff; native disclosures expose its saved observation and the other records' output. No rendered UI, cross-platform compatibility, live agent execution or baseline comparison is implied. Presentation changes do not regenerate these observations or the ZIP.

The recorder uses an isolated, uncommitted Git fixture. The CLI normalizes a cwd inside `.groundwork/` to its project root, so it invokes from the fixture’s own namespace with `--plan plans/task.json`. Displayed commands use the equivalent project-root form, `--plan .groundwork/plans/task.json`. Output, run IDs, logs, fingerprints, evidence and coverage are retained verbatim except trailing whitespace. The artifact path comes from the saved observation, not a browser-generated result.

## Regenerate and check the example
The development-only [groundwork-example.py](../../../.groundwork/scripts/groundwork-example.py) script runs the pinned CLI and rebuilds both [recording/runs.json](recording/runs.json) and [the ZIP](examples/groundwork-theme-example.zip) from the canonical example files. It requires Python 3, Bun and Git. It does not install packages, change global configuration, modify the supplied checkout or import anything into the website.

From this website repository, supply a clean Groundwork checkout at the pinned public revision:

```sh
python3 .groundwork/scripts/groundwork-example.py --record /path/to/pinned-groundwork-checkout
python3 .groundwork/scripts/groundwork-example.py --check
```

`--record` refuses a different revision or tracked edits to the CLI inputs. Each capture retains its full local run artifacts and previous portable recording at the path it prints. `--check` only compares the current canonical input hashes and ZIP entries with the recording; it does not rerun checks or establish new behaviour. Run `--record` after changing an example, then inspect the resulting output and source/context limits before publishing. The ZIP contains the five example files at their documented paths plus runtime ignore rules. [Its README](examples/README.md) is the user-facing guide.

## Distribution evidence and limits
On 23 October 2026, a fresh isolated `bun add --global git+https://github.com/darylcecile/groundwork.git` plus `groundwork install` resolved b5c89c4 and registered the bundled skills. GitHub visibility was separately observed as public; the pinned README’s private-access phrase is stale.

Independent update verification used Bun 1.3.14 on macOS ARM64. An older resolved install was emulated at `4ec313d` while the global manifest requested the unpinned HTTPS URL. Re-running `bun add` retained `4ec313d`. Removing `@darylcecile/groundwork` first, then adding the HTTPS URL, resolved b5c89c4. This is evidence for **remove + add**, not reinstall-in-place. The behaviour is corroborated by [Bun #32607](https://github.com/oven-sh/bun/issues/32607) and [Bun #8590](https://github.com/oven-sh/bun/issues/8590), and Groundwork’s own updater removes before adding (Distribution:97–99). The site’s HTTPS update command follows that sequence; `groundwork update` retains its actual SSH prerequisite.

Isolated Bun global experiments must start with an initialized global `package.json`; otherwise Bun may search parent directories. The website’s regeneration script needs no global install and avoids that boundary entirely.

Context7 quota was exhausted. Official fallback documentation: [next-themes README](https://raw.githubusercontent.com/pacocoursey/next-themes/main/next-themes/README.md) for mounted UI/resolvedTheme/class providers and [Vite server options](https://vite.dev/config/server-options) for isolated preview settings. Existing self-hosted Manrope Variable and Geist Mono Variable packages supply the fonts; no new runtime dependencies were added.
