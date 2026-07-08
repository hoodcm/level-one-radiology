# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.9.0] - 2026-07-08

### Added
- **Case viewer tap-to-boot gate** (`apparatus.caseTapToBoot`, default on) — the viewer now holds inert and semi-greyed behind a centered `ACTIVATE` button until the reader taps it: no frame decode, no network, no boot HUD until then. The tap clears the dim veil and hands off to the existing inline `.is-booting` choreography (HUD reticle → first frame → `.is-ready`), then the `TAP TO SCRUB` chip takes over for engage. ACTIVATE is the **only live control while armed** — stage click/engage, pointer scrub, two-finger promote, slider (snaps back), PageUp/Down, window chips, series tabs, and ⛶ are all gated on the same `#pendingBoot` latch; the boot IntersectionObserver isn't wired and the warm/flush tier no-ops, so flipping the flag off restores auto-boot-on-scroll wholesale. While armed, the whole console mutes with the stage — meta strip, slider bar, chips, and tabs fade to `--cv-armed-chrome-opacity` with `pointer-events: none` (caption stays crisp) and fade back on activation. Button sized as the primary gate (72px square holding the Lucide square-power glyph — `--cv-activate-h`/`--cv-activate-icon`); new `--cv-armed-veil` token; `.cv__activate` emitted in the shell (`case-shell.mjs`). The rest-state hint chip now reads `TAP TO SCRUB` everywhere (the desktop `CLICK TO SCRUB` variant is gone).
- **Fullscreen CRT switch-on/off** — entering fullscreen plays the beta site's CRT power-on grammar (`design-assets/references/beta-crt-boot.md`, timings verbatim via new `--cv-crt-*` tokens): hairline dwell → spring to full height → narrow-and-tall overshoot → settle to the full screen, with the content arriving on the beta's 150ms hard-ease slide once the rect lands; closing (✕/Esc) cuts the content and collapses the rect back to the line at the designed half-duration off-beat, the real close deferred `CRT_OFF_MS` (180ms) in `fullscreen.ts`. Shipping adaptations per the exhibit's own notes: no border-radius animation, morph on the `scale` longhand (the `transform` channel is owned by visualViewport sizing), and the overlay's cached stage rect now reads transform-immune `offset*` metrics so the mid-morph scale can't distort the first canvas fit. Reduced motion: instant settled overlay, immediate close; a direct back-gesture popstate still tears down instantly. (An earlier HUD-reticle-based fullscreen boot was built and reverted the same day — the reticle is the *loading* choreography; the CRT power-on was always the intended transition.)
- **Fullscreen is overlay-only on every platform** — the native Fullscreen API layer is dropped (element fullscreen escalates to the host window in embedded browsers like the VS Code preview; iPhone Safari never had it); the fixed visualViewport-sized overlay is the single fullscreen code path.
- **Case viewer tap-to-activate** (experiment; toggle: `apparatus.caseTapToActivate`, default on): the rest-state horizontal drag-scrub is disabled — the viewer is inert until the explicit engage tap/click — and a quiet `TAP TO SCRUB` scrim chip (`CLICK TO SCRUB` on fine pointers) rises over the imaging field once the boot settles, retiring for good on first engagement; the stage cursor reads pointer (not grab) at rest. A drag at rest is released to the page and its synthesized click eaten, so only a deliberate tap activates. Flag off restores the drag-scrubs-at-rest model and removes the chip + cursor wholesale (the `data-cv-tap` attribute is never stamped)

