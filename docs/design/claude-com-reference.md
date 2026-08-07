# claude.com Token Reference

> [← Design System](README.md)

External reference — the scraped design-token set of **claude.com** (Anthropic), a strong
inspiration for this site's color, type, and spacing decisions. This is a snapshot of *their*
system for study; it is **not** our token source (ours lives in `src/styles/tokens/`). When a
value here inspires a change, the change lands in our tokens with our names.

**Provenance**: `claude-brand.shared.d08b78c56.min.css` via
`cdn.prod.website-files.com/6889473510b50328dbb70ae6/` (Webflow), scraped 2026-08-07; dark-mode
values cross-checked against live blog screenshots (pixel-sampled).

## Architecture

Three layers of indirection: **swatches** (raw hex, below) → **theme roles**
(`background-primary`, `foreground-secondary`, …) → **component styles** (buttons, switches).
Dark mode is a *class-scoped remap of the theme roles onto the same swatch ramp* — no second
palette. Three dark tiers exist (`u-theme-dark-1/2/3` on bg gray-800/850/950); the blog's
article pages run **dark-3**.

## Swatches

### Warm gray ramp (the workhorse — 21 steps, subtly warm)

| Step | Hex | | Step | Hex |
|---|---|---|---|---|
| 000 | `#FFFFFF` | | 550 | `#73726C` |
| 050 | `#FAF9F5` | | 600 | `#5E5D59` |
| 100 | `#F5F4ED` | | 650 | `#4D4C48` |
| 150 | `#F0EEE6` | | 700 | `#3D3D3A` |
| 200 | `#E8E6DC` | | 750 | `#30302E` |
| 250 | `#DEDCD1` | | 800 | `#262624` |
| 300 | `#D1CFC5` | | 850 | `#1F1E1D` |
| 350 | `#C2C0B6` | | 900 | `#1A1918` |
| 400 | `#B0AEA5` | | 950 | `#141413` |
| 450 | `#9C9A92` | | 1000 | `#000000` |
| 500 | `#87867F` | | | |

### Brand + accents

| Name | Hex | Role |
|---|---|---|
| clay | `#D97757` | THE accent — text accent, hero accent, selection tint |
| clay-interactive | `#C96442` | Brand button bg (darker for contrast under light text) |
| error | `#B53333` | Error text (the only functional red) |
| cactus | `#BCD1CA` | Illustration/pictogram pastel |
| coral | `#EBCECE` | Illustration pastel |
| fig | `#C46686` | Illustration pastel |
| heather | `#CBCADB` | Illustration pastel |
| mineral | `#629987` | Illustration pastel (the green figure card in the blog) |
| oat | `#E3DACC` | Illustration pastel |
| olive | `#788C5D` | Illustration pastel |
| peach | `#EBC9B7` | Illustration pastel |
| plum | `#827DBD` | Illustration pastel |
| sky | `#6A9BCC` | Illustration pastel |

The discipline to lift: **one saturated accent (clay) in the UI**; the pastels live only inside
illustrations/pictogram cards, never as UI signal colors.

## Theme role mapping

| Role | Light (default) | Dark-3 (blog articles) |
|---|---|---|
| background-primary | gray-050 `#FAF9F5` | gray-950 `#141413` |
| background-secondary | gray-100 `#F5F4ED` | gray-900 `#1A1918` |
| background-tertiary | gray-150 `#F0EEE6` | gray-850 `#1F1E1D` |
| foreground-primary (body + headings) | gray-950 `#141413` | gray-050 `#FAF9F5` |
| foreground-secondary | gray-750 `#30302E` | gray-400 `#B0AEA5` |
| foreground-tertiary (captions, muted) | gray-600 `#5E5D59` | gray-500 `#87867F` |
| border-primary | gray-400 `#B0AEA5` | gray-600 `#5E5D59` |
| border-secondary | gray-300 `#D1CFC5` | gray-700 `#3D3D3A` |
| border-tertiary | gray-200 `#E8E6DC` | gray-750 `#30302E` |
| text-accent | clay | clay |
| selection | clay 50% over transparent | same |

Notable: dark body text is **full-brightness ivory (gray-050, ~16.9:1)** — the calm comes from
muted apparatus and near-invisible borders, not from dimming the reading text.

## Typography

Families: **Anthropic Sans** (primary/body, weights 300–700), **Anthropic Serif** (display
/headlines), **Anthropic Mono**. Body default: sans, weight 400, line-height 1.6,
letter-spacing 0, `text-wrap: pretty`. Cap-height leading trim: top .39em, bottom .38em.

Every size is a fluid clamp between viewport 320px → 1440px:

| Token | Min → Max (px) | | Token | Min → Max (px) |
|---|---|---|---|---|
| display-1 | 42 → 72 | | body-large-1 | 22 → 24 |
| display-2 | 36 → 64 | | body-large-2 | 20 → 23 |
| h1 | 34 → 52 | | body-1 (default) | 19 → 20 |
| h2 | 30 → 44 | | body-2 | 17 |
| h3 | 28 → 36 | | body-3 | 15 |
| h4 | 23 → 32 | | caption | 12 |
| h5 | 20 → 25 | | micro | 10 |
| h6 | 16 → 19 | | | |

Line-height scale: 1 / 1.1 / 1.2 / 1.3 / 1.5 / 1.6 / 1.7. Letter-spacing scale: 0 / .01em /
.05em (uppercase only).

## Layout & shape

| Token | Value |
|---|---|
| Page margin | fluid 32 → 64px |
| Grid | 12 columns, 32px gutter |
| Max width main / medium / small | 1440 / 1192 / 960px |
| Section space small / main / large | 64→96 / 96→128 / 128→200px (fluid) |
| Page-top space | 192 → 240px |
| Radius xs / s / main / l / xl / xxl | 4 / 8 / 12 / 16 / 16→24 / 16→32px |
| Border width | 1px |
| Focus ring | 2px, offset −2 inner / +4 outer |

## Observed article-page practices (from the blog, dark-3)

- Serif display headlines over sans body; the serif never runs body text.
- "Key takeaways" list: bold sans label, bulleted complete sentences with terminal periods,
  bullet in a narrow gutter, one text edge.
- Meta block (Category / Date / Reading time / Share) as icon + muted label + value rows.
- Figures ride light cards (white or pastel) on the dark ground, caption centered below in
  foreground-tertiary.
- Accent appears exactly once above the fold (the logo mark); links underline in the text color.

---

*Snapshot 2026-08-07 — re-scrape to refresh; the CSS bundle hash in Provenance will have moved.*
