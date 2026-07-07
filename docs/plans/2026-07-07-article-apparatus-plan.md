# Article Apparatus: Recurring Delight Elements — Implementation Plan

*2026-07-07 · brainstorm output, skeptic-reviewed · target: /implement-plan in a fresh chat*

## Context & why

leveloneradiology.com wants recurring in-article "delight" elements that read as **engineered
precision** (instrument-grade, tight, compact), never airy premium-editorial (large type, wide
leading, decorative marginalia — the explicitly rejected register). A four-agent survey (July 2026)
of magazine, tech-editorial, and engineered-dense article pages plus a live browser-support check
established: the airy school is the anti-pattern; the surviving references are Sanglard's zero-JS
density, Distill's citation apparatus, and Asterisk's layered footnote architecture; and the full
platform toolkit (Popover API, CSS anchor positioning, scroll-driven animations, `::details-content`)
now ships in all three engines.

The article shell already carries: h2 mono ordinals, desktop TOC rail (≥80em only), reading-progress
hairline, serial (`L1-nnnn`) meta line, `lastReviewed` line, key-points card, callouts, figure
console strip (`.figure-meta`), reference card, endmark, subscribe card. This plan adds **eight new
elements plus one demo-gated ninth**, each doing a job nothing existing does, each individually
disable-able.

A fresh-context skeptic reviewed the design; its confirmed findings are folded into the steps below
(GFM footnote `h2#footnote-label` contamination, counter-reset clobber, `::target-text` limits,
crosshair-vs-square mark grammar, packaging honesty for template-backed elements).

## Locked decisions

- **Budget: CSS + platform primitives.** Popover API, anchor positioning, `<details>`,
  `::details-content`, CSS counters, `:target`. Zero new client-side JS islands. Build-time rehype
  transforms are allowed (they are not runtime JS).
- **Per-element kill switches, honestly packaged.** CSS-only elements: one file each under
  `src/styles/components/apparatus/`, one import line each in `main.css` (labeled block). Elements
  that emit markup (mobile INDEX, serial exit, cite line, footnote popovers): one boolean each in a
  new `src/lib/apparatus.ts`, consumed by templates and `astro.config.mjs`, so disabling never
  leaves orphaned markup. Rationale: the user wants to adjust or fully disable any element after
  seeing it live.
- **Footnote presentation is Popover-based and tap-first**, so the majority-mobile audience gets the
  full element (project stance: no hover-dependent interactions). The GFM endnote section stays
  rendered as the base layer, so browsers without popover support lose only the card, never content.
- **Arrival wash uses `:target` only.** `::target-text` styles text-fragment navigation, not hash
  jumps, and highlight pseudo-elements cannot animate. Reduced motion = no wash (not a persistent
  highlight).
- **The `hr` mark uses the crosshair-circle registration grammar** (structural, as in the footer),
  never the indicator square (that square means action/signal — see `Footer.astro:52` vs
  `prose.css` callout labels).
