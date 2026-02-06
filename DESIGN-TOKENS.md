# Level One Radiology: Design Tokens

*Complete specification for colors, typography, and spacing*

**Navigation:** [README](README.md) Â· [Brand Foundation](BRAND-FOUNDATION.md) Â· [Design Methodology](DESIGN-METHODOLOGY.md) Â· [Design Principles](DESIGN-PRINCIPLES.md) Â· **Design Tokens** Â· [Component Library](COMPONENT-LIBRARY.md) Â· [Technical Architecture](TECHNICAL-ARCHITECTURE.md)

---

## About This Document

This is the implementation reference for all design tokens. For the philosophy behind these decisions, see [DESIGN-PRINCIPLES.md](DESIGN-PRINCIPLES.md).

**Use this document when:**
- Writing CSS
- Implementing components
- Referencing exact color values
- Checking typography specifications

---

## Color System

### Generative Parameters

The surface palette derives from a base luminance value with consistent stepping and minimal warmth offset:

| Parameter | Value |
|-----------|-------|
| **Base Luminance** | 10 (G value for deepest) |
| **Luminance Step** | 8 (between adjacent levels) |
| **Warmth Spread** | 3 (R - B difference) |

### The Warmth Formula

Professional dark interfaces achieve warmth by manipulating RGB channels relative to a neutral base. Level One uses a **minimal warm bias**â€”imperceptible as color, but prevents clinical coldness:

```
R = G + 1  (slight red boost)
G = base   (anchor value)
B = G - 2  (slight blue suppression)
```

This creates warmth without visible tintâ€”more vintage monitor than candlelight. The 3-unit spread (R - B) is subtle enough to read as neutral gray while avoiding the harshness of pure neutrals on backlit screens.

### Luminance Stepping

Human vision perceives luminance logarithmically. Level One uses **consistent 8-unit steps** between adjacent surface levels, creating smooth visual hierarchy.

**Reading surface range:** The secondary and raised levels (L:0.02â€“0.04) provide comfortable extended reading in dark environments typical of radiology workstations.

---

## Surface Hierarchy (Backgrounds)

Six background levels providing clear visual hierarchy through luminance.

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-bg-deepest` | `#0B0A08` | (11, 10, 8) | Body background, case viewer, deepest accents |
| `--color-bg-primary` | `#131210` | (19, 18, 16) | Primary content surface |
| `--color-bg-secondary` | `#1B1A18` | (27, 26, 24) | Sidebar, main content areas, cards |
| `--color-bg-raised` | `#232220` | (35, 34, 32) | Panels, inputs, artifact areas |
| `--color-bg-active` | `#2B2A28` | (43, 42, 40) | Hover states, selected items |
| `--color-bg-elevated` | `#333230` | (51, 50, 48) | Tooltips, dropdowns, buttons |

### Surface Selection Guide

| Context | Recommended Surface |
|---------|---------------------|
| Page body | `--color-bg-deepest` |
| Reading areas | `--color-bg-secondary` |
| Cards, sidebars | `--color-bg-secondary` |
| Input fields | `--color-bg-raised` |
| Hover states | `--color-bg-active` |
| Buttons, elevated UI | `--color-bg-elevated` |
| Tooltips, popovers | `--color-bg-elevated` |

### Legacy Tokens (deprecated but supported)

| Legacy Token | Maps To | Notes |
|--------------|---------|-------|
| `--color-imaging-black` | `--color-bg-deepest` | Original naming |
| `--color-control-charcoal` | `--color-bg-secondary` | Now part of hierarchy |

---

## Text Hierarchy

Five text levels for clear typographic hierarchy.

| Token | Hex | RGB | Luminance | Usage |
|-------|-----|-----|-----------|-------|
| `--color-text-primary` | `#F9F3EB` | (249, 243, 235) | 0.95 | Body text, high priority |
| `--color-text-ivory` | `#F5E6C2` | (245, 230, 194) | 0.89 | Headlines, display text |
| `--color-text-secondary` | `#D8CFC3` | (216, 207, 195) | 0.80 | Bylines, excerpts |
| `--color-text-muted` | `#9E9484` | (158, 148, 132) | 0.57 | Timestamps, metadata |
| `--color-text-disabled` | `#6E6356` | (110, 99, 86) | 0.38 | Disabled states |

*Note: Text colors will be refined in a future update to align warmth formula with surfaces.*

### Legacy Tokens (deprecated but supported)

| Legacy Token | Maps To |
|--------------|---------|
| `--color-console-white` | `--color-text-primary` |
| `--color-textbook-ivory` | `--color-text-ivory` |

---

## Signal Colors

Semantic and functionalâ€”they communicate meaning, not decoration.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-signal-red` | `#D03454` | Brand accent, primary CTA, critical |
| `--color-signal-orange` | `#E85D2D` | Warning states, urgent |
| `--color-signal-yellow` | `#E8C547` | Caution, highlights |
| `--color-signal-cyan` | `#2ACEC2` | Links, interactive |
| `--color-signal-violet` | `#A98BFF` | Code, technical accents |
| `--color-signal-magenta` | `#D91CC3` | Special emphasis (rare) |

