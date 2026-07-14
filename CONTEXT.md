# CONTEXT.md

Stable background reference for this project. Read at session start, update rarely.

## What This Project Is

Level One Radiology is the website for leveloneradiology.com — an independent, solo-authored platform for emergency radiology content. It combines the timeliness of trade publications (Radiology Business) with the educational depth of academic journals (RadioGraphics), executed with design sophistication. The primary audience is practicing radiologists and trainees, with secondary reach to radiology-adjacent clinicians.

## Why It Matters

This is owned infrastructure for building a national reputation and thought leadership in emergency radiology. Unlike journal publications or social media, the platform is completely independent — content, design, and editorial decisions are self-determined. The keystone metric is email subscribers, representing a compounding owned audience. The site is designed to be the kind of thing you'd be proud to share with a respected colleague.

## Key Concepts

- **Fictive Kin methodology** — The foundational design philosophy (see `docs/design/philosophy.md`). Eight principles: Systems Not Sites, Facts Not Feelings, Modules Not Pages, Beginning Not Ending, Keystone Metrics, Minimum Viable System, Tight Not Cramped, Bespoke Warmth.
- **Collectors vs Attractors** — Two content types. Collectors are SEO workhorses (educational articles, case analyses). Attractors are timely commentary pieces (LinkedIn fuel, traffic spikes).
- **React islands** — Astro architecture pattern. Most pages are static HTML; React loads only for interactive components (the newsletter form). The case viewer is interactive but deliberately framework-free (see below), so it is not a React island.
- **Detector-plate framing** — Signature visual treatment on cards and callouts: quarter "field arcs" in the inner corners plus T-shaped fiducials at the edge midpoints, modeled on a DR detector plate's registration marks. Values in `src/styles/tokens/ornament.css`, rendering in `src/styles/components/ornament.css` (masked `::before`, one per surface; kill-switch is the import line).
- **Detector hero** — The homepage hero backdrop: the brand's scintillator-grid cross-section drawing, generated parametrically by `src/lib/detector-hero.mjs` (geometry + locked settings) and rendered two ways by `DetectorHero.astro` — build-time static SVGs (the no-JS/reduced-motion baseline) and a live client instance with the motion set (draw-in, drift, pointer re-focus, beam sweep, touch response — a finger steers the focal point and pulls/re-exposes the fan plates under it; vertical pans still scroll). Ink/motion knobs in `src/styles/tokens/detector-hero.css`. Two viewport predicates: composition (which drawing + stage height) and a stricter seat predicate (whether the statement h1 sits beside the wordmark in the slab or in the FeatureBand card — exactly one accessible h1 either way). The mobile composition fits its slab span to the content box, so the drawing lands on the page grid margins like every other element, and a width-derived hero-height floor keeps it margin-to-margin at every viewport (desktop stays full-bleed cover). On the mobile composition the FeatureBand card also carries the gold Subscribe route above the fold (the keystone-metric action). The client seats the copy on the slab in both axes (the corePad clamp can shrink the live slab inside a short, wide window; extreme squat falls back to a title-only slab via `.dh-squat`, statement in the card seat). Kill-switch `apparatus.detectorHero` restores the text-only hero wholesale.
- **Content structure** — Headline, lede, why it matters, go deeper — combined with a human teaching voice (see `docs/writing.md`).
- **Case Viewer** — The "showstopper module." PACS-like viewer for JPEG image stacks (deliberately not DICOM), embedded within articles via `::case[caption]{id="…"}`, mobile-first. Framework-free `<case-viewer>` custom element (`src/components/case/`), not shadcn. Requirements + architecture brief: `docs/archive/plans/2026-07-07-case-viewer-brief.md`.
- **Surface hierarchy** — Six-level background system from near-black (#0B0A08) to mid-gray (#333230), using warm bias formula (R=G+1, B=G-2).
- **Color semantics** — Gold (`--color-primary`) is the *action* color: links, focus, selection, CTAs, progress. Cyan is *informational apparatus* (key points, note callouts, statuses) plus taxonomy; the other signals are taxonomy/severity only. Semantic tokens (`--color-link` etc.) live in `src/styles/tokens/colors.css`.
- **Layout grid primitive** — Page layout goes through `<Container>`/`<Grid>`/`<Col>` (`src/components/layout/`), backed by first-class margin/gutter/column tokens with a responsive column count (mobile → tablet → desktop). Hand-rolling `grid-template-columns` or container shells is disallowed (CLAUDE.md rule). The *reasoning* layer — how to choose a token when a spec is silent — lives in `docs/design/reasoning/` and sits above the concrete values in `docs/design/tokens.md` (application order: tokens → principles → polish; tokens win on conflict).
- **Article apparatus** — Recurring in-article elements (section-break mark, arrival wash, mobile INDEX, More-articles footer block, footnote popovers, figure accession, readout chips), CSS + platform primitives only, each with a one-place kill switch: a CSS import line in `src/styles/main.css` for style-only elements, a boolean in `src/lib/apparatus.ts` for markup-emitting ones. Roster and disable instructions: `docs/design/components.md` → "Article apparatus". Serials (`L1-nnnn`) are internal metadata only — schema-required but not displayed.

## Architecture Overview

**Astro static site** with React islands for interactivity. Content authored in Markdown with YAML frontmatter, stored in the git repository. shadcn/ui provides accessible component primitives (Base UI under the hood, Mira visual style). Tailwind CSS for utility classes, CSS custom properties for design tokens. Built by a GitHub Actions workflow (`.github/workflows/deploy.yml`) on push, custom domain via `public/CNAME`; hosting is mid-migration to Cloudflare (first go-live — see the hosting-migration plan and TODO). Newsletter via Buttondown API; analytics not yet wired (Cloudflare Web Analytics chosen, replacing the never-installed Plausible).

**MVP scope:** 3-5 articles, working newsletter signup, functional case viewer in at least 1 article, homepage, about page, article index. No search, comments, user accounts, or light mode at launch.

## Related Work / Dependencies

- **Buttondown** — Email newsletter service (API for subscriber management)
- **Plausible** — Privacy-respecting analytics
- **GitHub Pages** — Hosting and deployment (GitHub Actions workflow; custom domain via `public/CNAME`)
- **shadcn/ui** — Component abstraction layer (Base UI primitives, Mira style)
- **Fonts** — Active faces are the self-hosted OFL trial set (Newsreader serif, DM Sans body, Michroma brand/UI, Chivo Mono; `public/fonts/ofl/`, regenerated by `scripts/fetch-ofl-fonts.mjs`). The commercial originals (Utopia Std, Lab Grotesque, Eurostile) remain self-hosted as CSS fallbacks pending the trial verdict + licensing confirmation. Above-the-fold faces preloaded in `Layout.astro`

---

*Last updated: 2026-07-14*
