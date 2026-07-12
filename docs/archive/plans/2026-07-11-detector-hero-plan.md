# Detector Hero — scintillator-grid drawing as the homepage hero backdrop

## Context & why

The image-board title slide (`Level One Radiology Image Board.pptx`, extracted to
`…/OneDrive…/Projects/Level One Radiology/Assets/title-slide-detector-grid.png`) carries the brand's
technical line drawing: a scintillator-grid detector in cross-section — a stack of consecutively
overlapping en-face plates, the detector slab, and below it a perpendicular plate fan whose depth
edges recede toward the center with no drawn vanishing point. On the slide it sits at 10% opacity
behind the title on `#11100D`.

Michael and Claude reverse-engineered the drawing's construction from pixel measurements, corrected
it to a coherent geometric model (each fan plate's far end anchored on the posterior slab), rebuilt
it as a **parametric SVG generator**, and iterated look + motion in an interactive lab artifact until
both a desktop and a mobile composition were **locked** (settings below). This plan integrates that
locked object into the live homepage hero, replacing the current blueprint hairline grid
(`.hero::before` in `src/styles/components/homepage.css`).

The reference implementation — the final lab, exactly as approved — is checked in at
**`design-assets/references/detector-hero-lab.html`**. Its `<script>` contains the complete model
(compositions, constants, motion behaviors) and is the authoritative source to port from. The live
artifact remains at https://claude.ai/code/artifact/2708738e-906f-4d6d-aa9f-563a9555f99b.

## Locked decisions

1. **The object replaces the hero blueprint grid** — same seat (behind hero text, `z-index: -1`
   inside the `.hero` stacking context), Michael 2026-07-11.
2. **Two compositions, one grammar.** Landscape ≥ ~640px & aspect ≥ 0.9 → the desktop object
   (cover-fit, measured source geometry). Portrait/narrow → a portrait recomposition (contain-fit —
   the whole object always visible; slab spans the width; stack height = 0.35 × slab height, the
   source's own proportion; slab centered in its canvas so the title seats in it).
3. **Locked settings** (Michael's Copy-settings JSON, 2026-07-11 — these become token/constant
   defaults, "knowing we may return to edit them later"):
   - composition: `{ scale: 1, verticalShift: 2% }`
   - grid: `{ platesPerSide: 16, fanMode: "derived", fanSteepness: 1, gridHeight: 1 (= slab height), stackLayers: 10 }`
   - mobile: `{ platesPerSide: 10, slabBoxiness: 0.5 }`
   - ink: `{ color: ivory (--color-text-ivory), opacity: 0.15, strokePx: 1.5 }` (stroke matches case-viewer icon weight)
   - motion: `{ drawIn: true (0.9s), scrollDepth: true (strength 1.05), pointerFocus: true,
     focalDrift: true (amount 0.2), stackParallax: 0.3, beamSweep: true (every 7s, width 1800, boost 1.5×) }`
4. **The geometric model** (all in the reference file):
   - Fan plates: front vertical edges at even pitch spanning exactly the slab's footprint; per-plate
     parallel depth edges whose far ends sit ON the posterior slab — lateral position mapped by the
     stack contraction `S_BACK = 0.433`, hidden rear height `drop = 1.294 × grid height` (derived
     mode; measured mode retained only as an A/B reference).
   - Depth edges end at the earliest of: own rear endpoint, neighboring plate, slab bottom (order-
     preserving ⇒ crossings impossible; with drop > gridH the rear ends stay hidden).
   - Focus motion: viewpoint shift → back plane shifts by
     `σ = σmax·tanh(dfx·stackParallax/σmax)`, `σmax = 0.8 × pitch`; fan re-aims at anchors, stack
     layers translate `σ × (n−i)/n` (deeper = more), en face always. Pointer authority ramps in/out
     ~1s (no entry lurch). Focus clamped inside the slab.
   - Scroll depth: slab + fan move as one rigid assembly (−34·d), stack lags (−12·d); the stack's
     bottom layer's sides run on under the slab; slab face (bg-fill) + full-opacity bg occluder
     handle all occlusion.
   - Beam sweep: gradient-masked `<use>` references of both grid layers (always live, never stale),
     lift = `opacity×(boost−1)`, slab excluded, occluder above.
5. **Mobile text arrangement (Anthropic-style, to confirm on device):** the slab holds only the
   LEVEL ONE RADIOLOGY wordmark; the tagline leaves the mobile hero and the statement + support
   copy move into the feature-band card (rounded, `--bg-panel`, centered serif). Desktop keeps
   wordmark-left / support-right riding the slab band.
6. **No gyroscope tilt.** Dropped by Michael: iOS requires a tap-gated permission prompt, killing it
   as ambient flair.
7. **Reduced motion / no JS:** reduced-motion renders the final static drawing (no draw-in, no
   ambient loops, no beam); no-JS gets a build-time static SVG (the generator runs in Astro
   frontmatter at build), per the FeatureBand noscript precedent.

## Design

```
src/lib/detector-hero.mjs          ← the generator: compositions, constants,
   │  (pure functions, no DOM)        path emission (front/depth/stack/slab)
   ├── build time: DetectorHero.astro frontmatter → static SVG markup (no-JS baseline)
   └── client:     DetectorHero.astro <script> → responsive rebuild + motion
                   (draw-in, scroll depth, drift, pointer re-focus, beam)

src/styles/tokens/detector-hero.css  ← ink/opacity/stroke/durations as tokens
src/components/shared/DetectorHero.astro  ← emitted only when apparatus.detectorHero
src/pages/index.astro                ← <DetectorHero /> inside .hero; blueprint grid removed
src/styles/components/homepage.css   ← hero::before removed; hero-copy desktop 2-col;
                                        mobile tagline → FeatureBand card copy
```

The client script owns one rAF ambient loop (drift + pointer, exactly the reference's
`ambientTick`), one scroll listener (rAF-coalesced, per FeatureBand's pattern), and a beam interval.
All numeric constants come from the generator module; all *style* values (ink color, opacity, stroke,
durations, easing) come from CSS tokens — the SVG reads them via `var(--…)` exactly as the lab does.

**Composition switching** is JS-driven (rebuild on debounced resize, like the lab) but the selection
predicate is **viewport-based and shared with CSS**: the client and the static-SVG / copy media
queries evaluate the identical viewport condition —
`matchMedia('(min-width: <exact>) and (min-aspect-ratio: 9/10)')`, the exact breakpoint read from the
reference. Do **not** port the reference's element-dimension `pickComp()`
(`.hero.clientWidth/clientHeight`) verbatim: the hero is only ~70svh tall, so its element aspect
diverges from the viewport aspect (a 768×1024 portrait tablet reads element-aspect > 0.9 → desktop
detector, but viewport-aspect 0.75 → mobile copy — the two disagree). One viewport predicate,
evaluated the same way in JS and CSS, is the single source. The two build-time static SVGs (desktop +
mobile) are both emitted, media-query gated (`display:none` swap at that shared breakpoint), so the
no-JS baseline is correct on both form factors; the client script replaces them with the live
responsive instance.

## Design trade-offs / Non-goals

- **Gyroscope tilt re-focus** — rejected (iOS permission-tap friction; Michael dropped it).
- **Measured-fan mode** — the artist's per-plate slopes survive in the generator only as a
  reference constant table; the site ships derived mode. Not configurable at runtime.
- **FeatureBand's editorial future** (what the expanding card ultimately showcases — Case Viewer
  tease, featured article, …) — explicitly parked by Michael; this plan only adds the mobile
  statement copy to it (step 7) without deciding its larger role.
- **Hero-text typography polish** (real wordmark faces/sizes/kerning on the new seats) — Michael:
  "a separate step from getting this initial object behavior looking correct." The plan places the
  existing text markup correctly; a follow-on session refines type.
- **Per-breakpoint plate-density tuning beyond the two locked compositions** — cover-crop and the
  two plate counts handle it; revisit only if a real device pass says otherwise.
- **The lab console/controls** — lab-only; none of it ships.

## Files to read first

1. `design-assets/references/detector-hero-lab.html` — the approved reference; port its `<script>`.
2. `src/components/shared/FeatureBand.astro` — the house pattern for hero-adjacent SVG + script +
   noscript + reduced-motion.
3. `src/styles/components/homepage.css` (hero section, lines ~590–700) — what gets replaced/edited.
4. `src/lib/apparatus.ts` — flag conventions.
5. `docs/design/reasoning/motion.md` + `src/styles/base/motion.css` — easing/duration tokens to reuse.
6. `src/lib/case-shell.mjs` — precedent for a shared build-time/client `.mjs` module.

## Reuse

- `--reveal-ease` / `--ease-out` (motion.css) for draw-in and beam easing — no new cubic-beziers.
- `--color-text-ivory`, `--color-bg-deepest`, `--bg-panel`-equivalent (`--color-bg-*` tokens) — no
  new colors; the ink IS ivory.
- FeatureBand's rAF-coalesced scroll listener shape and its noscript/reduced-motion stance.
- The apparatus kill-switch pattern (`src/lib/apparatus.ts` markup boolean → template gates emission).

## Steps

1. **Generator module** — create `src/lib/detector-hero.mjs`: compositions (DESKTOP measured
   constants; MOBILE base + boxiness/stack-ratio), model constants (`S_BACK`, `DROP_PER_GRID_H`,
   slope table, gap law), and pure emit functions (`stackPaths`, `slabPath`, `vaneRest`,
   `vaneFrontD`, `vaneDepth`, `sigmaOf`) — ported verbatim from the reference file's script.
   `Contracts:` `detector-hero.mjs` exported function signatures (consumed by both the Astro
   frontmatter and the client script).
   → verify: `node -e "import('./src/lib/detector-hero.mjs').then(m => console.log(!!m.vaneDepth))"`
   prints `true`; `npm run check` clean.

2. **Tokens** — create `src/styles/tokens/detector-hero.css` (`--dh-ink`, `--dh-opacity: 0.15`,
   `--dh-stroke: 1.5px`, `--dh-draw-dur: 0.9s`, `--dh-beam-every: 7s`, `--dh-beam-boost`, plus the
   locked motion scalars that CSS consumes); import from `src/styles/main.css`. Values reference
   existing color tokens (`--dh-ink: var(--color-text-ivory)`), never literals.
   → verify: `npm run lint` passes (stylelint + inline-color check).

3. **Apparatus flag** — add `detectorHero: true` to `src/lib/apparatus.ts` (markup boolean). The flag
   gates the **entire** hero transformation, not just the detector SVG: `false` must restore the true
   pre-change text-only hero — a single hero `<h1>`, the tagline in the hero, FeatureBand without the
   duplicated copy. So the Step 6–7 copy restructuring (dual `<h1>` instances, the mobile
   copy-in-card move, and the new copy-layout CSS) is emitted/scoped **only in the flag-on branch**;
   flag-off emits the original single-`<h1>` markup and leaves FeatureBand unchanged. Otherwise a
   flag-off after a failed device pass (Steps 7/10) leaves a broken half-state — a title-only hero
   with its heading stranded in an unstyled FeatureBand — not the pre-change hero the success
   criterion promises. Extend the exact-match expected array in `src/lib/apparatus.test.ts` (the
   `toEqual([...])` flag-name contract) to include `detectorHero` — the test asserts the *exact* key
   set, so a new flag fails it until the fixture is updated (`npm run check` typecheck alone will not
   catch this; only the vitest run does).
   `Contracts:` `apparatus.detectorHero` flag name (apparatus flag-name contract test).
   → verify: `npm test` green (the apparatus flag-name contract now includes `detectorHero`);
   `npm run check` clean; with `detectorHero: false` the built homepage renders the original
   single-`<h1>` text-only hero (no dual heading, no card copy) at mobile, portrait-tablet, and
   desktop widths.

4. **Component** — create `src/components/shared/DetectorHero.astro`: frontmatter imports the
   generator and emits the two static SVGs (desktop + mobile compositions at their locked settings,
   media-gated); inline `<script>` ports the lab's client behavior (responsive rebuild, draw-in,
   scroll depth, drift, pointer ramp, beam via `<use>`, occluder) gated on
   `prefers-reduced-motion`. **Composition selection uses `matchMedia` on the Step-6 shared viewport
   predicate** (the same condition as the CSS media-query gating), *not* the reference's
   element-dimension `pickComp()` — see the Design "Composition switching" note. `aria-hidden="true"`,
   `pointer-events: none`.
   → verify: `npm run build` green; view-source of built homepage shows static SVG paths (no-JS
   baseline exists).

5. **Hero swap** — in `src/pages/index.astro` mount `<DetectorHero />` inside `.hero` (gated on the
   flag); in `homepage.css` delete the `.hero::before` blueprint-grid block; remove the now-orphaned
   `--color-grid-line` (tokens/colors.css) and `--grid-texture-cell` (tokens/spacing.css) after
   grepping that no other consumer exists. One non-consumer reference remains: a comment in
   `src/styles/tokens/case-viewer.css` (~line 21) cites the `--color-grid-line` idiom — update it to
   name only `--color-border-*`, so no dangling token name survives the removal.
   → verify: `grep -rn "grid-line\|grid-texture" src/` returns nothing (the comment reference is
   cleaned too); dev server shows the drawing behind the hero at 15% ivory; draw-in plays once on load.

6. **Desktop hero-copy layout** — the text arrangement must switch on the **exact same composition
   predicate the detector uses**, so copy and drawing never disagree at any viewport. Establish that
   predicate as a single shared source: the detector's locked desktop boundary (locked decision 2 —
   landscape width ≥ the reference file's *exact* breakpoint AND aspect ≥ 0.9; read the exact px from
   `detector-hero-lab.html` / `detector-hero.mjs`, do **not** hard-code a fresh "~640px"). Express it
   once — a CSS custom-media / documented media condition of `min-width` at that exact breakpoint plus
   `(min-aspect-ratio: 9/10)` — and apply it to **every** related rule: `.hero__wordmark` visibility,
   tagline restyle, statement/support layout, and the Step-7 mobile-copy move. `homepage.css`: under
   that desktop predicate hero-copy is a flex row (wordmark left, tagline right, `align-items: center`),
   per the lab; tagline `max-width` ≈ 24em. **Replace** the existing width-only `48em`/`60em`
   breakpoints on these rules with the shared predicate — otherwise a viewport that is desktop-side by
   width but should still read mobile (e.g. iPhone landscape 844×390: width past the detector's
   desktop boundary but the copy layout only triggers at 60em) renders the desktop detector with the
   mobile copy arrangement and breaks the locked slab seating.
   → verify: at 1440px the support text sits right of the wordmark, inside the slab band, clear of
   the grid lines below (failure modes: tagline overlapping fan lines; wordmark escaping the slab
   band; copy wider than the slab); AND at iPhone-landscape (844×390) the desktop detector renders
   *with* the desktop copy row, not the mobile arrangement.

