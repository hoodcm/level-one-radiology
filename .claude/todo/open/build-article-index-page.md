---
id: build-article-index-page
title: Build article index page (/articles)
band: now
first_surfaced: 2026-06-23
last_touched: 2026-06-23
depends_on: []
links: [src/pages/articles/]
assessed: 2026-06-26
---
Build the `/articles` listing page at `src/pages/articles/index.astro` — the
index that lists all articles (the homepage cards now link through to the
article template, but there is no standalone listing route yet). MVP-core
(CONTEXT names "article index" in MVP scope) and stated priority #1 for next
session. Article template (`[slug].astro`) and ArticleCard component already
exist to build on.

Done: `src/pages/articles/index.astro` renders the article collection.
