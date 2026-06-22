# DESIGN.md — Level One Radiology

Consolidated design system for **leveloneradiology.com** — an independent emergency radiology publication. Written for AI coding agents: drop this in the project root and use it as the authoritative reference when generating UI.

For philosophy and "why" behind these decisions see the docs in [docs/](docs/). This file captures the **token-level rules an agent can apply mechanically**.

## Table of contents

1. [At a glance](#at-a-glance)
2. [Stack](#stack)
3. [Brand & voice](#brand--voice)
4. [Color](#color)
5. [Typography](#typography)
6. [Spacing & layout](#spacing--layout)
7. [Motion](#motion)
8. [Components](#components)
9. [Writing style](#writing-style)
10. [Anti-patterns](#anti-patterns)

---

## At a glance

> **Dark-first. Imaging-native. Tight, not cramped.** Warm-biased dark grays (R+1, B-2 formula) with a three-family type system: Utopia Std serif for display, Lab Grotesque sans for body, Eurostile LT Std tech for UI chrome. Signal colors (red/cyan/yellow/violet) are functional, not decorative. Ornament is earned: HUD framing on key containers, registration marks and dimension lines in the masthead and footer.

**Feel:** PACS workstation meets editorial publication. Palantir-adjacent density with newspaper typography authority.
**Primary metric:** Email subscribers. Every design choice serves conversion.
**Axis of restraint:** no pure black, no pure white, no decorative gradients, no bounce easing.
**Axis of expression:** signal colors when they mean something, HUD framing on the Case Viewer, small-caps bylines, optical-size serif switches.

---

## Stack

- **Framework:** Astro 5 + React islands (`client:load` only where interaction is needed)
- **Styling:** Tailwind v4 via `@tailwindcss/vite` plugin + CSS custom properties. **No `tailwind.config.mjs`** — use `@theme` directives in CSS instead.
- **Primitives:** shadcn/ui with `"style": "base-lyra"` (Base UI primitives, Lyra visual style)
- **Content:** Markdown + YAML frontmatter, Astro 5 Content Layer API (`src/content.config.ts`, not `src/content/config.ts`)
- **Hosting:** GitHub Pages
- **Newsletter:** Buttondown
- **Analytics:** Plausible
- **Search (deferred):** Pagefind — add at 15+ articles
- **Fonts:** self-hosted `.otf`/`.ttf` in `/public/fonts/` (migrate to `.woff2` later)

---

## Brand & voice

### Positioning

One-person trade publication with educational depth — "timeliness of Radiology Business with the rigor of RadioGraphics." Not a CV, not a wiki, not a case repository, not a corporate site. **Owned infrastructure.**

### Audience

Default writing level: **practicing radiologist**. Trainees learn from this; non-radiologists self-filter.

| Segment | Needs |
|---|---|
| Residents / trainees | Educational content, frameworks, case-based learning |
| Practicing radiologists | Efficiency, pearls, staying current |
| Radiology-adjacent clinicians (EM, surgery) | Foundational context |
| Informatics / AI readers | Field trends, technology, policy perspective |

### Primary CTA

Email newsletter signup. Solid Signal-Red button, **not ghost**. Label: "Subscribe" — never "Submit." Value prop visible. Privacy reassurance in muted small text.

### Navigation — 4 items max

```
ARTICLES   CASES (deferred until 10+)   ABOUT   [SUBSCRIBE]
```

Subscribe is button-styled and visually distinct. Sticky on scroll. On mobile, hamburger is acceptable — but Subscribe stays visible even when menu is collapsed.

---

## Color

Dark-first, **warm-biased neutrals** with functional signal colors. Never pure black; never pure white in body text.

### Warmth formula

All surfaces follow:

```
R = G + 1   (slight red boost)
G = base    (anchor)
B = G - 2   (slight blue suppression)
```

3-unit spread reads as neutral but prevents the harshness of pure grays on backlit screens. This is the "vintage phosphor monitor" move — distinct from crimson-biased candlelight warmth.

### Luminance stepping

Adjacent surfaces are **8 units apart on the G channel**. Creates a smooth perceptual hierarchy from near-black to mid-gray.

### Surface hierarchy (6 levels)

```css
--color-bg-deepest:   #0B0A08;  /* Body bg, case viewer, deepest accents */
--color-bg-primary:   #131210;  /* Primary content surface */
--color-bg-secondary: #1B1A18;  /* Sidebar, cards, reading areas */
--color-bg-raised:    #232220;  /* Inputs, panels, code backgrounds */
--color-bg-active:    #2B2A28;  /* Hover states, selected items */
--color-bg-elevated:  #333230;  /* Tooltips, dropdowns, buttons */
```

**Selection guide:**

| Context | Surface |
|---|---|
| Page body | `--color-bg-deepest` |
| Cards, sidebars, reading areas | `--color-bg-secondary` |
| Input fields, code blocks | `--color-bg-raised` |
| Hover on interactive | `--color-bg-active` |
| Elevated UI (buttons, tooltips, dropdowns) | `--color-bg-elevated` |

### Text hierarchy (5 levels)

```css
--color-text-primary:   #F9F3EB;  /* Body — 16:1 on deepest (AAA) */
--color-text-ivory:     #F5E6C2;  /* Headlines, display */
--color-text-secondary: #D8CFC3;  /* Bylines, excerpts */
--color-text-muted:     #9E9484;  /* Timestamps, metadata, UI labels */
--color-text-disabled:  #6E6356;  /* Disabled states only */
```

**Ivory** is the warm highlight. Use on display type to amplify the warm bias — headlines feel set in candlelight.

### Signal colors — functional only

```css
--color-signal-red:     #D03454;  /* Brand accent, primary CTA, critical */
--color-signal-orange:  #E85D2D;  /* Warning states, urgent */
--color-signal-yellow:  #E8C547;  /* Caution, highlights */
--color-signal-cyan:    #2ACEC2;  /* Links, interactive elements */
--color-signal-violet:  #A98BFF;  /* Code, technical accents */
--color-signal-magenta: #D91CC3;  /* Special emphasis (rare) */
```

**Rules:**
- Colors mean something when they appear. Train readers: red=critical/CTA, cyan=interactive, yellow=caution, violet=technical.
- Never decorative. Never to "add color" to a layout.
- Prose links are **Signal Cyan** with `text-decoration: underline; text-underline-offset: 0.15em`. Hover removes the underline.
- Primary CTA button: Signal Red solid fill, white text, border same as fill. Hover inverts: ivory bg, red text.

### Borders — alpha tokens

```css
--color-border-subtle:  rgba(255, 255, 255, 0.04);  /* Subtle separation */
--color-border-default: rgba(255, 255, 255, 0.08);  /* Standard */
--color-border-strong:  rgba(255, 255, 255, 0.15);  /* HUD frames, focus */
--color-border-accent:  #232220;                    /* Solid accent (matches raised) */
```

Alpha transparency means borders look right on any surface level. A `default` border visually intensifies on lighter surfaces without re-tokenizing.

### Color scheme declaration

```css
:root {
  color-scheme: dark;   /* Required — lets browser UA match */
}
```

### Accessibility floors

- Body text on deepest: ~16:1 (AAA)
- Secondary on secondary: ~9:1 (AAA)
- Muted on secondary: ~5:1 (AA)
- Disabled: 3:1 minimum (AA large-text only)

---

## Typography

Three families. Each has a distinct role. **Don't mix.**

### Families

| Role | Family | Stack |
|---|---|---|
| **Display** (serif) | Utopia Std | `"Utopia Std", Georgia, serif` |
| **Body** (sans) | Lab Grotesque | `"Lab Grotesque", system-ui, sans-serif` |
| **UI / tech** | Eurostile LT Std | `"Eurostile LT Std", "IBM Plex Mono", monospace` |
| **Mono** (code, meta) | IBM Plex Mono | `"IBM Plex Mono", "JetBrains Mono", monospace` |

Utopia has **four optical sizes** declared: default, `Utopia Std Display`, `Utopia Std Subhead`, `Utopia Std Caption`. Use the matching optical size for the matching role (display sizes for display copy, caption for fine metadata).

Eurostile also has an **Extended** variant (`Eurostile Extended`) for wider/looser UI treatments like the masthead.

### Font variables

```css
--ff-display:          "Utopia Std", Georgia, serif;
--ff-display-optical:  "Utopia Std Display", "Utopia Std", Georgia, serif;
--ff-subhead:          "Utopia Std Subhead", "Utopia Std", Georgia, serif;
--ff-caption:          "Utopia Std Caption", "Utopia Std", Georgia, serif;
--ff-body:             "Lab Grotesque", system-ui, sans-serif;
--ff-ui:               "Eurostile LT Std", "IBM Plex Mono", monospace;
--ff-ui-ext:           "Eurostile Extended", "Eurostile LT Std", monospace;
--ff-mono:             "IBM Plex Mono", "JetBrains Mono", monospace;
```

### Type scale

```css
/* Base */
--fz-base: 1rem;         /* 16px */
--lh-base: 1.5;

/* Body */
--fz-body:    1rem;      /* 16px — primary reading */
--fz-body-s:  0.875rem;  /* 14px — captions, metadata */
--fz-body-xs: 0.6875rem; /* 11px — nav, tags, timestamps */
--lh-body:    1.5;
--lh-body-s:  1.5;
--lh-body-xs: 1.45;

/* Display */
--fz-display-l: 2.25rem;   /* 36px mobile → 3rem (48px) desktop */
--fz-display:   1.75rem;   /* 28px mobile → 2rem (32px) desktop */
--lh-display-l: 1.1;
--lh-display:   1.15;

/* Headlines */
--fz-headline: 1.5rem;     /* 24px */
--lh-headline: 1.2;

/* UI */
--fz-ui: 0.6875rem;        /* 11px */
--lh-ui: 1.5;
--ls-ui: 0.06em;           /* Tracking for uppercase */

/* Nav */
--fz-branding: 1.125rem;   /* 18px */
--fz-nav:      0.875rem;   /* 14px */

@media (min-width: 60em) {  /* 960px+ */
  --fz-display-l: 3rem;
  --fz-display:   2rem;
}
```

### Utility classes

```css
.type-display-l {
  font-family: var(--ff-display);
  font-size: var(--fz-display-l);
  line-height: var(--lh-display-l);
  letter-spacing: -0.01em;
  color: var(--color-text-ivory);
}
.type-display      { /* display, ivory, -0.01em tracking */ }
.type-headline     { font-family: var(--ff-body); font-weight: 600; color: primary; }
.type-body         { font-family: var(--ff-body); color: primary; }
.type-body-secondary { color: secondary; }
.type-ui {
  font-family: var(--ff-ui);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--color-text-muted);
}
.type-meta {
  font-family: var(--ff-mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
}
```

### Rules

- **Display = Utopia serif + ivory color + `-0.01em` tracking.**
- **Body = Lab Grotesque at 16px, line-height 1.5, primary text color.** Never loosen below 1.5.
- **UI = Eurostile uppercase at 11px, tracking 0.06em, muted color, 700 weight.** This is nav, tags, buttons, labels.
- **Meta = IBM Plex Mono at 11px, tracking 0.02em, muted color.** Timestamps, folio numbers, dimension lines.
- **Prose uses `.prose` wrapper** with line length cap at **65ch**, paragraph gap 1em, h2/h3 in Lab Grotesque (not serif — serif is for the article title only).
- **Prose H3 uses** `font-size: calc(var(--fz-body) * 1.125)` (18px-ish).
- **Prose `<strong>`** = 600 weight, primary color.
- **Prose `<code>`** = IBM Plex Mono, 0.9em, on `--color-bg-raised`, 0.1em × 0.3em padding, 3px radius.
- **Prose links** = Signal Cyan, underlined with 0.15em offset; underline disappears on hover.
- **Small caps** via `font-variant: small-caps; letter-spacing: 0.05em` — used for section labels in long-form articles.

---

## Spacing & layout

### Scale

```css
--space-0: 0.25rem;   /* 4px */
--space-1: 0.5rem;    /* 8px */
--space-2: 1rem;      /* 16px */
--space-3: 1.5rem;    /* 24px */
--space-4: 2rem;      /* 32px */
--space-5: 3rem;      /* 48px */
--space-6: 4rem;      /* 64px */
--space-7: 5rem;      /* 80px */
--space-8: 6rem;      /* 96px */

/* Fixed */
--space-fixed-1: 1.5rem;   /* 24px */
--space-fixed-2: 10rem;    /* 160px */

/* Semantic */
--space-gutter:   var(--space-2);              /* 16px column gaps */
--space-gutter-v: calc(var(--space-2) * 4);    /* 64px row gaps */
--space-outer:    1.5rem;                      /* 24px page margins */
--space-inner:    var(--space-2);              /* 16px component padding */

@media (min-width: 60em) {
  --space-outer: 3.5rem;   /* 56px on desktop */
}
```

### Spacing philosophy — "tight, not cramped"

| Use | Value |
|---|---|
| Nav items (horizontal gap) | **16px** (not 32–40px) |
| Tight relationships (title → description) | 8–16px |
| Tag groups | 8px |
| Content → unrelated content | 48px+ |
| Section separations | 64–96px |
| Article end → CTA | 48px |

**Same philosophy on mobile — don't loosen up for small screens.** Density is the point; touch targets are 44×44px minimum, achieved through padding math, not by inflating font sizes.

### Navigation

```css
--nav-height:     48px;
--nav-item-gap:   1rem;      /* 16px */
--nav-padding-h:  0.5rem;    /* 8px */
```

Sticky on scroll, `backdrop-filter: blur(12px)`, `--color-bg-secondary` background, 1px bottom border (`--color-border-subtle`).

### Grid

```css
--grid-columns:   4;    /* default: mobile 4-col */
--grid-gap:       var(--space-gutter);
--grid-max-width: 1440px;

@media (min-width: 37.5em) {  /* 600px */
  --grid-columns: 12;
}
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), minmax(10px, 1fr));
  gap: var(--space-gutter-v) var(--grid-gap);
}
.container {
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: 0 var(--space-outer);
}
```

### Breakpoints

| Name | Min-width | Notes |
|---|---|---|
| Small (default) | 0–599px | Mobile-first |
| Medium | 600px (`37.5em`) | Grid becomes 12-col |
| Large | 960px (`60em`) | Display type scales up; `--space-outer` → 56px |
| X-Large | 1280px (`80em`) | |
| Max content | 1440px (`90em`) | Container caps |

---

## Motion

Motion is minimal and functional.

- **Global transition:** `transition: all 0.15s ease` on interactive elements (nav items, buttons, tags).
- **Article card hover:** 0.2s `ease` on `background-color` and `border-color`. Background goes `bg-secondary → bg-raised`; border `border-subtle → border-default`.
- **Button hover:** 0.15s on all properties. Primary button hover inverts bg/color (Signal Red ↔ ivory).
- **No auto-playing animations, no scroll-driven animation, no bounce easing.**
- **`prefers-reduced-motion: reduce` must be respected.** Disable non-essential motion.
- **No hover-dependent interactions.** Mobile-first — every hover state must have an equivalent touch behavior.

---

## Components

### HUD framing — `.hud-frame`

**The signature ornament.** Four-corner brackets create a targeting-reticle aesthetic on key containers. Inspired by Palantir / PACS workstations.

```css
.hud-frame {
  position: relative;
  padding: 2px;
}
.hud-frame::before,
.hud-frame::after,
.hud-frame > .hud-corner-bl,
.hud-frame > .hud-corner-br {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--color-border-strong);
  border-style: solid;
}
.hud-frame::before       { top: 0; left: 0;     border-width: 1px 0 0 1px; }
.hud-frame::after        { top: 0; right: 0;    border-width: 1px 1px 0 0; }
.hud-frame > .hud-corner-bl { bottom: 0; left: 0;  border-width: 0 0 1px 1px; }
.hud-frame > .hud-corner-br { bottom: 0; right: 0; border-width: 0 1px 1px 0; }
```

**Use on:** article cards, Case Viewer, sidebar panels, modal dialogs.
**Do NOT use on:** body text, navigation, form inputs, inline elements.

### Micrographic ornaments

Technical detail inspired by print production.

**Registration mark:**

```svg
<svg width="8" height="8" viewBox="0 0 8 8">
  <circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" stroke-width="0.5"/>
  <line x1="4" y1="0" x2="4" y2="8" stroke="currentColor" stroke-width="0.5"/>
  <line x1="0" y1="4" x2="8" y2="4" stroke="currentColor" stroke-width="0.5"/>
</svg>
```

**Dimension line** — hairline rules with a centered mono label:

```css
.dimension-line { display: flex; align-items: center; gap: 8px; }
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
}
```

**Folio numbers** — for page/section positioning:

```css
.folio {
  font-family: var(--ff-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--color-text-disabled);
  display: flex; align-items: center; gap: 6px;
}
.folio__current { font-weight: 600; }
.folio__separator { opacity: 0.5; }
.folio__total { opacity: 0.7; }
```

### Navigation bar

```css
.site-header {
  height: var(--nav-height);            /* 48px */
  position: sticky; top: 0;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(12px);
}
.site-nav__list { display: flex; gap: var(--nav-item-gap); }
.site-nav__item {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);              /* 11px */
  font-weight: 700;
  letter-spacing: var(--ls-ui);         /* 0.06em */
  text-transform: uppercase;
  padding: 6px var(--nav-padding-h);
  border-radius: 4px;
  color: var(--color-text-muted);
}
.site-nav__item:hover  { background: var(--color-bg-raised);  color: secondary; }
.site-nav__item--active { background: var(--color-bg-active); color: primary; }

.branding {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-ivory);
}
```

### Tag / chip — `.tag`

Uppercase Eurostile, 11px, bordered, with an optional 4×4 indicator square.

```css
.tag {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);
  font-weight: 700;
  letter-spacing: var(--ls-ui);
  text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 7px;
  border: 1px solid currentColor;
  border-radius: 2px;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}
.tag__indicator {
  width: 4px; height: 4px;
  border-radius: 1px;
  background: currentColor;
}
.tag--signal-red  { color: var(--color-signal-red);  border-color: currentColor; }
.tag--signal-cyan { color: var(--color-signal-cyan); border-color: currentColor; }
.tag--active      { background: var(--color-text-primary); color: var(--color-bg-deepest); border-color: var(--color-text-primary); }
```

**Tag taxonomies in use:**
- Categories: `CHEST`, `NEURO`, `MSK`, `ABDOMEN`, `TRAUMA`
- Content type: `EDUCATIONAL`, `COMMENTARY`, `CASE ANALYSIS`
- Modality: `CT`, `MRI`, `ULTRASOUND`, `RADIOGRAPH`

### Button — `.button`

Bordered by default; **primary CTA is solid Signal Red, never ghost**.

```css
.button {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);
  font-weight: 700;
  letter-spacing: var(--ls-ui);
  text-transform: uppercase;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px var(--space-2);
  min-height: 2.5rem;
  border: 1px solid var(--color-text-muted);
  border-radius: 3px;
  background: transparent;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}
.button:hover { background: var(--color-bg-raised); border-color: secondary; color: primary; }

/* Primary — solid, never ghost */
.button--primary {
  background: var(--color-signal-red);
  border-color: var(--color-signal-red);
  color: #fff;
}
.button--primary:hover {
  background: var(--color-text-primary);
  border-color: var(--color-text-primary);
  color: var(--color-signal-red);
}

/* Ghost — secondary only */
.button--ghost {
  background: var(--color-bg-raised);
  border-color: transparent;
  color: var(--color-text-muted);
}
.button--ghost:hover { background: var(--color-bg-active); color: secondary; }
```

### Callout block — `.callout`

Left border in the callout color, muted background, small mono label.

```css
.callout {
  background: var(--color-bg-secondary);
  border-left: 2px solid var(--callout-color, var(--color-signal-cyan));
  padding: 12px 16px;
  border-radius: 0 6px 6px 0;
}
.callout__label {
  font-family: var(--ff-mono);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--callout-color, var(--color-signal-cyan));
  display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
}
.callout__label::before {
  content: '';
  width: 4px; height: 4px;
  background: currentColor; border-radius: 1px;
}
.callout__text {
  font-size: var(--fz-body-s);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.callout--key-point { --callout-color: var(--color-signal-cyan); }
.callout--caution   { --callout-color: var(--color-signal-yellow); }
.callout--critical  { --callout-color: var(--color-signal-red); }
.callout--technical { --callout-color: var(--color-signal-violet); }
.callout--warning   { --callout-color: var(--color-signal-orange); }
```

### Article card — `.article-card`

Used on index/listing pages. HUD framing optional (use on featured cards, not list cards).

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
.article-card__tags    { display: flex; gap: 8px; margin-bottom: 12px; }
.article-card__title   { font-size: var(--fz-headline); font-weight: 600; line-height: 1.3; color: primary; margin-bottom: 8px; }
.article-card__excerpt { font-size: var(--fz-body-s); line-height: 1.5; color: secondary; margin-bottom: 16px; }
.article-card__meta    { font-family: var(--ff-mono); font-size: 10px; color: muted; display: flex; gap: 16px; }
```

### Article header

Two-column on desktop (50/50): title on the left in display serif + ivory, metadata/tags on the right. Stacked on mobile.

```css
.article-header { display: flex; flex-direction: column; gap: var(--space-gutter); padding: var(--space-5) var(--space-outer); }

@media (min-width: 60em) {
  .article-header { flex-direction: row; padding: var(--space-8) calc(var(--space-5) * 2); }
  .article-header__title { flex: 0 0 50%; }
  .article-header__meta  { flex: 0 0 50%; }
}

.article-header__title h1 {
  font-family: var(--ff-display);
  font-size: var(--fz-display-l);
  line-height: var(--lh-display-l);
  font-weight: 500;
  color: var(--color-text-ivory);
}
.article-header__description {
  font-size: var(--fz-body); line-height: var(--lh-body);
  color: var(--color-text-secondary); max-width: 50ch; margin-bottom: var(--space-gutter);
}
.article-header__tags { display: flex; flex-wrap: wrap; gap: var(--space-1); }
```

### Byline

```css
.byline {
  display: flex; align-items: center; gap: 12px;
  font-size: var(--fz-body-s);
  color: var(--color-text-secondary);
}
.byline__separator    { color: var(--color-text-disabled); }
.byline__meta         { color: var(--color-text-muted); }
.byline__reading-time {
  font-family: var(--ff-mono);
  font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase;
}
```

### Prose — `.prose`

```css
.prose {
  font-family: var(--ff-body);
  font-size: var(--fz-body);
  line-height: var(--lh-body);
  color: var(--color-text-primary);
  max-width: 65ch;
}
.prose p + p { margin-top: 1em; }
.prose h2, .prose h3 {
  font-family: var(--ff-body);  /* sans, not serif — serif is reserved for article title */
  font-weight: 600;
  color: var(--color-text-ivory);
  margin-top: 2em; margin-bottom: 0.5em;
}
.prose h2 { font-size: var(--fz-headline); }
.prose h3 { font-size: calc(var(--fz-body) * 1.125); }

.prose a {
  color: var(--color-signal-cyan);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
.prose a:hover { text-decoration: none; }

.prose strong { font-weight: 600; color: var(--color-text-primary); }

.prose code {
  font-family: var(--ff-mono);
  font-size: 0.9em;
  background: var(--color-bg-raised);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}
```

### Newsletter CTA

- End of article: **required**.
- Mid-article: optional, after ~50% scroll.
- Sticky footer bar: optional, dismissable.

Fields: headline, subhead (value prop), email input, Submit button (labeled "Subscribe"), privacy note in muted small text.
Design: `.button--primary` (Signal Red solid). Uses shadcn/ui `Button` + `Input` as the underlying primitives.

**Do not:** ask for name, ask for preferences, require double opt-in before adding, redirect to a separate page, or popup during reading.
**Post-subscribe:** inline confirmation ("You're in. Check your inbox for a welcome email."). Don't bounce to a thank-you page; don't immediately ask for more.

### Showstopper: Case Viewer

The signature differentiator — image-stack viewer for radiology cases embedded in articles.

- Full `.hud-frame` treatment on container
- Scroll wheel / keyboard arrows (desktop) → slice navigation
- Swipe / tap / pinch (mobile)
- Annotation toggle; annotations use Signal Cyan strokes on `--color-bg-deepest`
- Comparison mode: two stacks side-by-side, synchronized scrolling
- Lazy-load slices; don't load full stack upfront
- **Custom-built, not shadcn** — domain-specific interactions don't map to primitives. May use Base UI Slider for window/level, Base UI Tooltip for annotation popups, Base UI ScrollArea for thumbnail strip.

Only **one showstopper.** Don't build a second until 20+ articles, engagement data, and clear need.

#### Case Viewer loading animation

The Case Viewer has a bespoke entrance — an x-ray fades in inside a console frame while an SVG HUD reticle acquires, holds, then dismisses. Working prototype: [docs/prototypes/case-viewer-loading-hud.html](docs/prototypes/case-viewer-loading-hud.html). Integration notes: [docs/prototypes/case-viewer-loading-hud.md](docs/prototypes/case-viewer-loading-hud.md).

**Signature move — the "infinite pixel" frame:**

The dark border around the image isn't a separate layer; it's a second copy of the same image with its **top-left pixel zoomed 20,000×** to fill the background:

```css
.dynamic-bg-layer {
  background-image: url('<same source as .xray-image>');
  background-position: 0% 0%;
  background-size: 20000%;
  background-repeat: no-repeat;
  image-rendering: pixelated;   /* no blur — reads as solid color */
}
```

On window/level drag, the **same CSS filter is applied to both** the image and the background layer, so the frame always matches the image's current tonality. This is non-negotiable — it's what makes it feel like a real reading-room monitor.

```js
const filter = `grayscale(100%) contrast(${c}) brightness(${b})`;
xrayImage.style.filter = filter;
bgLayer.style.filter   = filter;
```

**Entrance timing:**

| Element | Animation | Duration | Delay | Easing |
|---|---|---|---|---|
| Grid crosshairs | `cut-in` (opacity 0→0.6) | 100ms | 50ms | `steps(1, jump-end)` |
| Center rect 1 | `slow-flicker` | 400ms | 0ms | `steps(1, jump-start)` |
| Center rect 2 | `slow-flicker` | 400ms | 75ms | `steps(1, jump-start)` |
| Side panels (L/R) | `slow-flicker` | 400ms | 100ms | `steps(1, jump-start)` |
| Corner brackets (4) | `snap-*` (slide from ±40,±40 + flicker) | 350ms | 100ms | `cubic-bezier(0.1, 1.5, 0.92, 1.0)` |
| X-ray image + background | `fade-in` (opacity 0→1) | 400ms | 250ms | `cubic-bezier(0.7, 0, 0.84, 0)` |

The corner-bracket easing **overshoots past 1.0 and settles back** — that plus the mid-slide opacity flicker (`1 → 0 → 1`) is what makes the brackets feel like a real targeting reticle acquiring a lock. Don't swap these for a plain ease-out.

**Exit timing (staggered, interior first):**

```css
.exit-group-early { animation: fade-out 400ms cubic-bezier(0.7, 0, 0.84, 0) 350ms forwards; }  /* grid, center, panels */
.exit-group-late  { animation: fade-out 400ms cubic-bezier(0.7, 0, 0.84, 0) 450ms forwards; }  /* corner brackets hold 100ms longer */
```

**Drag-to-adjust window/level:**

```js
const SENSITIVITY_X = -0.002;   // right = less contrast
const SENSITIVITY_Y =  0.008;   // down  = less brightness
// Clamp: contrast [0, 5], brightness [0, 3]
```

These values are tuned; keep them.

**Production integration:**
- Lives at `src/components/case/CaseViewer.jsx` + `src/styles/components/case-viewer.css`.
- Image URL is a prop, not hardcoded. Drop the prototype's CDN Tailwind `<script>`.
- Map prototype hex (`#050505`, `#1a1a1a`, `#333`) to tokens (`--color-bg-deepest`, `--color-bg-raised`, `--color-border-strong`). Keep HUD strokes `white` — reads correctly on any imaging.
- **Respect `prefers-reduced-motion`:** skip HUD entrance entirely, collapse image fade to ~150ms.
- Add touch events (`touchstart/move/end`) alongside mouse — mobile-first.
- Ensure `role="application"` + `aria-label` + keyboard bindings (arrows for W/L, `0` to reset).

### Designated spice zones

Concentrate personality. Don't spread it everywhere.

| Apply spice | Don't apply spice |
|---|---|
| Masthead / logo | Body text area |
| Case Viewer | Navigation |
| Article cards (HUD corners, structured metadata) | Reference section |
| CTA hover/focus (subtle shift, gentle scale) | Forms |
| Section transitions (dimension lines, gradient fades) | |
| Footer (registration marks, warmth moment, display accent) | |
| 404 page ("Nothing here. Perhaps the image was lost in translation.") | |

---

## Writing style

(Summary. Full reference in [docs/WRITING-STYLE.md](docs/WRITING-STYLE.md).)

**Voice:** teaching attending, not textbook. Smart Brevity structure with human layer.

**The 200-word test:** if a reader stops after 200 words, did they get the essential point? Structure so the answer is yes.

**Core 4 framework** (hold loosely):

| | |
|---|---|
| Headline | ≤6 words. Specific. |
| Lede | 1–2 sentences. Tell me something useful immediately. |
| Why it matters | Connect finding to clinical action. |
| Go deeper | Optional expansion. |

**Openings must ground the learner.** Start with the confusion or shared experience, not the concept:

> ❌ "Window width and window level control how CT densities are displayed."
> ✅ "I'm sure you've sat next to a radiologist and watched them jerk the mouse around with small movements that alter the image. You might be wondering what they're doing."

**Rules:**
- Framework before findings. Explain what the thing *is* before listing what to look for.
- Ground concepts in **physical reality** — physics, anatomy, pathophys. Not just pattern recognition.
- Signs get **mechanisms**, not just descriptions. ("Hub-and-spoke edema represents venous congestion — the mesenteric veins are obstructed before the arteries.")
- Technical terms come **second**. Build intuition, then label it.
- Show tradeoffs unfolding — demonstrate, don't state.
- **Plant your flag** on opinion pieces. Concede partial truth. Preempt counterarguments.
- **State importance plainly.** No performed urgency. "This is important because it's a surgical emergency." — that's it.
- **Active voice.** "The lesion enhances," not "enhancement is noted within the lesion."
- **Purge radiology-speak:** no "correlate clinically," "cannot be excluded," "attention is directed to."
- **Syllable rule:** one-syllable > two > three when meaning is equivalent. `bleed` > `hemorrhage`. `seen` > `visualized`.
- **Axiom labels** as signposts when they help: "Why it matters", "What you're looking for", "The mechanism", "Where people miss it", "The bottom line". Not mandatory headers.
- **Every section ends actionable.** Reader should never finish wondering "so what do I do with this?"

---

## Anti-patterns

Things the system actively avoids. Don't add these when extending it.

- **Pure `#000` / `#fff`.** Body text is `#F9F3EB`; deepest bg is `#0B0A08`.
- **Decorative use of signal colors.** Red, cyan, yellow, violet only appear when they mean something.
- **Ghost CTAs.** Primary action is solid Signal Red with white text. No ghosts, no outlines.
- **Pure-neutral grays.** Use the warmth formula (R+1, B-2).
- **Excessive padding / oversized fonts.** Body is 16px, not 18–20px. Nav is 48px tall. Tight, not cramped.
- **Loosening spacing on mobile.** Same density philosophy at every breakpoint.
- **Drop shadows for elevation.** Surfaces use the 6-level luminance hierarchy; HUD framing provides containment.
- **Rounded-by-default everywhere.** Cards and callouts use small radii (3–8px). Pill shapes on buttons are wrong for this system.
- **Bounce easing / spring animations.** Motion is `ease`, 0.15–0.2s, functional.
- **Serif body text.** Serif = Utopia = display only (article titles, ivory-colored moments).
- **Hover-dependent interactions.** Mobile-first; every hover must have a touch equivalent.
- **Auto-playing animations, scroll-jacking, parallax, popups that interrupt reading.**
- **Performed urgency in writing.** "Miss this and you'll regret it" is not the voice. Plain statements of importance are.
- **Mailchimp-style embedded forms.** Use Buttondown API with shadcn components.
- **Light mode shims.** Dark-first IS the brand. (Light mode is a future consideration, not a parallel system.)
- **Adding a second showstopper.** The Case Viewer is it. Earn more via 20+ articles + engagement data.