7. **Mobile text move** — **user-gated (visual sign-off on Michael's iPhone).** `homepage.css` +
   `index.astro` + `FeatureBand.astro`: in the mobile composition the statement + support copy live in
   the FeatureBand card, styled rounded/panel/serif-centered per the lab mock; in the desktop
   composition they ride the hero band as today.
   **Markup strategy (server-rendered, no client relocation):** a single `<h1>` cannot occupy two
   sibling components via media queries, and moving the node with client JS would break the no-JS
   baseline (locked decision 7). So emit the heading as **two static instances** — one in the hero,
   one in the FeatureBand card — both server-rendered by the generator/templates, each gated by the
   Step-6 shared composition predicate with `display:none` on the inactive instance. `display:none`
   removes the inactive heading from *both* paint and the accessibility tree, so exactly one accessible
   `<h1>` is active at every breakpoint **with or without JS**. Do not relocate the node with client
   JS. (This mirrors the plan's own two-static-SVG composition-switch pattern.)
   **Accessibility constraint (do not skip):** the heading is the page's only `<h1>` (it wraps the
   statement + support copy); `FeatureBand.astro`'s `<section>` currently carries `aria-hidden="true"`,
   so re-scope that decorative `aria-hidden` to only the card's presentational SVG subtree (the
   `role="presentation"` svg), never the whole `<section>` — otherwise the card-instance heading is
   hidden from assistive tech. The `.hero__wordmark` link is not a heading and cannot substitute for
   it. Michael: "will need to test this more" — land it behind his on-screen judgment, not
   autonomously final.
   → verify: phone viewport shows title-only slab; card carries the statement; desktop band unchanged;
   at each of phone / portrait-tablet / desktop widths **exactly one** visible, accessible `<h1>`
   exists (never zero, never two) — confirmed with JS **enabled and disabled** — and the
   statement/support copy is exposed to assistive tech (inspect the accessibility tree, not just the
   rendered pixels).

