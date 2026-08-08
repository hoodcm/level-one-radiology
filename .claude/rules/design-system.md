---
paths:
  - "src/**/*.css"
  - "src/**/*.astro"
  - "src/**/*.tsx"
  - "src/**/*.jsx"
---

# Site changes follow the design system

Before changing styling, layout, components, or motion, consult the design system — it is the source of
truth. Don't reinvent it or work from memory. Open the relevant doc:

- Map (start here) → `docs/design/README.md`
- *Why* a choice is right → `docs/design/philosophy.md`
- *What* tokens exist and where → `docs/design/tokens.md`
- *How to choose* when a spec is silent — grid, spacing, type, motion, accessibility → `docs/design/reasoning/`
- Module specs → `docs/design/components.md`

**Values are tokens, never literals.** Every color, type size, line-height, letter-spacing,
font-weight, space, z-index, border width, and easing/duration comes from `src/styles/tokens/*.css`
and `src/styles/base/motion.css`. Never hard-code a value in a component — reference the ramp, or add
a token if the rung genuinely doesn't exist.

**Where the knob lives** (full map: `docs/design/tokens.md`): leading → the closed `--lh-*` rung ramp;
tracking → `--ls-*`; weight → `--fw-*`; type sizes → `--fz-*`; prose vertical rhythm (¶ gap, heading
gaps, list gap/indent) → `--prose-*` in tokens/spacing.css; spacing → `--space-*` + semantic tokens;
stacking → the `--z-*` ladder; hairlines → `--border-w*`; focus ring → `--focus-ring-*`; hover/menu
beats → `--t-*` in base/motion.css. **A tuning request ("tighten bullets", "more air before
headings") is a one-line token edit that propagates site-wide — never a per-component override.**

**Enforcement is layered and fail-closed** — do not weaken any layer: stylelint's strict-value gate
governs colors, grid, and the rhythm properties in `.css` AND `.astro` `<style>` blocks
(postcss-html); `scripts/check-inline-colors.mjs` owns markup hex + `--gray-*` swatch leakage; the
`check-tokens` PostToolUse hook runs both on every edited file; `src/styles/tokens.test.mjs` guards
the ramp contracts (closed rung sets, fluid clamp endpoints, print pins, dangling references) and
re-fires the stylelint gate with a planted probe each run.

User-facing copy in a component follows the voice in `docs/writing.md`.
