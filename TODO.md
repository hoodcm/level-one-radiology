# TODO

Actionable tasks and open questions. Check at session start, update frequently.

<!-- todo:worklist:start -->

## Now

- **Build About page**
  Build the About page (the nav already links ABOUT; no page exists yet). MVP-core (CONTEXT names "about page" in MVP scope) and stated priority #1 for next session. Done: an About route renders under `src/pages/`.
  ↳ links: src/pages/
- **Build article index page (/articles)**
  Build the `/articles` listing page at `src/pages/articles/index.astro` — the index that lists all articles (the homepage cards now link through to the article template, but there is no standalone listing route yet). MVP-core (CONTEXT names "article index" in MVP scope) and stated priority #1 for next session. Article template (`[slug].astro`) and ArticleCard component already exist to build on. Done: `src/pages/articles/index.astro` renders the article collection.
  ↳ links: src/pages/articles/

## Next

- **Configure GitHub Pages DNS**
  Configure DNS so leveloneradiology.com resolves to GitHub Pages (A/AAAA + CNAME records at the registrar; enable Pages custom domain + HTTPS). `public/CNAME` already holds `leveloneradiology.com` and the deploy workflow exists — the remaining work is the registrar-side DNS, an external/infra step. Stated priority #2. Related open question: whether the domain is registered yet (see is-domain-dns-configured). Done: leveloneradiology.com serves the deployed site over HTTPS.
- **Set up Plausible analytics**
  Wire Plausible analytics — add the tracking script (gated on `PUBLIC_PLAUSIBLE_DOMAIN`, already declared in CLAUDE.md env vars) to the base layout. No `plausible` reference exists anywhere in `src/` yet. Privacy- respecting analytics is the listed measurement tool; subscriber conversion is the keystone metric. Stated priority #2. Done: Plausible script loads on production pages for the configured domain.
  ↳ links: src/layouts/Layout.astro

## Later

- **Build Case Viewer showstopper module**
- **Write first educational article (deep-dive)**

## Someday

- **Reconsider display/body serif if text halation persists**
- **Consider thin Scrib3-style gutters for full-bleed image spans**

## Open questions

- **Confirm leveloneradiology.com registered + pointed at GitHub Pages**
  Open question: is leveloneradiology.com registered, and is it pointed at GitHub Pages? `public/CNAME` declares the domain but that does not confirm registrar ownership or live DNS records. (The actionable follow-up, once answered, is configure-github-pages-dns.)
- **Confirm font licensing acquired (Utopia/Lab Grotesque/Eurostile)**
  Open question: are Utopia Std, Lab Grotesque, and Eurostile LT Std properly licensed for web use? The font files are placed in `public/fonts/` and self- hosted, but licensing acquisition is unconfirmed — a web-embedding license is distinct from having the files on disk.

<!-- todo:worklist:end -->

<!-- todo:friction:start -->

## Friction worth addressing

_Refreshed 2026-06-23 by end-session janitor · project store_

No project-store items need action right now. The one open project item (`headless-uncapturable-animations`) is in a 90-day observation window, not yet actionable. (This session's two friction items routed to the global store.)

<!-- todo:friction:end -->

<!-- todo:continuation:start -->

## Continuation

_Last session: 2026-06-23_

**Accomplished:**
- Shipped a large Anthropic-derived design-polish pass across the homepage and article template — fonts, motion, typography, cards, prose (see CHANGELOG [Unreleased] ### Added / ### Changed)
- New: full-bleed `FeatureBand` component, scroll-reveal engine, mobile nav clip-path wipe + two-step hamburger morph, desktop wordmark→mark scroll-collapse
- Fixed the card-padding override bug (`.hud-frame` was stealing `.article-card` padding) — CHANGELOG ### Fixed
- Trimmed all three articles (removed `###` subheaders + bold run-ins) and removed em dashes from all site copy

**Start by reading:** TODO.md, CONTEXT.md, CHANGELOG.md

**Priorities:** see the worklist `## Now` / `## Next` bands above (About page + article index → Plausible + GitHub Pages DNS).

**Open questions:** see `## Open questions` above (font licensing; domain DNS).

**Time-sensitive:** none.

<!-- todo:continuation:end -->