8. **Motion QA pass** — with dev server: (a) draw-in once, replayable only via reload; (b) scroll:
   no seam at either slab join at any scroll position; (c) pointer entry/exit glides (~1s ramp, no
   lurch); (d) drift + beam run; (e) `prefers-reduced-motion: reduce` (macOS setting) → static
   drawing, zero animation, no rAF loops (`performance` tab quiet); (f) JS disabled → static SVG
   visible on both widths **and** the mobile copy sits in the card with exactly one accessible `<h1>`
   (verify the no-JS path itself, not only the SVG); (g) portrait tablet (~768×1024) plus a boundary
   sweep — just-below, at, and just-above both the min-width and the aspect boundary: the detector
   composition and the text arrangement always agree (both driven by the one shared viewport
   predicate), the mobile/portrait detector riding with the mobile text arrangement (title-only slab),
   never the desktop 2-col band.
   → verify: each lettered check observed; failure modes enumerated are exactly (a)–(g).

9. **Gates** — `npm run check`, `npm run lint`, `npm test`, `npm run build` all green (the test run
   covers the amended apparatus flag-name contract from step 3); CHANGELOG `[Unreleased]` entry (hero
   swap, blueprint grid retired, tokens/flag added).
   → verify: exit codes 0 captured individually (`cmd; echo exit=$?`).