*Note: Signal colors will be refined in a future update for better harmony with the warm gray palette.*

### Legacy Tokens (deprecated but supported)

| Legacy Token | Maps To |
|--------------|---------|
| `--color-level-one-red` | `--color-signal-red` |
| `--color-sunset-orange` | `--color-signal-orange` |
| `--color-chroma-yellow` | `--color-signal-yellow` |
| `--color-scanline-cyan` | `--color-signal-cyan` |
| `--color-cosmic-violet` | `--color-signal-violet` |
| `--color-burst-magenta` | `--color-signal-magenta` |

---

## Border Tokens

Alpha transparency for consistency across surface levels.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-border-subtle` | `rgba(255, 255, 255, 0.04)` | Subtle separation |
| `--color-border-default` | `rgba(255, 255, 255, 0.08)` | Standard borders |
| `--color-border-strong` | `rgba(255, 255, 255, 0.15)` | Emphasized, focus |
| `--color-border-accent` | `#232220` | Accent borders (matches raised) |

---

## Color Application Rules

1. Signal colors appear only when they mean something
2. Never use signal colors decoratively
3. Train readers: yellow = caution, red = critical, cyan = interactive
4. Use surface hierarchy for elevation
5. Text hierarchy creates scannability

---

## Typography System

### Font Families

```css
:root {
  --ff-display: "Utopia Std", Georgia, serif;
  --ff-body: "Lab Grotesque", system-ui, sans-serif;
  --ff-ui: "Eurostile LT Std", "IBM Plex Mono", monospace;
  --ff-mono: "IBM Plex Mono", "JetBrains Mono", monospace;
}
```

### Type Scale

```css
:root {
  /* Base */
  --fz-base: 1rem;           /* 16px */
  --lh-base: 1.5;            /* 24px line height */
  
  /* Body variants */
  --fz-body: 1rem;           /* 16px - primary reading */
  --lh-body: 1.5;
  --fz-body-s: 0.875rem;     /* 14px - captions, metadata */
  --lh-body-s: 1.5;
  --fz-body-xs: 0.6875rem;   /* 11px - nav, tags, timestamps */
  --lh-body-xs: 1.45;
  
  /* Display */
  --fz-display-l: 2.25rem;   /* 36px mobile â†’ 3rem/48px desktop */
  --lh-display-l: 1.1;
  --fz-display: 1.75rem;     /* 28px mobile â†’ 2rem/32px desktop */
  --lh-display: 1.15;
  
  /* Headlines */
  --fz-headline: 1.5rem;     /* 24px */
  --lh-headline: 1.2;
  
  /* UI */
  --fz-ui: 0.6875rem;        /* 11px */
  --lh-ui: 1.5;
  --ls-ui: 0.06em;           /* Letter-spacing for uppercase */
}

/* Desktop scale adjustments */
@media (min-width: 60em) {
  :root {
    --fz-display-l: 3rem;
    --fz-display: 2rem;
    --fz-headline: 1.5rem;
  }
}
```

### Typography Classes

```css
.type-display-l {
  font-family: var(--ff-display);
  font-size: var(--fz-display-l);
  line-height: var(--lh-display-l);
  letter-spacing: -0.01em;
  color: var(--color-text-ivory);
}

.type-display {
  font-family: var(--ff-display);
  font-size: var(--fz-display);
  line-height: var(--lh-display);
  letter-spacing: -0.01em;
  color: var(--color-text-ivory);
}

.type-headline {
  font-family: var(--ff-body);
  font-size: var(--fz-headline);
  line-height: var(--lh-headline);
  font-weight: 600;
  color: var(--color-text-primary);
}

.type-body {
  font-family: var(--ff-body);
  font-size: var(--fz-body);
  line-height: var(--lh-body);
  color: var(--color-text-primary);
}

.type-body-secondary {
  font-family: var(--ff-body);
  font-size: var(--fz-body);
  line-height: var(--lh-body);
  color: var(--color-text-secondary);
}

.type-ui {
  font-family: var(--ff-ui);
  font-size: var(--fz-ui);
  line-height: var(--lh-ui);
  letter-spacing: var(--ls-ui);
  text-transform: uppercase;
  font-weight: 700;
  color: var(--color-text-muted);
}

.type-meta {
  font-family: var(--ff-mono);
  font-size: var(--fz-body-xs);
  line-height: var(--lh-body-xs);
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
}
```

---

## Spacing System

### Relative Scale

```css
:root {
  --space-0: 0.25rem;        /* 4px */
  --space-1: 0.5rem;         /* 8px */
  --space-2: 1rem;           /* 16px */
  --space-3: 1.5rem;         /* 24px */
  --space-4: 2rem;           /* 32px */
  --space-5: 3rem;           /* 48px */
  --space-6: 4rem;           /* 64px */
  --space-7: 5rem;           /* 80px */
  --space-8: 6rem;           /* 96px */
}
```

