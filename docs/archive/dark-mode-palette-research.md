---
status: archived
superseded_by: ../DESIGN-TOKENS.md
retained_for: historical context and comparison research (Claude UI, VS Code)
date_captured: 2024-12
---

# ⚠️ Archived: Dark Mode Palette Research

**This document is historical.** It was the research that informed the current palette in [../DESIGN-TOKENS.md](../DESIGN-TOKENS.md), but the authoritative token values now live there. Values in this file do not match the current system exactly — they were proposals that got refined during implementation.

**Why it's kept:**
- Shows the provenance of the 6-level surface hierarchy and the R+1/B-2 warmth formula.
- Contains reference palettes from **Claude UI** and **VS Code Dark** that are useful for future comparative analysis.
- Documents the luminance-stepping rationale (4–6% per step) that still governs the current system.

**What changed between this research and the implemented tokens:**

| This file | DESIGN-TOKENS.md (current) |
|---|---|
| `--color-imaging-black: #070606` | `--color-bg-deepest: #0B0A08` (slightly lifted) |
| `--color-surface-deep: #121210` | `--color-bg-primary: #131210` |
| `--color-control-charcoal: #202022` | `--color-bg-secondary: #1B1A18` (rebalanced warmer) |
| `--color-surface-raised: #2C2C2A` | `--color-bg-raised: #232220` |
| `--color-surface-active: #3A3A38` | `--color-bg-active: #2B2A28` (plus new `--color-bg-elevated: #333230` for a 6th level) |
| `--color-console-white: #F5F1EC` | `--color-text-primary: #F9F3EB` (slightly warmer) |
| `--color-textbook-ivory: #F2E8C9` | `--color-text-ivory: #F5E6C2` |
| Legacy names (imaging-black, console-white, etc.) | Renamed to semantic names (bg-deepest, text-primary). Legacy names retained as aliases in `colors.css`. |

**When to reference this document:**
- When proposing further palette refinements and you want the original comparative context.
- When explaining to a collaborator why the system is warm-biased and luminance-stepped.
- Not when writing code — use the live tokens in `DESIGN-TOKENS.md` / `src/styles/tokens/colors.css`.

---

---

# Dark Mode Color Analysis: Claude UI, IDE Patterns & Level One Radiology

*Analysis of warm dark mode palettes for professional interfaces*

---

## Part 1: Claude UI Color Extraction

### Background Colors (Dark to Light)

| Role | Hex | RGB | Luminance | Notes |
|------|-----|-----|-----------|-------|
| **Deepest Background** | `#141414` | (20, 20, 20) | 0.08 | Title bar, window frame |
| **Primary Background** | `#242420` | (36, 36, 32) | 0.14 | Main content area, conversation pane |
| **Sidebar Background** | `#31312F` | (49, 49, 47) | 0.19 | Left navigation panel |
| **Elevated Surface** | `#3D3D3A` | (61, 61, 58) | 0.24 | Selected/hover states, cards |
| **Hover/Active** | `#484844` | (72, 72, 68) | 0.28 | Interactive element highlights |

### Text Colors (Hierarchy)

| Role | Hex | RGB | Luminance | Notes |
|------|-----|-----|-----------|-------|
| **Primary Text** | `#F8F8F4` | (248, 248, 244) | 0.97 | Main body text, high priority |
| **Secondary Text** | `#F4F4F0` | (244, 244, 240) | 0.96 | Slightly softer, same tier |
| **Tertiary Text** | `#C0C0BC` | (192, 192, 188) | 0.75 | Sidebar items, timestamps |
| **Muted Text** | `#B8B8B4` | (184, 184, 180) | 0.72 | Labels, section headers |
| **Disabled/Faint** | `#888884` | (136, 136, 132) | 0.53 | Very low priority, hints |

### Accent Colors

