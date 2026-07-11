# TODO

Actionable tasks and open questions. Check at session start, update frequently.

<!-- todo:worklist:start -->

## Start here
_as of 2026-07-11 · 3 streams startable · 2 now/next items untyped_

**Decisions waiting (⚖): 8** — Judge this session's visual tuning on screen · Reconsider display/body serif if text halation persists · Remove or gate the unused data-reveal motion system · Retire legacy font payload (Utopia/Eurostile/Lab Grotesque) and re-subset Newsreader · Split primary-CTA gold from caution into distinct tokens if they conflict · Consider thin Scrib3-style gutters for full-bleed image spans · +2 more

- case-viewer — next: Build Case Viewer showstopper module (build)
- fonts — next: Retire legacy font payload (Utopia/Eurostile/Lab Grotesque) and re-subset Newsreader (decide)
- newsletter — next: Replace the React newsletter island with a static form + vanilla JS (build)
- standalone: Restore footer LinkedIn/X links with real profile URLs (build)

## Now

- **Build Case Viewer showstopper module**
  Build the Case Viewer — the "showstopper module," a PACS-like image viewer for clinical cases embedded within articles. Light-DOM custom element `<case-viewer>` (not a React island — see the archived plan), mobile-first, built and code-reviewed. Michael: "the mobile-first image viewer is key." Implementation is substantially complete (mapping/frame-store/case-viewer/ fullscreen modules, boot choreography, TUNE, build-time manifest pipeline, review hardening, /simplify pass) and is live-embedded in a published article (`src/content/articles/window-and-level.md`), but that embed is a TEMPORARY synthetic demo case (`::case{id="dev-synthetic"}`) standing in for the on-device test surface — swapping it for a real clinical case is step 15 below, not a separate deliverable. Remaining scope is purely the four **user-gated, device-only** steps from `docs/archive/plans/2026-07-07-case-viewer-plan.md` (Steps section) — none are autonomous: - Step 3 — on-device gesture-spike judgment (Michael's iPhone) - Step 12 — fullscreen device pass - Step 13 — VoiceOver full-flow a11y pass - Step 15 — first real clinical case (replaces the synthetic embed above) Done: all four device-gated steps pass on Michael's iPhone and the real-case embed (step 15) is live.
  ↳ links: src/components/case/, docs/design/components.md, docs/archive/plans/2026-07-07-case-viewer-plan.md
- **Judge this session's visual tuning on screen**
  One on-screen judgment pass over this session's headless-verified visual knobs — his eyes are the gate on all of these: - Deepened gold shade (`--color-signal-yellow` → #D8A82C, via `--color-primary`) now owns much more surface than before: CTAs, nav/mobile Subscribe, newsletter buttons, pull-quote stripe, links, focus rings, selection, progress hairline, subscribe accents, and the caution role (shared token). - Hero blueprint grid (`--color-grid-line` alpha 0.04, `--grid-texture-cell` 48px). - Desktop prose leading (`--lh-reading` 1.44). - De-striped apparatus cards. - Card + callout detector-plate ornament (corner field-arcs + edge fiducials, replacing the old HUD corner brackets; card radius 8px→16px). New this session, headless-only so far — confirm the ornament geometry/ink reads right and the hover brighten feels right without the old bracket step-out. - Title view-transition morph (click card → article in Chrome/Safari). - Print stylesheet (⌘P on an article). - Ordinal tick-in keep/cut: demo-gated element at `src/styles/components/apparatus/ordinal-tick.css` (import marked DEMO-GATED in `src/styles/main.css`). Scroll any article in `npm run dev`; plan's default expectation is CUT (a second motion grammar beside `[data-reveal]`). If cut: delete the file + import line, record in CHANGELOG. - On-screen pass over the 7 shipped article-apparatus elements (canonical roster: `docs/design/components.md` → Article apparatus): section break mark, arrival wash, mobile INDEX, More-articles footer block, footnote popover cards, figure accession cells, readout chips. (The cite-line element planned in the first pass was cut on review before shipping.) Done: each knob above is confirmed acceptable on screen (or re-tuned), and the ordinal tick-in keep/cut call is made.
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

- **Configure GitHub Pages DNS**
  Configure DNS so leveloneradiology.com resolves to GitHub Pages (A/AAAA + CNAME records at the registrar; enable Pages custom domain + HTTPS). `public/CNAME` already holds `leveloneradiology.com` and the deploy workflow exists — the remaining work is the registrar-side DNS, an external/infra step. Stated priority #2. Related open question: whether the domain is registered yet (see is-domain-dns-configured). Done: leveloneradiology.com serves the deployed site over HTTPS.
- **Set up Plausible analytics**
  Wire Plausible analytics — add the tracking script (gated on `PUBLIC_PLAUSIBLE_DOMAIN`, already declared in CLAUDE.md env vars) to the base layout. No `plausible` reference exists anywhere in `src/` yet. Privacy- respecting analytics is the listed measurement tool; subscriber conversion is the keystone metric. Stated priority #2. Done: Plausible script loads on production pages for the configured domain.
  ↳ links: src/layouts/Layout.astro
- **Restore footer LinkedIn/X links with real profile URLs**
  LinkedIn/X placeholder links were removed from the footer this session (the bare-domain hrefs were dead links). Restore once Michael supplies real profile URLs — a one-line change in `src/components/layout/Footer.astro`; a comment in the file marks the spot ("Connect" column). Blocked on Michael supplying the URLs. Done: real LinkedIn/X links render in the footer Connect column.
  ↳ links: src/components/layout/Footer.astro
- **Case-viewer hot-path perf items deferred from the /simplify pass**
  Two remaining efficiency/altitude findings from the case-viewer review, judged real but profiling-gated (they change hot-path behavior that only the iPhone session can validate): 1. `#setFrame` conflates advance/retarget/repaint; splitting an explicit `#repaint()` would let it early-out on unchanged frame. The repaint-on-unchanged-frame dependency is pinned by a comment at #setFrame for now; do the split only with device profiling in hand. 2. `get #store` re-derives `` `${series.key}/${win.key}` `` + Map.get ~4× per pointermove. Negligible in isolation — bundle with the above only if profiling shows it matters (a cached field must be invalidated on window/series switch). (The third — layout-read/write interleaving in the scrub path — was applied in the 2026-07-07 polish pass: stage dimensions are now cached by the inline ResizeObserver and the fullscreen viewport handler, so the per-move handlers perform zero layout reads. Note for the device pass: CDP LayoutCount stays ~1/frame either way because the counter-text update schedules a normal render-phase layout — the win is the removed *synchronous* mid-handler reflow, which that metric can't isolate.) Done: apply-or-close each with an on-device profiling judgment during (or after) the device-gated case-viewer pass. ## Additional runtime-robustness scope (folded in, same workstream) Surfaced by a parallel session's case-viewer sweep — real bugs/gaps, not hot-path perf, but same files/workstream so kept as one item rather than a scatter of siblings: - Fullscreen slider lacks the inline viewer's stall indicator + frontier clamp — the counter can assert a slice that isn't actually shown yet. - Prefetch fan-out is uncapped (~40 fetches) mid-scrub; needs a ceiling. - A queued wheel rAF can land after disengage (stale-state write). - No `inert` behind the fullscreen overlay; no keyboard zoom/TUNE path. - No warm-decode-on-engage for first-scrub feel (cold first frame). Done (this scope): each bug fixed or explicitly closed with a written rationale.
  ↳ links: src/components/case/case-viewer.ts, src/components/case/fullscreen.ts
- **Replace the React newsletter island with a static form + vanilla JS**
  The newsletter form is the site's only React island — ~72KB gzipped plus hydration cost, all to power one email field. Surfaced during the site-wide sweep as the single highest-leverage perf win available: a static HTML form + ~20 lines of vanilla JS (POST to Buttondown, swap in a success/error message) reproduces the same behavior and lets `@astrojs/react` be dropped from the dependency tree entirely (no more React runtime anywhere on the site). Touches the same component as `newsletter-buttondown-account-missing` — sequence with that item in mind (fixing the account first makes the rewrite testable end-to-end; either order is workable). Done: `NewsletterSignup` is a plain Astro component with vanilla JS, no React runtime ships to the client, and `@astrojs/react` is removed from package.json.
  ↳ links: src/components/shared/NewsletterSignup.tsx
- **Retire legacy font payload (Utopia/Eurostile/Lab Grotesque) and re-subset Newsreader**
  Surfaced during the site-wide latency sweep: ~2MB of retired Utopia/Eurostile/ Lab Grotesque woff2 still ships in `public/fonts/` even though the OFL trial (Newsreader/DM Sans/Michroma/Chivo Mono) is the active face set. The legacy `@font-face` blocks lack `unicode-range`, so the literal "→" glyph in "All articles →" triggers a Lab Grotesque download on every article page. Decide: delete the legacy faces outright (if the OFL trial is staying) or add `unicode-range` scoping so they never download unless actually needed. Also re-subset Newsreader — the 132KB preload could roughly halve with a tighter glyph range. Related but distinct: `is-fonts-licensing-acquired` (whether the legacy faces are even licensed) and `metric-compatible-font-fallbacks` (size-adjust fallback faces for the OFL set) — this item is the payload-weight cleanup, not licensing or CLS. Done: legacy font files are either removed or unicode-range-scoped (no accidental download), and Newsreader ships a tighter subset.
  ↳ links: public/fonts/, src/styles/tokens/fonts-ofl.generated.css

## Later

- **Decide and verify FeatureBand detector desktop behavior**
- **Enforce the grid primitive with a hook**
- **Split primary-CTA gold from caution into distinct tokens if they conflict**
- **Tokenize the duplicated 0.15s UI-transition duration literal**
- **Remove or gate the unused data-reveal motion system**
- **Give the TOC scroll-spy an initial / deep-link active state**

## Someday

- **Reconsider display/body serif if text halation persists**
- **Consider thin Scrib3-style gutters for full-bleed image spans**
- **Repair ~/.npm cache permissions (EACCES)**
- **Add size-adjust metric-compatible fallbacks for OFL fonts**

## Open questions

- **Confirm leveloneradiology.com registered + pointed at GitHub Pages**
  Open question: is leveloneradiology.com registered, and is it pointed at GitHub Pages? `public/CNAME` declares the domain but that does not confirm registrar ownership or live DNS records. (The actionable follow-up, once answered, is configure-github-pages-dns.)
- **Confirm font licensing acquired (Utopia/Lab Grotesque/Eurostile)**
  Open question: are Utopia Std, Lab Grotesque, and Eurostile LT Std properly licensed for web use? The font files are placed in `public/fonts/` and self- hosted, but licensing acquisition is unconfirmed — a web-embedding license is distinct from having the files on disk.

<!-- todo:worklist:end -->

<!-- todo:friction:start -->

## Friction worth addressing
_Refreshed 2026-07-08 by end-session janitor · project store_

**Quick fixes (5)** — apply directly:
- file-move-crashes-running-dev-server — a bulk file/folder move under a running `npm run dev` crashed it with a stale-path ENOENT (no actual broken ref) → add to CLAUDE.md Technical Gotchas: after a large `git mv`, restart `npm run dev` and confirm health with `npm run build`, not the dev-server overlay.
- pull-then-install-before-dev — a cross-machine pull that added a `package.json` dep left `npm run dev` failing with module-not-found → add to CLAUDE.md Technical Gotchas: run `npm install` after any cross-machine pull touching `package.json`.
- astro-frontmatter-regex-compiler-break — a regex literal with `\/\/` in `.astro` frontmatter broke the esbuild compile with a misleading `Unexpected "export"` → add to CLAUDE.md Technical Gotchas: avoid `\/\/` regex in `.astro` frontmatter; adjudicate single-file `.astro` diagnostics with `npm run build`.
- prefer-font-supported-before-transform-hacks — reached for `transform: scaleX()` before checking the font's native variable axes → add to docs/design/reasoning/typography.md: check native axes / OpenType features before transform hacks.
- bezier-cannot-express-undershoot-motion — reached for a cubic-bezier for a recoil/undershoot motion (beziers are monotonic) → add to docs/design/reasoning/motion.md: non-monotonic motion needs `@keyframes` with per-beat timing, not a bezier.

**Needs design (1)**:
- shell-module-edits-stale-content-cache — editing the build-time shell (`case-shell.mjs`/`case-icons.mjs`) doesn't invalidate Astro's content-layer cache, so markup/icon changes stay invisible until a manual cache clear + dev restart → /hook-design .claude/friction/open/2026-07-08-shell-module-edits-stale-content-cache.md

<!-- todo:friction:end -->

<!-- todo:continuation:start -->

## Continuation

_Last session: 2026-07-11_

Level One Radiology — an independent emergency-radiology publication (Astro + framework-free custom elements, dark-first, token-driven).

**Accomplished:**
- Unified the case-viewer buttons into one design system and added per-icon hover micro-motion — see CHANGELOG `[Unreleased]` → Added/Changed.
- Replaced the fullscreen numeric TUNE readout with a live window/level X-Y indicator pad; icon set reworked (scan-eye/x/maximize-2).
- Engaged scrub now releases by tapping the image again (inline minimize button removed).
- Added a homepage "Latest" section and a thin "Using the Case Viewer" demo article (featured lead).
- Fixed the slider stall-dot storm (frontier clamp), the iOS footnote-arrow emoji substitution (U+FE0E pin), and the W/L pad open delay — see CHANGELOG `[Unreleased]` → Fixed.

**Start by reading:** TODO.md, CONTEXT.md, CHANGELOG.md

**Priorities:** see the TODO.md worklist `## Start here` digest and the `## Now` / `## Next` bands.

**Time-sensitive:** see the TODO.md `## Time-sensitive` view (domain/DNS + font-licensing questions).

**Unverified assumptions:**
- The footnote backref arrow now renders as a text glyph (not the blue emoji) on real iOS Safari — VS15 is the standard mechanism, but only an on-device look confirms it.
- The slider frontier-clamp actually quiets the stall-dot storm on a real iPhone under network decode — verified in logic, not yet on device.
- The W/L pad's vertical sense (up = brighter) matches Michael's PACS muscle memory — a one-line flip in `fullscreen.ts` if it reads inverted.

<!-- todo:continuation:end -->
