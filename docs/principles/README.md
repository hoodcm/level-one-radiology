# Level One Radiology: Design Principles (Reasoning Layer)

*The reasoning layer that sits **above** concrete tokens — how to choose which token goes where.*

**Navigation:** [README](../../README.md) · [Design Methodology](../DESIGN-METHODOLOGY.md) · [Design Principles](../DESIGN-PRINCIPLES.md) · [Design Tokens](../DESIGN-TOKENS.md) · [Component Library](../COMPONENT-LIBRARY.md)

---

## What this directory is

These files are the **reasoning layer** of the design system, adapted from the
[typeui](https://github.com/bergside/typeui) `fundamentals/` model and rewritten against Level One's
own tokens and methodology. They explain *how* to choose and layer values — which spacing tier, how
many columns, where the gutter goes — when a brief or component spec is silent.

They do **not** restate values. Concrete numbers (the spacing scale, column counts, type sizes, color
hexes, contrast ratios) live in exactly one place: **[DESIGN-TOKENS.md](../DESIGN-TOKENS.md)**. These
docs reference that file; they never duplicate it.

| File | Reasoning about |
|---|---|
| [layout-principles.md](layout-principles.md) | Margin vs gutter vs column; the 6/12/18 grid; `<Container>`/`<Grid>`/`<Col>` usage |
| [spacing-principles.md](spacing-principles.md) | Proximity grouping, inner vs outer gaps, vertical/horizontal rhythm, the spacing tiers |
| [typography-principles.md](typography-principles.md) | Scale, measure, heading rhythm, the three families' roles |
| [accessibility.md](accessibility.md) | Contrast, focus, targets, motion, semantic structure (the non-negotiable floor) |

---

## Application order (mandatory)

```
1. Design-system tokens & component specs   →  ship these first (the source of concrete values)
2. These principles                          →  choose the tier / span / measure when the spec is silent
3. Polish                                    →  refine hierarchy and edge cases last
```

**Tokens first, principles second, polish third.** When a principle here and a token in
DESIGN-TOKENS.md disagree, **the token wins** — flag the conflict for review rather than overriding it
silently. Accessibility (the floor in [accessibility.md](accessibility.md)) is the one layer that
overrides aesthetic preference everywhere.

## Relationship to the foundational docs

- [DESIGN-METHODOLOGY.md](../DESIGN-METHODOLOGY.md) — the eight Fictive-Kin principles (the *why* of the
  whole system). These reasoning docs operationalize "Modules, Not Pages" and "Tight, Not Cramped."
- [DESIGN-PRINCIPLES.md](../DESIGN-PRINCIPLES.md) — aesthetic philosophy and decisions.
- [DESIGN-TOKENS.md](../DESIGN-TOKENS.md) — the single source of truth for every concrete value.
- [COMPONENT-LIBRARY.md](../COMPONENT-LIBRARY.md) — per-module specs.
