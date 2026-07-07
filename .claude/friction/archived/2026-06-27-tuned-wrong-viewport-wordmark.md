---
id: tuned-wrong-viewport-wordmark
status: resolved
tags: [pattern-only]
first_seen: 2026-06-27
last_seen: 2026-06-27
recurrence: 1
related: []
assessed: 2026-07-07
---

## Description
During the font-swap trial I spent ~6 rounds tuning the **desktop** header wordmark (`.site-logo__wordmark`, shown ≥48em) — bold stroke, "make it 10x," etc. — while the user was watching the **mobile hero lockup** (`.hero__wordmark`, shown <48em). The user reported "visually that didn't change anything" repeatedly; the disconnect only surfaced when they said "I was on the mobile viewport the whole time. I thought you were changing the hero text." Two compounding causes: (1) I rendered/screenshotted desktop (1280px) by default instead of the mobile viewport, despite mobile-first being the user's standing default; (2) the user's own browser tab had a stale HMR state, so even correct changes weren't visible to them. Both elements (`LEVEL ONE` / `RADIOLOGY`) exist twice — once per viewport — so styling one leaves the other untouched.

## Notes
2026-06-27 — Remedy is behavioral, not mechanical: when iterating on observable output, screenshot the viewport the user is actually viewing (mobile-first here) *before* tuning, and confirm which element carries the text when a name like "the wordmark" is ambiguous between a mobile and a desktop instance. Reinforces the existing `mobile-first-default` memory. No clean hook surface — tagged pattern-only.

2026-07-07 — Janitor: shipped in [Unreleased] — CHANGELOG "Fixed: Mobile hero wordmark clipped/wrapped ≤390px" records `--fz-wordmark-hero` now a fluid clamp derived from the measured width ratio, verified 0 overflow at 344/360/390. The single-viewport-tuning failure mode this item describes is structurally addressed (formula-derived sizing + multi-width verification replaces ad hoc single-viewport tuning).