### Fixed Spacing

```css
:root {
  --space-fixed-1: 1.5rem;   /* 24px */
  --space-fixed-2: 10rem;    /* 160px */
}
```

### Semantic Spacing

```css
:root {
  --space-gutter: var(--space-2);           /* 16px - column gaps */
  --space-gutter-v: calc(var(--space-2) * 4); /* 64px - row gaps */
  --space-outer: 1.5rem;                    /* 24px - page margins */
  --space-inner: var(--space-2);            /* 16px - component padding */
}

@media (min-width: 60em) {
  :root {
    --space-outer: 3.5rem;   /* 56px on desktop */
  }
}
```

### Navigation Spacing

```css
:root {
  --nav-height: 48px;
  --nav-item-gap: 1rem;      /* 16px between items */
  --nav-padding-h: 0.5rem;   /* 8px horizontal padding */
}
```

---

## Grid System

```css
:root {
  --grid-columns: 4;
  --grid-gap: var(--space-gutter);
  --grid-max-width: 1440px;
}

@media (min-width: 37.5em) {
  :root {
    --grid-columns: 12;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), minmax(10px, 1fr));
  gap: var(--space-gutter-v) var(--grid-gap);
  width: 100%;
}

.container {
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: 0 var(--space-outer);
}
```

---

## Responsive Breakpoints

```css
/* Mobile-first breakpoints */

/* Small: 0 - 599px (default) */

/* Medium: 600px - 959px */
@media (min-width: 37.5em) { /* 600px */ }

/* Large: 960px+ */
@media (min-width: 60em) { /* 960px */ }

/* Extra large: 1280px+ */
@media (min-width: 80em) { /* 1280px */ }

/* Max content width: 1440px */
@media (min-width: 90em) { /* 1440px */ }
```

---

## Dark Mode Implementation

```css
:root {
  color-scheme: dark;
  
  --color-bg: var(--color-bg-deepest);
  --color-bg-elevated: var(--color-bg-secondary);
  --color-text: var(--color-text-primary);
  --color-text-muted: var(--color-text-muted);
  --color-border: var(--color-border-default);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Complete Token Reference

```css
:root {
  /* ============================================
     SURFACE HIERARCHY
     Warmth formula: R = G + 1, B = G - 2
     Luminance step: 8 units between levels
     ============================================ */
  --color-bg-deepest: #0B0A08;
  --color-bg-primary: #131210;
  --color-bg-secondary: #1B1A18;
  --color-bg-raised: #232220;
  --color-bg-active: #2B2A28;
  --color-bg-elevated: #333230;
  
  /* ============================================
     TEXT HIERARCHY
     (To be refined in future update)
     ============================================ */
  --color-text-primary: #F9F3EB;
  --color-text-ivory: #F5E6C2;
  --color-text-secondary: #D8CFC3;
  --color-text-muted: #9E9484;
  --color-text-disabled: #6E6356;
  
  /* ============================================
     SIGNAL COLORS
     (To be refined in future update)
     ============================================ */
  --color-signal-red: #D03454;
  --color-signal-orange: #E85D2D;
  --color-signal-yellow: #E8C547;
  --color-signal-cyan: #2ACEC2;
  --color-signal-violet: #A98BFF;
  --color-signal-magenta: #D91CC3;
  
  /* ============================================
     BORDERS
     ============================================ */
  --color-border-subtle: rgba(255, 255, 255, 0.04);
  --color-border-default: rgba(255, 255, 255, 0.08);
  --color-border-strong: rgba(255, 255, 255, 0.15);
  --color-border-accent: #232220;
  
  /* ============================================
     LEGACY (deprecated)
     ============================================ */
  --color-imaging-black: var(--color-bg-deepest);
  --color-control-charcoal: var(--color-bg-secondary);
  --color-console-white: var(--color-text-primary);
  --color-textbook-ivory: var(--color-text-ivory);
  --color-level-one-red: var(--color-signal-red);
  --color-sunset-orange: var(--color-signal-orange);
  --color-chroma-yellow: var(--color-signal-yellow);
  --color-scanline-cyan: var(--color-signal-cyan);
  --color-cosmic-violet: var(--color-signal-violet);
  --color-burst-magenta: var(--color-signal-magenta);
}
```

---

## Accessibility Requirements

### Contrast Ratios

| Combination | Ratio | Status |
|-------------|-------|--------|
| Primary text on deepest | ~16:1 | âœ“ AAA |
| Primary text on secondary | ~14:1 | âœ“ AAA |
| Secondary text on secondary | ~9:1 | âœ“ AAA |
| Muted text on secondary | ~5:1 | âœ“ AA |
| Disabled text minimum | 3:1 | âœ“ AA (large text) |

### Interactive Elements

- Minimum touch target: 44Ã—44px
- Focus indicators: 2px solid outline, Signal Cyan
- All interactive elements keyboard accessible

---

*Document created: December 2024*
*Last updated: January 2025*
