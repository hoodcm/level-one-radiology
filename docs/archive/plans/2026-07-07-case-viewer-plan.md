# Case Viewer — Implementation Plan

*Output of the 2026-07-07 /brainstorm session. Supersedes
`docs/plans/2026-07-07-case-viewer-brief.md` (the pre-brainstorm requirements
capture). Design was researched (three parallel research passes: radiology web
viewers live-tested, general-web scrubber/lightbox patterns read at source
level, mobile/canvas engineering with browser-support facts), then hardened by
a fresh-context adversarial skeptic whose confirmed findings are folded in.
Ready for /implement-plan.*

## Context & why

Level One Radiology (static Astro site, GitHub Pages, dark token-driven design
system, markdown articles) needs its showstopper: **scrollable CT/MR stacks
embedded inline in articles**, so readers scrub through an exam the way
radiologists do. Existing web viewers (Radiopaedia, DICOM viewers, dicomtube)
glitch, fight page scroll, and dissuade readers. Success is defined by two
words: **ironclad** (zero layout shift, zero flicker, no scroll hijack, no
decode stalls, bounded memory) and **mobile-first** (the primary reader is on
an iPhone, driving with a thumb).

Frames are **pre-exported de-identified JPEGs** (≤1200px long edge, ~30–90 per
series), never DICOM. v1 ships **one presentation mode**: the inline figure —
series/window switching within a study, caption, maximal image area, slight
HUD console framing — plus a fullscreen mode with pinch zoom and a
brightness/contrast TUNE.

## Locked decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | One presentation mode in v1: inline figure | User: bare imaging construct must be ironclad before variants (unknown-case block, comparison, scrollytelling all deferred) |
| 2 | **Progressive-engage gesture model** | Horizontal drag + slider always work (`touch-action: pan-y` resolves the axis conflict natively); click-to-engage unlocks vertical PACS scrub with page scroll held. Fallback if the device spike shows mode confusion: ship horizontal-only by deleting the engage layer — it is additive code |
| 3 | **Light-DOM custom element `<case-viewer>`**, framework-free | Upgrades in place inside markdown-rendered HTML (no MDX, no island-mounting layer, no React runtime on article pages); matches the FeatureBand house pattern; light DOM so design tokens cascade in |
| 4 | **Build-time directive expansion** | remark plugin reads the case manifest during `astro build` and emits the full static shell → zero CLS by construction, zero runtime JSON fetches, real no-JS/RSS story, missing manifest fails the build loudly |
| 5 | **`ImageBitmap` store + 2D-canvas render as primary**; persistent-`<img>` src-swap as fallback | `img.decode()` guarantees decoded-data residency only ~one frame (WHATWG); Safari purges non-painted images, so only `createImageBitmap` + explicit `close()` makes the LRU memory bound *real*. A `ResizeObserver` redraw makes canvas blank-on-resize structurally impossible. Spike judges feel; the memory architecture is not spike-jurisdiction |
| 6 | Direct 1:1 mapping, integer snap, **zero momentum**; scrub position **clamps to the decoded frontier** | Precision instrument, not a toy (field evidence: SpriteSpin rejected inertia; cloudimage defaults it off). Frontier clamp means the counter can never assert a slice the screen isn't showing |
| 7 | Zoom is fullscreen-only; **a second finger on the inline image promotes to fullscreen** | Keeps the inline gesture surface single-purpose; rewards the most instinctive gesture on a medical image instead of letting it die against `pan-y`. Fallback if promotion is janky on device: `touch-action: pan-y pinch-zoom` (honest page zoom) |
| 8 | Fullscreen = `position: fixed` overlay on iPhone; real Fullscreen API on desktop/iPadOS | Element fullscreen on iPhone Safari is Apple-WONTFIX. Overlay: `100dvh`, `visualViewport`-sized, safe-area padded, fixed-body scroll lock, **popstate as the single close authority** |
| 9 | W/L answer: **window-variant chips inline** (pre-baked exports, frame index preserved exactly) + **TUNE in fullscreen only** (CSS filter drag, prototype math, resets on close) | Zero client pixel math inline; TUNE is honestly a render adjustment (`TUNE C 1.2 · B 0.9` readout, never "W/L"); reset-on-close avoids an inline/fullscreen split-brain |
| 10 | **Two-level manifest schema**: `series[]` (plane/geometry) × `windows[]` (variants) | Window switch at slice 34 must land on slice 34 — that index *is* the pedagogy; true series switches reset. A flat list cannot express this |
| 11 | Slider = **restyled native `<input type="range">`** | Custom ARIA-div sliders are documented-broken for iOS VoiceOver adjustment; native input gives VO adjustability + APG keyboard free. Decorative tick rail is `aria-hidden` |
| 12 | Frames: JPEG-only v1, ≤1200px long edge, EXIF/metadata stripped at ingest | De-identification happens at export — Michael's clinical workflow, not the tool's job. EXIF strip is free hygiene. Content-review tooling deliberately not built (see Non-goals) |
| 13 | **Edge dead-zones (~28px)** on coarse pointers; **inline height cap 70svh** | iOS/Android system edge-back-swipes beat `touch-action`; the cap guarantees tap-outside/scroll surface always exists (tall sagittal stacks letterbox on the imaging field) |
| 14 | Asset URLs go through a **base-URL indirection** (default `/cases/`); GitHub Pages serves v1 | Pages ceilings are real (1GB site, 100GB/mo, ~10-min cache max-age). Migration trigger: bandwidth warning or ~50 published series → flip base URL to a CDN origin, zero article edits |
| 15 | Boot choreography = the existing loading-HUD prototype; reduced-motion collapses it to a fade; **scrub itself is exempt** from reduced-motion | The wait is brand; 1:1 user-driven frame substitution is not authored motion (WCAG-consistent reading) |
| 16 | Engaged accent = `--color-signal-cyan`; keyboard focus = gold `--color-focus` | Cyan = imaging-active in the token semantics; two meanings, two colors |

