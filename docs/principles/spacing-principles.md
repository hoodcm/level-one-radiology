# Spacing Principles

> The reasoning layer for **whitespace, proximity, and rhythm** — how to choose gaps and padding when the
> spec is silent. Concrete values live in [DESIGN-TOKENS.md](../DESIGN-TOKENS.md); when a principle here
> conflicts with a token, **the token wins** — flag it. Pairs with the methodology principle
> *"Tight, Not Cramped"* ([DESIGN-METHODOLOGY.md](../DESIGN-METHODOLOGY.md) §7).

---

## 1. The spacing scale

Every gap, padding, and margin comes from the `--space-*` scale (`--space-0` 4px through `--space-8`
96px) — a 4-point-compatible system. **Never invent an off-scale value** (`13px`, `22px`); pick the
nearest token. This is the project's standing rule: never hard-code a value where a token exists; if a
genuinely new measure is needed, add a token, don't inline a literal.

Use **at least three distinct tiers** in any layout (tight / default / loose). If every gap is equal,
hierarchy collapses and the eye can't find the structure. "Tight, Not Cramped" means *restraint*, not
*uniformity* — the gaps still differ; they're just small.

| Tier | Typical token | Role |
|---|---|---|
| Micro | `--space-0` / `--space-1` | Icon ↔ label, badge internals |
| Tight | `--space-1` / `--space-2` | Within a group (label → field, list-item internals) |
| Default | `--space-2` / `--space-3` | Related siblings (stacked fields, card internals) |
| Loose | `--space-4` / `--space-5` | Between subgroups / section header → content |
| Section | `--section-spacer*` | Page rhythm between major blocks |

---

## 2. Proximity creates grouping

Spacing is the **primary** grouping tool — stronger than borders for most content. Tight spacing says
"these belong together"; loose spacing says "new group." Prefer proximity over a divider when proximity
already communicates the grouping (avoids decoration — see "Tight, Not Cramped").

**Inner < outer (non-negotiable).** Padding around a group must be larger than the gaps within it:

```
group outer padding (edge → first child)  >  inner gap (child ↔ child)
```

If inner and outer are equal, the group doesn't read as a unit. Applies vertically and horizontally —
cards, toolbars, nav clusters, icon rows.

**Start generous, then tighten.** When spacing feels wrong, begin with *more* whitespace than you think
you need and remove until the grouping still reads — don't increment up from the minimum, which produces
cramped layouts.

---

## 3. Vertical spacing

- **Heading → its paragraph** binds tighter than the block above it: the heading owns its bottom margin
  (use a `--space-*` token; `--space-4`/32px is the workhorse), and that gap stays **looser than
  paragraph→paragraph** but **tighter than section→section**.
- **Paragraph → paragraph** ≈ one body line (`--space-2`).
- **Content block → content block** — default/medium (`--space-3`/`--space-4`).
- **Section → section** — `--section-spacer` (large) / `--section-spacer-sm`. Keep section vertical
  padding **symmetric** (top = bottom); never compress one edge "to save space."
- **Forms** — bind a label to its field with *tight* spacing and separate field groups with *loose*
  spacing, so each label visibly owns its input. Equal gaps everywhere is the most common spacing failure.

---

## 4. Horizontal spacing

- **Icon ↔ label** inside a control: tight (`--space-1`, ~8px).
- **Related controls in a row**: default (`--space-2`).
- **Icon-only controls in one cluster**: micro (`--space-0`), with a default gap to the next
  text-labeled control — so the cluster reads as one unit (same inner < outer rule as §2).
- **Unrelated regions** (brand ↔ nav ↔ utilities): medium–loose.

Column gutters are **not** a §4 concern — they're the constant `--grid-gutter`, owned by `<Grid>` (see
[layout-principles.md](layout-principles.md) §0).

---

## 5. Margin vs padding

- **Padding** sizes a component's internal comfort (text/icon breathing room inside a button, card, input).
  Never fake internal spacing with margin on a bordered surface.
- **Margin / parent `gap`** separates siblings. Prefer `gap` on a flex/grid parent over chaining margins
  on children (avoids collapsing-margin surprises).

---

## 6. Responsive spacing

- Section padding may **scale down** on mobile — but keep top/bottom **equal** at each breakpoint.
- **Don't** proportionally shrink every gap on mobile — preserve the tier **ratios** (tight stays tighter
  than loose). The page **margin** (`--grid-margin`) shrinks; internal component tiers do not.
- Keep ≥ `--space-1` between adjacent touch targets (see [accessibility.md](accessibility.md)).

---

## 7. Quick audit checklist

1. **Scale** — every value a `--space-*` token (or a justified new token), nothing off-scale?
2. **Tiers** — can you name the tight / default / loose gaps, and are they visibly different?
3. **Grouping** — does every label sit closer to its field than to the next field? Inner < outer?
4. **Sections** — heading→paragraph tighter than section→section? Section padding symmetric?
5. **Margin vs padding** — internal comfort is padding; sibling separation is `gap`/margin?
