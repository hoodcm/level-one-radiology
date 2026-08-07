# TODO

Actionable tasks and open questions. Check at session start, update frequently.

<!-- todo:worklist:start -->

## Start here
_as of 2026-08-07 · 4 streams startable · 0 now/next items untyped_

**Decisions waiting (⚖): 11** — Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10) (→ enables 1) · Judge this session's visual tuning on screen · Explore radiograph imagery in/near the homepage hero · Wire a site-wide SEO sweep into /push for meaningful diffs · Reconsider display/body serif if text halation persists · Remove or gate the unused data-reveal motion system · +5 more

- case-viewer — next: Build Case Viewer showstopper module (build)
- cloudflare-migration — next: Go live on Cloudflare (hosting + DNS + registrar + analytics) (build)
- fonts — next: Retire legacy font payload (Utopia/Eurostile/Lab Grotesque) and re-subset Newsreader (decide)
- newsletter — next: Replace the React newsletter island with a static form + vanilla JS (build)
- standalone: Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10) (decide)

## Now

- **Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10)**
  The homepage hero's scintillator-grid drawing (replacing the old blueprint grid) needs Michael's on-screen judgment on his iPhone and desktop: density, slab seating, drift amplitude, and beam subtlety at both 120Hz and 60Hz. This also signs off the mobile statement-in-card arrangement, which is accessibility-sensitive (dual-h1 seat between the hero statement and the page's own h1). Any retune should only touch `src/styles/tokens/detector-hero.css` tokens or the `SETTINGS` constants in `src/lib/detector-hero.mjs`, then re-run gates. Done: composition confirmed acceptable (or retuned) on both device classes, the mobile dual-h1 arrangement is signed off, the touch interaction (steering + beam re-exposure) feels right on a real finger, and the mobile drawing's grid-margin alignment holds on device.
  ↳ links: src/styles/tokens/detector-hero.css, src/lib/detector-hero.mjs, src/components/shared/DetectorHero.astro, src/lib/wireframe-tunnel.mjs, src/components/shared/WireframeTunnel.astro, src/styles/components/homepage.css, docs/archive/plans/2026-07-11-detector-hero-plan.md
- **Build Case Viewer showstopper module**
  Build the Case Viewer — the "showstopper module," a PACS-like image viewer for clinical cases embedded within articles. Light-DOM custom element `<case-viewer>` (not a React island — see the archived plan), mobile-first, built and code-reviewed. Michael: "the mobile-first image viewer is key." Implementation is substantially complete (mapping/frame-store/case-viewer/ fullscreen modules, boot choreography, TUNE, build-time manifest pipeline, review hardening, /simplify pass) and is live-embedded in a published article (`src/content/articles/window-and-level.md`), but that embed is a TEMPORARY synthetic demo case (`::case{id="dev-synthetic"}`) standing in for the on-device test surface — swapping it for a real clinical case is step 15 below, not a separate deliverable. Remaining scope is purely the four **user-gated, device-only** steps from `docs/archive/plans/2026-07-07-case-viewer-plan.md` (Steps section) — none are autonomous: - Step 3 — on-device gesture-spike judgment (Michael's iPhone) - Step 12 — fullscreen device pass - Step 13 — VoiceOver full-flow a11y pass - Step 15 — first real clinical case (replaces the synthetic embed above) Done: all four device-gated steps pass on Michael's iPhone and the real-case embed (step 15) is live.
  ↳ links: src/components/case/, docs/design/components.md, docs/archive/plans/2026-07-07-case-viewer-plan.md
- **Judge this session's visual tuning on screen**
  One on-screen judgment pass over this session's headless-verified visual knobs — his eyes are the gate on all of these: - Deepened gold shade (`--color-signal-yellow` → #D8A82C, via `--color-primary`) now owns much more surface than before: CTAs, nav/mobile Subscribe, newsletter buttons, pull-quote stripe, links, focus rings, selection, progress hairline, subscribe accents, and the caution role (shared token). - ~~Hero blueprint grid (`--color-grid-line` alpha 0.04, `--grid-texture-cell` 48px)~~ — MOOT: the blueprint grid and both tokens were removed 2026-07-11, replaced by the detector-hero scintillator-grid drawing (see `detector-hero-device-pass`, a separate device-gated judgment item). - Desktop prose leading (`--lh-reading` 1.44). - De-striped apparatus cards. - Card + callout detector-plate ornament (corner field-arcs + edge fiducials, replacing the old HUD corner brackets; card radius 8px→16px). New this session, headless-only so far — confirm the ornament geometry/ink reads right and the hover brighten feels right without the old bracket step-out. - Title view-transition morph (click card → article in Chrome/Safari). - Print stylesheet (⌘P on an article). - Ordinal tick-in keep/cut: demo-gated element at `src/styles/components/apparatus/ordinal-tick.css` (import marked DEMO-GATED in `src/styles/main.css`). Scroll any article in `npm run dev`; plan's default expectation is CUT (a second motion grammar beside `[data-reveal]`). If cut: delete the file + import line, record in CHANGELOG. - On-screen pass over the 7 shipped article-apparatus elements (canonical roster: `docs/design/components.md` → Article apparatus): section break mark, arrival wash, mobile INDEX, More-articles footer block, footnote popover cards, figure accession cells, readout chips. (The cite-line element planned in the first pass was cut on review before shipping.) - "wireframe-tunnel" title-region backdrop (`src/lib/wireframe-tunnel.mjs`, `src/components/shared/WireframeTunnel.astro`, `src/styles/tokens/wireframe-tunnel.css`, `src/styles/components/wireframe-tunnel.css`), mounted on the homepage hero and article headers. As of 2026-08-07 the homepage instance mounts on the whole hero FIELD (hero + feature band, frameless, converging on the wordmark center) and the detector-hero drawing was made opaque over it (new `.dh-occ` occlusion layer in `src/lib/detector-hero.mjs` / `src/styles/tokens/detector-hero.css`) — headless-only so far, confirm the composition reads right on screen. (Rides the same on-screen judgment as `detector-hero-device-pass`, which additionally covers the on-device device-class + touch-feel gate.) - 2026-08-07 small UI-fix set, headless-verified only: header wordmark kerning matched to hero, Subscribe button vertical centering, section-ordinal number color dimmed to `--color-text-disabled`, body-text color stepped down to `--color-text-secondary` (halation reduction), callout/key-points bullet geometry redone with explicit gutter markers, footer switched from monospace to the body sans, article TOC rail repositioned to start beside the Key Points card instead of the title. Done: each knob above is confirmed acceptable on screen (or re-tuned), and the ordinal tick-in keep/cut call is made.
  ↳ links: src/styles/tokens/colors.css, src/styles/tokens/typography.css, src/styles/tokens/ornament.css, src/styles/components/ornament.css, src/styles/components/apparatus/ordinal-tick.css, src/styles/main.css, src/lib/wireframe-tunnel.mjs, src/components/shared/WireframeTunnel.astro, src/styles/components/wireframe-tunnel.css, src/lib/detector-hero.mjs, src/components/shared/DetectorHero.astro, src/styles/tokens/detector-hero.css, src/styles/components/prose.css, src/styles/components/homepage.css
- **Resolve the body-serif widening (opsz vs wider OFL serif)**
  The body reading serif (Newsreader) is being widened for a sturdier text column. An `opsz` experiment is live via `--reading-opsz` (typography.css; consumed by prose.css `font-variation-settings: "opsz"`) and awaits the user's on-screen judgment. Newsreader has no `wdth` axis, so widening is only available through optical size. Next step is either lower the opsz further or evaluate a wider / more-geometric OFL body serif. Stated priority Now/Next. Done: a deliberate body-serif width direction is chosen — a settled `--reading-opsz` value or a swapped wider OFL body serif.
  ↳ links: src/styles/tokens/typography.css, src/styles/components/prose.css
- **Review/edit Claude-drafted page copy**
  Claude drafted the copy on `/about`, the 404 page, and the article subscribe-card microcopy in brand voice; a de-slick pass already ran at Michael's direction this session ("copy reading a little too slick"), but the final wording is his call. Review and edit each. Done: About, 404, and article subscribe-card copy read as final, in Michael's voice.
  ↳ links: src/pages/about.astro, src/pages/404.astro, src/pages/articles/[slug].astro
- **Create the Buttondown account (or fix the slug) — Subscribe is fully broken**
  Confirmed at runtime during the site-wide sweep: the newsletter form POSTs to `buttondown.com/…/leveloneradiology`, which 404s — the Buttondown account/newsletter does not exist. Every live Subscribe click on the deployed site currently fails silently into the (now-visible) error state. Email subscribers are the site's keystone metric (CONTEXT.md) and a working signup is explicit MVP scope — this is the single most launch-blocking open item in the store. USER-ACTION: either create the `leveloneradiology` Buttondown account or correct the slug the form posts to; no code change needed once the account/slug is right. Done: a real Subscribe submission on the deployed site succeeds end-to-end.
  ↳ links: src/components/shared/NewsletterSignup.tsx

## Next

- **Go live on Cloudflare (hosting + DNS + registrar + analytics)**
  Supersedes the prior "configure GitHub Pages DNS" task (decided 2026-07-13). The site is not yet confirmed live, so its **first go-live goes straight to Cloudflare** — DNS is pointed at Cloudflare, never at GitHub Pages. Execute the migration plan `docs/plans/hosting-migration-cloudflare.md`: repo prep (wrangler.jsonc, ci.yml) → create the Cloudflare Workers project → QA the `*.workers.dev` preview → point the domain's nameservers at Cloudflare → transfer the registrar GoDaddy → Cloudflare → decommission the GH Pages deploy path → hardening (analytics beacon, cache headers, redirects). Most phases are USER-GATED (Cloudflare account, GoDaddy dashboard, one real test-subscribe, outward DNS + registrar changes). Blocked on the domain confirmation (`is-domain-dns-configured`) for the registrar step. Done: leveloneradiology.com serves over HTTPS from Cloudflare, DNS + registrar on Cloudflare, GH Pages deploy path removed, Cloudflare Web Analytics live.
  ↳ links: docs/plans/hosting-migration-cloudflare.md, is-domain-dns-configured
- **Wire Cloudflare Web Analytics (replaces Plausible)**
  Analytics provider decision changed 2026-07-13: **drop Plausible, use Cloudflare Web Analytics** (free, cookieless, no banner) — it folds into the Cloudflare platform the site is migrating to, dropping a vendor and a $9/mo line. Plausible was never installed, so this is a re-point, not a migration. Privacy-respecting analytics is the listed measurement tool; subscriber conversion is the keystone metric. Mechanics live in the migration plan (`docs/plans/hosting-migration-cloudflare.md` Phase 6, "Cloudflare Web Analytics"): create the Web Analytics site in the Cloudflare dashboard, then add the beacon `<script>` (public token, not a secret) to `src/layouts/Layout.astro`'s `<head>`, gated to production. Best done after the host is on Cloudflare (Phase 4), so the account exists — but the beacon can be committed earlier; it just won't report until the site is live and the Web Analytics site is created. Done: the production `<head>` loads exactly one Cloudflare Web Analytics beacon (none in dev/preview); the dashboard shows page views for leveloneradiology.com.
  ↳ links: src/layouts/Layout.astro, docs/plans/hosting-migration-cloudflare.md
- **Restore footer LinkedIn/X links with real profile URLs**
  LinkedIn/X placeholder links were removed from the footer this session (the bare-domain hrefs were dead links). Restore once Michael supplies real profile URLs — a one-line change in `src/components/layout/Footer.astro`; a comment in the file marks the spot ("Connect" column). Blocked on Michael supplying the URLs. Done: real LinkedIn/X links render in the footer Connect column.
  ↳ links: src/components/layout/Footer.astro
- **Case-viewer hot-path perf items deferred from the /simplify pass**
  Two remaining efficiency/altitude findings from the case-viewer review, judged real but profiling-gated (they change hot-path behavior that only the iPhone session can validate): 1. `#setFrame` conflates advance/retarget/repaint; splitting an explicit `#repaint()` would let it early-out on unchanged frame. The repaint-on-unchanged-frame dependency is pinned by a comment at #setFrame for now; do the split only with device profiling in hand. 2. `get #store` re-derives `` `${series.key}/${win.key}` `` + Map.get ~4× per pointermove. Negligible in isolation — bundle with the above only if profiling shows it matters (a cached field must be invalidated on window/series switch). (The third — layout-read/write interleaving in the scrub path — was applied in the 2026-07-07 polish pass: stage dimensions are now cached by the inline ResizeObserver and the fullscreen viewport handler, so the per-move handlers perform zero layout reads. Note for the device pass: CDP LayoutCount stays ~1/frame either way because the counter-text update schedules a normal render-phase layout — the win is the removed *synchronous* mid-handler reflow, which that metric can't isolate.) Done: apply-or-close each with an on-device profiling judgment during (or after) the device-gated case-viewer pass. ## Additional runtime-robustness scope (folded in, same workstream) Surfaced by a parallel session's case-viewer sweep — real bugs/gaps, not hot-path perf, but same files/workstream so kept as one item rather than a scatter of siblings: - ~~Fullscreen slider lacks the inline viewer's stall indicator + frontier clamp~~ — MOOT: the decoded-frontier clamp was retired entirely (every path) 2026-07-11 on live-iPhone-testing evidence that it made the thumb lag the finger; there is no more frontier to fall out of sync with (see `build-case-viewer-module` notes + CHANGELOG `[Unreleased]`). - Prefetch fan-out is uncapped (~40 fetches) mid-scrub; needs a ceiling. - A queued wheel rAF can land after disengage (stale-state write). - No `inert` behind the fullscreen overlay; no keyboard zoom/TUNE path. - No warm-decode-on-engage for first-scrub feel (cold first frame). Done (this scope): each bug fixed or explicitly closed with a written rationale.
  ↳ links: src/components/case/case-viewer.ts, src/components/case/fullscreen.ts
- **Replace the React newsletter island with a static form + vanilla JS**
  The newsletter form is the site's only React island — ~72KB gzipped plus hydration cost, all to power one email field. Surfaced during the site-wide sweep as the single highest-leverage perf win available: a static HTML form + ~20 lines of vanilla JS (POST to Buttondown, swap in a success/error message) reproduces the same behavior and lets `@astrojs/react` be dropped from the dependency tree entirely (no more React runtime anywhere on the site). Touches the same component as `newsletter-buttondown-account-missing` — sequence with that item in mind (fixing the account first makes the rewrite testable end-to-end; either order is workable). Done: `NewsletterSignup` is a plain Astro component with vanilla JS, no React runtime ships to the client, and `@astrojs/react` is removed from package.json.
  ↳ links: src/components/shared/NewsletterSignup.tsx
- **Retire legacy font payload (Utopia/Eurostile/Lab Grotesque) and re-subset Newsreader**
  Surfaced during the site-wide latency sweep: ~2MB of retired Utopia/Eurostile/ Lab Grotesque woff2 still ships in `public/fonts/` even though the OFL trial (Newsreader/DM Sans/Michroma/Chivo Mono) is the active face set. The legacy `@font-face` blocks lack `unicode-range`, so the literal "→" glyph in "All articles →" triggers a Lab Grotesque download on every article page. Decide: delete the legacy faces outright (if the OFL trial is staying) or add `unicode-range` scoping so they never download unless actually needed. Also re-subset Newsreader — the 132KB preload could roughly halve with a tighter glyph range. Related but distinct: `is-fonts-licensing-acquired` (whether the legacy faces are even licensed) and `metric-compatible-font-fallbacks` (size-adjust fallback faces for the OFL set) — this item is the payload-weight cleanup, not licensing or CLS. Done: legacy font files are either removed or unicode-range-scoped (no accidental download), and Newsreader ships a tighter subset.
  ↳ links: public/fonts/, src/styles/tokens/fonts-ofl.generated.css
- **Wire a site-wide SEO sweep into /push for meaningful diffs**
  Michael (2026-07-14): when /push runs in this repo with meaningful diffs, it should also do an SEO sweep that checks the rest of the website is idealized to Google's standards. Wiring deliberately deferred ("we can figure out how to wire that into push"). His framing: this is a writing/structure exercise against Google's standards, nothing to do with medicine or biology. The sweep checks copy and site conformance (titles, descriptions, legibility, structure), never clinical content. Design space to settle (route through /brainstorm or /hook-design): - What the sweep checks: the build-side checklist in `.claude/rules/seo-structure.md` (rendered-HTML legibility, head validity, title/description uniqueness, truthful JSON-LD, sitemap/lastmod, status codes) — structural conformance over `dist/`, distinct from the per-article copy grade `/seo-grade` owns. - Trigger: which diffs count as "meaningful" (templates/layout/config/content vs docs-only). - Wiring mechanism: /push is a global skill — options are a project rule the push flow reads, a project /seo-sweep skill /push offers when in this repo, or a PreToolUse/pre-push hook. Global-skill edits vs project-owned step is the real fork. Done: a designed, wired sweep — /push in this repo triggers (or offers) the structural SEO check on meaningful diffs, with the checker itself implemented and its scope documented.
  ↳ links: .claude/rules/seo-structure.md, .claude/skills/seo-grade/SKILL.md
- **Add Terms of Service and Privacy Policy pages**
  Michael named these as needed for the site (collecting newsletter subscriber emails, running analytics) but explicitly deferred writing them this session. No pages currently exist at `/terms` or `/privacy`. Done: a Terms of Service page and a Privacy Policy page are live and linked from the footer.
  ↳ links: src/pages/
- **Audit/reconcile design tokens against the claude.com reference**
  2026-08-07 wrote a scraped reference of claude.com's design-token set (`docs/design/claude-com-reference.md`) as inspiration for this site's own tokens (not a source of truth — study copy only). Full audit/reconciliation is future work, scoped in the session's own continuation notes: palette reduction toward a 60/30/10 balance, reconsidering body-text color, moving to fluid clamp()-based type/spacing scales, and a border-alpha-vs-opaque-ramp strategy decision. This is plan-shaped work — route through `/brainstorm` before implementation per the continuation notes' own instruction, not a direct-to-code task. Done: a deliberate set of token changes (or explicit no-changes) decided and landed for each of the four areas above, each token still living in exactly one place per the project's single-source-of-truth rule.
  ↳ links: docs/design/claude-com-reference.md, src/styles/tokens/

## Later

- **Decide and verify FeatureBand desktop behavior (now an empty card there)**
- **Enforce the grid primitive with a hook**
- **Split primary-CTA gold from caution into distinct tokens if they conflict**
- **Tokenize the duplicated 0.15s UI-transition duration literal**
- **Remove or gate the unused data-reveal motion system**
- **Give the TOC scroll-spy an initial / deep-link active state**
- **Explore radiograph imagery in/near the homepage hero** — after Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10)

## Someday

- **Reconsider display/body serif if text halation persists**
- **Consider thin Scrib3-style gutters for full-bleed image spans**
- **Repair ~/.npm cache permissions (EACCES)**
- **Add size-adjust metric-compatible fallbacks for OFL fonts**

## Open questions

- **Confirm leveloneradiology.com registered at GoDaddy + transfer-eligible**
  Open question, reframed 2026-07-13 (DNS now goes straight to Cloudflare, not GH Pages — see go-live-cloudflare): is leveloneradiology.com **registered at GoDaddy**, and what is its **registration date**? `public/CNAME` declares the domain but does not confirm registrar ownership. The date matters because Cloudflare Registrar (migration plan Phase 5) requires the domain be > 60 days since registration/last transfer; if registered recently, the registrar transfer waits for the 60-day mark while the rest of the go-live proceeds. If it's not registered anywhere yet, register it at Cloudflare directly and skip the transfer. Answered when: registrar ownership + registration date are known (feeds go-live-cloudflare Phase 0).
- **Confirm font licensing acquired (Utopia/Lab Grotesque/Eurostile)**
  Open question: are Utopia Std, Lab Grotesque, and Eurostile LT Std properly licensed for web use? The font files are placed in `public/fonts/` and self- hosted, but licensing acquisition is unconfirmed — a web-embedding license is distinct from having the files on disk.

<!-- todo:worklist:end -->

<!-- todo:friction:start -->

## Friction worth addressing
_Refreshed 2026-08-07 by end-session janitor · project store_

**Quick fixes (6)** — apply directly:
- prefer-font-supported-before-transform-hacks — Encode the order-of-operations rule for type adjustments before it recurs a third time. → Add to CLAUDE.md Technical Gotchas or docs/design/reasoning/typography.md: "Before reaching for a CSS transform (scaleX, etc.) to adjust type, check the loaded font's native variable axes / OpenType features first (see the Google Fonts URL in Layout.astro for the axis list) — only fall back to transform hacks when the font has no native lever, and flag the tradeoff explicitly."
- bezier-cannot-express-undershoot-motion — Document that non-monotonic motion needs @keyframes, not a bezier ease, so the next recoil/overshoot request skips the wasted first round. → Add to docs/design/reasoning/motion.md: "Beziers are monotonic in position — they can overshoot past a target but never undershoot and return. Any non-monotonic motion (undershoot, multi-stop, hold-then-continue, e.g. a recoil/settle-back) needs @keyframes with per-beat animation-timing-function, not a single cubic-bezier ease."
- astro-frontmatter-regex-compiler-break — Warn future sessions off regex literals with escaped slashes in .astro frontmatter, and to trust npm run build over IDE diagnostics there. → Add to CLAUDE.md Technical Gotchas: "Avoid regex literals containing `\/\/` sequences in `.astro` frontmatter — they can break the esbuild config compile with a misleading `Unexpected \"export\"` error and cascade bogus IDE diagnostics elsewhere in the file. Prefer non-regex string ops (e.g. `URL.host`/`pathname`) and confirm any frontmatter fix with `npm run build`, not the IDE's diagnostics."
- pull-then-install-before-dev — Codify the two-Mac post-pull step so a stale node_modules doesn't cost another failed dev-server launch. → Add to CLAUDE.md Technical Gotchas: "After pulling the other machine's work, run `npm install` before `npm run dev` if `package.json` changed — a stale `node_modules` fails with `Cannot find module '<new-dep>'`."
- file-move-crashes-running-dev-server — Note that a post-file-move dev-server ENOENT is a stale-watcher artifact, not a code bug, so it isn't chased as one again. → Add to CLAUDE.md Technical Gotchas: "After a bulk file/folder move (especially `git mv` of anything the dev server watches or serves), restart `npm run dev` rather than chasing the resulting `ENOENT` as a code bug — confirm health with a clean `npm run build`, not the dev-server error overlay."
- no-js-playwright-for-headless-verify — Save the next headless-verification attempt from reaching for a nonexistent JS Playwright dependency. → Add to CLAUDE.md (verification/testing section): "This repo has no JS Playwright dependency — for headless site screenshots/verification, use the globally-installed Python Playwright + Chrome-for-Testing binary (see `~/.claude/references/chrome-for-testing.md`), not an ad-hoc Node Playwright script."

**Needs design (2)**:
- shell-module-edits-stale-content-cache — Case-viewer shell-module edits (case-shell.mjs, case-icons.mjs) don't invalidate the content-layer cache, costing a manual rm -rf + restart every time (recurred hard, now recurrence 2). → /hook-design .claude/friction/open/2026-07-08-shell-module-edits-stale-content-cache.md
- background-shell-orphaned-across-sessions — A background dev-server shell can go orphaned across a session handoff with no completion record, costing a manual liveness check + relaunch before work resumes. → /hook-design .claude/friction/open/2026-08-07-background-shell-orphaned-across-sessions.md

<!-- todo:friction:end -->

<!-- todo:continuation:start -->

## Continuation

_Last session: 2026-08-07_

**Accomplished:**
- Homepage wireframe-tunnel backdrop moved to a field-level mount (hero + feature band): frameless/base-less, converging on the wordmark container, extending down to the feature band's end (`cy`/`extendH` opts on `tunnelSVG`).
- Retired the blueprint-grid prototype (`.hero-field--detector::before`, `--dh-grid-*` tokens) in favor of the tunnel.
- Fixed a scroll-driven stretch/redraw glitch on the field-mounted tunnel (now pixel-anchored, redraws only on real input changes).
- Made the detector-hero drawing fully opaque to backdrops (new `.dh-occ` occlusion layer: stack cards, per-plate faces, the fan's full band, the slab face) so the tunnel no longer reads through the instrument's polygons.
- Touch/finger re-exposure now covers the stack layer too (previously vanes-only) and runs hotter (`--dh-touch-boost` 2.2 → 3).
- Committed as `69700f1` — `astro check` clean, token lint clean, vitest 48/48.

**Start by reading:** Read `CONTEXT.md`. Grep `TODO.md` for `## Now` and `## Continuation`; read those sections only — `/next` owns full triage.

**Priorities:**
1. See `TODO.md` `## Start here` digest and `## Now` band — `confirm-gold-shade-onscreen` and `detector-hero-device-pass` both cover this session's tunnel/detector work as more surface to judge under their existing on-screen gates (not new items).

**Unverified assumptions:**
- The scroll-anchor fix was verified headless (zero SVG-innerHTML mutations across a scripted scroll cycle at 1440×900) — not yet felt on a real trackpad/touch scroll; the on-screen gates above are where that gets confirmed.

<!-- todo:continuation:end -->
