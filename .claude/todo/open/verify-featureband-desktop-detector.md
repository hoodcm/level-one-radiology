---
id: verify-featureband-desktop-detector
title: Decide and verify FeatureBand detector desktop behavior
band: later
first_surfaced: 2026-06-23
last_touched: 2026-06-23
depends_on: []
links: [src/components/shared/FeatureBand.astro, src/styles/components/homepage.css]
worktype: decide
assessed: 2026-07-08
---
The homepage FeatureBand detector card was tuned entirely for mobile this
session — on-load ~30svh peek, scroll-linked widen (contained→full-bleed via
`--fb-progress`), progress-based boot, a fixed-size HUD that does NOT scale as
the card widens, and the detector fading away (card stays) at top after ~1.5s.
Desktop behavior was explicitly left undecided/unverified by the user. Decide
the intended desktop interaction and verify it renders correctly at desktop
widths. Pre-launch polish, not launch-blocking.

Done: a deliberate desktop behavior is decided and verified for the FeatureBand
detector at desktop widths.
