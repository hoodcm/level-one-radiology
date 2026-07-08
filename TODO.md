# TODO

Actionable tasks and open questions. Check at session start, update frequently.

<!-- todo:worklist:start -->

## Start here
_as of 2026-07-07 · 0 streams startable · 4 now/next items untyped_

**Decisions waiting (⚖): 2** — Judge this session's visual tuning on screen · Split primary-CTA gold from caution into distinct tokens if they conflict

- standalone: Restore footer LinkedIn/X links with real profile URLs (build)

## Now

- **Build Case Viewer showstopper module**
  Build the Case Viewer — the "showstopper module," a PACS-like image viewer for clinical cases embedded within articles. Light-DOM custom element `<case-viewer>` (not a React island — see the archived plan), mobile-first, built and code-reviewed. Michael: "the mobile-first image viewer is key." Implementation is substantially complete (mapping/frame-store/case-viewer/ fullscreen modules, boot choreography, TUNE, build-time manifest pipeline, review hardening, /simplify pass) and is live-embedded in a published article (`src/content/articles/window-and-level.md`), but that embed is a TEMPORARY synthetic demo case (`::case{id="dev-synthetic"}`) standing in for the on-device test surface — swapping it for a real clinical case is step 15 below, not a separate deliverable. Remaining scope is purely the four **user-gated, device-only** steps from `docs/archive/plans/2026-07-07-case-viewer-plan.md` (Steps section) — none are autonomous: - Step 3 — on-device gesture-spike judgment (Michael's iPhone) - Step 12 — fullscreen device pass - Step 13 — VoiceOver full-flow a11y pass - Step 15 — first real clinical case (replaces the synthetic embed above) Done: all four device-gated steps pass on Michael's iPhone and the real-case embed (step 15) is live.
  ↳ links: src/components/case/, docs/design/components.md, docs/archive/plans/2026-07-07-case-viewer-plan.md
- **Judge this session's visual tuning on screen**
  One on-screen judgment pass over this session's headless-verified visual knobs — his eyes are the gate on all of these: - Deepened gold shade (`--color-signal-yellow` → #D8A82C, via `--color-primary`) now owns much more surface than before: CTAs, nav/mobile Subscribe, newsletter buttons, pull-quote stripe, links, focus rings, selection, progress hairline, subscribe accents, and the caution role (shared token). - Hero blueprint grid (`--color-grid-line` alpha 0.04, `--grid-texture-cell` 48px). - Desktop prose leading (`--lh-reading` 1.44). - De-striped apparatus cards. - HUD corner hover. - Title view-transition morph (click card → article in Chrome/Safari). - Print stylesheet (⌘P on an article). - Ordinal tick-in keep/cut: demo-gated element at `src/styles/components/apparatus/ordinal-tick.css` (import marked DEMO-GATED in `src/styles/main.css`). Scroll any article in `npm run dev`; plan's default expectation is CUT (a second motion grammar beside `[data-reveal]`). If cut: delete the file + import line, record in CHANGELOG. - On-screen pass over the 8 shipped article-apparatus elements: section break mark, arrival wash, mobile INDEX, serial exit strip, footnote popover cards, figure accession cells, readout chips, cite line. Done: each knob above is confirmed acceptable on screen (or re-tuned), and the ordinal tick-in keep/cut call is made.
  ↳ links: src/styles/tokens/colors.css, src/styles/tokens/typography.css, src/styles/components/apparatus/ordinal-tick.css, src/styles/main.css
- **Resolve the body-serif widening (opsz vs wider OFL serif)**
  The body reading serif (Newsreader) is being widened for a sturdier text column. An `opsz` experiment is live via `--reading-opsz` (typography.css; consumed by prose.css `font-variation-settings: "opsz"`) and awaits the user's on-screen judgment. Newsreader has no `wdth` axis, so widening is only available through optical size. Next step is either lower the opsz further or evaluate a wider / more-geometric OFL body serif. Stated priority Now/Next. Done: a deliberate body-serif width direction is chosen — a settled `--reading-opsz` value or a swapped wider OFL body serif.
  ↳ links: src/styles/tokens/typography.css, src/styles/components/prose.css
- **Review/edit Claude-drafted page copy**
  Claude drafted the copy on `/about`, the 404 page, and the article subscribe-card microcopy in brand voice; a de-slick pass already ran at Michael's direction this session ("copy reading a little too slick"), but the final wording is his call. Review and edit each. Done: About, 404, and article subscribe-card copy read as final, in Michael's voice.
  ↳ links: src/pages/about.astro, src/pages/404.astro, src/pages/articles/[slug].astro

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
  Three efficiency/altitude findings from the case-viewer review were judged real but not mechanically safe to apply before the device-gated verification pass (they change hot-path behavior that only the iPhone session can validate): 1. Layout-read/write interleaving forces a synchronous reflow per scrub frame — `#ppf()`/`fitCanvas` read `clientWidth` right after `#syncReadout` DOM writes (case-viewer.ts), and fullscreen `#redraw` reads `getBoundingClientRect()` after `#syncFrame` writes. Fix shape: cache stage dimensions in the existing ResizeObserver / viewport callbacks and pass them through (mind the 0×0 window before the first RO callback). 2. `#setFrame` conflates advance/retarget/repaint; splitting an explicit `#repaint()` would let it early-out on unchanged frame. The repaint-on-unchanged-frame dependency is pinned by a comment at #setFrame for now; do the split only with device profiling in hand. 3. `get #store` re-derives `` `${series.key}/${win.key}` `` + Map.get ~4× per pointermove. Negligible in isolation — bundle with the above only if profiling shows it matters (a cached field must be invalidated on window/series switch). Done: apply-or-close each with an on-device profiling judgment during (or after) the device-gated case-viewer pass.
  ↳ links: src/components/case/case-viewer.ts, src/components/case/fullscreen.ts

## Later

- **Decide and verify FeatureBand detector desktop behavior**
- **Write first educational article (deep-dive)**
- **Enforce the grid primitive with a hook**
- **Split primary-CTA gold from caution into distinct tokens if they conflict**

## Someday

- **Reconsider display/body serif if text halation persists**
- **Consider thin Scrib3-style gutters for full-bleed image spans**
- **Remove the stale local context7 entry in ~/.claude.json**
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
_Refreshed 2026-07-07 by end-session janitor · project store_

**Quick fixes (1)** — apply directly:
- prefer-font-supported-before-transform-hacks — encode "font-supported axes before transform hacks" as a typography principle → add the adjustment order (native variable axes / OpenType features first; transforms second, with the tradeoff flagged) to docs/design/reasoning/typography.md
**Needs design (0)**:

<!-- todo:friction:end -->

<!-- todo:continuation:start -->

## Continuation

_Last session: 2026-07-07_

Level One Radiology — the dark-first, content-driven website for leveloneradiology.com (Astro + React islands, design-token single-source-of-truth).

**Accomplished:**
- Implemented the article-apparatus plan end to end (13/13 steps): eight in-article elements plus the demo-gated ordinal tick-in, one-place kill switches, new contract tests — see CHANGELOG `[Unreleased]`.
- Ran the Phase 10 chain: /code-review (3 correctness fixes applied, incl. always-on footnote heading fix) and /simplify (`--fz-micro` token, structuredClone); Codex offer declined.
- Fixed the pre-existing TOC rail selector mismatch (mobile hide, desktop sticky, and print exclusion had all silently failed).
- Archived the plan with its deviations ledger to docs/archive/plans/2026-07-07-article-apparatus-plan.md.

**Start by reading:** TODO.md, CONTEXT.md, CHANGELOG.md

**Priorities:**
1. See TODO.md `## Start here` — the new decision surface is the on-screen judgment pass over the apparatus elements, including the ordinal tick-in keep/cut (plan default: cut). Dev server: `npm run dev`, any article page; the gallery (`/articles/style-gallery`) exercises everything.
2. The case-viewer device-gated steps remain the lead workstream (unchanged this session).

**Time-sensitive:** See TODO.md `## Time-sensitive` (nothing new this session).

**Unverified assumptions:**
- Footnote-card anchor positioning was verified in Chromium only; non-Chromium engines get the centered-card fallback by design, but that fallback hasn't been exercised in a real Safari/Firefox — confirm during the on-screen pass.
- One vitest run reported 2 transient failures right after the simplify commit, unreproducible across 5 subsequent 33/33 runs; if it recurs, suspect contention with a concurrent build, not the structuredClone change.

<!-- todo:continuation:end -->
