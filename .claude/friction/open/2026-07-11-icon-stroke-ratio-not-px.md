---
id: icon-stroke-ratio-not-px
status: open
tags: [pattern-only]
first_seen: 2026-07-11
last_seen: 2026-07-11
recurrence: 1
related: [prefer-font-supported-before-transform-hacks, bezier-cannot-express-undershoot-motion]
---

## Description

Sizing case-viewer icon stroke-width to match the h2 'H' stem in absolute px (0.92 at the 52px ACTIVATE glyph) rendered hairline; the user corrected to a constant 1.5. Line-art weight is the stroke-to-glyph RATIO, held constant across render sizes, not absolute px — type scales its own stems the same way.

## Notes

2026-07-11 — Now documented in the --cv-icon-stroke token comment. Sibling to bezier-cannot-express-undershoot-motion / prefer-font-supported-before-transform-hacks: reaching for a plausible-but-wrong first mechanism in CSS/design math.
