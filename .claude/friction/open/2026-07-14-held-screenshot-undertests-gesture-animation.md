---
id: held-screenshot-undertests-gesture-animation
status: open
tags: [pattern-only]
first_seen: 2026-07-14
last_seen: 2026-07-14
recurrence: 1
related: []
---

## Description

A single held-pointer screenshot of the detector-hero vane touch-pull passed visual review, but the same lines were re-reported as visibly breaking — a static frame samples one point in the gesture's configuration space and misses artifacts that only appear across a continuous drag.

## Notes

2026-07-14 — Remediation that finally worked: a headless drag SWEEP over several hold positions with numeric artifact detection (per-frame gap + proper-segment-crossing test over all rendered vane segments), asserting zero. Also cost: an interim 'all endpoints flush' claim was voided by a regex parser bug ([\d.eE+]+ matched the 'e' in 'translate'), so verify the probe's own parser before trusting a green result.