10. **Device pass** — **user-gated:** Michael judges both compositions on his iPhone + desktop
    (density, seating, drift amplitude, beam subtlety at 120Hz/60Hz). Any retune edits the tokens /
    generator constants only.
    → verify: Michael signs off on both compositions on device; any retune lands only in
    `detector-hero.css` tokens or `detector-hero.mjs` constants (no structural or markup change), then
    the Step 9 gates re-run green.

## Success criteria

- The homepage hero renders the locked object behind the text on both form factors, matching the
  approved lab (reference file) at its locked settings.
- Zero hard-coded style values in components — every color/size/duration a token or generator
  constant (`npm run lint` proves the mechanical subset).
- Reduced-motion and no-JS both show the correct static drawing.
- `apparatus.detectorHero: false` restores the pre-change hero (minus the retired blueprint grid).
- All gates green (`check`, `lint`, `test`, `build`); steps 7 and 10 signed off by Michael on device.

## Implementation deviations

- 2026-07-11 — **Mobile composition fit: contain → cover (width-spanning), Michael's mid-run direction.**
  On the site's hero (≈70svh minus nav — squatter than the lab's 78svh stage) contain-fit let the
  height bind against the mostly-empty 1080×1560 portrait canvas, rendering the object at ~83% of
  screen width; Michael: "the background image is way too small. It needs to span the width of the
  screen, or just about." Cover-fit makes the width bind in any hero squatter than the canvas (every
  real phone), so the slab spans the screen; the vertical crop consumes only empty canvas margin.
  Locked decision 2's "whole object always visible" still holds in practice (the drawn content core
  is far shorter than any phone hero).

