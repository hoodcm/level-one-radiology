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

- **Decide the font-swap trial**
  The working tree holds an uncommitted trial swapping the four font slots to OFL faces (Newsreader←Utopia, DM Sans←Lab Grotesque, Michroma←Eurostile, Chivo Mono←IBM Plex Mono), loaded from the Google Fonts CDN with the originals kept as fallbacks. Decide the direction: commit as the new typography, revert, or pursue a legitimately-licensed Eurostile equivalent (Square 721 / Zekton) or license real Eurostile Next for the brand/UI slot — the user felt none of the free faces matched Eurostile as well. Baseline restore point is commit 0c7448a (`git reset --hard 0c7448a` discards the trial). Done: the trial is committed, reverted, or superseded by a chosen licensed-font direction.
  ↳ links: src/layouts/Layout.astro, src/styles/tokens/typography.css
- **Configure GitHub Pages DNS**
  Configure DNS so leveloneradiology.com resolves to GitHub Pages (A/AAAA + CNAME records at the registrar; enable Pages custom domain + HTTPS). `public/CNAME` already holds `leveloneradiology.com` and the deploy workflow exists — the remaining work is the registrar-side DNS, an external/infra step. Stated priority #2. Related open question: whether the domain is registered yet (see is-domain-dns-configured). Done: leveloneradiology.com serves the deployed site over HTTPS.
- **Set up Plausible analytics**
  Wire Plausible analytics — add the tracking script (gated on `PUBLIC_PLAUSIBLE_DOMAIN`, already declared in CLAUDE.md env vars) to the base layout. No `plausible` reference exists anywhere in `src/` yet. Privacy- respecting analytics is the listed measurement tool; subscriber conversion is the keystone metric. Stated priority #2. Done: Plausible script loads on production pages for the configured domain.
  ↳ links: src/layouts/Layout.astro

## Later

- **Build Case Viewer showstopper module**
- **Decide and verify FeatureBand detector desktop behavior**
- **Write first educational article (deep-dive)**
- **Enforce the grid primitive with a hook**
- **Self-host the trial-font woff2 if the trial is kept** — blocked on Decide the font-swap trial

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
_Refreshed 2026-06-27 by end-session janitor · project store_

**Quick fixes (0)** — apply directly:
_None this run._

**Needs design (0)**:
_None this run._

<!-- todo:friction:end -->

<!-- todo:continuation:start -->

## Continuation

_Last session: 2026-06-27_

**Accomplished:**
- Ran an uncommitted font-swap trial — Newsreader←Utopia, DM Sans←Lab Grotesque, Michroma←Eurostile, Chivo Mono←IBM Plex Mono (token-level, originals kept as fallbacks, loaded from Google Fonts).
- Built a text-stroke faux-bold for single-weight Michroma (`--wordmark-stroke-*` tokens); tuned the mobile hero "LEVEL ONE / RADIOLOGY" lockup (size, stroke, tracking, line-height, left-edge alignment).
- Created baseline restore commit `0c7448a` before the trial (`git reset --hard 0c7448a` discards the whole experiment).
- Explored and rejected Saira (semi-expanded/expanded) and Orbitron for the Eurostile slot.

**Start by reading:** TODO.md, CONTEXT.md, CHANGELOG.md

**Priorities:** see the worklist `## Now` / `## Next` bands — the font-trial decision is queued there.

**Time-sensitive:** none.

<!-- todo:continuation:end -->
