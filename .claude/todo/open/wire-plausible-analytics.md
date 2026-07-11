---
id: wire-plausible-analytics
title: Set up Plausible analytics
band: next
first_surfaced: 2026-06-23
last_touched: 2026-06-23
depends_on: []
links: [src/layouts/Layout.astro]
worktype: build
assessed: 2026-07-11
---
Wire Plausible analytics — add the tracking script (gated on
`PUBLIC_PLAUSIBLE_DOMAIN`, already declared in CLAUDE.md env vars) to the base
layout. No `plausible` reference exists anywhere in `src/` yet. Privacy-
respecting analytics is the listed measurement tool; subscriber conversion is
the keystone metric. Stated priority #2.

Done: Plausible script loads on production pages for the configured domain.