### Changed
- **Case-viewer buttons carry Lucide icons; Lucide adopted as the icon library** — the text glyphs (⛶/✕/ACTIVATE/TUNE) are replaced with Lucide outline SVGs (square-power = activate, minimize = close, scan-eye = fullscreen, contrast = TUNE): the viewer is React-free, so `src/lib/case-icons.mjs` inlines the node data verbatim from `lucide-react` (the new dependency; the unused `@tabler/icons-react` is dropped), imported by both the build-time shell and the fullscreen overlay. Glyphs run large in their hit areas (32px `--cv-icon-size`; activate power 52px `--cv-activate-icon`) over the buttons' plain 1px border. On hover-capable pointers each glyph springs up a touch (`transform: scale(1.05)`, GPU-composited, reduced-motion opt-out). The CRT beam gets a two-layer bloom (tight core + wide halo). Fullscreen-open scroll-lock now pads the scrollbar gutter and the inline viewer's de-engage snaps (no transitions) while promoted — both were visible background movement under the CRT dwell.
- **Card + callout ornament: detector-plate framing replaces the HUD corner brackets** — article cards now carry quarter "field arcs" in each inner corner (6px inset, 10px radius, 12px arms) and T-shaped fiducials at the edge midpoints (32px line parallel to the edge, 8px stem pointing at the card center), modeled on a DR detector plate's registration marks; callouts and Key Points get the corner arcs alone at half scale. Ink is `text-muted` at 25%, brightening ×1.7 on card hover (color only — the bracket step-out hover is gone with the brackets). Card radius 8px→16px (`--radius-sm`→`--radius-lg`). Implementation: one masked `::before` per surface (mask layers carve arcs+tees from a single ink layer; geometry entirely token-driven) — new `tokens/ornament.css` + `components/ornament.css` (kill-switch: drop the import); the `.hud-frame` CSS block and ArticleCard's two `hud-corner` spans are removed. Spec chosen interactively in the card-ornament lab artifact (2026-07-08)
- **Case viewer polish pass** (browser-driven review of every user-facing element; device-gated steps unchanged):
  - *Latency* — the per-scrub-frame layout read/write interleave is gone (TODO item 1 of 3 applied): inline `#draw`/`#ppf` now consume stage dimensions cached by the ResizeObserver, and the fullscreen `#redraw`/pinch/pan clamps consume a rect cached per visualViewport event, so the pointermove handlers perform zero forced-layout reads; fullscreen wheel now rAF-coalesced and capped at 3 steps/frame (the inline contract — trackpad inertia previously stepped once per event, uncapped)
  - *Fullscreen mouse parity* — double-click toggles fit↔2× zoom (touch keeps the pointer-event double-tap path; a pointer-type guard prevents double-firing), PageUp/PageDown = ±5 on the slider (matching inline)
  - *Engaged-state legibility* — the counter and slider thumb join the brackets in signal cyan while engaged (the imaging-active semantic, previously carried by 12px corner marks alone); the top-right bracket yields to the ✕ instead of peeking from behind its scrim
  - *Delight* — stack-edge tick: corner brackets nudge inward once (`--cv-edge-tick`, 200ms) when a drag/wheel scrub arrives at IM 1/N — the PACS end-of-stack stop; once per edge visit, frontier holds excluded, reduced-motion suppressed
  - *Hover/press feedback* — window chips, series tabs, fullscreen chips, and both ✕ buttons get 0.15s hover/active states (chips brighten, ✕ scrim lifts one bg step); ⛶ hover gains the missing transition
  - *A11y* — both `role=radiogroup`s get the full radio keyboard pattern: roving tabindex (checked chip is the tab stop) + Arrow/Home/End selection-follows-focus
  - *Hardening* — stages get `user-select: none` + `-webkit-touch-callout: none` (no Safari text-selection drift mid-scrub, no iOS long-press image callout on the poster); mobile full-bleed switched from `100vw` (overflows beside a classic scrollbar) to `calc(100% + 2 * var(--grid-margin))`
  - *Latency (second round)* — the inline wheel listener now binds only while engaged: the always-registered non-passive listener made the browser wait on the handler for every page-scroll wheel event crossing the stage at rest
  - *Delight (second round)* — engaging advances the corner brackets inward to a **locked** inset (`--cv-bracket-lock`) held for the whole engaged stay, with impact-recoil choreography (the video-game weight trick, Michael's spec): quick travel into the lock, recoil to 70% of the travel, settle back in — 0→100→70→100 (`cv-lock-in` keyframes); release returns on the plain UI ease, and the stack-edge tick nudges from the locked position (bracket travel refactored to per-corner sign pairs so lock + tick compose; reduced motion places the lock instantly). The fullscreen overlay enters on a 150ms settle instead of a hard pop (reduced-motion skips it)
  - *Chrome consistency (second round)* — the ✕ / ⛶ glyph buttons get the mono console face (they inherited the serif body via the preflight's `font: inherit`); the thrice-duplicated control-scrim `color-mix` consolidated into a `--cv-scrim` token
- **Prose rhythm: split the difference on the v0.8.0 spacing increases** (Michael's read: the full step was a bit too much air): heading margin-top 32→28px mobile / 48→40px desktop; callout margins 48→40px (the calc midpoint of `--space-4`/`--space-5`)
- **Voice pass over all six live articles** (voice skill + editorial overlay, per Michael's "too slick" read of the earlier copy): the three earliest pieces (L1-0001–0003) rewritten from textbook voice to the calibrated register — grounded openings, flag planted in the ACR commentary (first person, concede-then-pivot), mechanism before statistic, AAST grade reframed as "how much spleen is devascularized"; the three newer pieces (L1-0004–0006) de-slicked — binary-contrast thesis lines, aphoristic paragraph closers, and italics-for-emphasis cut, landing sentences brought inside the emphasis budget. Retitled: closed-loop → "Closed-Loop Obstruction on CT: Two Transition Points", lisfranc → "Lisfranc Injury on CT: The One Joint to Check" (slugs/URLs unchanged). All apparatus (callouts, tables, figures, reference cards, footnotes, case directives) preserved; build green; style-gallery specimen left as-is (meta-copy, not article voice)

### Fixed
- **`astro check` now exits clean (0 errors/warnings/hints); added `npm run check`** — `@astrojs/check` + `typescript` installed and wired as a script (mirrors the IDE Problems panel). Fixed the pre-existing diagnostics it surfaced: `TableOfContents.astro` typed `Astro.props as Props` (was implicit-`any` on the heading map/filter callbacks + unused `Props`), and `NewsletterSignup.tsx` swapped the React-19-deprecated `FormEvent` for `SyntheticEvent`. Also updated the apparatus flag-name contract test for the new `caseTapToBoot` flag.
- **`tsc --noEmit` now exits clean** — `readdirSync` pinned to the string[] overload via `encoding` (astro.config.mjs validation hook), the `@tailwindcss/vite` plugin cast across the astro-bundled/root vite type duality, and a stale `@ts-expect-error` dropped in `case-loader.ts`
- **Site-wide sweep (4-agent review + browser verification), fixes applied**:
  - *Nav active state dead in production* — `Header.astro` compared `pathname === '/about'` but builds emit directory URLs (`/about/`), so About never highlighted on the live site; pathname now normalized before comparing
  - *Internal links 301 on every click* — card, nav, footer, and 404 hrefs were slashless (`/articles/<slug>`) while GitHub Pages serves the slashed form; all internal hrefs now carry the trailing slash (no redirect round-trip, no diluted link signal)
  - *Newsletter form half-styled* — the shadcn `ui/` components style with semantic theme colors (`ring`, `input`, `muted-foreground`, …) that were defined nowhere, so their utilities silently generated nothing; `main.css` `@theme` now aliases them to project tokens (focus ring is the gold, placeholder is muted, border/bg visible). Also in `main.css`: the `--font-*` theme entries had drifted to the *old* face stacks — now reference `--ff-*`
  - *Newsletter dead code + silent status* — the unreachable `response.status === 303` check removed (fetch follows redirects); success/error messages now render in a `role="status"` live region
  - *Reading-progress hairline drew over the open mobile menu* (z 49 vs 40) — now 30
  - *No `<main>` landmark / no skip link anywhere* — Layout now wraps pages in `<main id="main">` with a "Skip to content" link (gold-focus treatment in global.css); heading hierarchy mended (footer section titles h4→h2, sr-only h2 on the articles index)
  - *Print stamped interactive chrome onto case images* — `.cv__bar`, chips/tabs, ✕, the TAP-TO-SCRUB stage chip, and the mobile INDEX are now hidden in print
  - *FeatureBand blank without JS* — the HUD was `opacity: 0` pending a JS boot despite the "static without JS" comment; a `<noscript>` override reveals the static composition. Script also skips the per-frame style write when progress is unchanged (it's pinned 0/1 for most of the scroll range)
  - *Header `resize` handler forced layout per event* — now rAF-throttled; dead `backdrop-filter` behind the opaque header removed; stale comments (48px header, 600px breakpoint) corrected
  - *Token discipline* — `rgba()` literals in the FeatureBand border/glow → `color-mix` on tokens; card-meta 10px → `--fz-micro`; footer 9px ×2 → new `--fz-plate`; hamburger hit area raised to `--tap-target` (44px, was ~38×30)
  - *Quiet-link hover underline inconsistency* — INDEX, More-articles, and back links gained the global serif underline on hover while the TOC rail suppressed it; all now suppress (the `.toc__link` convention)
  - *SEO/discovery* — articles emit `og:type=article` + `article:published_time` (Layout prop); RSS autodiscovery `<link>` in head; Astro `prefetch.prefetchAll` on (hover-prefetch, verified firing)
  - *Case-viewer canvas unnamed to AT* — `aria-hidden` on the canvas (state lives on the labeled slider); docs: tokens.md signal-semantics line corrected (gold is the action color, not cyan)
- **Case viewer fullscreen: case title interpolated unescaped into the overlay's innerHTML** — a quote in a manifest title would break out of the slider's `aria-label` attribute (and markup in it would parse); now set via `setAttribute` after build
- **Case viewer: dead inline ✕** — a pointerdown on the disengage button (it lives inside the stage) started scrub tracking and pointer-captured to the stage, retargeting the button's click there; the ✕ could never exit engaged mode on any platform (Playwright-confirmed, click log showed the stage swallowing it). `#pointerDown` now ignores presses that begin on a button
- **Case viewer fullscreen: counter hidden under the ✕** — the meta strip ran the full width, so `IM n/N` sat beneath the absolutely-positioned close button; the strip now reserves the button's zone (hit-area + gutter + safe-area)
- **Case viewer: multi-series window-chip desync (latent)** — the shell renders series[0]'s window chips and `#switchSeries` never rebuilt them, so a second series would have shown the previous series' chips with stale checked state (unreachable with the current single-series synthetic case; fixed ahead of the first real multi-series embed by rebuilding chips from the incoming series, same escaping contract as the shell)

## [0.8.0] - 2026-07-07

### Added
- **Article apparatus** (2026-07-07 plan + same-day on-screen revision): eight recurring in-article delight elements, CSS + platform primitives only (zero new JS islands), each disable-able in one labeled place and each demonstrated to disable cleanly (roster: `docs/design/components.md` → Article apparatus). Section break (`hr` → crosshair-circle registration mark, the footer's structural grammar in tokens/currentColor, article prose only), arrival wash (`:target` gold wash fading 2s on hash jumps; reduced motion → none), mobile INDEX (`<details>` disclosure TOC under the article header, <80em, numbered to mirror the section ordinals, `::details-content` open/close transition where supported), More-articles footer block (date-neighbor titles as plain readable links + "All articles →", replacing the back-link row; edge articles degrade gracefully; drafts excluded in prod), footnote popovers (`rehypeFootnotePopovers`: GFM `[^n]` refs → tap-first popover buttons with a build-time copy of the note, anchored to the ref via implicit-anchor positioning; the injected `h2#footnote-label` is neutralized to a label paragraph, keeping the phantom "Footnotes" heading out of the TOC rail, mobile INDEX, and section ordinals; endnote plate stays as the no-popover base layer, and the heading fix runs even with the popover flag off; contract-tested), figure accession (`FIG NN` cell leading the console strip via an `l1-figure` counter consolidated into prose.css's single counter-reset; authored `Fig. N` + `#fig-n` reference convention documented in the gallery), readout chips (`.readout` muted mono hairline for inline measurements, deliberately not code-violet), and the ordinal tick-in (section ordinals tick in on scroll via a pure-CSS `view()` timeline; kept on live judgment). Kill-switch architecture: one CSS file + import line per element under `src/styles/components/apparatus/`; markup-emitting elements additionally gated by booleans in `src/lib/apparatus.ts` (flag-name contract test). Footnotes authored into `supine-pneumothorax.md`; readouts into `window-and-level.md`; the style gallery exercises every element. New tokens: `--break-mark-size`, `--tap-target`, `--wash-duration`, `--fz-micro` (the last also replacing prose.css's inline 10px micro-numeral literals). A cite-line element shipped in the first pass was cut on review (no reader value); its `site.ts` AUTHOR source went with it

### Changed
- **On-screen design pass over the article page** (Michael's review of the apparatus session): serials (`L1-nnnn`) pulled from every display surface — card meta, article meta line, footer block — the frontmatter field stays as internal metadata; section-ordinal mono numbers moved into the left margin (absolute, off the text box) so h2 text aligns flush with the prose; heading breathing room opened (h2/h3/h4 margin-top 32px mobile / 48px desktop); list markers restored globally — the Tailwind preflight had silently stripped bullets and numbers from all prose and card lists; the 4px indicator square removed from card headers (Key Points, callout labels, subscribe headline) — signal color rides the label text alone; callouts get more separation from body text (margin 32px → 48px); "Practice patterns vary" dropped from the review line and "Trauma bay" from the figure strip (modality + view + technique only)

### Fixed
- **TOC rail selector mismatch**: the rail `<nav>` never carried the `article__toc` class prose.css and print.css target, so the mobile hide, desktop sticky positioning, and print exclusion all silently failed — the rail rendered in-flow at the page bottom on mobile and scrolled away on desktop (grid column placement only worked by auto-placement luck)

## [0.7.0] - 2026-07-07

### Added
- **Case Viewer showstopper module** (2026-07-07 plan, M1–M5 autonomous steps; device gates pending): scrollable CT/MR JPEG stacks inline in articles via `::case[caption]{id="…"}`. Framework-free light-DOM `<case-viewer>` element (`src/components/case/`) with progressive-engage gestures (rest = page scrolls + horizontal scrub; tap engages PACS scrub on either axis; second finger / ⛶ promotes to fullscreen), 1:1 zero-momentum mapping with the scrub clamped to the decoded frontier (measured from the *current* frame — drag-start frontier collapsed under LRU eviction, caught in emulation), ImageBitmap LRU (12 resident, explicit `close()`, generation tokens, direction-weighted decode-ahead; memory verified flat over a 500-frame scrub loop), build-time shell expansion (`remarkCaseViewer` + `src/lib/case-shell.mjs`: zero CLS, no runtime JSON, no-JS poster fallback, missing manifest/frame fails the build), boot-HUD choreography ported verbatim from the loading-hud prototype (reduced-motion → fade; CLS 0 verified), fullscreen overlay with popstate as the single close authority + instant scroll restore (the page's smooth scroll-behavior made restoration a visible glide — fixed), TUNE filter drag with floors (never a uniform field; resets on close), `npm run case:build` ingestion CLI (resize ≤1200px, EXIF strip, poster, manifest `rev` bump), and the repo's first vitest harness (25 contract tests: mapping, frame-store, CLI, directive/shell). Chrome-text contrast ≥6.6:1; forced-colors smoke clean. Dev spike page (`/dev/gesture-spike`, prod-excluded) + synthetic stack generator retained pending the on-device judgment sessions
- **Content-layer staleness finding + remedy** (case-viewer plan step 9): Astro's content layer caches rendered articles by content digest, so a regenerated or deleted case left embeds stale (confirmed live: a deleted manifest sailed through a cached prod build; a running dev server kept serving 48 frames after a 60-frame regen). Remedy is two-layered — `src/lib/case-loader.ts` (`caseAwareGlob`) invalidates embedding entries when a case's manifest `rev` moves (cold start + live dev via a `public/cases` watcher), and an `astro:build:start` integration re-validates every published `::case` against disk (catches frame files deleted without a rev change)
- Case viewer embedded live in `window-and-level.md` via `::case{id="dev-synthetic"}` — the synthetic-stack test surface on the deployed site until the real windowing case lands (the `/dev/gesture-spike` page stays prod-excluded and style-gallery's embed stays draft-only, so neither shipped a testable viewer)
- Three design-system-exercising articles (voice skill + writing.md, `featured: false`, build- and lint-verified): `window-and-level.md` (L1-0004, Neuro/educational — lead paragraph, `<dl>`, code block, presets table, `<kbd>`, note+caution callouts, `<hr>`), `lisfranc-injury-ct.md` (L1-0005, MSK, first **case-analysis** content type — figure + console strip, reference-card, `<mark>`, internal/external links), `supine-pneumothorax.md` (L1-0006, Chest/educational — blockquote pull quote, signs table, figure, critical callout, ordered checklist). Together with L1-0001–0003 every primary-tag signal color and content type now appears on the index
- `design-assets/references/ethos-survey-2026-07.md` — the verified 12-site design-ethos survey (dark editorial / technical-instrument / craft-motion), each with its lesson and adoption status
- `docs/plans/2026-07-07-case-viewer-brief.md` — Case Viewer requirements + architecture brief (JPEG stacks not DICOM, mobile-first, the inline gesture-model problem, decode-ahead/zero-CLS "ironclad" spec, custom-element recommendation, milestones); feeds `/brainstorm`
- Blueprint grid texture on the hero (`--color-grid-line` alpha knob + `--grid-texture-cell` pitch, masked fade toward the band; `isolation: isolate` so the z:-1 overlay paints above the section background)
- **House metadata format**: required `serial` frontmatter (`L1-nnnn`, schema-enforced) rendered in card meta and the article meta line (`L1-0002 · Published … · N min read`); `remarkReadingTime` plugin injects `minutesRead`; optional `lastReviewed` renders a clinical-currency line ("Last reviewed 2026-01 · Practice patterns vary")
- **Article apparatus**: mono section ordinals on article h2s (CSS counters, articles only); "On this page" TOC rail ≥80em (`TableOfContents.astro` + scroll-spy, numbering mirrors the ordinals; layout via `--article-rail-columns` ghost|prose|rail so the measure stays centered); 1px gold reading-progress hairline (pure CSS `animation-timeline: scroll()`, invisible where unsupported); L1-glyph tombstone after the last paragraph; end-of-article subscribe card (newsletter island `client:visible`)
- **Interaction details**: HUD corner brackets brighten and step 2px outward on card hover (reduced-motion keeps color only); card title ↔ article h1 share a per-slug `view-transition-name` (title morphs across navigation); `text-wrap: balance` on titles / `pretty` on prose
- **Footer data plate**: `L1R v{version} · Built {date}` stamped at build time between the registration marks
- **Figure console strip** pattern (`.figure-meta`: `CT · Axial · W400 L40 · Portal venous`) — the house chrome for all future case imagery; demoed in the style gallery
- **Print stylesheet**: `tokens/print.css` re-bases the color tokens to an ink-friendly light palette (whole site flips with zero per-component rules); `base/print.css` hides chrome and prints external link URLs
- **Markdown article pipeline** (`astro.config.mjs` + `src/lib/markdown-plugins.mjs`): `remark-directive` + custom `remarkCallouts` (`:::note[Label]` / `:::caution` / `:::critical` → the prose callout apparatus, replacing raw-HTML authoring), `rehype-slug` + `rehype-autolink-headings` (hover-revealed `#` anchors, sticky-header `scroll-margin-top`), `rehype-external-links` (`target=_blank` + `noopener`), custom `rehypeTableScroll` (every table wrapped in an `overflow-x` container — wide tables previously panned the whole page sideways on mobile), and Shiki `css-variables` theming mapped to the color tokens in `prose.css` (code blocks ride the design system)
- Draft-only specimen article `src/content/articles/style-gallery.md` — every prose element on one page for visual regression (`draft: true`, dev-server only, never builds)
- **Routes**: `/articles` index (page-header pattern + card grid), `/about` (draft copy in the writing.md voice — review wording), `404` page ("No signal" register), `/rss.xml` via `@astrojs/rss`
- `src/lib/tags.ts` — single source of truth for primary tags + content types and their signal variants; the Zod schema derives enums from it (typo'd tag now fails the build); replaces duplicated literal maps in `ArticleCard.astro` + `[slug].astro`
- `src/lib/articles.ts` — `getArticles()`: draft-filtered (prod), date-sorted collection accessor used by homepage, index, slug routes, and RSS
- Content schema: `publishDate` → `z.coerce.date()`, `draft` + `ogImage` fields, `featured` defaults false
- `public/images/og-default.jpg` (1200×630 brand card) — OG/Twitter images previously 404'd on every share; per-article `ogImage` frontmatter override supported
- Self-hosted OFL trial faces (`scripts/fetch-ofl-fonts.mjs` → `public/fonts/ofl/` + generated `fonts-ofl.generated.css`): Google CDN `<link>` removed; preloads now point at faces that actually render (previously preloaded ~150KB of unused fallbacks)
- Cross-document view transitions (`@view-transition`, pure CSS, reduced-motion off-switch); smooth in-page anchor scrolling; `theme-color` meta fused to `--color-bg-deepest` (sole blessed hex-in-markup, exempted in `check-inline-colors.mjs`)
- `src/styles/components/pages.css` — standalone-page patterns (page header, article-index cells, 404)

### Changed
- **Opinionated color semantics** (`colors.css`): gold is the action color — new `--color-link` / `--color-focus` / `--color-selection-*` tokens (→ `--color-primary`) replace signal-cyan for links, focus rings, and selection; cyan is reserved for informational apparatus (key points, note callouts, statuses) and taxonomy, remaining signals taxonomy/severity only
- **De-striped the apparatus cards** (the left color-edge read as template default): Key Points, callouts, and the subscribe card now share the reference-card treatment — quiet panel, full hairline border, signal color carried by a 4px label indicator square (the `.tag` vocabulary); blockquote keeps its stripe deliberately (editorial convention, not a card)
- About / 404 / article-subscribe microcopy flattened to plain statements — rhetorical flourishes dropped ("no sponsor over it", "never resolved in the first place", the "no filler" tricolon)

### Fixed
- **Case-viewer review + simplify hardening** (unreleased module, post-implementation pass): decode-pipeline guards now key on `AbortController` identity so a stale aborted decode can't evict a live re-request of the same frame, the ImageBitmap LRU bound is enforced globally across window/series switches (was per-visited-store, so memory could exceed the cap), and build-time validation now covers caption-less/single-quoted `::case` embeds and articles in subdirectories (previously invisible to the stale-shell and missing-frame safety nets)
- **Mobile hero wordmark clipped/wrapped** ≤390px ("RADIOLOG" at 360px): `--fz-wordmark-hero` is now a fluid clamp derived from the measured 9.18× width ratio of "Level One" (+16px classic-scrollbar allowance); reveal-mask lines carry `white-space: nowrap`. Verified 0 overflow at 344/360/390
- **Dead `#subscribe` anchor**: header/mobile Subscribe CTAs targeted a nonexistent id — the footer newsletter section now carries it (+ `scroll-margin-top`)
- **Dates rendered one day early** (authored Jan 28 → shown Jan 27): frontmatter dates parse as UTC midnight; both formatters now render with `timeZone: 'UTC'`
- Article-index/lead cards: lead card gets a differentiated treatment (`article-card--lead`: headline-scale title, `--card-padding-lg`, fills its grid row, meta pinned bottom) — the featured slot previously read as a wide small card over a dead corner
- Desktop hero display moment: the h1 splits into a display-scale statement + support line (same copy); desktop previously opened with a 22px paragraph floating in a ~630px black field
- Tag chips no longer wrap ("AI & POLICY" broke to two lines at 390px): `white-space: nowrap`
- Footer placeholder social links (bare `linkedin.com` / `x.com`) removed until real profile URLs exist; RSS link now resolves
- Newsletter component: variants DRY'd, inline style objects → token-backed classes (`.btn-gold`, status/error classes), footer island `client:load` → `client:visible`; footer's literal `style="gap:16px"` → `.site-footer__marks`
- Desktop reading leading opens to 1.44 ≥60em (mobile keeps 1.36): the full 640px measure was under-leaded at the mobile value

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
