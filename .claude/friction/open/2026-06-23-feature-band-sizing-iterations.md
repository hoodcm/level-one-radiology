---
id: feature-band-sizing-iterations
status: open
tags: [pattern-only]
first_seen: 2026-06-23
last_seen: 2026-06-23
recurrence: 1
related: []
assessed: 2026-07-11
---

## Description
Dialing in the feature-band detector's on-load peek + sizing took several rounds because the geometry has non-obvious coupling: (1) the card peek is a fraction of the **viewport** but the IntersectionObserver threshold measures a fraction of the **card**, so a 30svh peek tripped a 0.5 card-threshold on tall screens (boot fired at load); (2) the hero's **content height** could bind instead of its `min-height`, pinning the card to a fixed pixel offset and killing the peek on short phones; (3) the HUD SVG is sized to the **contained** card width and held fixed, which is separate from how much of that box the `viewBox` fills. Each was diagnosed reactively, one round at a time.

## Notes
2026-06-23 — Resolved this session: boot is now progress-based (`p >= 0.35`) not threshold-based; hero padding zeroed so `min-height` binds; HUD width = `min(contained-width, --fb-card-min-h)` with a separate `viewBox` crop for fill. Logged so a future session changing the feature band knows these three knobs interact before re-deriving them. Low recurrence risk — likely auto-decays.
