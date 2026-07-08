# Design Tokens

*The index to the design tokens — what each token family is and where its values live.*

[← Design system](README.md) · [Docs](../README.md)

---

## About

Every concrete value — hex, size, line-height, spacing step, grid count, easing — lives in the CSS token files and is the single source of truth:

- **Color** — `../../src/styles/tokens/colors.css`
- **Typography** — `../../src/styles/tokens/typography.css`
- **Spacing & grid** — `../../src/styles/tokens/spacing.css`
- **Motion** — `../../src/styles/base/motion.css`

This doc is the **map**, not the spec. It names each token family, says what it's for, and points to the file that defines it. It never restates a value — pasted values drift out of sync; the CSS does not. When you need a number, open the file linked in that section.

Historical palette research (the warmth derivation, the 6-level surface study) lives in `../archive/dark-mode-palette-research.md`. The *why* behind the choices is in [philosophy.md](philosophy.md) and the [reasoning/](reasoning/) layer.

---

## Color

→ **`../../src/styles/tokens/colors.css`** · rationale: [philosophy.md](philosophy.md)

- **Surfaces** (`--color-bg-*`) — a six-level warm-biased background hierarchy from deepest (body ground) up through primary, secondary, raised, active, to elevated, separated by even luminance steps. Pick elevation by role: body → deepest; cards/sidebars → secondary; inputs → raised; hover → active; buttons/popovers → elevated.
- **Text** (`--color-text-*`) — a five-level hierarchy of warm whites and grays: primary (body/UI) → ivory (headlines/display) → secondary (bylines, excerpts) → muted (metadata, captions) → disabled.
- **Brand primary** (`--color-primary`, `--color-on-primary`) — the CTA/accent identity. `--color-primary` points at the **gold** (`--color-signal-yellow`); `--color-on-primary` is the legible near-black foreground on it (white on gold fails contrast). Re-point these two tokens to restyle every CTA.
- **Signals** (`--color-signal-*`) — functional, not decorative; each one carries meaning: **red** = critical / trauma, **cyan** = informational apparatus (key points, note callouts, statuses) + taxonomy, **yellow / gold** = the action color — links, focus, selection, CTAs (via `--color-primary`) — plus caution, **violet** = code / technical, **orange** = warning. Use a signal only when it means its thing. (The full interaction-semantics split lives in `colors.css`.)
- **Borders** (`--color-border-*`) — alpha-on-white separators from subtle through default to strong, plus an accent border.

**Warmth bias.** Surfaces carry a *minimal* warm offset — red nudged up one, blue down two off the neutral gray (R+1 / B−2) — enough to kill clinical coldness without reading as a visible tint. The exact channel values and the formula are in the CSS header; the reasoning is in [philosophy.md](philosophy.md).

---

## Typography

→ **`../../src/styles/tokens/typography.css`** · rationale: [reasoning/typography.md](reasoning/typography.md)

Families are chosen by **role**, not look — each `--ff-*` token is a non-interchangeable register. Active faces (OFL, loaded via Google Fonts); the prior self-hosted faces are kept as CSS fallbacks behind each token:

| Token | Role | Active face | Fallback face |
|---|---|---|---|
| `--ff-display` | Display & headlines — editorial voice | **Newsreader** | Utopia Std |
| `--ff-body` | Body & long-form reading | **DM Sans** | Lab Grotesque |
| `--ff-ui` | UI labels, tags, brand chrome | **Michroma** | Eurostile LT Std |
| `--ff-mono` | Code, technical / monospaced | **Chivo Mono** | IBM Plex Mono |

(Display optical-size and extended-width brand variants — `--ff-display-optical`, `--ff-subhead`, `--ff-caption`, `--ff-ui-ext` — layer the same active-then-fallback stacking.)

- **Scale** — the `--fz-*` / `--lh-*` ramp runs display → headline → body → UI, with a desktop step-up at the wide breakpoint. Reading-specific knobs (`--lh-reading`, `--reading-opsz`, the link-underline metrics) and the wordmark sizing/stroke tokens live alongside.
- **Utility classes** — apply `.type-display-l`, `.type-display`, `.type-headline`, `.type-body`, `.type-body-secondary`, `.type-ui`, `.type-meta` rather than re-specifying family/size/line-height/color per element; each class bundles the set that belongs together.

---

## Spacing & grid

→ **`../../src/styles/tokens/spacing.css`** · rationale: [reasoning/layout.md](reasoning/layout.md)

- **Spacing scale** — a relative `--space-*` ramp (tight to expansive) plus fixed steps, composed into semantic tokens: gutters, inner padding, section rhythm (`--section-spacer*`), component gaps, card padding, the radius scale, and the nav/logo metrics. Reach for a semantic token first; fall back to the raw scale.
- **Grid** — a primitive-based **6 / 12 / 18-column** system (mobile / ≥600px / ≥960px), where one mobile column equals two tablet equals three desktop. Three first-class roles are tokens: `--grid-columns` (track count), `--grid-gutter` (between columns, constant), `--grid-margin` (page edge → content, grows across breakpoints), with `--grid-max-width` capping the page shell. Layout is driven by `<Container>` / `<Grid>` / `<Col>` — never hand-rolled `grid-template-columns`.
- **Nested widths** — prose and media are capped independently of the shell: `--reading-column` (long-form measure) and `--media-column` (figures, code) so media can breathe wider than text.

---

## Motion

→ **`../../src/styles/base/motion.css`** · rationale: [reasoning/motion.md](reasoning/motion.md)

- **Reveal** (`--reveal-*`) — scroll-into-view entrance: rest offset distance, entry/exit duration, the reveal easing curve, and per-step stagger. An IntersectionObserver toggles `is-revealed`; CSS owns the transition, gated behind `prefers-reduced-motion`.
- **Easing** (`--ease-out`, `--ease-in-out`) — the curves for interactive UI feedback (presses, hovers, popovers) — snappier than reveals. Easing always comes from a token, never an inline `cubic-bezier()` outside the token files.

---

## Accessibility — contrast ratios

This is the **canonical home** for the measured text-on-surface contrast ratios; [reasoning/accessibility.md](reasoning/accessibility.md) and [engineering.md](../engineering.md) point here. For focus indicators, target sizes, and the full accessibility floor, see [reasoning/accessibility.md](reasoning/accessibility.md).

| Combination | Ratio | Status |
|---|---|---|
| Primary text on deepest | ~16:1 | ✓ AAA |
| Primary text on secondary | ~14:1 | ✓ AAA |
| Secondary text on secondary | ~9:1 | ✓ AAA |
| Muted text on secondary | ~5:1 | ✓ AA |
| Disabled text minimum | 3:1 | ✓ AA (large text) |
