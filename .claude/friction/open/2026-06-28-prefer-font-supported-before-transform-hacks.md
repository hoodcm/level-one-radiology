---
id: prefer-font-supported-before-transform-hacks
status: open
tags: [needs-design]
first_seen: 2026-06-28
last_seen: 2026-06-28
recurrence: 1
related: []
---

## Description
Asked to widen the Newsreader body serif, I reached straight for `transform: scaleX()` (a CSS transform *outside* the font) before exhausting what the typeface natively supports. The user corrected the order of operations: "Let's use font-supported actions before we go outside what the font itself supports." The font-supported lever here is the `opsz` (optical-size) axis — Newsreader exposes `ital`/`opsz`/`wght` (no `wdth`), confirmed by the Google Fonts request in `Layout.astro`.

## Notes
2026-06-28 — Order for type adjustments: (1) native variable axes / OpenType features the loaded font actually exposes (check the font's axis list — e.g. the Google Fonts URL in `Layout.astro`), (2) only then transforms/synthetic hacks, and flag the tradeoff. Candidate to encode as a typography principle in CLAUDE.md / docs/principles/typography-principles.md → `/hook-design` or a doc rule. True per-glyph *width* needs a font with a `wdth` axis; Newsreader has none.
