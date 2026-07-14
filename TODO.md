# TODO

Actionable tasks and open questions. Check at session start, update frequently.

<!-- todo:worklist:start -->

## Start here
_as of 2026-07-14 · 4 streams startable · 1 now/next items untyped_

**Decisions waiting (⚖): 10** — Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10) (→ unblocks 1) · Judge this session's visual tuning on screen · Explore radiograph imagery in/near the homepage hero · Reconsider display/body serif if text halation persists · Remove or gate the unused data-reveal motion system · Retire legacy font payload (Utopia/Eurostile/Lab Grotesque) and re-subset Newsreader · +4 more

- case-viewer — next: Build Case Viewer showstopper module (build)
- cloudflare-migration — next: Go live on Cloudflare (hosting + DNS + registrar + analytics) (build)
- fonts — next: Retire legacy font payload (Utopia/Eurostile/Lab Grotesque) and re-subset Newsreader (decide)
- newsletter — next: Replace the React newsletter island with a static form + vanilla JS (build)
- standalone: Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10) (decide)

## Now

- **Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10)**
  The homepage hero's scintillator-grid drawing (replacing the old blueprint grid) needs Michael's on-screen judgment on his iPhone and desktop: density, slab seating, drift amplitude, and beam subtlety at both 120Hz and 60Hz. This also signs off the mobile statement-in-card arrangement, which is accessibility-sensitive (dual-h1 seat between the hero statement and the page's own h1). Any retune should only touch `src/styles/tokens/detector-hero.css` tokens or the `SETTINGS` constants in `src/lib/detector-hero.mjs`, then re-run gates. Done: composition confirmed acceptable (or retuned) on both device classes, the mobile dual-h1 arrangement is signed off, the touch interaction (steering + beam re-exposure) feels right on a real finger, and the mobile drawing's grid-margin alignment holds on device.
  ↳ links: src/styles/tokens/detector-hero.css, src/lib/detector-hero.mjs, docs/archive/plans/2026-07-11-detector-hero-plan.md
- **Build Case Viewer showstopper module**
  Build the Case Viewer — the "showstopper module," a PACS-like image viewer for clinical cases embedded within articles. Light-DOM custom element `<case-viewer>` (not a React island — see the archived plan), mobile-first, built and code-reviewed. Michael: "the mobile-first image viewer is key." Implementation is substantially complete (mapping/frame-store/case-viewer/ fullscreen modules, boot choreography, TUNE, build-time manifest pipeline, review hardening, /simplify pass) and is live-embedded in a published article (`src/content/articles/window-and-level.md`), but that embed is a TEMPORARY synthetic demo case (`::case{id="dev-synthetic"}`) standing in for the on-device test surface — swapping it for a real clinical case is step 15 below, not a separate deliverable. Remaining scope is purely the four **user-gated, device-only** steps from `docs/archive/plans/2026-07-07-case-viewer-plan.md` (Steps section) — none are autonomous: - Step 3 — on-device gesture-spike judgment (Michael's iPhone) - Step 12 — fullscreen device pass - Step 13 — VoiceOver full-flow a11y pass - Step 15 — first real clinical case (replaces the synthetic embed above) Done: all four device-gated steps pass on Michael's iPhone and the real-case embed (step 15) is live.
  ↳ links: src/components/case/, docs/design/components.md, docs/archive/plans/2026-07-07-case-viewer-plan.md
- **Judge this session's visual tuning on screen**
  One on-screen judgment pass over this session's headless-verified visual knobs — his eyes are the gate on all of these: - Deepened gold shade (`--color-signal-yellow` → #D8A82C, via `--color-primary`) now owns much more surface than before: CTAs, nav/mobile Subscribe, newsletter buttons, pull-quote stripe, links, focus rings, selection, progress hairline, subscribe accents, and the caution role (shared token). - ~~Hero blueprint grid (`--color-grid-line` alpha 0.04, `--grid-texture-cell` 48px)~~ — MOOT: the blueprint grid and both tokens were removed 2026-07-11, replaced by the detector-hero scintillator-grid drawing (see `detector-hero-device-pass`, a separate device-gated judgment item). - Desktop prose leading (`--lh-reading` 1.44). - De-striped apparatus cards. - Card + callout detector-plate ornament (corner field-arcs + edge fiducials, replacing the old HUD corner brackets; card radius 8px→16px). New this session, headless-only so far — confirm the ornament geometry/ink reads right and the hover brighten feels right without the old bracket step-out. - Title view-transition morph (click card → article in Chrome/Safari). - Print stylesheet (⌘P on an article). - Ordinal tick-in keep/cut: demo-gated element at `src/styles/components/apparatus/ordinal-tick.css` (import marked DEMO-GATED in `src/styles/main.css`). Scroll any article in `npm run dev`; plan's default expectation is CUT (a second motion grammar beside `[data-reveal]`). If cut: delete the file + import line, record in CHANGELOG. - On-screen pass over the 7 shipped article-apparatus elements (canonical roster: `docs/design/components.md` → Article apparatus): section break mark, arrival wash, mobile INDEX, More-articles footer block, footnote popover cards, figure accession cells, readout chips. (The cite-line element planned in the first pass was cut on review before shipping.) Done: each knob above is confirmed acceptable on screen (or re-tuned), and the ordinal tick-in keep/cut call is made.
  ↳ links: src/styles/tokens/colors.css, src/styles/tokens/typography.css, src/styles/tokens/ornament.css, src/styles/components/ornament.css, src/styles/components/apparatus/ordinal-tick.css, src/styles/main.css
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

## Later

- **Decide and verify FeatureBand desktop behavior (now an empty card there)**
- **Enforce the grid primitive with a hook**
- **Split primary-CTA gold from caution into distinct tokens if they conflict**
- **Tokenize the duplicated 0.15s UI-transition duration literal**
- **Remove or gate the unused data-reveal motion system**
- **Give the TOC scroll-spy an initial / deep-link active state**
- **Explore radiograph imagery in/near the homepage hero** — blocked on Judge detector-hero composition on iPhone + desktop (plan steps 7 + 10)

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
_Refreshed 2026-07-11 by end-session janitor · project store_

**Quick fixes (2)** — apply directly:
- prefer-font-supported-before-transform-hacks — encode "native font axes before transform hacks" as a stated typography ordering principle → add a numbered principle to `docs/design/reasoning/typography.md` (check native variable axes / OpenType features before transforms; flag the tradeoff when no native axis covers the need)
- pull-then-install-before-dev — document the two-Mac pull-then-install gotcha → add to CLAUDE.md (Session Workflow or Technical Gotchas): after a cross-machine git pull touching package.json, run `npm install` before `npm run dev`, else stale node_modules surfaces as `Cannot find module`

**Needs design (1)**:
- shell-module-edits-stale-content-cache — editing `src/lib/case-shell.mjs` / `case-icons.mjs` doesn't invalidate the Astro content-layer cache, so icon/markup changes stay invisible until a manual `rm -rf .astro` + restart (recurrence 2, hit 4× one session) → /hook-design .claude/friction/open/2026-07-08-shell-module-edits-stale-content-cache.md

<!-- todo:friction:end -->

<!-- todo:continuation:start -->

## Continuation

_Last session: 2026-07-14_

Website for leveloneradiology.com — a dark-first, content-driven emergency-radiology publication (Astro + React islands, single-source-of-truth design tokens).

**Accomplished (homepage hero enrichment round):**
- Recomposed the mobile hero's first screen — a shortened FeatureBand card seats the statement plus a gold Subscribe CTA above the fold, with Featured cresting the fold (CHANGELOG → Added).
- Fixed the FeatureBand card loading pre-expanded on the mobile detector composition — p=0 now anchors at the card's measured rest position (CHANGELOG → Fixed).
- Reformulated the detector-hero vane touch-pull to slide panes along their own depth axis with occlusion-seated rear tips (rigid, no broken/intersecting lines), verified by a headless multi-position drag sweep with numeric artifact detection (CHANGELOG → Added).
- Added gold exposure ink and a margin-registered blueprint grid to the hero, plus a width-derived hero-height floor so the drawing spans the page margins at every viewport (CHANGELOG → Added/Changed).

**Start by reading:** TODO.md, CONTEXT.md, CHANGELOG.md

**Priorities:**
- The natural next step is the detector-hero **on-device judgment pass**, now enlarged to also gate this session's gold exposure ink, the blueprint grid, the touch-pull kinematics, and the margin-spanning floor (`detector-hero-device-pass` in the worklist `## Now` band). Otherwise take priorities from the worklist `## Start here` digest and `## Now`/`## Next` bands.

**Time-sensitive:** see the worklist `## Time-sensitive` view.

**Unverified assumptions:**
- The entire hero-enrichment round is headless-verified only (emulated viewports + synthetic pointer events). The gold exposure's readability on a real OLED, the touch-pull's feel under a continuous finger, and the grid density all await Michael's iPhone — the `--dh-beam-boost`/`--dh-touch-boost` and `--dh-grid-*` tokens are the knobs.
- The vane-pull artifact sweep samples held drag positions; a continuous finger sweep could still expose a sub-pixel hairline where a pulled tip meets a neighbor's hook.
- The gold-exposure and blueprint-grid layers are explicit prototypes that may be cut at the device pass (kept out of CONTEXT for that reason).

<!-- todo:continuation:end -->
