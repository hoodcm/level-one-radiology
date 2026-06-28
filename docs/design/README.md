# Design System

> [← Docs](../README.md)

The design system in four layers. **Concrete values are not in these docs** — they live in the CSS token
files (`src/styles/tokens/*.css`, `src/styles/base/motion.css`), the single source of truth. These docs
describe the system and point to it.

| Layer | Doc | What it is |
|---|---|---|
| **Philosophy** | [philosophy.md](philosophy.md) | The *why* — operating + aesthetic principles, color/type/spacing rationale, the module system, review cadence |
| **Tokens** | [tokens.md](tokens.md) | The map of token families → the CSS files that define them; plus the measured contrast-ratio table |
| **Components** | [components.md](components.md) | Module catalog + specs (authoritative CSS lives in `src/styles/`) |
| **Reasoning** | [reasoning/](reasoning/) | *How to choose* a value when a spec is silent |

## Reasoning layer

How to pick the right token when philosophy and tokens leave a gap.

| Doc | Reasoning about |
|---|---|
| [reasoning/layout.md](reasoning/layout.md) | Margin vs gutter vs column; the 6/12/18 grid; `<Container>`/`<Grid>`/`<Col>` usage |
| [reasoning/spacing.md](reasoning/spacing.md) | Proximity grouping, inner vs outer gaps, vertical rhythm, the spacing tiers |
| [reasoning/typography.md](reasoning/typography.md) | Scale, measure, heading rhythm, the type families' roles |
| [reasoning/motion.md](reasoning/motion.md) | Whether/when to animate, easing & duration, enter/exit, performance |
| [reasoning/accessibility.md](reasoning/accessibility.md) | Contrast, focus, targets, reduced motion, semantics (the non-negotiable floor) |

## Application order

1. **Tokens & component specs** — the concrete values (ship these first).
2. **These principles** — choose the tier / span / measure when a spec is silent.
3. **Polish** — refine hierarchy and edge cases last.

**Tokens first, principles second, polish third.** When a principle and a token disagree, **the token
wins** — flag the conflict rather than overriding it silently. Accessibility (the floor in
[reasoning/accessibility.md](reasoning/accessibility.md)) overrides aesthetic preference everywhere.
