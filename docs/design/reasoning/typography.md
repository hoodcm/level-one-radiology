# Typography Principles

> [← Design system](../README.md)

> The reasoning layer for **type** — how to choose family, size, measure, and rhythm. Concrete sizes,
> line-heights, and family stacks live in [tokens.md](../tokens.md) §Typography; when a
> principle here conflicts with a token, **the token wins** — flag it.

---

## 1. The families have fixed roles

Level One runs four typefaces, each with a non-interchangeable job. Choosing a family is choosing a
*role*, not a look. The authoritative stack — active face plus its fallbacks — lives in
[typography.css](../../../src/styles/tokens/typography.css); these are the active faces and their roles:

| Family | Token | Role |
|---|---|---|
| **Newsreader** (serif) | `--ff-display` | Display and headlines — the publication's editorial voice |
| **DM Sans** (humanist sans) | `--ff-body` | Body and reading text — approachable, long-form |
| **Michroma** (geometric sans) | `--ff-ui` | UI labels, tags, brand chrome — the "instrument" register |
| **Chivo Mono** (monospace) | `--ff-mono` | Code and technical / monospaced text |

The prior self-hosted faces (Utopia Std, Lab Grotesque, Eurostile LT Std, IBM Plex Mono) are retained only
as CSS fallbacks behind each token — they are not the active faces.

Reserve the UI family for true UI chrome (labels, tags, timestamps) and the mono family for code. Do
**not** let either bleed into reading text — the hero privacy line rides the body family for exactly this
reason. One register per purpose.

---

## 2. Scale and hierarchy

Sizes come from the `--fz-*` scale (display → headline → body → UI). Use the **typography classes**
(`.type-display-l`, `.type-display`, `.type-headline`, `.type-body`, `.type-ui`, `.type-meta`) rather
than re-specifying font/size/line-height per element — they bundle the family, size, line-height,
letter-spacing, and color that belong together.

- Establish hierarchy with **distinct steps**, not many near-equal sizes. Display, headline, body, UI is
  enough levels for a content site.
- Body anchors at `--fz-body` (16px). "Tight, Not Cramped" governs size: restrained, not shrunken —
  don't drop body text to win density.

---

## 3. Line-height matches role

| Role | Line-height | Why |
|---|---|---|
| Body copy | ~1.5 (`--lh-body`) | Comfortable extended reading |
| Headlines | ~1.2 (`--lh-headline`) | Large type needs tighter leading |
| Display | ~1.1 (`--lh-display*`) | Tighter still; display is seen, not read line-by-line |

Never apply body line-height to large display type — it looks loose and unanchored.

---

## 4. Measure (line length)

Long-form prose is capped at the **reading measure** (`--reading-column`, 640px) via
`<Container width="reading">` — roughly 60–75 characters per line, the readable band. Figures, media, and
code use the wider `--media-column` (880px). The page shell is wider than both. This is the layout
system's width-cap rule (see [layout.md](layout.md) §3) seen from the type side:
**text gets the narrow measure even when its container could be wider.**

---

## 5. Heading rhythm

A heading binds to the content **below** it. Set the heading's bottom margin from the `--space-*` scale
(not default browser margins), keep it **looser than paragraph→paragraph** but **tighter than
section→section**, and own the gap on the heading — never fake it with top-margin on the paragraph. Full
rhythm rules in [spacing.md](spacing.md) §3.

---

## 6. Quick audit checklist

1. **Family role** — display serif for headlines, body sans for reading, UI sans only for chrome, mono only for code?
2. **Classes** — using the `.type-*` classes, not ad-hoc font/size declarations?
3. **Line-height** — tight for display, comfortable for body? No body leading on large type?
4. **Measure** — prose on the reading cap, not the full page width?
5. **Heading rhythm** — heading owns its bottom margin; bound to the copy below it?