## Design

### Architecture & data flow

```
AUTHORING (once per case)                BUILD (astro build)                     RUNTIME (reader's phone)
─────────────────────────                ───────────────────                     ────────────────────────
~/exports/ct-abd-001/*.jpg          ::case[caption]{id="ct-abd-001"} in .md
        │                                        │
        ▼                                        ▼
scripts/build-case.mjs              remarkCaseViewer reads
  resize ≤1200px · strip EXIF       public/cases/ct-abd-001/manifest.json
  number 001..N · gen poster        at build time → emits FULL STATIC SHELL:
  write manifest.json     ────►     <case-viewer> + aspect-ratio box            ──► poster paints (no JS, zero CLS)
        │                           + poster <img loading=lazy> + meta strip            │ IO: near viewport
        │                           + counter + range slider + chips + caption          ▼
        ▼                                        │                               case-viewer.ts upgrades:
public/cases/ct-abd-001/            plugin stamps hasCaseViewer into            boot HUD ▸ warm bitmap window
  manifest.json                     remarkPluginFrontmatter →                   ▸ gesture engine live
  axial/{soft,lung}/001..048.jpg    [slug].astro loads element script
  axial/poster.jpg                  only on articles that need it
```

- The element's script loads once per page, conditionally (same mechanism as
  `minutesRead`: the plugin stamps derived frontmatter; no author-maintained
  flag exists).
- Build validation: manifest missing → build error; a frame file the manifest
  references missing on disk → build error. That is the whole list — it exists
  so a published stack can never stall on a 404, not to police content.

### Manifest schema (`public/cases/<id>/manifest.json`)

```json
{
  "id": "ct-abd-001",
  "title": "CT abdomen/pelvis · closed-loop obstruction",
  "modality": "CT",
  "base": "/cases/ct-abd-001/",
  "rev": 3,
  "series": [
    {
      "key": "axial",
      "label": "AXIAL",
      "plane": "axial",
      "frames": 48,
      "width": 1024,
      "height": 1024,
      "start": 23,
      "windows": [
        { "key": "soft", "label": "SOFT TISSUE", "pattern": "axial/soft/{nnn}.jpg" },
        { "key": "lung", "label": "LUNG",        "pattern": "axial/lung/{nnn}.jpg" }
      ],
      "poster": "axial/poster.jpg"
    }
  ]
}
```

