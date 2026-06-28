# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.6.0] - 2026-06-28

### Added
- `@astrojs/sitemap` integration (`astro.config.mjs`) — build now emits `sitemap-index.xml`, the path `public/robots.txt` already advertised (previously a 404)
- Design-token enforcement gate so "colors/grid come from central tokens, never hard-coded" is enforced, not just documented:
  - `.stylelintrc.json` — `stylelint-declaration-strict-value` requires color properties (`/color$/`, `fill`, `stroke`, `background(-color)`, `*-border-color`, `outline-color`) and `grid-template-columns` to be a `var(…)`/`color-mix(…)` token; `src/styles/tokens/**` exempt (the one legitimate home for literals)
  - `scripts/check-inline-colors.mjs` — catches hex literals in `.tsx`/`.jsx`/`.astro` inline styles, which stylelint can't see (this is where the pre-existing `#ffffff` literals lived)
  - `npm run lint` (`lint:css` + `lint:markup`); wired as a CI step in `deploy.yml` — a violation now fails the Pages deploy
  - `.claude/hooks/check-tokens.sh` (PostToolUse, advisory exit 2) — lints just-edited style files so Claude self-corrects in-session
- `--color-primary` / `--color-on-primary` semantic tokens (`colors.css`) — brand accent (gold, → `--color-signal-yellow`) + its legible near-black foreground
- CLAUDE.md guidance: a "Single Source of Truth" rule (no hard-coded style values) and a context7 section (it's a user-scope plugin — don't re-add via `.mcp.json`)
- Motion reasoning doc `docs/design/reasoning/motion.md` (whether/when to animate, easing & duration, enter/exit, performance, reduced-motion) — adapted to Base UI + the CSS-first reveal system; plus `--ease-out`/`--ease-in-out` easing tokens in `motion.css`
- `.claude/rules/` path-scoped referrer rules that auto-surface the right guide while editing — `design-system.md` (CSS/components) and `content.md` (articles) — both pointers to the canonical docs, never restating them
- CLAUDE.md "Documentation" doctrine: the docs-map pointer plus the describe-and-point / one-fact-one-home method for writing and maintaining docs

### Changed
- **Reorganized `docs/` for single source of truth.** Top level is now `brand.md` · `engineering.md` · `writing.md` + a `design/` folder (`philosophy.md`, `tokens.md`, `components.md`, `reasoning/`), each behind a README map with `← parent` backlinks (no more per-doc breadcrumb bars). Merged DESIGN-METHODOLOGY + DESIGN-PRINCIPLES → `philosophy.md`; rewrote `tokens.md` as a map that points to `src/styles/tokens/*` instead of pasting now-stale value tables; component CSS marked illustrative (`src/styles/` is authoritative); `principles/` → `design/reasoning/`. Archived the obsolete PROJECT-INITIALIZATION; moved inspiration assets + prototypes out of `docs/` to top-level `design-assets/`
- Aligned the docs to current code (the reorg surfaced the drift): typefaces (→ Newsreader/DM Sans/Michroma/Chivo), CTA color (→ gold), warmth bias (→ minimal R+1/B-2), grid (→ 6/12/18), hosting (→ GitHub Pages). Repaired all repo-root README + CLAUDE.md doc links; fixed cp1252 mojibake across the moved docs
- Replaced 3 live `transition: all` in `homepage.css` (nav item, tag, article card) with explicit animatable properties
- Removed unused dependencies `radix-ui` (the app uses Base UI; it appeared only in doc examples) and `lucide-react` (the configured icon library is `tabler`); node_modules pruned, 14 → 12 direct deps
- `tsconfig.json`: removed the deprecated `baseUrl` (the TS 7 migration) — `paths` (`@/*`) now resolve relative to the config file; build unaffected
- Archived `DESIGN.md` (33KB consolidated monolith — superseded by `docs/design/` + the CSS tokens) → `docs/archive/`; removed a stray `.DS_Store`
- shadcn style set to **Mira** (`base-mira` in `components.json`); `button.tsx`/`input.tsx` regenerated on Base UI, and the style name aligned across CLAUDE.md/README/CONTEXT/`engineering.md` (docs had said Lyra, config said Nova)
- Deepened `--color-signal-yellow` (`#E8C547` → `#D8A82C`, a richer goldenrod) — flows to both the gold CTAs (via `--color-primary`) and the caution signal, since they share the token
- **Brand primary is now gold, not red.** Repointed every *brand* use of `--color-signal-red` → `--color-primary`: nav + mobile Subscribe CTAs, both newsletter buttons, pull-quote stripe. CTA text flipped white→`--color-on-primary` (white-on-gold fails contrast); nav-CTA hover now inverts to gold-on-near-black. Functional signal reds left intact (critical callouts, TRAUMA tag, form error text) — there red is semantic, not brand

