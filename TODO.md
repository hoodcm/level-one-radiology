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
- **Resolve the body-serif widening (opsz vs wider OFL serif)**
  The body reading serif (Newsreader) is being widened for a sturdier text column. An `opsz` experiment is live via `--reading-opsz` (typography.css; consumed by prose.css `font-variation-settings: "opsz"`) and awaits the user's on-screen judgment. Newsreader has no `wdth` axis, so widening is only available through optical size. Next step is either lower the opsz further or evaluate a wider / more-geometric OFL body serif. Stated priority Now/Next. Done: a deliberate body-serif width direction is chosen — a settled `--reading-opsz` value or a swapped wider OFL body serif.
  ↳ links: src/styles/tokens/typography.css, src/styles/components/prose.css

## Next

- **Configure GitHub Pages DNS**
  Configure DNS so leveloneradiology.com resolves to GitHub Pages (A/AAAA + CNAME records at the registrar; enable Pages custom domain + HTTPS). `public/CNAME` already holds `leveloneradiology.com` and the deploy workflow exists — the remaining work is the registrar-side DNS, an external/infra step. Stated priority #2. Related open question: whether the domain is registered yet (see is-domain-dns-configured). Done: leveloneradiology.com serves the deployed site over HTTPS.
- **Set up Plausible analytics**
  Wire Plausible analytics — add the tracking script (gated on `PUBLIC_PLAUSIBLE_DOMAIN`, already declared in CLAUDE.md env vars) to the base layout. No `plausible` reference exists anywhere in `src/` yet. Privacy- respecting analytics is the listed measurement tool; subscriber conversion is the keystone metric. Stated priority #2. Done: Plausible script loads on production pages for the configured domain.
  ↳ links: src/layouts/Layout.astro
- **Self-host the OFL font faces (currently CDN-loaded)**
  The OFL swap shipped in release 0.5.0 (Newsreader / DM Sans / Michroma / Chivo Mono), but the four faces load from the Google Fonts CDN — unlike the rest of the project, which self-hosts from `public/fonts/`. Download and self-host the woff2 files and repoint Layout.astro (the CDN `<link>` to fonts.googleapis.com). The Utopia / Lab Grotesque / Eurostile / IBM Plex Mono originals are deliberately retained as CSS fallbacks — leave them. Done: the four OFL faces are self-hosted from `public/fonts/` and Layout.astro no longer references the Google Fonts CDN.
  ↳ links: src/layouts/Layout.astro
- **Confirm the deepened gold shade on screen**
  The brand primary moved from red to gold and `--color-signal-yellow` deepened to #D8A82C (a richer goldenrod) this session, flowing to both the gold CTAs (via `--color-primary`) and the caution signal (shared token). Confirm the new shade reads correctly on screen — CTAs, nav/mobile Subscribe, newsletter buttons, pull-quote stripe, and the caution role — before relying on it. Done: the deepened gold is confirmed acceptable on screen (or re-tuned).
  ↳ links: src/styles/tokens/colors.css

## Later

- **Build Case Viewer showstopper module**
- **Decide and verify FeatureBand detector desktop behavior**
- **Write first educational article (deep-dive)**
- **Enforce the grid primitive with a hook**

## Someday

- **Reconsider display/body serif if text halation persists**
- **Consider thin Scrib3-style gutters for full-bleed image spans**
- **Remove the stale local context7 entry in ~/.claude.json**
- **Repair ~/.npm cache permissions (EACCES)**
- **Split primary-CTA gold from caution into distinct tokens if they conflict**

## Open questions

- **Confirm leveloneradiology.com registered + pointed at GitHub Pages**
  Open question: is leveloneradiology.com registered, and is it pointed at GitHub Pages? `public/CNAME` declares the domain but that does not confirm registrar ownership or live DNS records. (The actionable follow-up, once answered, is configure-github-pages-dns.)
- **Confirm font licensing acquired (Utopia/Lab Grotesque/Eurostile)**
  Open question: are Utopia Std, Lab Grotesque, and Eurostile LT Std properly licensed for web use? The font files are placed in `public/fonts/` and self- hosted, but licensing acquisition is unconfirmed — a web-embedding license is distinct from having the files on disk.

<!-- todo:worklist:end -->

<!-- todo:friction:start -->

## Friction worth addressing
_Refreshed 2026-06-28 by end-session janitor · project store_

**Quick fixes (0)** — apply directly:
**Needs design (1)**:
- prefer-font-supported-before-transform-hacks — order-of-operations for type adjustments (native variable axes / OpenType features first, then synthetic transforms with the tradeoff flagged) → /hook-design .claude/friction/open/2026-06-28-prefer-font-supported-before-transform-hacks.md

<!-- todo:friction:end -->

<!-- todo:continuation:start -->

## Continuation

_Last session: 2026-06-28_

**Accomplished:**
- Reorganized docs/ for single-source-of-truth — grouped under `design/`, docs point to the CSS tokens (see CHANGELOG ### Changed)
- Added `.claude/rules/` pointer rules + the CLAUDE.md "Documentation" doctrine (see ### Added)
- Fixed `tsconfig.json` baseUrl (TS-7 migration); pruned unused deps `radix-ui` + `lucide-react`
- Root cleanup: archived `DESIGN.md` + `PROJECT-INITIALIZATION`; moved references/prototypes to top-level `design-assets/`
- Set shadcn style to Mira + regenerated button/input; fixed the npm cache (installs + context7 now work)

**Start by reading:** CLAUDE.md, CONTEXT.md, docs/README.md, TODO.md, CHANGELOG.md

**Priorities:** see the `## Now` / `## Next` bands above.

**Heads-up:**
- Reload the VS Code window once to bring context7's MCP server online (the npm-cache fix needs a fresh session to re-launch it).
- The repo is uncommitted; `/push` (minor bump) is next.

<!-- todo:continuation:end -->
