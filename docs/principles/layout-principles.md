# Layout Principles

> The reasoning layer for **columns, gutters, and margins** — how to lay out a page so a desktop layout
> is specified as systematically as a mobile one. Concrete values live in
> [DESIGN-TOKENS.md](../DESIGN-TOKENS.md); when a principle here conflicts with a token, **the token wins** — flag it.

---

## 0. The three layout roles

A layout is built from exactly three spatial roles. Keep them distinct — conflating them is what produced
the hand-rolled duplication this system replaced.

| Role | Token | What it is |
|---|---|---|
| **Margin** | `--grid-margin` | Page edge → content. Grows with viewport (mobile → tablet → desktop). |
| **Gutter** | `--grid-gutter` | The space *between* columns. **Constant** (16px) at every breakpoint. |
| **Column** | `--grid-columns` | The track count: **6 / 12 / 18** at mobile / ≥600px / ≥960px. |

These nest cleanly: **1 mobile column = 2 tablet columns = 3 desktop columns** (each is ~16.7% of content
width). A block that is "one sixth" on mobile stays one sixth at every tier — you design the proportion
once.

The page **width cap** is a fourth, independent value (`--grid-max-width`, plus the narrower
`--media-column` and `--reading-column` for figures and prose). See §3.

---

## 1. Always lay out through the primitive

Use the layout components — never hand-roll grid geometry.

| Need | Use |
|---|---|
| A page shell (cap width, center, apply page margin) | `<Container>` |
| A multi-column layout | `<Grid>` |
| A child spanning N columns | `<Col span={…}>` |

**Never** write `grid-template-columns` in component CSS, and **never** re-declare a
`max-width + margin:auto + padding` shell by hand. That duplication is exactly what `<Container>` and
`<Grid>` exist to remove. A new margin/gutter/column need is a **token**, never a literal.

```astro
<Container>
  <Grid>
    <Col span={{ lg: 11 }}>main</Col>
    <Col span={{ lg: 7 }}>aside</Col>
  </Grid>
</Container>
```

---

## 2. Spans: design desktop as explicitly as mobile

A `<Col span>` is read against the **active tier's** column count. Pass a scalar for all tiers, or a
per-tier object `{ base, md, lg }` (mobile / ≥600px / ≥960px). An omitted tier inherits the next-smaller
one; an omitted `base` means **full width** — so a bare `<Col>` stacks. That is the mobile-first default:
content stacks on small screens and *opts into* columns as space appears.

- **Mobile-first.** Start from the stacked base, then add `md`/`lg` spans where the layout earns columns.
- **Spans sum to the tier.** On desktop, the children of one `<Grid>` should sum to 18 (e.g. 11 + 7, or
  5 + 5 + 8). On tablet, to 12 (3 + 3 + 6). Unequal sums are legal but usually a mistake.
- **Proportion translates across tiers.** A 12/18 desktop column (~67%) reads the same as an 8/12 tablet
  column — pick the spans that hold the proportion you want, tier by tier.

---

## 3. Width caps: prose, media, and the page shell are capped independently

Long-form text wants a short measure; figures want to breathe wider; the page shell is wider still.
`<Container width>` selects the cap:

| `width` | Token | Use for |
|---|---|---|
| `page` (default) | `--grid-max-width` (1440px) | Full page shell, multi-column sections |
| `media` | `--media-column` (880px) | Figures, media, code blocks |
| `reading` | `--reading-column` (640px) | Long-form prose measure |

Never invent a new width cap inline — these three cover every case (per
[typography-principles.md](typography-principles.md) §measure).

---

## 4. Vertical rhythm is a separate axis from the gutter

The gutter (`--grid-gutter`) is **horizontal** — between columns. When `<Col>`s stack or wrap, the gap
between rows is a **different** decision: use `<Grid rowGap>` with a vertical spacing token when stacked
content needs more breathing room than the 16px gutter (a footer collapsing to one column on mobile is
the canonical case). Section-to-section rhythm uses `--section-spacer` / `--section-spacer-sm`, not the
gutter. See [spacing-principles.md](spacing-principles.md) §sections.

---

## 5. Quick audit checklist

Before shipping a layout:

1. **Primitive** — is every column layout a `<Grid>`/`<Col>`, every shell a `<Container>`? No raw
   `grid-template-columns`, no re-declared `max-width + margin + padding`?
2. **Roles** — are margin, gutter, and column the right tokens (not literals)?
3. **Spans** — do the children sum to the tier (18 desktop / 12 tablet)? Is the base case a sensible stack?
4. **Width cap** — is prose on `reading`, media on `media`, the shell on `page`?
5. **Vertical rhythm** — is stacked-row spacing a `rowGap`/section token, not the 16px gutter by accident?
