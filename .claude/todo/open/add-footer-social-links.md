---
id: add-footer-social-links
title: Restore footer LinkedIn/X links with real profile URLs
band: next
first_surfaced: 2026-07-07
last_touched: 2026-07-07
assessed: 2026-07-11
depends_on: []
links: [src/components/layout/Footer.astro]
worktype: build
---
LinkedIn/X placeholder links were removed from the footer this session (the
bare-domain hrefs were dead links). Restore once Michael supplies real profile
URLs — a one-line change in `src/components/layout/Footer.astro`; a comment in
the file marks the spot ("Connect" column). Blocked on Michael supplying the
URLs.

Done: real LinkedIn/X links render in the footer Connect column.
