---
id: prefer-font-supported-before-transform-hacks
status: open
tags: [needs-design]
first_seen: 2026-06-28
last_seen: 2026-06-28
recurrence: 1
related: []
assessed: 2026-07-11
---

## Description
Asked to widen the Newsreader body serif, I reached straight for `transform: scaleX()` (a CSS transform *outside* the font) before exhausting what the typeface natively supports. The user corrected the order of operations: "Let's use font-supported actions before we go outside what the font itself supports." The font-supported lever here is the `opsz` (optical-size) axis — Newsreader exposes `ital`/`opsz`/`wght` (no `wdth`), confirmed by the Google Fonts request in `Layout.astro`.

## Notes
2026-06-28 — Order for type adjustments: (1) native variable axes / OpenType features the loaded font actually exposes (check the font's axis list — e.g. the Google Fonts URL in `Layout.astro`), (2) only then transforms/synthetic hacks, and flag the tradeoff. Candidate to encode as a typography principle in CLAUDE.md / docs/principles/typography-principles.md → `/hook-design` or a doc rule. True per-glyph *width* needs a font with a `wdth` axis; Newsreader has none.

2026-07-08 — Janitor: scan flagged this as a merge candidate against `bezier-cannot-express-undershoot-motion` (thin lexical score 0.037, `related-edge` from that item's `related:` link). Reviewed and declined to merge — different lessons: this item is "check the native capability before reaching for a synthetic workaround" (transform used when native font axis existed); the bezier item is "recognize when the simpler native primitive can't express the requirement and escalate" (bezier used when only keyframes could work) — structurally opposite orderings, not one root cause. Left the `related:` cross-link as sufficient connective tissue.

2026-07-11 — Janitor: scan flagged a second merge candidate against `icon-stroke-ratio-not-px` (score 0.028, `related-edge` from that item's own `related:` list). Declined for the same reason as above — same "wrong first mechanism" family, different concrete lesson (font axis vs. absolute-px-vs-ratio); the three items (this, `bezier-cannot-express-undershoot-motion`, `icon-stroke-ratio-not-px`) stay cross-linked siblings, not a merge.
