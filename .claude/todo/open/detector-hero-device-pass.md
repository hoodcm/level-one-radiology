---
id: detector-hero-device-pass
title: Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10)
band: now
first_surfaced: 2026-07-11
last_touched: 2026-08-07
assessed: 2026-08-08
depends_on: []
links: [src/styles/tokens/detector-hero.css, src/lib/detector-hero.mjs, src/components/shared/DetectorHero.astro, src/lib/wireframe-tunnel.mjs, src/components/shared/WireframeTunnel.astro, src/styles/components/homepage.css, docs/archive/plans/2026-07-11-detector-hero-plan.md]
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
the mobile dual-h1 arrangement is signed off, the touch interaction (steering
+ beam re-exposure) feels right on a real finger, and the mobile drawing's
grid-margin alignment holds on device.

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
2026-07-14 scope enlarged: this session added a coarse-pointer touch
interaction (finger steers the focal point + pulls the fan plates out with a
beam-style re-exposure; new `--dh-touch-*` tokens, `SETTINGS.touchRadius`/
`touchPull`) and aligned the mobile drawing to the page's grid margins
(`fitSpan`/`insetX`, `mVanes` 10→9) — both headless-verified only (astro
check, token lint, vitest 47/47). Neither has been felt on a real finger yet;
folded into this item's on-device gate rather than spun into a sibling
(same "his eyes/hands are the gate" shape, same composition).
2026-07-14 (hero-enrichment round, same day, judged live on screen with
Michael mid-build): further surfaces folded into this gate — gold exposure
ink (`--dh-ink-exposure`: beam + touch re-ink in gold), the touch pull's
depth-edge stretch (vaneDepth `dy` — rear anchors
pinned; replaces the rigid translate that broke the illusion), the pull
excursion reserved in the drawn core (no more bottom clipping), the
width-derived hero floor (`--dh-core-fit`/`--dh-hero-h`: drawing spans the
margins at every viewport), and the recomposed mobile first screen
(statement + gold Subscribe in a shortened FeatureBand card, FEATURED
cresting the fold). All headless-verified; on-device feel still pending.
2026-08-07 the blueprint-grid prototype (`--dh-grid-*`) was retired — judged
live with Michael and replaced by the field-mounted wireframe tunnel
(frameless, wordmark-anchored, extending to the feature band; drawing made
opaque via the `.dh-occ` occlusion layer). That backdrop's own on-device
judgment rides this same gate; the grid sub-item is moot.
2026-08-07 (later same day, ~6 live-iteration rounds) tunnel now mounts on
the whole hero FIELD (hero + feature band), converging on the wordmark
center, with a pixel-anchored fixed-height overdraw so the feature card's
scroll expansion can't stretch/redraw it (a glitch caught and fixed
mid-session). The `.dh-occ` occlusion layer was refined once more — user
feedback "close, but not perfect" — to also fill the fan's full band (per-
plate faces alone left the backdrop showing through the comb gaps), and the
touch re-exposure glow now covers the stack layer too, boosted
(`--dh-touch-boost` 2.2→3). All headless-verified only (astro check 0
errors, token lint clean, vitest 48/48); still rides this same on-device
gate, not a separate item.
