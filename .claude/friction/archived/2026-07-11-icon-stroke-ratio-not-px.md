---
id: icon-stroke-ratio-not-px
status: resolved
tags: [pattern-only]
first_seen: 2026-07-11
last_seen: 2026-07-11
recurrence: 1
related: [prefer-font-supported-before-transform-hacks, bezier-cannot-express-undershoot-motion]
assessed: 2026-08-07
---

## Description

Sizing case-viewer icon stroke-width to match the h2 'H' stem in absolute px (0.92 at the 52px ACTIVATE glyph) rendered hairline; the user corrected to a constant 1.5. Line-art weight is the stroke-to-glyph RATIO, held constant across render sizes, not absolute px — type scales its own stems the same way.

## Notes

2026-07-11 — Now documented in the --cv-icon-stroke token comment. Sibling to bezier-cannot-express-undershoot-motion / prefer-font-supported-before-transform-hacks: reaching for a plausible-but-wrong first mechanism in CSS/design math.

2026-07-11 — Janitor: scan flagged this as a merge candidate against both siblings (thin lexical scores, driven by the `related:` list above). Declined both — three distinct lessons in the same "wrong first mechanism" family, not one root cause; the existing `related:` cross-links stay as the connective tissue.

2026-08-07 — closed on inference — the item's own 2026-07-11 note already confirms the fix (ratio, not px) landed in the `--cv-icon-stroke` token comment in the same session the friction was captured; verified the comment is still present at `src/styles/tokens/case-viewer.css` (`--cv-icon-stroke: 1.5` with the ratio-not-px rationale). No recurrence since.
