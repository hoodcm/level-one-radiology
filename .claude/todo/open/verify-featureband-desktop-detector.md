---
id: verify-featureband-desktop-detector
title: Decide and verify FeatureBand desktop behavior (now an empty card there)
band: later
first_surfaced: 2026-06-23
last_touched: 2026-07-11
depends_on: []
links: [src/components/shared/FeatureBand.astro, src/styles/components/homepage.css]
worktype: decide
assessed: 2026-07-14
---
The homepage FeatureBand is a plain card tuned for mobile — on-load ~30svh
peek, scroll-linked widen (contained→full-bleed via `--fb-progress`), and on
the mobile composition it carries the hero statement as the page h1. On the
DESKTOP composition the copy seat is hidden and (since the HUD's removal) the
band renders as an EMPTY contained card. Decide the intended desktop content/
behavior and verify it at desktop widths. Pre-launch polish, not
launch-blocking.

Done: a deliberate desktop behavior is decided and verified for the FeatureBand
at desktop widths.

## Notes
2026-07-11 (later session): Michael had the HUD detector graphic AND its boot
choreography removed entirely — the card is now text-only (mobile) / empty
(desktop), which makes the desktop decision more visible. FeatureBand's
long-term editorial content remains explicitly user-parked per the archived
detector-hero plan's Non-goals.
