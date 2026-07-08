---
id: toc-scroll-spy-initial-state
title: Give the TOC scroll-spy an initial / deep-link active state
band: later
first_surfaced: 2026-07-08
last_touched: 2026-07-08
depends_on: []
links: [src/components/article/TableOfContents.astro]
worktype: build
---
Surfaced during the site-wide sweep: the desktop "On this page" rail's
scroll-spy has no active-section highlight on initial page load or on a
direct hash-anchor deep link — it only starts tracking after the first
scroll event. Land on an anchored section (or load fresh at the top) and no
rail item is marked current until the reader scrolls.

Done: loading the article (fresh or via a `#section` deep link) shows the
correct TOC item highlighted before any scroll occurs.
