---
name: Tuna
description: Everyday feedback becomes maintained instructions, in lavender and grape ink.
colors:
  paper: "#fcfbff"
  field: "#e2dcfa"
  surface: "#f1edfb"
  ink: "#302347"
  muted: "#655675"
  accent: "#6540b3"
  action: "#563095"
  on-action: "#ffffff"
  line: "#c5b9db"
  active: "#37634c"
  active-field: "#e9f1e9"
  dark-paper: "#1c1725"
  dark-field: "#30233f"
  dark-surface: "#282033"
  dark-ink: "#f1eafa"
  dark-muted: "#bfb1ce"
  dark-accent: "#baa0ef"
  dark-action: "#c6b0f1"
  dark-on-action: "#2b1c40"
  dark-line: "#574565"
  dark-active: "#afd5ba"
  dark-active-field: "#24382c"
typography:
  display:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(3.25rem, 7vw, 6rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(2rem, 3.7vw, 3.4rem)"
    fontWeight: 550
    lineHeight: 1.13
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  reading:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "15px"
    lineHeight: 1.65
  label:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "12px"
    lineHeight: 1.65
  command:
    fontFamily: "Geist Mono Variable, monospace"
    fontSize: "0.78rem"
    lineHeight: 1.85
rounded:
  control: "5px"
  action: "6px"
  command: "8px"
spacing:
  page-mobile: "20px"
  field-mobile: "23px"
  field-desktop: "38px"
  section-mobile: "65px"
  section-desktop: "112px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.action}"
    padding: "15px 22px"
  command:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.command}"
---

# Design System: Tuna

## Overview
**Creative North Star: “The revisable proof sheet”**

A warm-in-voice, cool-in-color document language. Open geometric type and broad lavender fields make the idea approachable; ruled records make evidence and state tangible. This website is read in both bright workspaces and low-light coding sessions, so light and dark are tonal counterparts with equal hierarchy.

Key characteristics: wide document surfaces, visible revisions, human quotations, restrained status color, copyable commands. The narrative leads with relief from repeated corrections and hand-maintained instructions. A concise maker passage connects that benefit to Daryl's actual origin; it is authored prose, not a testimonial. Source of truth is `tuna.css`.

## Colors
Violet carries emphasis and interaction. Grape ink and purple-tinted secondary text avoid neutral gray against lavender. Light paper and surface tokens separate authored feedback from retained records. Dark mode swaps every semantic color under `.dark .tuna-site` without changing topology.

Violet carries actions and the maintained preference's relevance. The former active-status green tokens remain reserved in the palette; the simplified narrative does not need status badges. Before/after labels identify the instruction change without relying on color.

## Typography
Manrope Variable is used for display, body, navigation, and quotation. Geist Mono Variable is restricted to commands, file paths, IDs, and sequential step numbers. Both use the site's existing self-hosted Fontsource assets; no new font dependency or external font request.

Display caps at 96px, with a mobile override of `clamp(2.9rem, 10.6vw, 3.325rem)` that meets the desktop scale at the 760px breakpoint. Headlines are balanced, tight but never tracked below −0.04em. The example heading is 24px on desktop and 21.6px on mobile; its three action headings are 17.6px, with a 22.4px human quotation.

Install, FAQ, control, remember, and evidence-quote reading text uses `--tuna-reading-size` (15px at a 16px root). A single `--tuna-reading-measure: 55ch` cap tightens the former 65ch lines, which the independent review measured at 87–89 actual characters. The new rendered desktop maximum is 503.23px; observed full lines reach 74 characters for 15px prose and 75 for 14px notes. CSS ch is a font measure, not a literal character count. At 390px, available reading widths are 313px in numbered installation steps and 350px in FAQ/controls, with observed lines up to 53 characters. Secondary reading notes are 14px. Honesty labels and small controls use `--tuna-label-size` (12px), including mobile. Supporting labels remain mixed case, without eyebrow headings.

## Layout
All selectors are scoped under `.tuna-site`. The maximum container is 1200px; desktop horizontal clearance is 48px until the max width applies. At 1050px, gutters become 32px; at 760px, 20px.

The primary example is one ruled document with three visible parts: You correct your agent → Tuna maintains AGENTS.md → The next agent looks it up. The columns are .95:1.15:1, giving before/after upkeep extra room. Below 1050px they become a continuous vertical story. This is a causal sequence, not navigation: no slides, reset or moving Prev/Next controls. A single bug-fix expectation remains the context throughout. Analysis and refresh timings appear beside the corresponding work. Supporting quotations, repeat handling and changed intent live in a native disclosure below the chain, keeping records secondary to the benefit. The maker story is an open prose section between demonstration and setup. Installation ends with ordinary work, with inspection and immediate refresh behind an optional disclosure.

The integration table preserves native table semantics in a focusable horizontal scroller with an explicit mobile hint. Its 130px first column stays sticky and opaque in both themes; the last column wraps paths into the space beside those labels.

## Elevation & Depth
Flat surfaces with tonal separation and 1px rules. No ambient shadows, blurred glass, or floating decorative layers. The selected state and focus ring provide sufficient prominence; the harness button hover uses an inset 1px outline.

## Shapes
Document records have square corners. Commands use an 8px radius; controls are 4–6px. The explicit-remember aside has one 24px upper-right corner. Theme and meaningful install-step counters are circular. The authored fish mark uses a 40×40 viewBox, 2.5px strokes, an open line body/tail, and a short internal stroke; `Mark.tsx` is its reusable vector source.

## Components
- **Lifecycle:** a semantic ordered list displays the whole causal chain. A labelled native select changes the future harness name and linked path; the path is a polite live region. The rule/query/result remain visible and consistent. The supporting-evidence disclosure retains authored quotations labelled by session/harness and explains changed intent without introducing a second example or database form. No simulated loading or fabricated execution.
- **CopyCommand:** selectable wrapping command; native Clipboard API; success checkmark and live text; explicit failure with manual-copy recovery. Success clears after 2.5 seconds. Controls stay focusable through outcomes.
- **Theme:** uses the existing root ThemeProvider. The icon changes through CSS, keeping SSR markup stable.
- **Navigation:** always-visible section links, wrapping to a second row on mobile. Skip link targets focusable main without outlining the entire page; controls and links keep visible rings. Footer has source, release, and documentation links.
- **Disclosures:** native details/summary. Privacy boundary is open by default; deeper setup, expiry, and update details open on request.
- **Motion:** the causal story is stable with native disclosure/select updates and no authored entrance animation. Reduced motion remains supported. Focus is a 3px accent outline with 5px offset; selection uses action/on-action colors.

## Do's and Don'ts
- Do connect supporting quotations and changed intent to the benefit: automatic instruction upkeep and timely preference lookup.
- Do use semantic palette variables for all themes and state text alongside color.
- Do retain wrapping commands and stable, native keyboard behavior.
- Don't imply the website runs Tuna, analyzes input, or collects real conversations.
- Don't add eyebrow headings, gradient text, generic icon-card grids, or decorative charts.
- Don't import PRODUCT.md, SURFACE.md, RESEARCH.md, DESIGN.md, or the design sidecar into browser modules.