- `windows[]` within a series share geometry and frame count — switching
  preserves the current index exactly. Switching `series[]` resets to that
  series' `start` (author-chosen key image; default 1).
- `base` is the asset indirection (decision 14). `rev` bumps on regeneration
  (staleness guard, step 9 probes the Astro cache behavior).

### Gesture engine (inline)

| State | touch-action | Behavior | Exit |
|---|---|---|---|
| `rest` | `pan-y` | vertical drag → page scrolls natively; horizontal drag (10px axis race) → `scrub-h`; **second pointer down → fullscreen**; `click` on image → `engaged` | — |
| `scrub-h` | `pan-y` | 1:1 horizontal scrub, `setPointerCapture`, `pointercancel` = pointerup (frame holds) | release |
| `engaged` | `none` | either axis scrubs (vertical = PACS axis); page held; brackets full + cyan; ✕ visible | ✕ · click outside · Esc · IO scroll-out |
| `fullscreen` | `none` | vertical scrub · pinch zoom fit→4× · pan when zoomed · double-tap fit↔2× · TUNE | ✕ · Esc · back gesture (popstate) |

- Engage binds to the **`click` event** (browsers suppress click on
  scroll-stopping taps — the momentum-stop tap can't accidentally engage);
  chrome controls (⛶, chips, slider) are excluded from the engage target;
  closing fullscreen returns to `rest`, never `engaged`.
- Axis race: cumulative `|Δx|` vs `|Δy|` to 10px (PhotoSwipe's hysteresis);
  vertical win at rest = do nothing (compositor is already scrolling).
- `pxPerFrame = clamp(containerWidth / frameCount, 8, 24)` — the primary
  spike-tuning knob.
- Edge dead-zones: pointer-downs starting within ~28px of the screen's left or
  right edge (coarse pointers only) are ignored — system back gestures pass.
- Desktop: hover never captures wheel. Click = engage; engaged wheel steps
  frames (`deltaY` read before `deltaMode` — Firefox order quirk), steps
  capped per animation frame (trackpad inertia bounded), swallowed at stack
  edges (disengage is always explicit). Cursors `grab`/`grabbing`. Keyboard
  rides the native range input: arrows ±1, PageUp/Down ±5, Home/End.

### Frame store & decode pipeline

- **Store**: fetch blob → `createImageBitmap` → `Map<index, ImageBitmap>`.
  LRU cap **12 resident** (~50MB worst case at 1024²), evicted bitmaps get
  explicit `.close()`. Decode-ahead current ±6, direction-weighted. 4
  concurrent fetches; `AbortController` cancels stale queued fetches; a
  **generation token** discards stale decode resolutions (a slow frame can
  never overwrite a newer one).
- **Render**: 2D canvas `drawImage` blit (no detach, atomic), backing store
  `cssWidth × devicePixelRatio` (cap 3), `ResizeObserver` redraws the current
  frame on any resize. Fallback mode behind the same FrameStore interface:
  persistent `<img>` + `decode()`-gated src swap — shipped only if the spike
  shows canvas artifacts.
- **Frontier clamp**: effective scrub position never exceeds the decoded
  frontier ± a small elastic; outrunning decode feels like slight weight, and
  counter + image move together always.
- **Tiers**: poster (static HTML, ~96px blur-up) → interaction window (IO
  near-viewport: boot HUD plays while start frame + neighbors decode) →
  background fill of the **active window's remaining frames only**, at
  `fetchpriority=low`, gated on **sustained interaction** (≥8 distinct frames
  scrubbed — `navigator.connection.saveData` is respected where it exists but
  iOS Safari doesn't have it, so interaction is the real gate). Other windows/
  series fill on first switch.
- Far out of viewport: store flushes to poster + current frame. Fetch failure:
  hold last good frame, backoff retry, subtle stall glyph in the counter.

### Chrome & design language

```
   CT · AXIAL · SOFT TISSUE                IM 23/48     ← meta strip (mono 10px, .figure-meta voice)
⌐                                                  ¬    ← corner brackets, ivory ~0.35 at rest;
                                                          full opacity + cyan accent when engaged
              [ slice on --color-imaging-black ]
                                                        ← ✕ top-right, engaged/fullscreen only
└                                                  ┘
────────●───────────────────────────────────  ⛶        ← restyled <input type=range> + fullscreen btn
SOFT TISSUE · LUNG                                      ← window chips (index-preserving); series tabs
Portal venous phase at the transition point.            ← figcaption, existing prose style
```

- No border — dark-on-dark needs none (chrome is a contrast decision; the
  brackets + meta strip *are* the "slight HUD framing").
- Mobile: **edge-to-edge full-bleed**, height capped at 70svh. Desktop: capped
  at `--media-column` (880px).
- Counter `IM 23/48` in mono is the persistent affordance. A one-shot
  two-frame settle-nudge after boot ships behind a flag — the spike judges it.
- Boot: port the prototype's keyframes/timings **verbatim** (grid flicker,
  bracket snap with overshoot, staggered exit), colors mapped to tokens per
  `design-assets/prototypes/case-viewer-loading-hud.md` §"What needs to
  change". Reduced motion: single fade, no nudge.
- All values are tokens; new ones (bracket opacity, chrome sizes, dead-zone
  inset, cyan accent usage) are **added to `src/styles/tokens/`** and
  referenced — `npm run lint` + the token hook enforce.

### Fullscreen & TUNE

- iPhone: fixed overlay — `100dvh`, sized off `visualViewport` (handles a
  page-pinch-zoomed entry), `env(safe-area-inset-*)` padding, fixed-body
  scroll lock (capture `scrollY`, restore on close), boomerang focus trap,
  `role="dialog"`.
- History machine: `pushState` on open; **popstate is the single close
  authority** — ✕/Esc call `history.back()`; teardown order: close → unlock
  body → restore scrollY. Forward-swipe must not resurrect a dead overlay.
- Gestures inside: vertical drag scrubs; pinch fit→4×; one-finger pan when
  zoomed (slider still scrubs at any zoom); double-tap fit↔2×; **no
  swipe-down-dismiss** (collides with vertical scrub).
- TUNE chip: drag → CSS filters, order pinned `contrast() brightness()`,
  ΔX → contrast (−0.002/px, clamp **0.3–3**), ΔY → brightness (0.008/px,
  clamp **0.4–2.5**) — floors, never zero (a gray/black void reads as
  breakage). RESET chip when non-neutral; double-tap in TUNE resets; **resets
  on overlay close**. Readout: `TUNE C 1.2 · B 0.9`.

### Accessibility

- Range input = the semantic scrubber (VO-adjustable natively);
  `aria-valuetext` = "Image 23 of 48"; labeled by case title. Decorative rail
  ticks `aria-hidden`. No `aria-busy` choreography (deleted — VO users adjust
  via the input, where value feedback is wanted).
- Window chips = radiogroup; series tabs labeled; all buttons ≥44px hit area.
- Fullscreen: dialog semantics, focus trap, focus return.
- VoiceOver-on-iPhone smoke check happens **in the spike** (10 min), not at
  the end.

## Design trade-offs / Non-goals

- **React island** — rejected: no path from markdown-rendered HTML to island
  hydration without MDX migration or a hand-rolled mounter; React unused in
  the pointermove hot path; ~45KB runtime on the pages that must be fastest.
  Cores (gesture/store) are plain modules a future island could wrap.
- **Canvas-first was *adopted*, img-first rejected** after the skeptic showed
  `decode()`'s residency guarantee is ~one frame and Safari purges non-painted
  images — the img path cannot honor the memory bound. Blank-on-resize (the
  field's canvas complaint) is closed by ResizeObserver redraw.
- **Sprite sheets / video-as-stack** — research-settled dead ends (all-or-
  nothing decode ≈369MB for 60 frames; Safari can't seek frame-accurately).
- **Page-scroll-driven scrub (pinned scrollytelling)** as the primary model —
  NN/g-documented disorientation, worst on mobile; deferred as a possible
  one-off showcase treatment, never the workhorse.
- **True window/level math** — 8-bit baked JPEGs can't re-window; pre-baked
  window exports + TUNE is the honest version.
- **Client-side pinch-zoom inline** — gesture-conflict surface; second finger
  promotes to fullscreen instead.
- **Swipe-down-to-dismiss fullscreen** — collides with vertical scrub.
- **External asset origin now** — premature at launch scale; base-URL
  indirection ships instead, with a named migration trigger (decision 14).
- **Ingestion review/validation tooling** (contact sheets, review.html
  apparatus, PHI gates, content checks) — rejected by Michael as
  over-engineering: the ingest is content-agnostic (a stack of cat photos
  must work identically), de-identification is his export-time clinical
  workflow, and previewing the case in the working viewer on the dev server
  *is* the frame-by-frame review. A plan-refiner run proposing this
  apparatus was stopped mid-loop; do not reintroduce it.
- **Deferred to v2 by explicit user choice**: unknown-case reveal block,
  comparison pair, pinned scroll-showcase, annotations/measurement,
  linked-series sync, cine export, text→image deep links (CaseStacks
  pattern), WebP output flag.

## Files to read first

1. `/Users/michael/GitHub/level-one-radiology/docs/plans/2026-07-07-case-viewer-plan.md` — this plan
2. `/Users/michael/GitHub/level-one-radiology/design-assets/prototypes/case-viewer-loading-hud.md` — boot choreography spec (+ the `.html` beside it, runnable)
3. `/Users/michael/GitHub/level-one-radiology/src/lib/markdown-plugins.mjs` — plugin conventions (remarkCallouts = the directive pattern; remarkReadingTime = the frontmatter-stamp pattern)
4. `/Users/michael/GitHub/level-one-radiology/src/components/shared/FeatureBand.astro` — house pattern: vanilla script, rAF-throttled scroll, reduced-motion gate
5. `/Users/michael/GitHub/level-one-radiology/src/styles/components/prose.css` — `.figure-meta` (lines ~211–231), figure/caption styles the chrome must speak
6. `/Users/michael/GitHub/level-one-radiology/src/styles/tokens/colors.css` + `spacing.css` + `typography.css` + `src/styles/base/motion.css` — the token vocabulary
7. `/Users/michael/GitHub/level-one-radiology/src/pages/articles/[slug].astro` — where the conditional script loads
8. `/Users/michael/GitHub/level-one-radiology/docs/design/components.md` — Showstopper section (updated in step 12)
9. `/Users/michael/GitHub/level-one-radiology/astro.config.mjs` — plugin wiring

## Reuse

- `remark-directive` already wired (`astro.config.mjs:22`); follow
  `remarkCallouts` for AST handling and `remarkReadingTime` for frontmatter
  stamping — no new dependency.
- `.figure-meta` styles for the meta strip; `figcaption` styles as-is.
- Motion tokens (`--ease-out`, `--reveal-*`) and prototype keyframes
  (ported per its own integration doc).
- `--media-column`, `--space-*`, `--radius-*`, signal-color tokens.
- FeatureBand's IO/reduced-motion/progressive-enhancement structure.
- `sharp` (new devDependency, ingestion only — never shipped to client).

## Steps

Milestone gates: each milestone ends green before the next begins.
**User-gated** steps need Michael's phone/eyes and are never run autonomously.

### M1 — Gesture spike (throwaway, answers the riskiest questions first)

1. **Synthetic stack generator** — `/Users/michael/GitHub/level-one-radiology/scripts/dev-make-synthetic-stack.mjs`:
   sharp-drawn 48-frame stack (frame number, drifting circle, noise — scrub
   direction visually obvious) → `public/cases/dev-synthetic/`, two fake
   "windows" (inverted variant) to exercise chips. Install `sharp` here.
   → verify: 48+48 JPEGs + poster exist; `ls public/cases/dev-synthetic/axial/soft | wc -l` = 48.
2. **Spike page** — `/Users/michael/GitHub/level-one-radiology/src/pages/dev/gesture-spike.astro`,
   dev-only (404s in prod build). One page, toggles for: render path
   (bitmap-canvas vs img-swap) · gesture model (progressive-engage vs
   horizontal-only) · `pxPerFrame` (live slider) · edge dead-zones on/off ·
   settle-nudge on/off; plus a second-pointer detection probe (logs whether
   two-finger-down is reliably observable under `touch-action: pan-y`) and a
   restyled `<input type=range>` prototype for the VO check.
   → verify: `npm run dev -- --host` serves it on LAN; all toggles function in desktop DevTools touch emulation; prod build excludes it.
3. **User-gated: on-device judgment session** (Michael's iPhone). Pass/fail
   criteria, enumerated — each is a distinct failure shape:
   (a) a tap that stops momentum scroll does **not** engage;
   (b) sloppy diagonal horizontal drags never die mid-scrub (pointercancel handled);
   (c) the engaged state is unmistakable at arm's length;
   (d) escape is always reachable (outside-tap surface exists at 70svh cap; ✕ hits at 44px);
   (e) at rest, vertical drag scrolls the page 100% of attempts;
   (f) chosen render path shows zero flicker at fastest thumb scrub;
   (g) a `pxPerFrame` value is chosen;
   (h) second-pointer detection fires reliably;
   (i) VoiceOver can focus and adjust the range prototype.
   → verify: decision record (gesture model kept/fallback, render path, pxPerFrame, nudge y/n) appended to this plan + CHANGELOG `[Unreleased]`. Spike page/synthetic generator are deleted in M5 unless promoted.

### M2 — Ingestion & schema

4. **`/Users/michael/GitHub/level-one-radiology/scripts/build-case.mjs`** —
   `npm run case:build -- --in <folder> --id <case-id> [--series axial:AXIAL]
   [--window soft:"SOFT TISSUE"]`: resize ≤1200px long edge, strip all
   metadata, number `001..N`, generate poster (~96px), write manifest (schema
   above, `rev` auto-bumped). Content-agnostic by design: a folder of cat
   photos ingests and scrubs identically to a CT series.
   `Contracts:` manifest schema (series[]/windows[] shape) · `case:build` CLI flags.
   → verify: run against a scrambled copy of the synthetic frames; manifest validates; EXIF confirmed stripped (`exiftool` spot-check).

### M3 — Core element

5. **Pure logic modules + micro-harness** —
   `/Users/michael/GitHub/level-one-radiology/src/components/case/` gets
   `mapping.ts` (px→frame, clamp, frontier elastic), `frame-store.ts` (LRU,
   generation tokens, decode-ahead ordering, abort) as DOM-free modules;
   minimal vitest harness (first tests in the repo — keep the harness tiny).
   `Contracts:` mapping + store module APIs.
   → verify: `npx vitest run` green — tests cover: LRU never exceeds 12 + evicted bitmaps closed; stale generation resolutions discarded; frontier clamp never exceeds decoded index; pxPerFrame clamp bounds.
6. **`case-viewer.ts` element** — gesture engine (state table above, click-
   engage with chrome exclusion, 10px axis race, capture, cancel-as-up, edge
   dead-zones, wheel capped/engaged-only, IO lifecycle: near→boot+warm,
   far→flush, out→disengage), canvas render (dpr cap 3, ResizeObserver
   redraw), range-input wiring, chips/tabs (window switch preserves index;
   series switch → `start`), background-fill gating (≥8 distinct frames).
   → verify: spike page swapped to the real element; DevTools touch emulation passes (a)–(e) shapes from step 3; Safari Timelines shows stable memory across a 500-frame scrub loop (no monotonic growth).
7. **remarkCaseViewer + conditional script + CSS** — plugin in
   `markdown-plugins.mjs` (build-time shell emission, manifest read +
   frame-file existence check, `hasCaseViewer` stamp), registered in
   `astro.config.mjs`; `[slug].astro` loads the element script only when
   stamped; `src/styles/components/case-viewer.css` (tokens only, new tokens
   added to `src/styles/tokens/`) imported via `main.css`.
   `Contracts:` `::case[caption]{id}` directive syntax · emitted shell DOM/attribute names.
   → verify: `src/content/articles/style-gallery.md` embeds `::case[Synthetic test stack.]{id="dev-synthetic"}`; `npm run build` green; `npm run lint` green (token gate); no-JS render (JS disabled) shows poster + meta + caption; deleting the manifest fails the build; deleting any frame file fails the build.
8. **Boot choreography port** — prototype keyframes/timings verbatim into
   `case-viewer.css`, colors→tokens per the prototype doc's mapping table;
   reduced-motion collapses to fade.
   → verify: boot plays once at ~50% IO on the style-gallery embed; DevTools `prefers-reduced-motion` emulation shows plain fade; Lighthouse CLS = 0 on the article.
9. **Astro content-layer staleness probe** — regenerate the synthetic case
   (48→60 frames) **without** touching the embedding `.md`; run dev + build.
   → verify: rendered shell reflects 60 frames in both. If stale: fold the manifest into the entry digest (or clear the content-layer cache in `case:build`) and re-verify; record the finding in CHANGELOG.

### M4 — Fullscreen & TUNE

10. **Fullscreen overlay** — visualViewport sizing, dvh + safe-area, scroll
    lock/restore, focus trap, popstate close-authority machine, real
    Fullscreen API on desktop/iPadOS; vertical scrub, pinch fit→4×,
    pan-when-zoomed, double-tap fit↔2×, inline second-pointer promotion.
    → verify (desktop emulation first): history entry consumed on every close path (✕, Esc, back) — forward-nav never resurrects the overlay; body scroll position restored exactly.
11. **TUNE mode** — chip, filter drag (floors 0.3/0.4, order pinned), RESET,
    readout, reset-on-close.
    → verify: drag to all four extremes — image never becomes a uniform field; readout matches computed filter; closing + reopening fullscreen shows neutral.
12. **User-gated: fullscreen device pass** (Michael's iPhone) — enumerated
    shapes: back-gesture closes overlay not page; edge-swipe during pan
    doesn't dismiss (dead-zones); rotation relayouts cleanly; entering while
    page-pinch-zoomed sizes correctly; pinch-promotion from inline feels
    continuous; TUNE drag feels PACS-plausible.
    → verify: decision record appended to plan + CHANGELOG.

### M5 — Polish, docs, real case

13. **A11y pass** — VO full-flow on device (**user-gated**): scrub via
    adjustable slider, window/series switch, fullscreen in/out; contrast
    check on chrome text; `forced-colors` smoke look.
    → verify: every interactive control reachable and operable with VO; documented in CHANGELOG.
14. **Docs to as-built** — rewrite `docs/design/components.md` Showstopper
    section (describe + point to tokens/CSS, no value restating); add the
    authoring guide to `docs/content.md`-adjacent writing docs: directive
    syntax, caption micro-copy convention ("Scroll through the exam…"),
    curation guidance (short, hand-picked runs), a one-line
    de-identification-at-export note; delete spike page + synthetic generator
    (or explicitly promote); CHANGELOG entry.
    → verify: `npm run build` + `npm run lint` green; no doc restates a token value.
15. **User-gated: first real case** — Michael exports 1–2 de-identified
    series; `case:build` ingests; embed in style-gallery or the first target
    article; final on-device judgment on real anatomy.
    → verify: the embed scrubs ironclad on real images on the real phone — the only gate that matters.

## Success criteria

- On-device scrub on Michael's iPhone: zero visible flicker, zero page-scroll
  capture outside the engaged state, counter never disagrees with the image.
- Lighthouse on an article with one embed: CLS = 0; article JS untouched on
  case-less articles.
- Safari memory timeline flat across a sustained scrub loop; overlay
  open/close restores scroll exactly.
- `npm run build` fails on: missing manifest, manifest/disk frame mismatch.
- `npm run lint` green — every chrome value is a token.
- VoiceOver can operate scrub, switch, fullscreen end-to-end on iPhone.
- vitest micro-harness green (mapping/store contracts).

## Implementation deviations

- **2026-07-07 — user-gated steps pending.** Steps 3, 12, 15 and the VoiceOver
  portion of 13 need Michael's phone and were not run autonomously. All
  implementation proceeded on the plan's locked/primary choices
  (progressive-engage, bitmap-canvas, auto pxPerFrame, settle-nudge behind a
  `data-nudge` flag, default off). The decision records those sessions produce
  are still to be appended here + CHANGELOG.
- **2026-07-07 — spike artifacts retained, not deleted in step 14.** The device
  sessions haven't run, so `/dev/gesture-spike` (now hosting the real element
  in section 1, the original inline prototype in section 2 for A/B) and the
  synthetic generator stay until the gates pass. Delete-or-promote moves to
  the post-device-session follow-up.
- **2026-07-07 — spike page is a dynamic route** (`src/pages/dev/[spike].astro`
  with `getStaticPaths` returning `[]` in prod), not `gesture-spike.astro` —
  the Astro-native way to make prod builds emit nothing under /dev/.
- **2026-07-07 — frontier measured from the CURRENT frame, both directions**
  (not from drag-start, forward-only, as written): under LRU eviction the
  drag-start frontier collapses once frames between start and current evict,
  yanking the scrub backwards — caught in emulation. The store protects the
  current frame from eviction, so current-frame frontier is stable.
- **2026-07-07 — step 9's staleness surfaced early (step 7) and the remedy is
  two-layered**: `caseAwareGlob` loader (manifest-`rev`-keyed invalidation,
  live in dev via a public/cases watcher — the plan's "fold into the digest"
  option) plus an `astro:build:start` validation integration (covers frame
  files deleted without a rev change, where cached renders would sail
  through). The interim "clear the content-layer cache in case:build" remedy
  was replaced by the rev mechanism.
- **2026-07-07 — TUNE (step 11) lives inside `fullscreen.ts`** rather than a
  separate module — same overlay, same gesture surface.
- **2026-07-07 — boot choreography split from decode warming**: warm/flush at
  the 600px IO tier, the choreography fires once at ~50% visibility (a
  600px-early boot would play unseen). Structural core of `case-viewer.css`
  landed with step 6 (the element needed layout to be verifiable).
- **2026-07-07 — post-implementation review hardening (commits `715daca`,
  `16cc949`).** The Phase-10 code review (recall-biased, adversarially
  verified) surfaced 13 findings; 10 fixed: decode-handler controller-identity
  guards in `frame-store.ts` (+1 regression test, suite 26/26), a global (not
  per-store) LRU memory bound across window/series switches, stall retry
  re-arming at capped 4s backoff while near-viewport, mouse-scrub click-engage
  suppression, single scrub-owner pointer tracking, idempotent fullscreen
  close (`#closing`), caption-less/single-quoted `::case` accepted by
  `CASE_DIRECTIVE_RE`, recursive build-start article walk, HUD glow
  tokenized. The /simplify pass unified the scrub pipeline on
  `frameForDrag(frontierFn)`, deduped CSS (focus rules, counters, fullscreen
  slider), and made `nnn` the shared frame-filename contract. Three hot-path
  perf items deferred to the device pass: `.claude/todo/open/case-viewer-hot-path-perf.md`.

## Open questions (genuinely downstream only)

- **CDN migration timing** — trigger named in decision 14; not a v1 action.
- **WebP output flag** in `case:build` once Safari-floor comfort allows —
  pure size win, schema-compatible.
- **v2 candidates** (explicit user deferral): unknown-case reveal block ·
  comparison pair · pinned scroll-showcase · annotations · linked-series
  sync · text→image deep links.