| Role | Hex | RGB | Notes |
|------|-----|-----|-------|
| **Primary Action (Green)** | `#28C040` | (40, 192, 64) | New chat button, positive actions |
| **Warm Highlight** | `#D87454` | (216, 116, 84) | Coral/terra cotta accent |
| **Alert/Gold** | `#FCBC2C` | (252, 188, 44) | Warning, attention |

---

## Part 2: The Warmth Formula

### Why Claude's Palette Feels Warm (Not Cold)

**Key observation:** Every neutral has a subtle warm bias. Look at the RGB values:

```
#242420 → R:36, G:36, B:32  (Blue is lower by 4)
#31312F → R:49, G:49, B:47  (Blue is lower by 2)
#F8F8F4 → R:248, G:248, B:244 (Blue is lower by 4)
```

**The pattern:** In every case, the Blue channel is slightly suppressed (2-4 points lower than R and G). This creates an imperceptible yellow/cream warmth that prevents the "cold reading room" feel.

**Contrast with pure neutrals:**
- Pure neutral: `#242424` (R=G=B)
- Claude's warm: `#242420` (B-4)
- The difference is subtle but cumulative across the entire interface

### Luminance Stepping Pattern

Claude uses a deliberate luminance hierarchy for surfaces:

```
0.08 → 0.14 → 0.19 → 0.24 → 0.28
   +6%    +5%    +5%    +4%
```

Each step increases luminance by 4-6%, creating clear visual separation without harsh contrast.

---

## Part 3: VS Code Dark Theme Analysis

### Core Background Colors

| Role | Hex | RGB | Luminance |
|------|-----|-----|-----------|
| **Editor Background** | `#1E1E1E` | (30, 30, 30) | 0.12 |
| **Sidebar Background** | `#252526` | (37, 37, 38) | 0.15 |
| **Tab Bar Background** | `#2D2D2D` | (45, 45, 45) | 0.18 |
| **Title Bar** | `#3C3C3C` | (60, 60, 60) | 0.24 |
| **Hover/Active** | `#2A2D2E` | (42, 45, 46) | 0.17 |
| **Selection** | `#094771` | (9, 71, 113) | — |

### Text Colors

| Role | Hex | RGB |
|------|-----|-----|
| **Primary Foreground** | `#CCCCCC` | (204, 204, 204) |
| **Editor Text** | `#BBBBBB` | (187, 187, 187) |
| **Sidebar Header** | `#F5F5F5` | (245, 245, 245) |
| **Muted/Inactive** | `#858585` | (133, 133, 133) |

### Key Functional Colors

| Role | Hex | Usage |
|------|-----|-------|
| **Focus/Selection** | `#007ACC` | Blue focus rings, selection |
| **Link** | `#3794FF` | Active links |
| **Error** | `#F14C4C` | Error states |
| **Warning** | `#CCA700` | Warning states |
| **Success/Add** | `#587C0C` | Git additions |
| **Info** | `#3794FF` | Information states |

### VS Code's Neutrality

Notice VS Code uses pure neutrals (R=G=B) for most surfaces:
- `#1E1E1E` (30, 30, 30) — perfectly neutral
- `#252526` (37, 37, 38) — B+1, slightly cool
- `#3C3C3C` (60, 60, 60) — perfectly neutral

This creates a more clinical/neutral feel compared to Claude's warm bias.

---

## Part 4: Comparison Table

| Attribute | Claude UI | VS Code Dark | Level One (Current) |
|-----------|-----------|--------------|---------------------|
| **Deepest BG** | `#141414` (L:0.08) | `#1E1E1E` (L:0.12) | `#070606` (L:0.03) |
| **Primary BG** | `#242420` (L:0.14) | `#252526` (L:0.15) | `#202022` (L:0.13) |
| **Primary Text** | `#F8F8F4` (L:0.97) | `#CCCCCC` (L:0.80) | `#F5F1EC` (L:0.94) |
| **Warmth Bias** | Yes (B-4) | Neutral to Cool | Yes (custom warm) |
| **Accent Strategy** | Green + Coral | Blue focus | Red + Cyan |

