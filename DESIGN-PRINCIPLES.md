# Level One Radiology: Design Principles

*Design philosophy and visual identity decisions*

**Navigation:** [README](README.md) Â· [Brand Foundation](BRAND-FOUNDATION.md) Â· [Design Methodology](DESIGN-METHODOLOGY.md) Â· **Design Principles** Â· [Design Tokens](DESIGN-TOKENS.md) Â· [Component Library](COMPONENT-LIBRARY.md) Â· [Technical Architecture](TECHNICAL-ARCHITECTURE.md)

---

## Design Philosophy

**Core principle:** Tight, not cramped. Trust the typography. Avoid the modern tendency toward excessive padding and oversized fonts that creates visual flabbiness.

**Reference point:** Fictive Kin achieves density through restraintâ€”minimal nav gaps (~16-20px between items), compact nav height (~48px), modest horizontal padding (~24px mobile), and body text at 16px rather than the endemic 18-20px.

**Level One adaptation:** Apply this density philosophy to a dark-first, imaging-native aesthetic with subtle warmth. The result should feel like a well-designed clinical applicationâ€”professional, efficient, and comfortable without being sparse.

---

## Aesthetic Vision

Dark-first interface inspired by:
- **X-ray grid lines** â€” Clinical precision
- **Vintage phosphor monitors** â€” Subtle warmth, technical heritage
- **Mature operating system design** â€” Palantir, Cursor IDE density

Executed with warmth through:
- Warm gray palette with minimal amber bias
- Tech-editorial hybrid typography
- Restrained spacing
- Technical ornament that evokes precision without coldness

---

## The Seven Core Principles

### 1. Dark-First, Not Dark-Only

Default is dark. Radiology is read in dark rooms. The brand is imaging-native.

**Implementation:**
- Uses darker luminance range optimized for radiology workstation environments
- Minimal warm bias (R+1, B-2) prevents clinical coldness without visible tint
- Sufficient contrast for accessibility (primary text on deepest â‰¥ 16:1 ratio)
- Consider light mode toggle for daytime/accessibility contexts (future)

### 2. The Case Viewer Is the Hero

The signature differentiator. What makes someone say "this is different."

**Implementation:**
- Natural extension of PACS workstation
- Where design investment pays off most
- Earns trust before reader finishes first article
- Full HUD framing treatment

### 3. Tight, Not Cramped

Compact navigation. Restrained font sizes. Trust typography to do its job.

**Implementation:**
- Navigation: 48px height, 16px gaps between items
- Body text: 16px (not 18-20px)
- UI text: 11px uppercase
- Every gap has a purposeâ€”whitespace is hierarchy, not decoration

### 4. Warmth Through Color, Typography, and Spacing

Warmth is systemic, not decorative.

**Implementation:**
- Minimal warm bias in surfaces creates comfort without visible tint
- Ivory text for headlines adds warmth to emphasis
- Humanist sans-serif (Lab Grotesque) for approachable body text
- Generous line-height (1.5) creates breathing room within text blocks
- Section breaks through whitespace, not dividers

### 5. Signal Colors Are Functional, Not Decorative

Colors mean something when they appear. Train readers to understand the visual language.

**Implementation:**
- Signal Red â†’ Brand accent, primary CTA, critical callouts
- Signal Cyan â†’ Links, interactive elements
- Signal Yellow â†’ Caution
- Signal Orange â†’ Warning
- Signal Violet â†’ Technical notes, code

### 6. Mobile-First Density

Most LinkedIn traffic is mobile. Apply the same tight spacing philosophy.

**Implementation:**
- Don't "loosen up" for mobile
- Touch targets: 44x44px minimum
- No hover-dependent interactions
- Same typography scale, same spacing philosophy

### 7. Technical Ornament Creates Distinction

Precision without coldness. Earned, not scattered.

**Implementation:**
- HUD framing (four-corner brackets) on key containers
- Micrographic elements (registration marks, dimension lines, folios)
- Editorial typography patterns (small caps, structured bylines)
- Restraint in applicationâ€”ornament is earned

---

## Typography Hierarchy

A tech-editorial hybrid combining three typefaces:

### Display (Serif): Utopia Std

- Headlines, article titles, emphasis moments
- Designed for newspapers (challenging reading conditions)
- Robust stroke weight, excellent dark mode rendering
- Editorial authority and warmth

### Body (Sans-Serif): Lab Grotesque

- Article body text, descriptions
- Modern humanist grotesque with warm personality
- Excellent small-size legibility (11px-48px)
- Mobile-optimized for scannable content

### UI/Technical: Eurostile LT Std Condensed