- 2026-07-11 — **Mobile canvas centers the drawn content core, not the slab; mobile stage 56svh;
  copy seated by script.** Follow-ons to the cover-fit deviation, all Michael's live direction: the
  fan hangs a grid height below the slab while the stack rises only 0.35 slab heights, so
  slab-centering cover-cropped the fan's bottom on real phones/tablets ("you've now cut off the
  bottom part of that graphic") — the canvas now centers stack-top→fan-bottom, which also buys the
  requested black space above the card. The 70svh mobile stage read as dead space above the title —
  the detector hero runs at 56svh on the mobile composition (desktop keeps 70svh). The mobile
  wordmark centers. The hero copy is seated on the slab's center line by the client script (exact,
  from the live composition), with CSS nudge tokens as the no-JS/reduced-motion approximation.
- 2026-07-11 — **The subtext seat gets its own fit predicate (Michael: "if the hero and its subtext
  can't fit within the slab, the subtext goes into the card below — look at how Anthropic handles
  it").** Anthropic's hero: headline + support side-by-side on desktop; stacked/relocated when the
  row can't fit. Ours: the DRAWING keeps the locked composition predicate (640px + aspect ≥ 0.9),
  but the slab row (wordmark + subtext) only fits where the slab is tall enough — the subtext seats
  in the hero at `(min-width: 48em) and (min-height: 30em) and (min-aspect-ratio: 9/10)` (the site's
  desktop breakpoint, with a height term that keeps landscape phones out: their ~190px hero crops
  the slab too short for the row) and in the FeatureBand card otherwise. So iPhone landscape gets
  the desktop drawing with a title-only slab and the statement in the card. This amends the plan's
  single-predicate copy rule (step 6) — the one-accessible-h1 invariant still holds because both h1
  seats share the SEAT predicate. The ambient loop also now holds until the draw-in settles (a
  depth edge regrown under a stale dasharray rendered as a dotted center line — Michael's report).

- 2026-07-11 — **Scroll-linked depth cut entirely (Michael, on-device: "it looks weird, it makes the
  LEVEL ONE RADIOLOGY text go outside of the box").** The scroll translate slid the slab up while the
  seated hero text stayed put, so the wordmark exited the slab band. `applyDepth`, its scroll
  listener, and `SETTINGS.depthK` removed; locked decision 3's `scrollDepth: true (strength 1.05)`
  reversed. Draw-in, drift, pointer re-focus, and the beam sweep remain the shipped motion set.

## Open questions

- (User-parked) FeatureBand's long-term editorial content once it carries the mobile statement copy.
- (User-parked) The hero-text typography polish session (real faces, sizes, kerning on both seats).
