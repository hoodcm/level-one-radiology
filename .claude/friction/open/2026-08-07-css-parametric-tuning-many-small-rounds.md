---
id: css-parametric-tuning-many-small-rounds
status: open
tags: [pattern-only]
first_seen: 2026-08-07
last_seen: 2026-08-07
recurrence: 2
related: []
assessed: 2026-08-07
---

## Description

Tuning the new wireframe-tunnel figure (ink opacity, ring inset, ring count, base-line weight) took ~8 sequential small-delta rounds with the user (faint→fainter→5%, inset margin→2/3 margin, etc.) each requiring a fresh screenshot+crop+measure cycle to verify.

## Notes

2026-08-07 — Not a defect — normal craft-iteration cadence per craft-iteration.md. Worth noting only because each round's headless-screenshot-and-crop setup (chrome launch, virtual-time-budget, PIL crop) was hand-rolled per iteration rather than as a reusable script; a small local helper (screenshot+crop-to-region by CSS selector) would have cut the per-round overhead.

2026-08-07 — recurred extending the same tunnel figure: 6 more small-delta rounds (opaque grid removal, extend-to-feature-band, meta-line removal, wordmark-anchor/scroll-glitch fix, polygon-opacity refinement, touch-glow follow-finger) before the user called it close
