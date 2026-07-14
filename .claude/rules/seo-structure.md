---
paths:
  - "src/**/*.astro"
  - "src/**/*.tsx"
  - "src/pages/**"
  - "src/layouts/**"
  - "astro.config.mjs"
  - "public/robots.txt"
---

# SEO / GEO structural requirements

Build-time rules distilled from Google's Search Central documentation (source:
`voice/lenses/google-search-central-seo/` — the lens governs *writing* for
search; this rule governs what templates, components, and config must emit).
Google's contract: everything below buys **eligibility, never outcomes** — no
markup or tag guarantees display. GEO/AEO note: AI Overviews and AI Mode run on
the same index and ranking systems; there is no llms.txt, chunking, or special
AI schema — the correct AI-search move is always the classic move below plus
content depth.

## Crawl and render legibility

- Google's crawler is passive and mobile-first: no taps, swipes, or typing.
  Everything that matters must exist in the **rendered HTML** — never gated
  behind a user gesture (accordion/tab content in the DOM is fine; content
  fetched on click is invisible).
- Every internal navigation is a real `<a href>` — never an `onclick` handler
  standing in for a link. Every page has at least one crawlable internal link
  pointing at it (no orphans); sitemap entries do not substitute for internal
  links.
- Lazy-loading triggers on viewport visibility, never on user gesture.
- Content images are real `<img>`/`<picture>` elements — Google does not index
  CSS background images. Alt text is descriptive, non-stuffed, and the image
  sits near its explanatory prose. Feature/Discover images: at least 1200px
  wide.
- Astro's static output already satisfies the SSR-over-client-rendering
  preference — keep content out of client-only islands. React islands are for
  interactivity, not for content Google must read.

## URLs, canonicals, status codes

- URLs are readable hyphenated words (never underscores, never opaque IDs),
  grouped in topical directories.
- One canonical URL per content unit; all signals (internal links, sitemap,
  rel=canonical, redirects) point the same way.
- Redirects: 301 for permanent moves, 302 only for genuinely temporary ones.
- Status codes tell the truth: removals return real 404/410. Never a "soft
  404" — an error page returning HTTP 200 (the SPA hazard; verify custom 404
  handling actually returns 404).
- Control tools are goal-specific and not interchangeable: robots.txt blocks
  *crawling*, `noindex` blocks *indexing*, auth blocks *access*. A
  robots.txt-blocked page can still appear in results (its noindex is never
  seen) — never use robots.txt to deindex.

## `<head>` discipline

- One invalid element in `<head>` silently truncates everything after it —
  Google discards every later tag. Keep `<head>` valid HTML; test after
  template changes.
- Every page: a unique, descriptive, non-generic `<title>` (site name once,
  set off by a simple delimiter) whose text matches the page's visually
  dominant first heading, plus a unique per-page meta description (the snippet
  fallback). Weak or duplicated titles get overridden by Google's generated
  text.

## Structured data (JSON-LD)

- Markup is a **truthful mirror of visible content**: never hidden content,
  never a subset (all visible reviews/items, not the flattering ones), never a
  borrowed richer type. Most specific applicable type; fewer complete
  properties over many incomplete ones.
- Schemas in scope for this site: `Article` (education pieces), `Organization`
  + `WebSite` with site name (home page), `BreadcrumbList`, `ProfilePage`
  (physician authors), `VideoObject` (teaching videos, on dedicated watch
  pages with stable non-expiring media URLs), `Course`/`Event` (if CME or
  conference content lands), `Speakable` (answer-engine surface).
- Byline dates: visible date and structured-data date match, and date only the
  page's own publish/update event — never bump a date without substantive
  change (a named search-engine-first red flag).
- Lifecycle: validate with the Rich Results Test at build, spot-check with URL
  Inspection after deploy, watch Search Console rich-result reports for silent
  template-change regressions.

## Discovery and page experience

- Sitemap generated with accurate `<lastmod>` (`@astrojs/sitemap`); recrawl
  requests are rate-limited hints that guarantee nothing.
- Core Web Vitals are the only page-experience inputs that directly feed
  ranking: LCP < 2.5 s, INP < 200 ms, CLS < 0.1. No intrusive interstitials —
  they block readers and Google alike (the newsletter prompt must not cover
  content on load).
- Mobile and desktop serve identical content, robots directives, and
  structured data (mobile is the master copy).

## Links out and measurement

- Descriptive standalone anchor text (never "click here"); credible sources
  cited openly; `rel="nofollow"`/`rel="sponsored"` on any paid or exchanged
  link, and nofollow reserved for links we don't vouch for — never blanket
  applied.
- Phrase outcomes as eligibility ("eligible for the Article rich result"),
  never as promised display. Search Console is the source of truth for search
  performance (16-month lookback; impressions and clicks, not rank positions);
  Plausible owns post-click behavior.
