---
id: detector-hero-device-pass
title: Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10)
band: now
first_surfaced: 2026-07-11
last_touched: 2026-07-11
assessed: 2026-07-11
depends_on: []
links: [src/styles/tokens/detector-hero.css, src/lib/detector-hero.mjs, docs/archive/plans/2026-07-11-detector-hero-plan.md]
worktype: decide
---
The homepage hero's scintillator-grid drawing (replacing the old blueprint
grid) needs Michael's on-screen judgment on his iPhone and desktop: density,
slab seating, drift amplitude, and beam subtlety at both 120Hz and 60Hz. This
also signs off the mobile statement-in-card arrangement, which is
accessibility-sensitive (dual-h1 seat between the hero statement and the
page's own h1).

Any retune should only touch `src/styles/tokens/detector-hero.css` tokens or
the `SETTINGS` constants in `src/lib/detector-hero.mjs`, then re-run gates.

Done: composition confirmed acceptable (or retuned) on both device classes,
and the mobile dual-h1 arrangement is signed off.

## Notes
2026-07-11 captured — this is the detector-hero plan's explicit user gate;
Michael was actively iterating on it live during this session.
2026-07-11 (later same day) substantial mobile-composition progress, judged
live on-screen with Michael: raised mobile slab (mSlab 0.6), corePad fit
clamp (no more fan-bottom clipping), wordmark size now derived from the
slab's rendered height (one scale factor for text + drawing), and the
dotted-center-line load glitch fixed. Still open: the desktop composition
pass, the 120Hz/60Hz beam-subtlety judgment, and the mobile dual-h1
arrangement sign-off are not yet done — Done-criterion unmet.
