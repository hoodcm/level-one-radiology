---
id: self-host-trial-fonts-woff2
title: Self-host the trial-font woff2 if the trial is kept
band: later
first_surfaced: 2026-06-27
last_touched: 2026-06-27
depends_on: [decide-font-swap-trial]
links: [src/layouts/Layout.astro]
assessed: 2026-06-27
---
If the font-swap trial is adopted, the four trial faces currently load from the
Google Fonts CDN — unlike the rest of the project, which self-hosts. Download
and self-host the woff2 files, then drop the now-unused Eurostile / Utopia / Lab
Grotesque / IBM Plex Mono fallback declarations. Blocked on the trial decision
(decide-font-swap-trial); only relevant if the trial is kept.

Done: the four trial faces are self-hosted from `public/fonts/` and the unused
original fallback declarations are removed.
