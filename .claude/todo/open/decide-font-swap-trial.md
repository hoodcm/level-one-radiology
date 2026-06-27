---
id: decide-font-swap-trial
title: Decide the font-swap trial
band: next
first_surfaced: 2026-06-27
last_touched: 2026-06-27
depends_on: []
links: [src/layouts/Layout.astro, src/styles/tokens/typography.css]
assessed: 2026-06-27
---
The working tree holds an uncommitted trial swapping the four font slots to OFL
faces (Newsreader←Utopia, DM Sans←Lab Grotesque, Michroma←Eurostile, Chivo
Mono←IBM Plex Mono), loaded from the Google Fonts CDN with the originals kept as
fallbacks. Decide the direction: commit as the new typography, revert, or pursue
a legitimately-licensed Eurostile equivalent (Square 721 / Zekton) or license
real Eurostile Next for the brand/UI slot — the user felt none of the free faces
matched Eurostile as well. Baseline restore point is commit 0c7448a
(`git reset --hard 0c7448a` discards the trial).

Done: the trial is committed, reverted, or superseded by a chosen licensed-font
direction.
