---
id: metric-compatible-font-fallbacks
title: Add size-adjust metric-compatible fallbacks for OFL fonts
band: someday
first_surfaced: 2026-07-07
last_touched: 2026-07-07
assessed: 2026-07-07
depends_on: []
links: [src/styles/tokens/fonts-ofl.generated.css, scripts/fetch-ofl-fonts.mjs]
worktype: build
---
Optional polish surfaced by the ethos survey: define `size-adjust`
metric-compatible fallback faces for the self-hosted OFL faces (Newsreader /
DM Sans / Michroma / Chivo Mono) to kill layout shift on first paint before
the webfont loads.

Done: each OFL face has a metric-compatible fallback declared, no measurable
layout shift on font swap.