## [0.5.0] - 2026-06-27

### Added
- Layout grid primitive (`src/components/layout/`): `<Container>` (page shell — width cap + centering + page margin; `width` prop maps to `--grid-max-width`/`--media-column`/`--reading-column`), `<Grid>` (responsive column track with constant `--grid-gutter` column gap + separate overridable `rowGap`), `<Col span>` (spans the active tier's columns; scalar or per-tier `{base,md,lg}`, mobile-first full-width default). Replaces hand-rolled `grid-template-columns` and re-declared container shells
- Design-system reasoning layer (`docs/principles/`): `README.md` (application order — tokens → principles → polish, tokens win on conflict), plus `layout-`, `spacing-`, `typography-principles.md` and `accessibility.md`, adapted from the typeui `fundamentals/` model and wired to Level One's own tokens/methodology. Linked from CLAUDE.md
- CLAUDE.md "Key Design Decisions" rule forbidding hand-rolled `grid-template-columns`/container shells; layout must go through the primitive
- Text-stroke faux-bold for single-weight Michroma (`--wordmark-stroke-*` tokens) — synthesizes heavier weights on a one-weight display face; mobile hero wordmark tuned for size/stroke/tracking/line-height and left-edge alignment

### Changed
- Grid tokens promoted to three first-class, breakpoint-aware roles: `--grid-margin` (page edge → content, 32→40→56), `--grid-gutter` (between columns, constant 16px; renamed from `--grid-gap`), `--grid-columns` (6→12→18 at mobile/≥600px/≥960px; was 4→12). The tiers nest: 1 mobile col = 2 tablet = 3 desktop
- Migrated the homepage hero/featured-section/header shells and the footer onto `<Container>`/`<Grid>`/`<Col>`; the four duplicated container shells and two hand-rolled grids removed. Featured grid is now an 11/7 desktop split (was 7fr/5fr); footer is 3/3/6 tablet → 5/5/8 desktop (was 1fr/1fr/1.5fr). Column gaps are now the systematic 16px gutter (featured grid was 48px, footer 32px); footer keeps its 48px stacked-mobile rhythm via `<Grid rowGap>`
- Retired the `--space-outer` token; all consumers (mobile-menu, FeatureBand) now reference `--grid-margin`
- Typography swapped to OFL faces — Newsreader (display, was Utopia Std), DM Sans (body, was Lab Grotesque), Michroma (UI/brand, was Eurostile), Chivo Mono (mono, was IBM Plex Mono); originals retained as CSS fallbacks. **Gotcha:** loaded from the Google Fonts CDN, not self-hosted like the rest — self-hosting still pending

## [0.4.1] - 2026-06-23

### Added
- Above-the-fold font preloads (`Layout.astro`): Eurostile ext regular/bold, Utopia regular, Lab Grotesque regular — eliminates the hero font-swap reflow flash on load

### Changed
- Converted the full self-hosted font library (47 faces) from `.otf`/`.ttf` to woff2 (~50% smaller); every `@font-face` repointed, originals moved out of the repo
- Homepage hero rebuilt mobile-first: dropped the kicker line and inline newsletter, enlarged the two-line wordmark (`--fz-wordmark-hero` → 2.5rem, 0.92 leading), replaced the tagline with a smaller serif statement (`--fz-hero-subtitle`)
- Hero wordmark animates in via a staggered baseline mask reveal (lines rise from clip windows); held static under `prefers-reduced-motion`
- Feature band reworked into a scroll-linked X-ray detector panel — blank at rest, peeks ~30svh on load, widens contained→full-bleed on scroll (`--fb-progress`), boots its HUD once scrolled past the peek, detector fades out (card stays) ~1.5s after returning to top
- Feature-band HUD is a fixed-size square panel (sized to the contained card width via `--fb-card-min-h`) that does not scale as the card widens; scanline recolored cyan → yellow
- Featured cards render uniformly (lead-card special formatting removed, gaps unified to `--gap-md`); "Featured" label set in Eurostile W1G extended, larger
- All pill text vertically centered (`line-height: 1` on tags + the Subscribe button) — uppercase Eurostile was sitting high in the boxes
- Removed semicolons from the three seed articles' body copy, per the site's no-semicolon copy rule

## [0.4.0] - 2026-06-23

### Added
- Extended article prose elements (`prose.css`): data tables, callouts (note / caution / critical), reference/data card, definition lists, run-in lead-ins, opt-in lead paragraph, and inline kbd + highlight. Apparatus reads sans, narrative stays serif (Anthropic voice split); authored in Markdown via raw HTML and demonstrated in the closed-loop article
- Full-bleed feature band (`FeatureBand.astro`): the homepage's one signature scroll moment — a contained card that expands edge-to-edge as it scrolls into view (and contracts on exit), mirroring Anthropic's full-bleed globe. Bespoke HUD "scanner/aperture" SVG visual (grid, CT-bore rings, cyan crosshair + scanline, registration brackets) using design tokens; inset serif statement + Subscribe CTA. Progressive enhancement — readable without JS, held contained under `prefers-reduced-motion`
- Scroll-reveal engine (`src/styles/base/motion.css` + global IntersectionObserver in `Layout.astro`): toggles a state class on entry/exit for `[data-reveal]` (fade/translate utility) and `[data-expand]` (the feature band), gated behind `prefers-reduced-motion`. Reserved for specific feature moments (Anthropic-style), not blanket-applied to body content
- Desktop wordmark → icon-mark collapse on scroll: past a 32px scroll threshold (`is-scrolled`, rAF-throttled) the wordmark's JS-measured width animates to 0, contracting horizontally into the compact icon mark
- Mobile hero brand wordmark (`hero__wordmark`): shows the "Level One Radiology" lockup on mobile, where the header carries only the icon mark; hidden ≥48em. New `--fz-wordmark-hero` token
- Article page template (`src/pages/articles/[slug].astro`) — full editorial reading view; all homepage cards now link through
- `prose.css` long-form reading system: type metrics mirror Anthropic's live article (body 17px, sans headings, 640px reading column, exact paragraph/heading vertical rhythm), expressed in Level One's fonts (Utopia serif body, Lab Grotesque sans titles/headings) and dark palette
- Self-hosted favicon (`public/favicon.svg`, the Level One mark) — also the mobile header logo
- Full-screen mobile nav overlay (icon + hamburger → ✕, Anthropic-style rows, bottom CTA)
- Semantic tokens: nested content widths (`--reading-column`/`--media-column`), radius scale (`--radius-xs/sm/md/lg`), card-padding, section-spacer, gap, reading line-height, inline-link metrics — values flip at shared breakpoints
- Live-motion GIFs (11) and mobile-viewport screenshots (6) across the Scrib3, Component Gallery, and Anthropic design references — embedded inline beside each description
- Motion & interaction documentation for the three design references — autonomous, scroll, hover, click, and load animations captured live (Anthropic §7 new; Scrib3 + Component Gallery Motion sections expanded)
- Responsive / horizontal-span documentation across the three design references — per-breakpoint behavior, fluid type, and what restructures at each width

### Changed
- Reduced peak text luminance to cut halation ("bloom") of bright text on the near-black ground: `--color-text-ivory` #FAF6EE → #EFEAE0, `--color-text-primary` #F4F0E9 → #E5E1DB. Contrast stays ~15:1 (well above AAA); warm bias preserved
- Article body leading tightened for a denser serif column: `--lh-reading` 1.45 → 1.38
- Article editorial pass: removed the `###` subheader level and all bold run-ins across the three articles, folding them into flowing prose. Leaves each article with `##` section headers + body only (plus callout/table/reference-card apparatus), cutting the font-size/weight variety that read as chaotic
- Removed em dashes from all site copy (article content, hero, feature band, page titles, aria-labels), replaced with colon / comma / semicolon per context
- Homepage featured articles now read as raised cards on a distinct ground: the section moved to `bg-primary` and cards to `bg-raised` (both were `bg-secondary`, so cards did not separate); hover lifts to `bg-active`
- Homepage card titles reduced: standard cards 24 → 20px (new `--fz-card-title` token), lead card 28/32 → 24px, so titles read as card labels rather than dominating the card
- Hero typography unified to three voices (was four): the "No spam" privacy line moved off IBM Plex Mono onto the body voice (Lab Grotesque), so all hero reading text shares one family. Hero now reads Utopia (headline) · Lab Grotesque (value-prop, email field, privacy) · Eurostile (kicker, Subscribe, mobile wordmark); mono is reserved for article metadata
- Eurostile import corrected: the extended-width branding face is now declared under its true family name **"Eurostile Next W1G"** (was the generic "Eurostile Extended"), sourced from the W1G Extended OTFs (UltraLight→Bold + italics); `--ff-ui-ext` points at it. Old `eurostile-ext-*.otf` duplicates removed
- Mobile nav overlay opens via a clip-path wipe (0.25s) instead of a plain fade; hamburger→✕ is a staggered two-step morph (slide-to-center, then rotate, 0.15s). Both gated behind `prefers-reduced-motion`
- Header: icon + hamburger on mobile (<768px), wordmark + inline nav on desktop (≥768px); bar height grows 48→56px
- Article type roles parallel Anthropic — sans title + sans deck + serif body
- Warm-white text ramp de-yellowed (`--color-text-ivory` `#F5E6C2` → `#FAF6EE`, etc.); consistent subtle warm bias. Dark surfaces unchanged — site stays dark-first
- Mobile page gutter 24 → 32px (Anthropic-style); homepage card titles → sans; radii / card padding / section spacing now token-driven
- Refreshed the three design-reference docs against live site CSS — corrected Scrib3 to its two-state 800px grid, refreshed token/grid systems, updated the Component Gallery example count, noted Anthropic's now-fluid marketing margin

### Fixed
- Homepage cards rendered with only 2px content padding: `.hud-frame { padding: 2px }` (the decorative corner-bracket utility) overrode `.article-card`'s padding by later source order at equal specificity, so the padding token never applied. Removed padding from `.hud-frame`; cards now use their own `--card-padding-md` (24/32) / `--card-padding-lg`
- Mobile menu broke when opened while scrolled: the `overflow:hidden` scroll-lock was killing the sticky header (and jumping scroll). Replaced with a full-viewport overlay, no lock
- Removed the `/favicon.ico` 404 (SVG favicon only)
- Broken relative image paths in `scrib3.DESIGN.md` (asset-folder prefix → bare filenames, since the doc lives inside its asset folder)

## [0.3.0] - 2026-02-06

### Added
- Homepage with 4 sections: sticky nav, hero with newsletter CTA, featured articles grid, footer
- Header component (48px sticky nav, ARTICLES / ABOUT / SUBSCRIBE)
- Footer component (3-column: navigate, connect, newsletter CTA with registration marks)
- Tag component (Eurostile uppercase, colored indicator dot, signal color variants)
- ArticleCard component (HUD framing, tag chips, hover states, lead variant)
- NewsletterSignup React island (inline + section variants, Buttondown integration)
- shadcn/ui Button and Input components (Base UI primitives, base-lyra style)
- Component CSS: site-header, article-card, tag, HUD frame, featured-grid, newsletter, footer
- 3 placeholder articles: splenic trauma, closed-loop obstruction, ACR AI guidelines
- Self-hosted fonts placed (Utopia Std, Lab Grotesque, Eurostile LT Std — 3.8MB)

## [0.2.0] - 2026-02-06

### Added
- Astro 5 project with React islands and Tailwind v4 (via @tailwindcss/vite)
- shadcn/ui configuration (Base UI primitives, Lyra style)
- CSS design token system: colors, typography, spacing from DESIGN-TOKENS.md
- Base layout (Layout.astro) with SEO meta tags and OG tags
- Minimal dark "coming soon" homepage verifying token pipeline
- Content collection schema for articles (Astro 5 Content Layer API)
- GitHub Pages deployment workflow (.github/workflows/deploy.yml)
- Font directory structure and @font-face declarations (fonts not yet placed)
- robots.txt and CNAME for custom domain

### Changed
- Documentation reorganized from project root into docs/ subdirectory

---

## [0.1.0] - 2026-02-06

### Added
- Initial project setup with context preservation scaffolding
- CLAUDE.md, CONTEXT.md, CHANGELOG.md, TODO.md
- Design system documentation suite (8 documents):
  - BRAND-FOUNDATION.md — Brand identity, positioning, content strategy
  - DESIGN-METHODOLOGY.md — Fictive Kin foundational principles
  - DESIGN-PRINCIPLES.md — Design philosophy, visual identity
  - DESIGN-TOKENS.md — Colors, typography, spacing specifications
  - COMPONENT-LIBRARY.md — Module specs, component CSS
  - TECHNICAL-ARCHITECTURE.md — Stack, performance, workflows
  - WRITING-STYLE.md — Smart Brevity structure, voice guidelines
  - PROJECT-INITIALIZATION.md — Quick-start setup guide
