# Level One Radiology

## Overview

Website for leveloneradiology.com — an independent emergency radiology publication combining the timeliness of Radiology Business with the educational rigor of RadioGraphics. Dark-first, content-driven platform with a singular authorial voice.

## Single Source of Truth (non-negotiable)

Every value that defines how the site looks or behaves is **defined once and referenced everywhere** — never hard-coded inline. Colors, spacing, type sizes and line-heights, grid columns/margins/gutters, radii, font families, breakpoints: each lives in exactly one place — design values in `src/styles/tokens/**` — and every consumer references the token. A literal in a component is a defect even when it renders correctly, because it is the thing that drifts out of sync.

- Need a value that doesn't exist yet? **Add a token, then reference it** — never inline a literal "just this once."
- Literals belong in exactly one place: the token definitions in `src/styles/tokens/**`.
- Enforced by `npm run lint` (stylelint + inline-color check, CI-gated) and the PostToolUse token hook. The automated gate hard-blocks colors and `grid-template-columns`; the principle governs **all** style values, including those a linter can't mechanically catch.

This is the project's expression of the global documentation-hygiene single-source-of-truth rule, applied to code tokens.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Framework | Astro + React islands |
| Styling | Tailwind CSS + CSS custom properties |
| Components | shadcn/ui (Base UI primitives, Mira style) |
| Icons | Lucide (`lucide-react`; inlined as SVG in framework-free components — see `src/lib/case-icons.mjs`) |
| Content | Markdown + YAML frontmatter (git-managed) |
| Hosting | GitHub Pages |
| Newsletter | Buttondown |
| Analytics | Plausible |
| Search | Pagefind (deferred — add at 15+ articles) |

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (localhost:4321) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | `astro check` — TypeScript/type diagnostics across `.astro`/`.ts`/`.tsx` (mirrors the IDE's Problems panel) |
| `npm run lint` | Enforce design tokens (no hard-coded colors/grid) — `lint:css` (stylelint) + `lint:markup` (inline-color check). Runs in CI; a violation fails the deploy |
| `npx shadcn add [name]` | Add shadcn/ui component |

**Keep the dev server running for the whole session.** Michael watches changes live at
localhost:4321 — start `npm run dev` as a background task early in any session that touches the
site, and never kill it when you finish a verification step. If it must restart (cache clear,
config change), bring it back up immediately and confirm it responds before moving on.

## Documentation Lookups (context7)

When you need current API/usage docs for a library — **Astro 5, Tailwind v4, shadcn/Base UI, or React 19** — use the **context7 MCP server**, not web search or training memory. These libraries move fast and the design tokens, content-collection schema, and `@theme` setup depend on *current* APIs; stale web results have caused wrong turns here before.

- context7 is installed as a **user-scope plugin** (`context7@claude-plugins-official`) — available in every session, no per-project setup. Do **not** add it to a project `.mcp.json`; that just duplicates the plugin.
- Flow: resolve the library id first (`resolve-library-id`), then fetch docs for the specific topic (`get-library-docs`). Prefer this over `WebSearch`/`WebFetch` for framework questions.

## Architecture

```
src/
  content.config.ts       # Content schema (Zod, Astro 5 Content Layer API; enums derive from lib/tags.ts)
  content/
    articles/             # Markdown files with frontmatter (style-gallery.md = draft-only specimen)
  components/
    layout/               # Header, Footer, Container, Grid, Col (.astro)
    article/              # TableOfContents.astro
    case/                 # <case-viewer> element + frame-store/fullscreen/mapping (.ts); see docs/archive/plans/ brief
    shared/               # Tag, ArticleCard, FeatureBand (.astro), NewsletterSignup (.tsx)
    ui/                   # shadcn/ui auto-generated components
  lib/
    utils.ts              # cn helper etc.
    tags.ts               # Single source: tag/contentType taxonomy → signal variants
    articles.ts           # getArticles(): draft-filtered, date-sorted accessor
    apparatus.ts          # Article-apparatus kill-switch flags (markup-emitting elements + case-viewer behavior experiments)
    markdown-plugins.mjs  # remarkCallouts, remarkCaseViewer, rehypeTableScroll, remarkReadingTime, rehypeFootnotePopovers
    case-shell.mjs        # build-time <case-viewer> shell emitter + ::case validation (shared w/ loader + case:build)
    case-loader.ts        # case-aware content loader (rev-invalidates stale ::case embeds)
  pages/
    articles/
      [slug].astro        # Article template
      index.astro         # Article listing
    index.astro           # Homepage
    about.astro           # About
    404.astro             # Not-found page
    rss.xml.js            # RSS feed (@astrojs/rss)
  layouts/
    Layout.astro          # Base layout
  styles/
    tokens/               # colors, typography, spacing, print, fonts-ofl.generated (.css)
    base/                 # global.css, motion.css, print.css
    components/           # Per-component CSS (homepage, prose, pages) + apparatus/ (one file per article-apparatus element)
    main.css              # Import manifest

public/
  CNAME                   # Custom domain for GitHub Pages
  robots.txt              # Search engine directives
  images/                 # og-default.jpg; article images by slug as they arrive
  fonts/                  # Self-hosted woff2 — ofl/ = active faces (fetch-ofl-fonts.mjs); rest = fallbacks
```

**Pattern:** Static Astro pages by default. React islands (`client:visible`/`client:load`) only for interactive components (newsletter form, case viewer, search). Markdown renders through the remark/rehype pipeline in `astro.config.mjs`.

## Documentation

All project docs are mapped in **[docs/README.md](docs/README.md)** — start there. The design system has
its own map at **[docs/design/README.md](docs/design/README.md)** (philosophy · tokens · components ·
reasoning). The single-source-of-truth discipline above governs the docs themselves: **values live in the
CSS tokens; docs describe and point to them, never restate them. One fact, one home — when you find
overlap, pick the canonical doc and replace the copy with a link.**

**Writing & maintaining docs — keep it this way.** This operationalizes the global documentation-hygiene
rule (one fact, one home; describe-and-point, never restate a value; current-state-only; one concept per
doc). In this repo that means:

- **A map at every level** — each directory has a README that indexes it in a one-line-per-doc table, and
  every doc opens with a single `← parent` backlink, never a heavy breadcrumb bar.
- **Group by concern** — related docs share a folder (`design/`); supersede a whole doc into `archive/`
  with a date suffix rather than deleting it or narrating its history inline.
- **Tight, plain, clean UTF-8** — tables for indexes, short declarative sentences, no filler, no dated
  per-fact footers. Elegance is the absence of duplication.
- **Even the rules point, never copy** — a `.claude/rules/` file references the canonical doc; it never
  restates the doc's content, because a copy is just a second thing to drift.

**Consult the docs as you work — don't go from memory.** Path-scoped rules in `.claude/rules/` auto-surface
the right guide when you touch the relevant files, and they *point* to the docs rather than copy them:

- Editing site styles / components (`.css` / `.astro` / `.tsx`) → `design-system.md` → the design system.
- Writing article content (`src/content/**`) → `content.md` → `writing.md` + `brand.md`.

Open the cited doc before making the change.

## Key Design Decisions

The load-bearing design facts — palette and the warmth formula, the type families, density, the 6/12/18
grid, signal-color meanings, the gold primary CTA, the keystone metric — live in the design system
([docs/design/README.md](docs/design/README.md) → philosophy + tokens) and the CSS tokens in
`src/styles/tokens/`. They are **not** restated here, because a copy drifts; open those docs when the work
touches them.

One enforceable rule earns an always-on spot:

- **Layout goes through the grid primitive** — page shells use `<Container>`, multi-column layouts use
  `<Grid>`/`<Col>`. Never hand-roll `grid-template-columns` or re-declare a `max-width + margin + padding`
  container shell. The rule and its reasoning live in
  [docs/design/reasoning/layout.md](docs/design/reasoning/layout.md) (the `grid-template-columns` ban is
  lint-enforced).

## Technical Gotchas

- **Tailwind v4**: Use `@tailwindcss/vite` plugin, NOT `@astrojs/tailwind`. No `tailwind.config.mjs`. Use `@theme` directives in CSS.
- **shadcn/ui schema**: The schema combines style+library into one field. Use `"style": "base-mira"` in components.json (NOT `"style": "mira"` + `"library": "base-ui"` as separate fields). Base UI styles are `base-<name>` (vega/nova/maia/lyra/mira/luma/sera/rhea).
- **node_modules corruption**: If `ERR_MODULE_NOT_FOUND` on astro CLI, `rm -rf node_modules package-lock.json && npm install`.
- **Astro 5 content collections**: Use `src/content.config.ts` (not `src/content/config.ts`), `glob` loader, `z` from `astro/zod`.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `BUTTONDOWN_API_KEY` | Newsletter API |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Analytics domain (leveloneradiology.com) |

## Project Files

| File | Purpose | Update frequency |
|------|---------|------------------|
| `CLAUDE.md` | Project instructions | As needed |
| `CONTEXT.md` | Stable background reference | Rarely |
| `CHANGELOG.md` | Change history | After substantive changes |
| `TODO.md` | Actionable tasks | Frequently |

## Session Workflow

**Start of session:** check `TODO.md` (current tasks + open questions), read `CONTEXT.md` (background),
scan recent `CHANGELOG.md` entries.

**As you work and at session end, update the file that owns the change:**

| If you… | Update… |
|---------|---------|
| Complete a task | `TODO.md` — check it off |
| Add a new task or question | `TODO.md` — add it |
| Make substantive changes | `CHANGELOG.md` — log under `[Unreleased]` |
| Learn something that changes understanding | `CONTEXT.md` — update the reference |
