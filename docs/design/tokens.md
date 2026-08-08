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

The palette is **one brand color, a warm neutral ramp, and a short list of accents** — some of them shades of the brand, some deliberately not.

**Three layers, one direction: swatch → role → consumer.**

1. **Swatches** (`--gray-*`) — the raw warm-neutral ramp, named by green-channel luminance (green is the warmth formula's free variable; every other channel derives from it). Sparse: a step exists only where a role consumes it.
2. **Roles** (`--color-*`) — name the *job* (`bg-raised`, `border-default`, `text-muted`) and point at a swatch or an accent.
3. **Consumers** — reference **roles only**. A `--gray-*` in a component is a violation: it reaches past the role that gives the value meaning, which is exactly the drift the role layer prevents. Enforced by `npm run lint` (`scripts/check-inline-colors.mjs`), which walks CSS as well as markup — stylelint inspects declaration *values* and cannot express an off-limits custom-property *name*.

- **Brand** (`--color-level-one-gold`) — **Level One Gold, the prime.** Defined once, as itself, not as a signal. `--color-primary` points at it and `--color-on-primary` is the legible near-black foreground on it (white on gold fails contrast); re-point those to restyle every CTA.
- **Surfaces** (`--color-bg-*`) — a six-level warm-biased hierarchy from deepest (body ground) up through primary, secondary, raised, active, to elevated. Raised sits **one** notch above ground, not two: plane definition is the borders' job, and a fill doing that work is what read as muddy in the mid-dark zone. Pick elevation by role: body → deepest; page bands → primary; cards → raised; hover → active; buttons/popovers → elevated.
- **Text** (`--color-text-*`) — five warm whites and grays: primary (body/UI, and every *reading* surface) → ivory (headlines/display) → secondary (*apparatus* — decks, callouts, blockquotes, reference cards) → muted (metadata, captions, chips) → disabled. The split is per-*element*, not per-component: within an apparatus card, the **reading content** goes to primary and the card's **framing prose** stays secondary. That is why a Key Points list reads at primary while a callout's body — which is the aside itself, not content you read through — stays secondary.
- **Accents** — two families. The **gold family** is a stepped ramp — `--gold-100/-80/-60`, the prime mixed toward ivory in even 20% rungs (the reference's clay / clay-interactive / selection pattern, mirrored for dark) — with one job per rung: **100** is the brand voice (CTAs, the beam — via `--color-primary`), **80** is the action voice (links, focus, progress — brand ≠ action, decided 2026-08), **60** is the large-area wash (selection, bands). A new gold weight is the next 20% rung, never a freehand hex, and a rung is never shared across jobs. `--color-signal-yellow` (caution) borrows the prime by name so the two can diverge in one line. The **independent** accents are their own hues on purpose: `--color-signal-red` (clinical severity, validation errors), `--color-signal-cyan` (**instrument** — the case viewer's readouts and rings, nothing else), `--color-teal-apparatus` (**editorial apparatus** — key points, note callouts, statuses, code strings). Cyan and teal are one hue family, two jobs.
- **Borders** (`--color-border-*`) — **opaque ramp steps** from subtle through default to strong. An alpha border inherits whatever is beneath it, so one token read as a different weight on every surface; opaque steps hold one weight everywhere. Two consequences the conversion made concrete: a border step must be chosen for the grounds it actually lands on — sitting one *on* a surface step makes it vanish there, which is why `subtle` has a step of its own — and because the old alpha borders drew brightness from the fill beneath them, **lowering a surface dims its own border**. Definition only transfers from fill to border if the border is actually raised to take it. **One carve-out:** borders that composite over CT imaging pixels stay component-local alpha, because a slice has no fixed ground — see `../../src/styles/tokens/case-viewer.css`.
- **Taxonomy is not a color.** Tags render as uniformly neutral chips; no per-tag hue exists (see `../../src/lib/tags.ts`).

**Warmth bias.** Surfaces carry a *minimal* warm offset; text carries a deliberately wider one. The formulas, the channel values, and the reasoning live in [philosophy.md](philosophy.md), which is their single home — this doc does not restate them.

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

- **Scale** — the `--fz-*` ramp runs display → headline → body → UI, with dedicated reading rungs (`--fz-lead` / `--fz-reading` / `--fz-list`, the reference system's 19/17/15 body ladder). The **editorial** part of it interpolates fluidly with `clamp()` over a 320 → 1280px viewport (display sizes, article title and deck, prose heading sizes, section spacers, card padding, the prose heading gap) rather than stepping at a breakpoint. Everything else stays **stepped** on purpose: body reading size, the UI/meta/micro sizes, and the grid triple, whose column count is inherently discrete. Reading-specific knobs (`--reading-opsz`, the link-underline metrics) and the wordmark sizing/stroke tokens live alongside.
- **Leading ramp** (`--lh-100` … `--lh-150`) — a **closed five-rung set**, named by value ×100, one rung per element class site-wide: solid display, display serif, headings, the dense reading voice, and the open sans voice. A numeric `line-height` outside the token file is a stylelint violation, rungs are spaced a meaningful step apart (test-enforced ≥ 0.1 — a minuscule-difference pair cannot re-enter), and every semantic `--lh-*` token resolves to a rung. `--lh-reading` is one rung at every viewport; there is no breakpoint step.
- **Tracking** (`--ls-tight` / `--ls-mono` / `--ls-ui`) — three voices: sans tightening, the mono console voice, uppercase UI labels. The wordmark pair (`--ls-wordmark`, `--ls-wordmark-open`) is deliberately separate: tuned against the synthesized stroke weight, it moves with the stroke knobs, not the label voice.
- **Weights** (`--fw-regular` / `--fw-semibold` / `--fw-bold`) — the three-weight vocabulary for style rules. `@font-face` descriptors stay numeric (they declare what a file *is*, not a style choice).
- **Two traps the fluid scale carries.** A `@media` block that still sets a token `:root` now clamps *wins* above that breakpoint and silently un-fluidizes it; and **no JS may read a fluid token** via `getPropertyValue`, which returns the unresolved `clamp()` string (`parseFloat` → `NaN`, propagating into geometry). Measure a consumer's resolved box instead. Both are guarded by tests in `../../src/styles/tokens.test.mjs` — which `npm test` runs but **CI does not**, so the guards only fire if someone runs the suite.
- **Utility classes** — apply `.type-display-l`, `.type-display`, `.type-headline`, `.type-body`, `.type-body-secondary`, `.type-ui`, `.type-meta` rather than re-specifying family/size/line-height/color per element; each class bundles the set that belongs together.

---

## Spacing & grid

→ **`../../src/styles/tokens/spacing.css`** · rationale: [reasoning/layout.md](reasoning/layout.md)

- **Spacing scale** — a relative `--space-*` ramp (tight to expansive) plus fixed steps, composed into semantic tokens: gutters, inner padding, section rhythm (`--section-spacer*`), component gaps, card padding, the radius scale, and the nav/logo metrics. Reach for a semantic token first; fall back to the raw scale.
- **Prose rhythm** (`--prose-*`) — the reading column's vertical grammar, one token per relationship: paragraph → next block, body → heading (fluid, replacing the old breakpoint step), heading → its own body, between list items, and the list indent. Tuning a gap is a one-line edit that propagates through every article.
- **Hairlines, focus, stacking** — `--border-w` / `--border-w-strong` are the border-width system's geometry (its colors live in colors.css); `--focus-ring-w` / `--focus-ring-offset` shape the `:focus-visible` outline; the `--z-*` ladder is the site's stacking order in one home (local stacking inside an isolated component stays inline — structural, not design). `z-index`, like the rhythm properties above, is stylelint-gated.
- **Grid** — a primitive-based **6 / 12 / 18-column** system (mobile / ≥600px / ≥960px), where one mobile column equals two tablet equals three desktop. Three first-class roles are tokens: `--grid-columns` (track count), `--grid-gutter` (between columns, constant), `--grid-margin` (page edge → content, grows across breakpoints), with `--grid-max-width` capping the page shell. Layout is driven by `<Container>` / `<Grid>` / `<Col>` — never hand-rolled `grid-template-columns`.
- **Nested widths** — prose and media are capped independently of the shell: `--reading-column` (long-form measure) and `--media-column` (figures, code) so media can breathe wider than text.

---

## Motion

→ **`../../src/styles/base/motion.css`** · rationale: [reasoning/motion.md](reasoning/motion.md)

- **Reveal** (`--reveal-*`) — scroll-into-view entrance: rest offset distance, entry/exit duration, the reveal easing curve, and per-step stagger. An IntersectionObserver toggles `is-revealed`; CSS owns the transition, gated behind `prefers-reduced-motion`.
- **Easing** (`--ease-out`, `--ease-in-out`) — the curves for interactive UI feedback (presses, hovers, popovers) — snappier than reveals. Easing always comes from a token, never an inline `cubic-bezier()` outside the token files.
- **Beats** (`--t-quick`, `--t-menu`) — `--t-quick` is *the* hover/focus feedback duration, site-wide; `--t-menu` is the mobile-menu clip reveal, shared by the clip transition and its visibility hand-off so they cannot drift apart. Authored choreography (case-viewer boot, feature-band reveal) keeps its own beats — a timeline is a sequence of distinct decisions, not a reusable value.

---

## Accessibility — contrast ratios

This is the **canonical home** for the measured text-on-surface contrast ratios; [reasoning/accessibility.md](reasoning/accessibility.md) and [engineering.md](../engineering.md) point here. For focus indicators, target sizes, and the full accessibility floor, see [reasoning/accessibility.md](reasoning/accessibility.md).

Measured against the current ramp with the standard WCAG relative-luminance formula. Recompute — do not nudge by hand — after any change to a surface or text swatch; nothing automated checks these, so a stale row stays green.

| Combination | Ratio | Status |
|---|---|---|
| Ivory text on primary | 15.6:1 | ✓ AAA |
| Primary text on deepest | 15.2:1 | ✓ AAA |
| Primary text on primary (body reading) | 14.4:1 | ✓ AAA |
| Primary text on raised (cards) | 13.3:1 | ✓ AAA |
| Secondary text on primary (apparatus) | 12.3:1 | ✓ AAA |
| Cyan (instrument) on primary | 9.5:1 | ✓ AAA |
| Near-black on brand gold | 9.4:1 | ✓ AAA |
| Gold (prime) on primary | 8.9:1 | ✓ AAA |
| Gold interactive (links) on primary | 9.9:1 | ✓ AAA |
| Gold interactive on raised (cards) | 9.2:1 | ✓ AAA |
| Teal (apparatus) on primary | 7.8:1 | ✓ AAA |
| Teal on secondary | 7.6:1 | ✓ AAA |
| Near-black on gold-soft (selection) | 11.8:1 | ✓ AAA |
| Muted text on primary (chips) | 6.3:1 | ✓ AA |
| Muted text on raised (chips on cards) | 5.8:1 | ✓ AA |
| Red on primary (`--color-signal-red`, large/rules only) | 3.8:1 | ✓ AA large only |
| Red text on primary (`--color-signal-red-text`) | 5.3:1 | ✓ AA |
| Red text on the critical callout's own tint | 4.8:1 | ✓ AA |
| Disabled text on primary | 3.3:1 | ✓ AA large only |

Two of these bound real decisions. **Red comes in two weights**: the saturated `--color-signal-red` is large-text-only (it is why the trauma chip was retired rather than restyled — at 11px it failed on both page and card ground), and `--color-signal-red-text` is the lifted hue for anything at label or body size. **Disabled** is a coordinate/ornament tier, never body copy.
