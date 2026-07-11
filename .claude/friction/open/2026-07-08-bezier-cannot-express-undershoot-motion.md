---
id: bezier-cannot-express-undershoot-motion
status: open
tags: [pattern-only]
first_seen: 2026-07-08
last_seen: 2026-07-08
recurrence: 1
related: [prefer-font-supported-before-transform-hacks]
assessed: 2026-07-11
---

## Description

Asked for a recoil/settle-back motion (travel to 100%, bounce back to ~70%, then settle to 100% — a video-game impact-with-recoil), I first reached for a cubic-bezier ease (--ease-out-back). A bezier ease can only overshoot PAST the target, never undershoot and return, so it read as a soft single-overshoot, not the requested recoil. Cost one iteration round before switching to @keyframes with per-beat animation-timing-function.

## Notes

2026-07-08 — Remediation: any non-monotonic motion (undershoot, multi-stop, hold-then-continue) needs @keyframes, not a bezier easing curve. Beziers are monotonic in position — reserve them for single-direction ease-in/out. The keyframe form also composes with a held state cleanly (final frame == the state's resting transform).

2026-07-11 — Janitor: scan flagged a merge candidate against `icon-stroke-ratio-not-px` (score 0.0, `related-edge` from that item's own `related:` list). Declined — distinct lesson (bezier monotonicity vs. absolute-px-vs-ratio sizing); stays a cross-linked sibling, not a merge.
