# Level One Radiology: Component Library

*Module specifications and component CSS*

**Navigation:** [README](../README.md) Â· [Brand Foundation](BRAND-FOUNDATION.md) Â· [Design Methodology](DESIGN-METHODOLOGY.md) Â· [Design Principles](DESIGN-PRINCIPLES.md) Â· [Design Tokens](DESIGN-TOKENS.md) Â· **Component Library** Â· [Technical Architecture](TECHNICAL-ARCHITECTURE.md)

---

## About This Document

This is the implementation reference for all modules and components. For the philosophy behind the module system, see [DESIGN-METHODOLOGY.md](DESIGN-METHODOLOGY.md). For design token values used in these components, see [DESIGN-TOKENS.md](DESIGN-TOKENS.md).

**Primitive Library Note:** Components in this document work with either Radix or Base UI as the underlying primitive layer. shadcn/ui provides an abstraction that keeps your component API consistent regardless of which primitive library you choose. See the Primitive Library Architecture section below.

---

## Primitive Library Architecture

### The Abstraction Layer

Level One uses shadcn/ui as an abstraction over headless component primitives:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Your Components (Case Viewer, Article UI)  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  shadcn/ui (abstraction + styling)          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Primitive Layer (Base UI or Radix)         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**What primitives provide:**
- Accessibility (ARIA attributes, focus management)
- Behavior logic (open/close states, keyboard navigation)
- Zero stylingâ€”just raw functionality

**What shadcn/ui adds:**
- Unified API regardless of primitive choice
- Tailwind-based styling
- Copy-paste ownership (code lives in your project)

### Choosing When to Use What

| Scenario | Approach |
|----------|----------|
| **Standard UI** (dialogs, dropdowns, tooltips) | Use shadcn/ui components |
| **shadcn doesn't have it** | Import directly from Base UI or Radix |
| **Need fine-grained control** | Use primitives Ã  la carte |
| **Highly custom interaction** (Case Viewer) | Build from scratch, primitives optional |

### Mixing Approaches

Since shadcn copies code to your project, you can mix freely:

```tsx
// shadcn component (uses your configured primitive)
import { Dialog } from "@/components/ui/dialog"

// Direct Base UI import for specific feature
import { Tooltip } from "@base-ui-components/react"

// Direct Radix import if needed
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

// Fully custom component
import { CaseViewer } from "@/components/case/CaseViewer"
```

---

## Module Tiers

### Workhorse Modules (8-10 total)

Used constantly. High investment in getting these right.

1. Article Header
2. Body Text
3. Inline Figure
4. Callout Block
5. Block Quote
6. Reference Section
7. Author Block
8. Newsletter CTA
9. Related Content
10. Article Index Card

### High-Touch Modules

Custom but reusable. Plan for iteration.

- Comparison Slider
- Timeline/Sequence
- Data Visualization

### Showstopper Module

The signature differentiator: **Case Viewer**

---

## Design Language

### HUD Framing

Inspired by Palantir's interface design. Four-corner brackets create a targeting-reticle aesthetic on key containers.

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

.hud-frame::before {
  top: 0; left: 0;
  border-width: 1px 0 0 1px;
}

.hud-frame::after {
  top: 0; right: 0;
  border-width: 1px 1px 0 0;
}

.hud-frame > .hud-corner-bl {
  bottom: 0; left: 0;
  border-width: 0 0 1px 1px;
}

.hud-frame > .hud-corner-br {
  bottom: 0; right: 0;
  border-width: 0 1px 1px 0;
}
```

**When to use:** Article cards, Case Viewer, sidebar panels, modal dialogs

**When NOT to use:** Body text, navigation, form inputs, inline elements

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
- Key Point â€” Signal Cyan
- Clinical Pearl â€” Ivory
- Caution/Warning â€” Signal Yellow
- Critical â€” Signal Red
- Technical Note â€” Signal Violet

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

**Design:** Solid Signal Red button. High-contrast. No ghost buttons.

**Implementation:** Use shadcn/ui `Button` and `Input` components. See [PROJECT-INITIALIZATION.md](PROJECT-INITIALIZATION.md) for code example.

### 9. Related Content

**Display:** 2-3 related articles at article end.

**Selection:** Same primary tag, manually curated, or "most popular" fallback.

**Design:** Cards with title, tags, minimal metadata. No thumbnails initially.

### 10. Article Index Card

For listing pages. Title, date, tag(s), excerpt. Uses monospace tag styling with HUD framing.

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
  background: var(--color-signal-red);
  border-color: var(--color-signal-red);
  color: #ffffff;
}

.button--primary:hover,
.button--primary:focus {
  background: var(--color-text-primary);
  border-color: var(--color-text-primary);
  color: var(--color-signal-red);
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

The signature differentiator. What makes someone say "this is different."

### Requirements

- Handle image stacks (scroll through slices)
- Support annotations (arrows, circles, text labels) with toggle
- Support comparison mode (two studies side-by-side, synchronized scrolling)
- Mobile: Swipe to scroll, tap to toggle annotations, pinch to zoom
- Desktop: Scroll wheel navigation, keyboard arrows, click-drag pan when zoomed
- Performance: Lazy loading essential (don't load entire stack upfront)
- Dark interface (uses deepest background with HUD framing)

### Design Principle

Should feel native to a radiologist. Familiar interaction patterns, clinical-appropriate display. This is where the imaging-native aesthetic gets expressed most fully.

### Implementation Approach

The Case Viewer is likely **custom-built rather than using shadcn/ui**, because:

1. **Domain-specific interactions** â€” PACS-like navigation doesn't map to standard primitives
2. **Full control needed** â€” Window/level, zoom, pan require custom implementation
3. **Performance critical** â€” Image stack handling needs specialized optimization

However, you may use primitive components internally:

- **Base UI Slider** for window/level controls
- **Base UI Tooltip** with "detached triggers" for annotation popups that follow cursor
- **Base UI ScrollArea** for thumbnail strip navigation

### Development Discipline

Do not build a second showstopper until:
- 20+ articles published
- Data on Case Viewer engagement collected
- Clear need identified for new feature

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
- [ ] Touch targets (44Ã—44px minimum)
- [ ] HUD framing applied where appropriate
- [ ] Works with chosen primitive library (Base UI or Radix)

---

*Document created: December 2024*
*Last updated: January 2025*
