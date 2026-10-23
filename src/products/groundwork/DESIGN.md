---
name: Groundwork
description: An attention-conscious return brief for delegated agent work
colors:
  ground: "#f7f8fb"
  surface: "#ffffff"
  soft: "#eef1f6"
  ink: "#222630"
  muted: "#606777"
  line: "#d5dae4"
  accent: "#3559c7"
  on-accent: "#ffffff"
  accent-soft: "#e9eefb"
  dark-ground: "#171a20"
  dark-surface: "#20242c"
  dark-soft: "#272c36"
  dark-ink: "#edf0f7"
  dark-muted: "#b4bdcc"
  dark-line: "#3b4351"
  dark-accent: "#9cb4ff"
  dark-on-accent: "#1a2545"
  dark-accent-soft: "#293652"
  negative: "#a3444a"
  negative-bg: "#f9edef"
  pending: "#81641d"
  pending-bg: "#f6f1e4"
typography:
  display:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(2.7rem, 4.1vw, 3.75rem)"
    fontWeight: 550
    lineHeight: 1.09
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(2rem, 3.2vw, 2.8rem)"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 450
    lineHeight: 1.65
  code:
    fontFamily: "Geist Mono Variable, monospace"
    fontSize: "0.78rem"
    lineHeight: 1.85
rounded:
  control: "4px"
  button: "5px"
  report: "7px"
spacing:
  compact: "8px"
  control: "16px"
  group: "24px"
  section-desktop: "88px"
  section-mobile: "58px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.button}"
    padding: "11px 20px"
    height: "48px"
  report:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.report}"
---

# Design System: Groundwork

## Overview
**The return brief.** Groundwork’s visual system starts with the person reclaiming attention, then gives them a clear place to return. The product is a verification and trust framework; the report is its tangible handoff. The maker’s account of supervision, context switching and burnout informs the page’s calm pace and prominent trust principle.

This user-requested redesign replaces the rejected saturated identity. Cool-neutral surfaces and dark neutral ink support sustained reading, with restrained blue actions. The page’s structure changed with its purpose: benefit, one continuous request-to-proof example, maker’s origin, the supporting process, adoption, and an optional technical reference. The later demonstration simplification replaces the four-scenario inspector rather than relabeling it.

`groundwork.css` is the implementation source of truth. `PRODUCT.md` owns the confirmed purpose; `SURFACE.md` owns this route’s narrative and opening. These documents and the design sidecar are development-only and are not browser imports.

## Colors
Light mode uses cool off-white ground, white report surfaces and charcoal text. Dark mode uses neutral charcoal layers, light gray text and a muted periwinkle blue. Large regions stay neutral in both themes; blue identifies actions, links and verified outcomes.

Status text always accompanies a symbol. Verified uses the blue accent family. Failed and incomplete states use restrained rose and ochre tones only where they communicate those specific outcomes. They do not become brand fields. Runtime tokens are scoped as `--gw-*` on `.groundwork-site`, with root ThemeProvider class overrides.

## Typography
Manrope Variable supplies a clear, moderately weighted display and body voice. Geist Mono Variable is reserved for commands, identifiers and recorded data. Both are existing self-hosted Fontsource dependencies.

The main headline caps at 60px, with 550 weight and tight but readable leading. Mobile uses `clamp(2.25rem, 9.5vw, 2.7rem)`. The maker’s principle has its own generous 1.3 leading and a 30.4–42.4px scale. Essential mobile labels and recorded output are at least 12px; body passages are larger and spaced for reading.

Narrative, demonstration, workflow, installation and reference passages use 1rem (16px) in both desktop and mobile layouts. Supporting notes use 0.9rem, and inline code uses 0.9em with a 12px floor. Status labels and optional raw output retain a compact data hierarchy. The report's plain-language outcome uses 1.55rem, reduced to 1.4rem on mobile.

Commands preserve their exact line structure and scroll locally rather than breaking mid-token. Inline flags do not wrap. The separate source-code viewer may soft-wrap. Long fingerprints and source paths can wrap independently.

## Layout
The container is capped at 1192px, with 48px outer gutters, then 32px below 900px and 20px below 640px. The opening pairs the benefit with a concise definition/action, then follows one request through its proof and successful result. Within one sheet, request and agreed check sit on the left; the persistent return report sits on the right. The first viewport establishes the causal chain without requiring a control choice or familiarity with requirement IDs.

Below the report, a quiet full-width origin passage places the maker’s story beside his principle. The supporting workflow uses three sequential rows: each connects a user benefit to maps/tasks, checks/review, or reports/artifacts. Installation follows the story. File and command detail remains available in the example and native disclosures rather than dominating the main narrative.

Mobile keeps the same reading order, stacks the three example stages, and turns the workflow into a readable vertical sequence. Native proof inspection expands in place without replacing the request or result. The owned root clips horizontal overflow. Full-width neutral sections use ordinary block layout, with no viewport-width pseudo-element backgrounds.

## Elevation & Depth
Tonal layers and one-pixel rules do most of the work. The report uses one low shadow, `0 12px 32px -24px #22263033`, to distinguish the handoff document. Other content stays flat. There are no glowing borders, decorative glass or terminal costumes.

## Shapes
Controls have 4px corners, actions and copy blocks 5px, and the report 7px. The theme control is circular. The mark remains an authored square-line G in a 32×32 viewBox: `M26 7H7v18h19V15H16`, no fill, 3.5px current-color stroke. It uses neutral ink on the page and can use the blue accent in standalone identity assets.

## Components
- **Continuous example:** three numbered stages carry real causal order: request, proof, return report. The request is ordinary language; the check explains two separate processes; the report starts with the genuine verified persistence result. Its illustrated/recorded label is visible before inspection. There is no scenario selection, requirement selection or reset state.
- **Saved observation:** one native disclosure is the main interaction. It reveals the fixed run's actual expected/observed JSON and saved artifact path. Its summary stays in place with keyboard focus while expanding, and the successful outcome remains visible.
- **Maker’s principle:** an attributable product philosophy in the main story, not a testimonial, verdict or correctness guarantee.
- **Copy blocks:** use the Clipboard API, announce success, and preserve content with manual recovery when copying fails. Command groups are named, focusable and horizontally scrollable; the source viewer is separately focusable and vertically scrollable.
- **Technical disclosures:** optional output/source and other-outcome sections follow the example. Failure, absent visual coverage and changed-source recordings retain their human explanation, requirement status and verbatim output. Opening them never replaces the successful example. The deeper reference keeps its native disclosures.
- **Focus and motion:** a 3px blue/periwinkle focus ring with 4px offset. Hover background transitions last 160ms and are disabled for reduced motion. The causal example and successful outcome are visible immediately; proof inspection uses native disclosure behavior.
- **Navigation:** independent anchors, source links and footer. Skip link is first in keyboard order and moves focus to main. Mobile keeps all three primary section links in a second header row.

## Do's and Don'ts
- Do lead with confident delegation and relief from continuous supervision.
- Do connect each mechanism to the return report and the decision it enables.
- Do make the request, agreed proof and verified result understandable before any click.
- Do distinguish actual recorded proof from illustrative process and keep missing evidence legible.
- Do retain the maker’s wording and attribution for the trust principle.
- Don’t restore green/yellow brand fields, headline kickers, generic feature-card grids or gradient text.
- Don’t imply that the CLI controls agent actions, launches judges or guarantees correct code.
- Don’t attach invented screenshots to the CLI-only example.
- Don’t import development documents or regeneration scripts into the website.

No raster assets ship. Runtime screenshots are verification evidence, not design assets or invented proof for the example.