---

## Part 5: Recommendations for Level One Radiology

### Current Palette Assessment

Your existing palette is strong:
- **Imaging Black** `#070606` — Very deep, darker than both Claude and VS Code
- **Control Charcoal** `#202022` — Good secondary, slightly warm
- **Console White** `#F5F1EC` — Warm off-white, excellent choice
- **Textbook Ivory** `#F2E8C9` — Strong warm accent

### Identified Gap: Intermediate Surface Colors

Your current system has a significant luminance jump:

```
Imaging Black:    #070606  (L: 0.03)
Control Charcoal: #202022  (L: 0.13)
                  ↑ Jump of 10% — too large for subtle hierarchy
```

Claude's system has 4-5% steps. This matters for:
- Hover states
- Card surfaces
- Sidebar differentiation
- Selected states
- Input field backgrounds

### Proposed Additions: Surface Color Scale

| Token | Hex | RGB | Luminance | Usage |
|-------|-----|-----|-----------|-------|
| `--color-imaging-black` | `#070606` | (7, 6, 6) | 0.03 | Deepest background, body |
| `--color-surface-deep` | `#121210` | (18, 18, 16) | 0.07 | ✨ **NEW** — elevated regions |
| `--color-control-charcoal` | `#202022` | (32, 32, 34) | 0.13 | Cards, nav, secondary BG |
| `--color-surface-raised` | `#2C2C2A` | (44, 44, 42) | 0.17 | ✨ **NEW** — hover states, inputs |
| `--color-surface-active` | `#3A3A38` | (58, 58, 56) | 0.22 | ✨ **NEW** — selected states |

### Proposed Additions: Text Hierarchy

Your current text colors:
- Console White `#F5F1EC` — Primary
- Textbook Ivory `#F2E8C9` — Emphasis

**Gap:** No muted text colors for metadata, timestamps, secondary content.

| Token | Hex | RGB | Luminance | Usage |
|-------|-----|-----|-----------|-------|
| `--color-console-white` | `#F5F1EC` | (245, 241, 236) | 0.94 | Primary text |
| `--color-text-secondary` | `#C4C0BA` | (196, 192, 186) | 0.75 | ✨ **NEW** — metadata, bylines |
| `--color-text-muted` | `#8A8884` | (138, 136, 132) | 0.53 | ✨ **NEW** — timestamps, hints |
| `--color-text-disabled` | `#5A5856` | (90, 88, 86) | 0.34 | ✨ **NEW** — disabled states |

### Complete Proposed Palette

```css
:root {
  /* === BACKGROUNDS (warm-biased neutrals) === */
  --color-imaging-black: #070606;     /* L:0.03 — deepest, body BG */
  --color-surface-deep: #121210;      /* L:0.07 — elevated regions */
  --color-control-charcoal: #202022;  /* L:0.13 — cards, nav, secondary */
  --color-surface-raised: #2C2C2A;    /* L:0.17 — hover, inputs */
  --color-surface-active: #3A3A38;    /* L:0.22 — selected, active */

  /* === TEXT (warm off-whites to muted) === */
  --color-console-white: #F5F1EC;     /* L:0.94 — primary text */
  --color-textbook-ivory: #F2E8C9;    /* L:0.92 — emphasis, headlines */
  --color-text-secondary: #C4C0BA;    /* L:0.75 — metadata, bylines */
  --color-text-muted: #8A8884;        /* L:0.53 — timestamps, hints */
  --color-text-disabled: #5A5856;     /* L:0.34 — disabled states */

  /* === SIGNAL COLORS (unchanged) === */
  --color-level-one-red: #D03454;     /* Brand, CTA, critical */
  --color-sunset-orange: #F04E2A;     /* Warning, urgent */
  --color-chroma-yellow: #F2C94C;     /* Caution */
  --color-scanline-cyan: #2ACEC2;     /* Links, interactive */
  --color-burst-magenta: #D91CC3;     /* Special emphasis */
  --color-cosmic-violet: #A98BFF;     /* Code, technical */

  /* === BORDERS (subtle) === */
  --color-border-subtle: rgba(245, 241, 236, 0.08);
  --color-border-default: rgba(245, 241, 236, 0.12);
  --color-border-strong: rgba(245, 241, 236, 0.20);
}
```

