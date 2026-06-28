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

**Values are tokens, never literals.** Every color, type size, space, and easing/duration comes from
`src/styles/tokens/*.css` and `src/styles/base/motion.css`. Never hard-code a hex/px/font/easing in a
component — add a token. (Lint and the `check-tokens` hook enforce this.)

User-facing copy in a component follows the voice in `docs/writing.md`.