- Logo, navigation, tags, metadata
- Retro-tech aesthetic (70s/80s electronics, vintage monitor heritage)
- PACS-like precision for Case Viewer
- Excellent at 11px uppercase

**Rationale:** This three-tier system provides clear differentiationâ€”serif authority in headlines, sans clarity in content, tech precision in UI chrome. Optimized for dark mode readability and small-size legibility (11px UI labels).

---

## Color Philosophy

### Generative Approach

The surface palette is generated from three parameters:
- **Base Luminance:** 10 (G value for deepest surface)
- **Luminance Step:** 8 (consistent interval between levels)
- **Warmth Spread:** 3 (difference between R and B channels)

This enables systematic exploration while maintaining consistency.

### The Warmth Formula

Professional dark interfaces achieve warmth by manipulating RGB channels relative to neutral. Level One uses a **minimal warm bias**:

```
R = G + 1  (slight red boost)
G = base   (anchor value)
B = G - 2  (slight blue suppression)
```

This creates warmth without visible tintâ€”the 3-unit spread is imperceptible as color but prevents the harshness of pure neutrals on backlit screens. The aesthetic evokes vintage phosphor monitors rather than the more saturated "candlelight" warmth of crimson-biased palettes.

### Luminance Stepping

Human vision perceives luminance logarithmically. Large jumps between surface levels feel harsh; small consistent steps feel smooth.

Level One uses **consistent 8-unit luminance steps** between adjacent surfaces, creating a smooth six-level hierarchy from near-black to mid-gray.

---

## Spacing Philosophy

### Tight Relationships

- Nav items: 16px gaps (not 32-40px)
- Related content (title â†’ description): 8-16px
- Tag groups: 8px gaps

### Generous Breaks

- Section separations: 64-96px
- Content â†’ unrelated content: 48px+
- Article end â†’ CTA: 48px

### The Rule

Whitespace is a hierarchy tool, not decoration. Every gap has a job.

---

## Designated Spice Zones

*Concentrate personality in specific areas rather than spreading everywhere.*

### Where to Apply Spice

1. **Masthead/Logo** â€” Brand mark, site identity
2. **Case Viewer Interface** â€” Dark, clinical, precise, warm. Signature interaction. Full HUD framing.
3. **Article Cards** â€” HUD corner framing, structured metadata
4. **CTAs on Hover/Focus** â€” Subtle color shift, gentle scale
5. **Section transitions** â€” Dimension lines, subtle gradient fades
6. **Footer** â€” Registration marks, warmth moment, display font accent
7. **404 Page** â€” Voice opportunity. "Nothing here. Perhaps the image was lost in translation."

### Where NOT to Apply Spice

- Body text area (clean, readable)
- Navigation (fast, functional)
- Reference section (scholarly credibility)
- Forms (frictionless, no surprises)

---

## Visual Identity Summary

| Element | Decision | Rationale |
|---------|----------|-----------|
| **Mode** | Dark-first | Imaging-native, radiology context |
| **Warmth** | Minimal warm bias (R+1, B-2) | Comfortable without visible tint |
| **Density** | Tight, not cramped | Fictive Kin methodology |
| **Display type** | Utopia Std (serif) | Editorial authority |
| **Body type** | Lab Grotesque (sans) | Warm clarity at small sizes |
| **UI type** | Eurostile LT Std (tech) | Retro-tech precision |
| **Hero feature** | Case Viewer | Clinical credibility |
| **Ornament** | HUD framing, micrographics | Technical precision |

---

## Design Decision Checklist

When making a design decision, verify alignment with principles:

- [ ] Does it maintain tight-not-cramped density?
- [ ] Does it support dark-first context?
- [ ] Does it use warmth systematically (not decoratively)?
- [ ] Are signal colors used functionally?
- [ ] Does it work on mobile without loosening?
- [ ] Is ornament earned and restrained?
- [ ] Does it respect the typography hierarchy?
- [ ] Does it support subscriber conversion? (See [Design Methodology](DESIGN-METHODOLOGY.md))

---

## Relationship to Tokens

This document describes **philosophy and decisions**. For implementation specifications (hex values, pixel values, CSS), see [DESIGN-TOKENS.md](DESIGN-TOKENS.md).

| This Document Says | Tokens Document Specifies |
|--------------------|--------------------------|
| "Six-level surface hierarchy" | Exact hex values for each level |
| "Minimal warm bias (R+1, B-2)" | RGB values, warmth formula |
| "16px body text" | `--fz-body: 1rem` |
| "48px nav height" | `--nav-height: 48px` |

---

*Document created: December 2024*
*Last updated: January 2025*
