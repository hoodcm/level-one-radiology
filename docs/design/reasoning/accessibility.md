# Accessibility

> [← Design system](../README.md)

> The **non-negotiable floor**. Unlike the other reasoning docs, accessibility overrides aesthetic
> preference everywhere — if a design choice and an accessibility requirement conflict, accessibility
> wins (it does **not** yield to a token). Concrete contrast ratios and target sizes live in
> [tokens.md](../tokens.md) §Accessibility and the methodology's Module Standards
> ([philosophy.md](../philosophy.md)).

Target: **WCAG 2.1 AA** across every module (the methodology's Module Standard).

---

## 1. Contrast

- **Body text ≥ 4.5:1** against its surface; large text (≥24px, or ≥19px bold) ≥ 3:1.
- The text-on-surface combinations and their measured ratios are tabulated in
  [tokens.md](../tokens.md) §Accessibility — pick text/surface pairs from there rather than
  eyeballing a new combination. `--color-text-muted` and below are **not** safe for body copy on every
  surface; check the table.
- Don't place signal colors as text on arbitrary surfaces without checking contrast.

## 2. Color is never the only signal

The palette spends hue on three things only: the **brand gold** (links, focus, selection, CTAs, and
caution), **red** (clinical critical), and one hue family split by job — **cyan** for the case viewer's
instrument readouts, **teal** for editorial apparatus. Because these encode information, that
information must **also** be available without color — text, icon, underline, or position. A link is not
"the gold one"; it is a link that is also gold, and underlined. Never rely on hue alone to distinguish
state.

Reducing the palette *removed* an obligation rather than adding one: tags no longer carry their category
in a hue at all, so a neutral chip satisfies this rule outright — its meaning is the word inside it.

Red is the case that needs care, so it exists in two weights. The saturated `--color-signal-red` is
**large-text-only** at 3.8:1 — use it for a rule, a border, a tint, or large type — and that limit is
exactly why the trauma chip was retired instead of restyled. Anything at label or body size takes
`--color-signal-red-text`, the same hue lifted to clear 4.5:1 on every ground it can land on. If you are
about to set red on small text, you want the second one.

## 3. Focus visibility

Every interactive element shows a visible focus indicator, drawn in the brand gold (`--color-focus` →
`--color-primary`). Never remove focus outlines without an equivalent visible replacement; focus order
follows reading order. The one deliberate exception is inside the case viewer, where controls sitting
over imaging use a cyan ring (`--cv-ring`) so the cue reads against slice pixels rather than against
chrome.

## 4. Targets and spacing

- Minimum touch target **44 × 44px**.
- Keep ≥ `--space-1` between adjacent interactive targets so they're separately tappable (see
  [spacing.md](spacing.md) §6).

## 5. Motion

The reduced-motion **floor** lives here; the broader reasoning on *when and how* to animate is
[motion.md](motion.md).

- Honor `prefers-reduced-motion`: scroll-linked and decorative animation (the FeatureBand widen, nav
  morphs, reveals) must have a reduced/none path.
- No essential information conveyed *only* through motion.

## 6. Semantic structure

- One `<h1>` per page; heading levels nest without skipping (`h1` → `h2` → `h3`).
- Use semantic elements (`<nav>`, `<main>`, `<footer>`, `<button>` for actions, `<a>` for navigation).
- Images carry `alt` text; decorative SVGs are `aria-hidden`.
- Interactive controls are keyboard-operable and reachable in a sensible tab order.

---

## Quick audit checklist

1. **Contrast** — body text ≥ 4.5:1, pair chosen from the tokens table?
2. **Color** — is every color-coded state also signaled by text/icon/shape?
3. **Focus** — visible indicator on every interactive element, in reading order?
4. **Targets** — 44×44px, adequately separated?
5. **Motion** — reduced-motion path for every animation?
6. **Semantics** — one h1, nested headings, semantic elements, alt text?