---

## Part 6: Application Examples

### Navigation Bar

```css
.site-header {
  background: var(--color-control-charcoal);  /* #202022 */
}

.site-nav__item {
  color: var(--color-text-secondary);  /* #C4C0BA - subdued by default */
}

.site-nav__item:hover {
  color: var(--color-console-white);  /* #F5F1EC - full brightness on hover */
  background: var(--color-surface-raised);  /* #2C2C2A - subtle lift */
}

.site-nav__item--active {
  color: var(--color-console-white);
  background: var(--color-surface-active);  /* #3A3A38 */
}
```

### Article Card

```css
.article-card {
  background: var(--color-control-charcoal);  /* #202022 */
  border: 1px solid var(--color-border-subtle);
}

.article-card:hover {
  background: var(--color-surface-raised);  /* #2C2C2A */
  border-color: var(--color-border-default);
}

.article-card__title {
  color: var(--color-console-white);
}

.article-card__meta {
  color: var(--color-text-muted);  /* #8A8884 */
}

.article-card__excerpt {
  color: var(--color-text-secondary);  /* #C4C0BA */
}
```

### Case Viewer (Signature Module)

```css
.case-viewer {
  background: var(--color-imaging-black);  /* #070606 - deepest for clinical feel */
}

.case-viewer__toolbar {
  background: var(--color-surface-deep);  /* #121210 */
  border-bottom: 1px solid var(--color-border-subtle);
}

.case-viewer__annotation {
  color: var(--color-scanline-cyan);  /* #2ACEC2 - interactive/technical */
}
```

---

## Part 7: Key Principles Learned

### From Claude UI
1. **Consistent warm bias** — Suppress blue by 2-4 points across all neutrals
2. **Gradual luminance steps** — 4-6% between adjacent surfaces
3. **High text contrast** — Primary text at L:0.94+ on dark backgrounds
4. **Accent restraint** — One or two accent colors, used sparingly

### From VS Code
1. **Clear functional colors** — Each semantic state has dedicated color
2. **Blue as primary interactive** — Focus, selection, links all share blue family
3. **Muted chrome** — UI elements stay subdued to foreground content
4. **Pure neutrals can work** — But feel more clinical/technical

### For Level One Radiology
1. **Your warm bias is correct** — Console White and Textbook Ivory are excellent choices
2. **Add intermediate surfaces** — 5 surface levels instead of 2
3. **Add muted text colors** — For clear visual hierarchy in metadata
4. **Keep signal colors semantic** — Your functional color system is already well-designed
5. **Deepest black works** — `#070606` is darker than typical, which is appropriate for imaging-native aesthetic

---

## Appendix: Luminance Reference

**Formula:** `L = (0.299×R + 0.587×G + 0.114×B) / 255`

| Luminance | Typical Use |
|-----------|-------------|
| 0.00-0.05 | Deepest backgrounds (your Imaging Black) |
| 0.05-0.10 | Primary dark backgrounds |
| 0.10-0.15 | Secondary surfaces |
| 0.15-0.20 | Hover states, inputs |
| 0.20-0.30 | Active/selected states |
| 0.30-0.40 | Disabled text |
| 0.50-0.60 | Muted text, timestamps |
| 0.70-0.80 | Secondary text, metadata |
| 0.90-1.00 | Primary text |

---

*Analysis completed December 2024*
