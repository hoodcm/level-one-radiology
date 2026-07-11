# Components

> [← Design system](README.md) · [Docs](../README.md)

*The module catalog and component specs.*

---

## About this document

The catalog of modules and their specs. **The CSS shown here is illustrative** — the authoritative styles live in `src/styles/` (`components/*.css` + `tokens/*.css`); where a snippet here disagrees with the stylesheet, the stylesheet wins. The module *system* (tiers, standards, showstopper discipline) is defined in [philosophy.md](philosophy.md); token values in [tokens.md](tokens.md).

---

## Primitive library

Level One uses **shadcn/ui** as a styling/abstraction layer over **Base UI** primitives, with Radix
and custom code available where needed. The full primitive-layer architecture — what primitives
provide, when to use shadcn vs. direct imports, and how to mix them — lives in
[engineering.md](../engineering.md).

## Modules by tier

Tier definitions, module standards, and showstopper discipline live in
[philosophy.md](philosophy.md#the-module-system). The modules themselves:

- **Workhorse** — Article Header, Body Text, Inline Figure, Callout Block, Block Quote, Reference Section,
  Author Block, Newsletter CTA, Related Content, Article Index Card.
- **High-touch** — Comparison Slider, Timeline/Sequence, Data Visualization.
- **Showstopper** — Case Viewer.

---

## Design Language

### Detector-plate framing

The signature container ornament, modeled on a DR detector plate's registration
fiducials. Two marks: quarter **field arcs** (a curve plus straight arms) in each
inner corner, and **edge tees** (a segment parallel to the edge with a stem
pointing at the container's center) at each edge midpoint. Ink is `text-muted`
at low opacity, brightening on card hover.

It renders as a single masked `::before` per surface — mask layers carve the
line-work out of one ink layer, so no ornament markup is needed and hover
restyles one `background-color`. Geometry (insets, radii, arm/line lengths, stem)
is entirely token-driven; a callout variant reuses the same arcs at half scale.

- **Values** → `src/styles/tokens/ornament.css`
- **Rendering** → `src/styles/components/ornament.css` (kill-switch: drop its import from `main.css`)

**Where it applies:** article cards (arcs + edge tees), article callouts and Key
Points (corner arcs only, half scale). The Case Viewer keeps its own lighter
corner brackets (`tokens/case-viewer.css`), a separate treatment.

**When NOT to use:** body text, navigation, form inputs, inline elements.

### Micrographic Elements

Technical ornament inspired by print production and vintage electronics.

#### Registration Marks

```svg
<svg width="8" height="8" viewBox="0 0 8 8">
  <circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" stroke-width="0.5"/>
  <line x1="4" y1="0" x2="4" y2="8" stroke="currentColor" stroke-width="0.5"/>
  <line x1="0" y1="4" x2="8" y2="4" stroke="currentColor" stroke-width="0.5"/>
</svg>
```

#### Dimension Lines

```css
.dimension-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dimension-line::before,
.dimension-line::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-text-disabled), transparent);
}

.dimension-line__label {
  font-family: var(--ff-mono);
  font-size: 7px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-disabled);
  white-space: nowrap;
}
```

#### Folio Numbers

```css
.folio {
  font-family: var(--ff-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--color-text-disabled);
  display: flex;
  align-items: center;
  gap: 6px;
}

.folio__current { font-weight: 600; }
.folio__separator { opacity: 0.5; }
.folio__total { opacity: 0.7; }
```

### Editorial Typography Patterns

#### Small Caps

```css
.small-caps {
  font-variant: small-caps;
  letter-spacing: 0.05em;
}
```

#### Bylines

```css
.byline {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--fz-body-s);
  color: var(--color-text-secondary);
}

.byline__separator {
  color: var(--color-text-disabled);
}

.byline__meta {
  color: var(--color-text-muted);
}

.byline__reading-time {
  font-family: var(--ff-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
```

---

## Workhorse Modules

### 1. Article Header

**Fields:**
- Title (required)
- Subtitle (optional)
- Publication date (required)
- Updated date (optional)
- Read time (auto-calculated)
- Primary tag (required)
- Secondary tags (optional)

**Design:** Two-column on desktop (50/50), stacked on mobile. Title uses serif display in ivory. Metadata subordinate in muted text.

```css
.article-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-gutter);
  padding: var(--space-5) var(--space-outer);
}

@media (min-width: 60em) {
  .article-header {
    flex-direction: row;
    padding: var(--space-8) calc(var(--space-5) * 2);
  }
  
  .article-header__title { flex: 0 0 50%; }
  .article-header__meta { flex: 0 0 50%; }
}

.article-header__title h1 {
  font-family: var(--ff-display);
  font-size: var(--fz-display-l);
  line-height: var(--lh-display-l);
  font-weight: 500;
  color: var(--color-text-ivory);
}

.article-header__description {
  font-size: var(--fz-body);
  line-height: var(--lh-body);
  color: var(--color-text-secondary);
  max-width: 50ch;
  margin-bottom: var(--space-gutter);
}

.article-header__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
```

### 2. Body Text

**Specifications:**
- Line length: 65ch maximum
- Line height: 1.5
- Paragraph spacing: 1em
- Font: Sans-serif at 16px

```css
.prose {
  font-family: var(--ff-body);
  font-size: var(--fz-body);
  line-height: var(--lh-body);
  color: var(--color-text-primary);
  max-width: 65ch;
}

.prose p + p { margin-top: 1em; }

.prose h2,
.prose h3 {
  font-family: var(--ff-body);
  font-weight: 600;
  color: var(--color-text-ivory);
  margin-top: 2em;
  margin-bottom: 0.5em;
}

.prose h2 { font-size: var(--fz-headline); }
.prose h3 { font-size: calc(var(--fz-body) * 1.125); }

.prose a {
  color: var(--color-signal-cyan);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.prose a:hover { text-decoration: none; }

.prose strong {
  font-weight: 600;
  color: var(--color-text-primary);
}

.prose code {
  font-family: var(--ff-mono);
  font-size: 0.9em;
  background: var(--color-bg-raised);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}
```

### 3. Inline Figure

**Fields:**
- Image (required)
- Caption (required)
- Source/attribution (optional)
- Alt text (required)

**Behavior:** Click/tap to expand. Full-width on mobile. Clinical images at appropriate window settings.

### 4. Callout Block

**Types:**
- Key Point — Signal Cyan
- Clinical Pearl — Ivory
- Caution/Warning — Signal Yellow
- Critical — Signal Red
- Technical Note — Signal Violet

```css
.callout {
  background: var(--color-bg-secondary);
  border-left: 2px solid var(--callout-color, var(--color-signal-cyan));
  padding: 12px 16px;
  border-radius: 0 6px 6px 0;
}

.callout__label {
  font-family: var(--ff-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--callout-color, var(--color-signal-cyan));
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.callout__label::before {
  content: '';
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 1px;
}

.callout__text {
  font-size: var(--fz-body-s);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* Variants */
.callout--key-point { --callout-color: var(--color-signal-cyan); }
.callout--caution { --callout-color: var(--color-signal-yellow); }
.callout--critical { --callout-color: var(--color-signal-red); }
.callout--technical { --callout-color: var(--color-signal-violet); }
.callout--warning { --callout-color: var(--color-signal-orange); }
```

### 5. Block Quote

**Design:** Serif font, italic, larger than body. Left border in ivory. Attribution in muted text.

### 6. Reference Section

**Format:** Numbered citations, linked to PubMed/DOI.

**Design:** 14px text, muted color. Scannable.

### 7. Author Block

**Fields:** Photo, name, one-line credential, link to About.

**Design:** Small, minimal. Circular photo, 48px. Not a biography.

### 8. Newsletter CTA

**Fields:**
- Headline
- Subhead (value proposition)
- Email input
- Submit button
- Privacy note

**Placement:**
- End of article (required)
- Mid-article (optional, after ~50% scroll)
- Sticky footer bar (optional, dismissable)

**Design:** Solid gold button (`--color-primary`), foreground near-black. High-contrast. No ghost buttons.

**Implementation:** shadcn/ui `Button` + `Input`. See `src/components/shared/NewsletterSignup.tsx`.

### 9. Related Content

**Display:** 2-3 related articles at article end.

**Selection:** Same primary tag, manually curated, or "most popular" fallback.

**Design:** Cards with title, tags, minimal metadata. No thumbnails initially.

### 10. Article Index Card

For listing pages. Title, date, tag(s), excerpt. Uses monospace tag styling with the detector-plate framing (see Design Language).

```css
.article-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 20px 24px;
  transition: all 0.2s ease;
}

.article-card:hover {
  background: var(--color-bg-raised);
  border-color: var(--color-border-default);
}

.article-card__tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.article-card__title {
  font-size: var(--fz-headline);
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.article-card__excerpt {
  font-size: var(--fz-body-s);
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.article-card__meta {
  font-family: var(--ff-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  display: flex;
  gap: 16px;
}
```

---

## Base Components

### Navigation Bar

```css
.site-header {
  height: var(--nav-height);
  position: sticky;
  top: 0;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(12px);
}

.site-nav__list {
  display: flex;
  gap: var(--nav-item-gap);
  align-items: center;
}

.site-nav__item {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);
  font-weight: 700;
  letter-spacing: var(--ls-ui);
  text-transform: uppercase;
  padding: 6px var(--nav-padding-h);
  border-radius: 4px;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.site-nav__item:hover {
  background: var(--color-bg-raised);
  color: var(--color-text-secondary);
}

.site-nav__item--active {
  background: var(--color-bg-active);
  color: var(--color-text-primary);
}

.branding {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-ivory);
}
```

### Tag/Chip Component

```css
.tag {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);
  font-weight: 700;
  letter-spacing: var(--ls-ui);
  text-transform: uppercase;
  
  display: inline-flex;
  align-items: center;
  gap: 5px;
  
  padding: 2px 7px;
  border: 1px solid currentColor;
  border-radius: 2px;
  
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.tag__indicator {
  width: 4px;
  height: 4px;
  border-radius: 1px;
  background: currentColor;
}

.tag--signal-red {
  color: var(--color-signal-red);
  border-color: var(--color-signal-red);
}

.tag--signal-cyan {
  color: var(--color-signal-cyan);
  border-color: var(--color-signal-cyan);
}

.tag--active {
  background: var(--color-text-primary);
  color: var(--color-bg-deepest);
  border-color: var(--color-text-primary);
}
```

**Tag variants by content:**
- Categories: `CHEST`, `NEURO`, `MSK`, `ABDOMEN`, `TRAUMA`
- Content type: `EDUCATIONAL`, `COMMENTARY`, `CASE ANALYSIS`
- Modality: `CT`, `MRI`, `ULTRASOUND`, `RADIOGRAPH`

### Button Component

Uses shadcn/ui `Button` as base. Custom styling applied via Tailwind classes and design tokens.

```css
.button {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);
  font-weight: 700;
  letter-spacing: var(--ls-ui);
  text-transform: uppercase;
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  padding: 10px var(--space-2);
  min-height: 2.5rem;
  
  border: 1px solid var(--color-text-muted);
  border-radius: 3px;
  
  background: transparent;
  color: var(--color-text-secondary);
  
  transition: all 0.15s ease;
  cursor: pointer;
}

.button:hover,
.button:focus {
  background: var(--color-bg-raised);
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

/* Primary CTA - solid, not ghost */
.button--primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.button--primary:hover,
.button--primary:focus {
  background: var(--color-text-primary);
  border-color: var(--color-text-primary);
  color: var(--color-primary);
}

/* Ghost button */
.button--ghost {
  background: var(--color-bg-raised);
  border-color: transparent;
  color: var(--color-text-muted);
}

.button--ghost:hover,
.button--ghost:focus {
  background: var(--color-bg-active);
  color: var(--color-text-secondary);
}
```

---

## Article apparatus

Recurring in-article delight elements — instrument-grade, CSS + platform primitives, zero new
client-side JS islands. Each element disables in exactly one labeled place: CSS-only elements by
commenting out their import line in `src/styles/main.css` ("Article apparatus" block); elements that
emit markup by a boolean in `src/lib/apparatus.ts` (so disabling never leaves orphaned markup).

| Element | What it does | Files | Disable |
|---------|--------------|-------|---------|
| Section break | `hr` renders as a centered crosshair-circle registration mark (the footer's structural grammar) | `src/styles/components/apparatus/section-break.css` | comment out import in `main.css` |
| Arrival wash | `:target` takes a gold wash that fades ~2s after a hash jump (TOC/anchor clicks); reduced motion → no wash | `src/styles/components/apparatus/arrival-wash.css` | comment out import in `main.css` |
| Mobile INDEX | `<details>` disclosure TOC under the article header, <80em only, numbered to mirror the section ordinals | `src/components/article/TableOfContents.astro` (variant="index") + `src/styles/components/apparatus/article-index.css` | `apparatus.ts: mobileToc` |
| More articles | Footer related-reading block: quiet label, the date-neighbor article titles as plain readable links, then "All articles →"; replaces the back-link row (flag off restores it) | `src/pages/articles/[slug].astro` + `src/styles/components/apparatus/read-next.css` | `apparatus.ts: readNext` |
| Footnote popovers | GFM `[^n]` refs become tap-first popover buttons with a build-time copy of the note; the endnote plate stays as the base layer (no-popover browsers lose only the card); flag off → plain GFM refs and plate (the phantom-heading fix always runs) | `rehypeFootnotePopovers` (`src/lib/markdown-plugins.mjs`, registered in `astro.config.mjs`) + `src/styles/components/apparatus/footnotes.css` | `apparatus.ts: footnotePopovers` |
| Figure accession | Figures with a console strip get a `FIG NN` cell (CSS counter; decorative images stay unnumbered). In-text refs are authored: `Fig. N` + `#fig-n` anchors (convention in the style gallery) | `src/styles/components/apparatus/figure-accession.css` (counter reset owned by `prose.css`) | comment out import in `main.css` |
| Readout chips | Inline measurement values (`W80 L40`, `65 HU`) as muted mono hairline chips via `<span class="readout">` — deliberately not code-violet | `src/styles/components/apparatus/readout.css` | comment out import in `main.css` |
| Ordinal tick-in | Section ordinals tick in on scroll via a pure-CSS `view()` timeline; behind `@supports` + reduced-motion guards. A deliberate second motion grammar beside `[data-reveal]`, kept on live judgment | `src/styles/components/apparatus/ordinal-tick.css` | comment out import in `main.css` |

---

## High-Touch Modules

### Comparison Slider

Before/after, with/without, two time points. More than simple image, less than full Case Viewer.

**Implementation options:**
- shadcn/ui `Slider` for basic functionality
- Base UI slider with custom styling
- Custom implementation for image-specific features

### Timeline/Sequence

For cases that evolve or multi-step workflow explanations.

### Data Visualization

Charts/graphs for trend analysis or literature data. Clean, on-brand, accessible. Use Signal Cyan and Signal Violet for data series.

---

## Showstopper: Case Viewer

The signature differentiator, shipped: scrollable CT/MR stacks embedded inline in articles, scrubbed
the way radiologists scrub. A framework-free light-DOM custom element `<case-viewer>` — no React on
article pages, and the design tokens cascade straight into it.

### How it works

- **Authoring**: `::case[Caption text.]{id="case-id"}` in article markdown. The authoring guide
  (frame export, `npm run case:build`, caption conventions) lives in
  [../writing.md](../writing.md) → Case viewer authoring.
- **Build**: `remarkCaseViewer` (`src/lib/markdown-plugins.mjs`) expands the directive via
  `src/lib/case-shell.mjs` into the full static shell — poster, meta strip, counter, native range
  slider, window chips, boot-HUD SVG — so the article ships zero-CLS, no-runtime-JSON HTML and a
  no-JS reader still gets poster + meta + caption. A missing manifest or frame file fails the
  build (render-time check + `astro:build:start` integration in `astro.config.mjs`);
  `src/lib/case-loader.ts` re-renders embedding articles when a case's manifest `rev` moves.
- **Runtime**: `src/components/case/case-viewer.ts` upgrades the shell in place. Pure logic lives
  in DOM-free, vitest-covered modules: `mapping.ts` (px→frame) and
  `frame-store.ts` (ImageBitmap LRU with explicit `close()`, generation tokens,
  direction-weighted decode-ahead). `fullscreen.ts` owns the overlay: visualViewport sizing,
  popstate as the single close authority, pinch zoom, TUNE filter drag.

### Interaction model (locked by the 2026-07 plan)

Progressive engage: at rest the image scrolls with the page (`touch-action: pan-y`) and a
horizontal drag scrubs; a tap engages PACS mode (page held, either axis scrubs; brackets, counter,
and slider thumb go signal cyan; the brackets strike a locked inward inset, recoil subtly, and
settle back in — 0→100→70→100 — holding the lock until release); a second finger
or the ⛶ button promotes to fullscreen. **Tap-to-activate** (`apparatus.caseTapToActivate`,
default on — an experiment, flip the flag to revert): the rest-state drag-scrub is disabled, so
the viewer is inert until the engage tap; a quiet `TAP TO SCRUB` chip over the imaging field
carries the affordance once the boot settles and retires on first engagement. **Tap-to-boot**
(`apparatus.caseTapToBoot`, default on — likewise an experiment): before any of that, the viewer
holds inert and semi-greyed behind a centered `ACTIVATE` button — no frame decode, no network, no
boot HUD — until the reader taps it; the tap clears the veil and drives the boot (warming the first
frame), then the tap-to-activate flow above takes over. Direct
1:1 mapping, integer snap, zero momentum; the scrub position follows the finger exactly — the canvas
holds the last decoded frame (stall glyph on the counter) while decode catches up, never the reverse
(the original decoded-frontier clamp read as a laggy scrubber on iPhone and was retired 2026-07-11);
arriving at IM 1/N ticks the brackets inward once — the end-of-stack stop. Window chips switch pre-baked window exports **preserving the slice index
exactly** (that index is the pedagogy) and carry the full radio keyboard pattern (roving tabindex,
arrows); series tabs reset to the series' start frame. TUNE (fullscreen only) is an honest render
adjustment — CSS filters with floors, reset on close — never labeled W/L. Desktop parity: wheel
scrubs engaged/fullscreen (rAF-coalesced, ≤3 frames/beat), double-click toggles fullscreen zoom,
PageUp/Down = ±5 on both sliders. Full rationale and rejected alternatives: the archived plan
(`docs/archive/plans/2026-07-07-case-viewer-plan.md`).

### Chrome

Meta strip in the `.figure-meta` console voice; corner brackets are the HUD framing (no border —
dark-on-dark needs none); boot choreography ported verbatim from
`design-assets/prototypes/case-viewer-loading-hud.html`; reduced motion collapses to a fade.
Button glyphs are **Lucide outline icons** (`lucide-react` is the source package — the project's
icon library): the viewer is React-free, so `src/lib/case-icons.mjs` inlines the SVG node data
verbatim, imported by both the build-time shell and the fullscreen overlay (square-power = activate,
minimize = disengage/close, scan-eye = fullscreen, contrast = TUNE). Glyphs run large in their hit
areas (`--cv-icon-size`; the activate power at `--cv-activate-icon`) over the buttons' plain 1px
border; on hover-capable pointers each springs up a touch (`transform: scale(1.05)`, reduced-motion
opt-out).
Fullscreen switches on and off like a CRT — the beta site's power-on grammar
(`design-assets/references/beta-crt-boot.md`: hairline dwell → spring → overshoot → settle; off at
half the on-duration), retargeted to the full screen, content arriving on the hard-ease slide once
the rect lands; close is deferred until the collapse beat lands. All
values are tokens — component tokens in `src/styles/tokens/case-viewer.css`, styles in
`src/styles/components/case-viewer.css`.

### Deferred by explicit choice (v2 candidates)

Annotations/measurement, comparison pairs with synced scrolling, unknown-case reveal block, pinned
scroll-showcase, text→image deep links, cine export. Don't build a second showstopper until the
criteria in [philosophy.md](philosophy.md#the-module-system) are met (20+ articles, engagement
data, a clear need).

---

## Component Checklist

When implementing a component, verify:

- [ ] Uses design tokens (no hardcoded values)
- [ ] Uses correct surface level from hierarchy
- [ ] Uses correct text level from hierarchy
- [ ] Responsive (mobile-first, 320px-1440px+)
- [ ] Accessible (keyboard nav, focus states, ARIA)
- [ ] Performance (optimized images, lazy loading)
- [ ] Dark mode compatible
- [ ] Typography scale (uses defined classes)
- [ ] Spacing (uses spacing tokens)
- [ ] Touch targets (44×44px minimum)
- [ ] Detector-plate framing applied where appropriate
- [ ] Works with chosen primitive library (Base UI or Radix)