- **Serial exit is ordered by `publishDate`** (the site's single ordering, via `getArticles()`),
  labeled with serials, and **replaces the existing back-link row** rather than stacking a new layer
  under the subscribe card (subscribe stays the last full-width apparatus — it is the keystone).
- **Counter ownership stays consolidated**: `prose.css` remains the sole owner of the
  `counter-reset` list (adds `l1-figure` beside `l1-section`); the figure-accession unit only
  increments. Avoids the single-property clobber the skeptic identified at `prose.css:130`.
- **Only figures with a `.figure-meta` console strip are accessioned** ("clinical figures get
  accession numbers") — semantically honest and skips decorative images cleanly.
- **Measurement chips are a `.readout` span convention**, muted mono (not violet — violet means
  code/technical token). `<data>` rejected: its `value` contract is a single machine-readable value,
  which `W80 L40` is not.
- **Tokens only.** Any new value becomes a token in `src/styles/tokens/**` first. `npm run lint`
  gates hex/grid literals; the crosshair mark must be built from tokens (CSS shapes or
  `currentColor`), not a hex-carrying data-URI.
- **Ordinal tick-in is demo-gated, not pre-decided.** Built last, behind `@supports
  (animation-timeline: view())` + `prefers-reduced-motion` guards; the user evaluates it live in dev
  and keeps or cuts. Known tension if kept: it introduces a second motion grammar beside
  `[data-reveal]` (motion.css) — cutting it is the default expectation.

## Design

### Element roster (the deliverable, per element)

| # | Element | Kind | Kill switch | Phase |
|---|---------|------|-------------|-------|
| 1 | Registration section break (`hr` → crosshair mark) | CSS | import line: `apparatus/section-break.css` | 1 |
| 2 | Arrival wash (`:target` gold wash, fades) | CSS | import line: `apparatus/arrival-wash.css` | 1 |
| 3 | Mobile INDEX (mono `<details>` TOC, <80em) | component + CSS | `apparatus.ts: mobileToc` + import line | 1 |
| 4 | Serial exit strip (prev/next by date, serial labels) | component + CSS | `apparatus.ts: serialExit` + import line | 1 |
| 5 | Ordinal tick-in (scroll-driven ordinal reveal) | CSS, guarded | import line: `apparatus/ordinal-tick.css` | 1 (demo-gated) |
| 6 | Footnote popovers (GFM `[^1]` → tap card + endnote plate) | rehype + CSS | `apparatus.ts: footnotePopovers` + import line | 2 |
| 7 | Figure accession (`FIG 01` in console strip) | CSS + convention | import line: `apparatus/figure-accession.css` | 2 |
| 8 | Readout chips (`.readout` for HU / window values) | CSS + convention | import line: `apparatus/readout.css` | 2 |
| 9 | Cite line (canonical citation string near endmark) | component + CSS | `apparatus.ts: citeLine` + import line | 2 |

### Structure

```
src/lib/apparatus.ts                      # feature flags: mobileToc, serialExit, footnotePopovers, citeLine
src/lib/site.ts                           # site constants: AUTHOR (new single source; cite line consumes)
src/lib/markdown-plugins.mjs              # + rehypeFootnotePopovers (Phase 2)
src/styles/components/apparatus/*.css     # one file per element (8–9 files)
src/styles/main.css                       # labeled import block, one line per element
src/components/article/TableOfContents.astro  # + mobile <details> INDEX (flag-gated)
src/pages/articles/[slug].astro           # serial exit strip; cite line (flag-gated)
src/content/articles/style-gallery.md     # every element exercised (specimen contract)
```

### Footnote pipeline (the one nontrivial unit)

`rehypeFootnotePopovers` (in `markdown-plugins.mjs`, registered in `astro.config.mjs` only when
`apparatus.footnotePopovers`):

1. **Neutralize the injected heading.** GFM emits `<h2 id="footnote-label" class="sr-only">` inside
   `<section class="footnotes">`. Replace it with `<p class="footnotes__label">NOTES</p>` (mono
   label grammar). This keeps the phantom heading out of Astro's `headings` collector (TOC rail +
   mobile INDEX), out of the `l1-section` ordinal counter, and avoids the never-generated `sr-only`
   utility problem — all three contaminations the skeptic verified.
2. **Transform each ref** `<sup><a href="#user-content-fn-N">` into
   `<sup><button popovertarget="fnpop-N" class="footnote-ref">N</button></sup>` and append a
   `<div popover id="fnpop-N" class="footnote-card">` containing a **duplicated copy** of note N's
   children (pure CSS cannot teleport bottom-of-document content; duplication at build time is the
   zero-runtime-JS answer). Card positioned via CSS anchor positioning to its button, with margin
   fallback.
3. **Endnote plate stays**, restyled compact mono-numbered. Backrefs (`↩`) keep working. No-popover
   browsers: button is inert, plate carries everything.

### Motion & accessibility invariants

Every animated element: honors `prefers-reduced-motion` (wash → none; `::details-content`
transition → none; tick-in → none) and is gated behind `@supports` where the property is Newly
Baseline. AA contrast holds for chips, cards, and wash states (check against
`reasoning/accessibility.md`). All tap targets ≥44px effective (footnote buttons get padded hit
areas despite small glyphs).

## Design trade-offs / Non-goals

- **Drop caps / enlarged ledes** — the rejected airy register; `initial-letter` also still gapped
  (no Firefox).
- **`::target-text` styling** — wrong selector for hash jumps; highlight pseudos can't animate.
- **Hover-peek footnotes without Popover** — refuted by the skeptic: pure CSS cannot bind ref N to
  note N generically, and hover-only excludes the mobile majority.
- **Ordinal tick-in as a committed element** — demoted to demo-gated (duplicate motion grammar,
  kitsch risk). Decision recorded at step 8.
- **Interactive inline figures** (Ciechanowski-style) — Case Viewer territory; one showstopper rule.
- **Scroll-hijack / smooth-scroll libraries, reading scrubbers, swipe-card layouts** — surveyed,
  rejected as the anti-pattern.
- **`text-box-trim`** — Firefox-gapped; revisit when Baseline.
- **Serial-ordered prev/next** — date order chosen; serial gaps from drafts would produce broken
  chains.
- **Auto-numbered in-text figure references** — no clean zero-JS mechanism; authored `Fig. N`
  references accepted with documented drift risk (reordering figures requires updating references).
- **A copy button on the cite line** — would need JS; selectable text suffices.

## Files to read first

1. `docs/design/philosophy.md` — spice zones, ornament-earned, mobile-first density
2. `src/styles/components/prose.css` — every existing article element; counter-reset at ~line 130
3. `src/styles/main.css` — import manifest structure
4. `src/styles/tokens/colors.css` + `docs/design/tokens.md` — token vocabulary; selection/link golds
5. `src/lib/markdown-plugins.mjs` — plugin house style (remarkCallouts is the model)
6. `src/components/article/TableOfContents.astro` and `src/pages/articles/[slug].astro`
7. `src/styles/base/motion.css` — `[data-reveal]` grammar and reduced-motion conventions
8. `src/content/articles/style-gallery.md` — the specimen contract

## Reuse

- `getArticles()` (`src/lib/articles.ts`) — serial exit's prev/next source
- `remarkCallouts` pattern (`src/lib/markdown-plugins.mjs`) — model for `rehypeFootnotePopovers`
- Existing tokens: `--color-selection-*` / `--color-primary` (wash), mono type + label letterspacing
  (chips, INDEX, plate), `--radius-sm`, card padding tokens
- Footer crosshair SVG geometry (`Footer.astro:52-56`) — the mark the section break re-expresses
- `.figure-meta` separator rules (`prose.css:227`) — extend, don't duplicate, for the `FIG NN` cell

## Steps

Phase 1 — structural + micro (no authoring-convention changes):

1. **Scaffold the kill-switch architecture.** Create `src/lib/apparatus.ts` (four booleans, all
   `true`), `src/styles/components/apparatus/` directory, and the labeled import block in
   `src/styles/main.css` ("Article apparatus — one import per element; disable = comment out").
   → verify: `npm run build` green with empty apparatus files.
   Contracts: `apparatus.ts` flag names (`mobileToc`, `serialExit`, `footnotePopovers`, `citeLine`).
2. **Section break** (`apparatus/section-break.css`): `.prose hr` renders a centered crosshair-circle
   mark built from tokens/`currentColor` (no hex in markup — lint-gated), muted, replacing the
   hairline. → verify: style gallery `hr` shows the mark; `npm run lint` green.
3. **Arrival wash** (`apparatus/arrival-wash.css`): `.prose :target` gets a gold wash animating to
   transparent (~2s, tokens); `prefers-reduced-motion` → no wash. → verify in dev: TOC-rail click
   and heading-anchor click each land with the wash; with emulated reduced motion, no wash and no
   persistent highlight.
4. **Mobile INDEX**: `TableOfContents.astro` additionally emits `<details class="article-index">`
   (mono summary "INDEX", numbered entries matching ordinals), gated by `apparatus.mobileToc`;
   `apparatus/article-index.css` shows it <80em only, `::details-content` transition where
   supported. → verify at 375px: INDEX present and numbered identically to desktop rail at 1440px;
   ≥2-h2 gating unchanged; flag off → no markup emitted.
5. **Serial exit** (`apparatus/serial-exit.css` + `[slug].astro`): replace the back-link row with a
   mono strip — `← L1-nnnn TITLE · INDEX · L1-nnnn TITLE →` — prev/next from date-sorted
   `getArticles()`, gated by `apparatus.serialExit`. → verify: middle article shows both neighbors;
   newest/oldest articles show one side gracefully; drafts excluded in prod build; subscribe card
   still the last full-width block.
6. **Retro-check Phase 1 kill switches**: comment out each import line / flip each flag, one at a
   time. → verify: each disablement renders cleanly (no orphaned markup, no unstyled widget), then
   restore.
7. **CHANGELOG + docs**: roster table (element → files → how to disable) added to
   `docs/design/components.md`; CHANGELOG `[Unreleased]` entry. → verify: table lists all Phase 1
   elements with working paths.
8. **Ordinal tick-in demo** (`apparatus/ordinal-tick.css`): `view()`-timeline reveal on
   `.article .prose h2::before`, behind `@supports (animation-timeline: view())` and
   `prefers-reduced-motion: no-preference`. **User-gated:** present live in `npm run dev` (scroll
   effect is not headless-capturable); the user keeps or cuts. If cut: delete the file and its
   import, record in CHANGELOG. → verify: whichever decision, tree is consistent (no dangling
   import).

Phase 2 — scholarly apparatus (authoring conventions):

9. **Footnote pipeline**: implement `rehypeFootnotePopovers` per the design (label neutralization,
   ref → popover button + duplicated card, anchor positioning with fallback), register in
   `astro.config.mjs` behind `apparatus.footnotePopovers`; `apparatus/footnotes.css` styles refs,
   cards, and the endnote plate. Add two real footnotes to
   `src/content/articles/supine-pneumothorax.md` and a footnote pair to the style gallery.
   → verify: build green; **TOC rail, mobile INDEX, and h2 ordinals show no phantom "Footnotes"
   section** (the skeptic's contamination trio); popover opens on tap in dev at 375px; endnote
   plate renders with working backrefs; flag off → plain GFM output.
   Contracts: `[^n]` authoring syntax in article markdown.
10. **Figure accession** (`apparatus/figure-accession.css`): add `l1-figure` to the consolidated
    `counter-reset` in `prose.css` (comment: owned here to avoid single-property clobber);
    increment on `.prose figure:has(.figure-meta)`; `FIG NN` cell via `.figure-meta::before` with
    the separator rule extended so the first span still separates correctly. Update the gallery +
    the two figure-bearing articles (`lisfranc-injury-ct.md`, `supine-pneumothorax.md`) with `id`
    anchors where referenced. → verify: `FIG 01` renders in strips; section ordinals unchanged;
    figures without strips unnumbered.
    Contracts: authored in-text figure references (`Fig. N` + `#fig-n` anchors) documented in the
    gallery.
11. **Readout chips** (`apparatus/readout.css`): `.readout` mono hairline chip, muted; author into
    `window-and-level.md` (HU and W/L values) and the gallery. → verify: chips render distinct from
    inline code (violet) at both 375px and 1440px; AA contrast.
    Contracts: `.readout` span authoring convention.
12. **Cite line**: create `src/lib/site.ts` (AUTHOR constant, single source), render one selectable
    canonical-citation string near the endmark gated by `apparatus.citeLine`
    (`apparatus/cite-line.css`, mono, quiet). → verify: renders correctly on all six articles; no
    author literal in the template.
13. **Full-system close**: style gallery exercises every shipped element; kill-switch retro-check
    over Phase 2 units; `npm run build && npm run lint`; docs roster updated; CHANGELOG.
    → verify: both gates green; gallery complete; each of the 8(±1) elements disable-able in one
    labeled place.

## Success criteria

- `npm run build` and `npm run lint` green at every step (lint = the token gate).
- Every shipped element appears in `style-gallery.md` and renders correctly at 320px, 375px, 1440px.
- Each element disables via exactly one labeled unit (import line or `apparatus.ts` flag) with no
  orphaned markup — demonstrated, not assumed (steps 6 and 13).
- Footnotes introduce no phantom heading into TOC rail, mobile INDEX, or section ordinals.
- Reduced-motion parity for wash, INDEX transition, and tick-in (if kept).
- Mobile INDEX gives <80em readers a TOC for the first time; serial exit gives every article a
  next-read path with the subscribe card still last.

## Open questions

- Ordinal tick-in keep/cut — deliberately deferred to the step-8 live demo (user's explicit choice).
