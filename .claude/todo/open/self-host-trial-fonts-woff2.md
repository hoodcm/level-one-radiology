---
id: self-host-trial-fonts-woff2
title: Self-host the OFL font faces (currently CDN-loaded)
band: next
first_surfaced: 2026-06-27
last_touched: 2026-06-28
depends_on: []
links: [src/layouts/Layout.astro]
assessed: 2026-06-28
---
The OFL swap shipped in release 0.5.0 (Newsreader / DM Sans / Michroma / Chivo
Mono), but the four faces load from the Google Fonts CDN — unlike the rest of
the project, which self-hosts from `public/fonts/`. Download and self-host the
woff2 files and repoint Layout.astro (the CDN `<link>` to fonts.googleapis.com).
The Utopia / Lab Grotesque / Eurostile / IBM Plex Mono originals are deliberately
retained as CSS fallbacks — leave them.

Done: the four OFL faces are self-hosted from `public/fonts/` and Layout.astro no
longer references the Google Fonts CDN.

## Notes
2026-06-28 unblocked: trial decision resolved (decide-font-swap-trial committed
in 0.5.0); was conditional/blocked, now live work. Re-banded later→next.
CHANGELOG 0.5.0 flags self-hosting as a known-pending gotcha.
