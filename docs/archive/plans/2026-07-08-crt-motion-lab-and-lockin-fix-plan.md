# CRT motion lab + case-viewer lock-in jitter fix

> Plan status: ready for plan-refiner / implement-plan. Author: brainstorm session 2026-07-08.

## Context & why

Two linked goals from one session:

1. **Fix the case-viewer lock-in jitter.** The corner brackets (`.cv__brackets i`) jump/stutter
   at image-stack ends and on rapid tap-engage/disengage. Root cause (confirmed against source): **three
   writers share the single `transform` property** — the `cv-lock-in` keyframe (engaged recoil), the
   `cv-edge` keyframe (end-of-stack tick, fires repeatedly), and a base `transform` transition. CSS
   `@keyframes` restart from zero on re-trigger and collide with the transition; the cascade drops one
   mid-flight. This is exactly the failure [`motion.md §5`](../design/reasoning/motion.md) warns about.

2. **Preserve the beta site's CRT "power-on" boot as a replayable exhibit.** The calibrated switch-on
   choreography is preserved as source in
   [`design-assets/references/beta-crt-boot.md`](../../design-assets/references/beta-crt-boot.md). Michael
   tuned its morph geometry, snappiness, and beat timing by hand; the exhibit must reproduce that **feel**
   faithfully. It becomes substrate to point future motion work at (and to decide, later, where CRT-style
   motion earns a home on the real site).

Both land on **one dev-only lab page** that hosts the real `<case-viewer>` element, so the lock-in fix is
tuned against production behavior and the CRT sits beside it for comparison.

**A brainstorm session already ran, including a fresh-context adversarial skeptic.** The skeptic
**disqualified** an earlier Web Animations API (WAAP) approach — `commitStyles()` writes an inline
`matrix()` that shadows the `var()`-driven resting transform and would freeze disengage. The plan below is
the corrected, CSS-only approach. Do not reopen the WAAP path (see Non-goals).

## Locked decisions

- **Lock-in fix = CSS property-channel split.** Drive the lock/inset on the independent **`translate`**
  longhand; keep the edge-tick on **`transform`**. They are separate, separately-animatable properties
  that *compose*, so the three-way fight dissolves without moving anything to JS. — *Dissolves the literal
  root cause (shared property) with minimal blast radius; keeps the recoil as keyframes; stays CSS-first.*
- **Recoil is kept**, authored as keyframes on the `translate` channel (final frame == engaged resting
  translate, so it composes with the held state). — *Michael built the video-game recoil deliberately; the
  friction note confirms non-monotonic motion needs keyframes.*
- **CRT boot = CSS `@keyframes`, faithful to the feel, re-expressed to satisfy repo rules.** One-shot
  predetermined motion → keyframes (motion.md §5). — *Same medium as the substrate; exact scale geometry
  and beat timing reproduced; only the banned mechanics re-expressed (see next).*
- **Re-express, don't byte-copy, three things the beta did that this repo bans:** the `scan` drift moves
  from `background-position` to `transform: translateY` (animating `background-position` is banned,
  motion.md §5); durations, easings, and the scanline color become tokens (inline literals banned).
- **CRT assets are self-contained and deletable** in `src/styles/components/crt-boot.css` +
  `src/pages/dev/motion/[view].astro`, imported only by the lab page — never wired into the global bundle
  or the real site. — *It's an exhibit; it must not pollute the global palette/SSOT.*
- **Surface = a new minimal dev-spike page**, dev-gated via `getStaticPaths() → []` in prod, `noindex`. Do
  **not** extend the existing throwaway `dev/[spike].astro`. — *Isolated, deletable, no inherited baggage.*
- **CRT is exhibit-only this pass.** Not wired into the real viewer launch (that's future lab work).

## Design

### Component 1 — lock-in channel split (the fix)

The brackets currently compose the lock into `transform` and animate it three ways. The split moves the
**position** (rest ↔ engaged inset) onto `translate`, leaving `transform` free for the **edge tick**.

Current values (unchanged): `--cv-bracket-lock: 3px`, `--cv-edge-tick: 2px`, `--cv-lock` flips `0px ↔
var(--cv-bracket-lock)` on `data-state='engaged'`, `--sx/--sy` are per-corner sign pairs
([`tokens/case-viewer.css`](../../src/styles/tokens/case-viewer.css)).

**Before → after** ([`src/styles/components/case-viewer.css`](../../src/styles/components/case-viewer.css) ~L204–288):

```css
/* BASE — position moves to the `translate` channel */
/* before */
.cv__brackets i {
  --cv-lock: 0px;
  transform: translate(calc(var(--sx) * var(--cv-lock)), calc(var(--sy) * var(--cv-lock)));
  transition: opacity .15s ease, border-color .15s ease;
}
/* after */
.cv__brackets i {
  --cv-lock: 0px;
  translate: calc(var(--sx) * var(--cv-lock)) calc(var(--sy) * var(--cv-lock));
  transition: opacity .15s ease, border-color .15s ease;
}

/* ENGAGED — unchanged: --cv-lock flips; the `translate` longhand picks it up */
case-viewer[data-state='engaged'] .cv__brackets i {
  opacity: 1; border-color: var(--color-signal-cyan);
  --cv-lock: var(--cv-bracket-lock);
}

/* NO-PREFERENCE — transition the `translate` channel, not `transform` */
/* before: transition: …, transform .2s var(--ease-out);  →  after: … translate .2s var(--ease-out); */

/* LOCK-IN RECOIL — same 0→100→70→100 beats, now on `translate` */
@keyframes cv-lock-in {
  0%   { translate: 0 0; animation-timing-function: ease-in; }
  40%  { translate: calc(var(--sx) * var(--cv-lock)) calc(var(--sy) * var(--cv-lock));
         animation-timing-function: ease-out; }
  68%  { translate: calc(var(--sx) * var(--cv-lock) * .7) calc(var(--sy) * var(--cv-lock) * .7);
         animation-timing-function: ease-in-out; }
  100% { translate: calc(var(--sx) * var(--cv-lock)) calc(var(--sy) * var(--cv-lock)); }
}

/* EDGE TICK — now expresses ONLY its delta on `transform`; composes over the `translate` lock */
@keyframes cv-edge {
  40% { transform: translate(calc(var(--sx) * var(--cv-edge-tick)), calc(var(--sy) * var(--cv-edge-tick))); }
}
```

Why this ends the jitter: `translate` (lock/recoil) and `transform` (edge tick) are now **different
properties**. An edge keyframe restarting from zero can no longer stomp the lock's channel, and the base
transition is on `translate` only — no property is written by two things at once. The recoil keyframe's
final frame equals the engaged resting `translate`, so lock-in → held state hands off seamlessly.

**Reduced motion (preserved):** the no-preference `@media` block still gates the `translate` transition +
`cv-lock-in`; the base rule places the lock instantly via `--cv-lock`. `#edgeCue` still bails under
reduced-motion in JS ([`case-viewer.ts:300`](../../src/components/case/case-viewer.ts)). **No JS changes.**

### Component 2 — CRT boot exhibit (faithful-feel replica)

New self-contained [`src/styles/components/crt-boot.css`](../../src/styles/components/crt-boot.css):

- **Tokens (scoped, exhibit-only, documented as such):** `--crt-on: 300ms`, `--crt-off: 150ms`,
  `--crt-content: 150ms`, `--crt-scan: 1s`; `--crt-content-ease: cubic-bezier(.8,0,1,1)`;
  `--color-crt-scanline: rgba(255,255,0,.08)`. (Off-duration is deliberately half the on-duration — the
  switch-off snaps shut faster than it opens.)
- **Keyframes reproduced verbatim in geometry/beats** from `beta-crt-boot.md`: `crtRect` /
  `crtRectMobile` (the switch-on morph, with the 80% overshoot beat that reads as CRT geometry snapping),
  `crtRectReverse` (switch-off collapse to a line), `crtContentFadeIn`. `transform-origin: center` set
  explicitly (the beta relied on Tailwind's default). **Both size variants + breakpoint** carried over —
  the absolute overshoot distance scales with the box, so a single variant would not feel the same on
  phone vs desktop.
- **`scan` re-expressed:** a taller repeating-gradient layer (period 4px) animated with
  `transform: translateY(0 → 4px)` instead of `background-position` — identical visible drift, GPU-safe.
- **Reduced-motion path (new; the beta had none):** collapse the whole sequence to a plain opacity fade.

**Known, deliberate deviation:** `--crt-content-ease` is an `ease-in` curve, which motion.md §1 bans "on
UI." Kept because it is load-bearing for the reference feel and this is a one-shot exhibit boot (motion.md
§0 "rare/first-time → can add delight"), not interactive UI. Flagged here so it is not silent.

### Component 3 — the lab page

New `src/pages/dev/motion/[view].astro` (nested dynamic route; no collision with `dev/[spike].astro`).
`getStaticPaths()` returns `[{ params: { view: 'lab' } }]` only in DEV → `/dev/motion/lab/`. `<meta
name="robots" content="noindex">`. Imports `main.css` + `crt-boot.css`.

- **Section A — CRT exhibit.** A `POWER ON` button re-runs the switch-on → card → switch-off phase machine
  (rect → card → exit, mirroring `beta-crt-boot.md`) by restarting the animation classes. A link/caption
  points at the preserved reference for side-by-side comparison.
- **Section B — lock-in stress harness.** The **real** `<case-viewer>` on the real build-time shell (reuse
  `caseShellHtml` + the `public/cases/dev-synthetic` manifest, as `dev/[spike].astro:15-16` does). Buttons
  wired to the element's public surface to *exercise the exact jitter paths*: force engage / disengage,
  jump to IM 1, jump to IM N, and a "rapid re-tap ×5" burst. Watch the corners.

```
/dev/motion/lab/
├─ A · CRT BOOT EXHIBIT      [POWER ON ▸]   → replayable switch-on/off
│     (faithful-feel replica; link → beta-crt-boot.md)
└─ B · LOCK-IN STRESS        real <case-viewer>
      [engage][disengage][◀ IM 1][IM N ▶][re-tap ×5]
      → corners must show zero jump; recoil still reads
```

## Design trade-offs / Non-goals

- **WAAP / any JS-driven lock-in** — rejected. `commitStyles()` writes an inline `matrix()` that shadows
  the `var()`-driven resting transform → disengage freezes; it's a net-new paradigm in a file that owns no
  WAAP today; motion.md §5 + the friction note both point to CSS. Do not reopen.
- **CSS "isolate via nested element"** (the brainstorm runner-up) — rejected in favor of the property-channel
  split, which needs *no* extra DOM: `translate`/`transform` already give two independent channels.
- **Drop the recoil for a monotonic settle** — rejected: loses the deliberate video-game feel.
- **Minimal patch (just delete the base transition)** — rejected: leaves `cv-lock-in` and `cv-edge` still
  sharing `transform`; patchwork on a structurally shared property.
- **Public article / standalone HTML prototype** for the page — rejected: article = shipping/voice
  obligation; standalone HTML = a CSS copy that drifts from the real component.
- **Wiring CRT into the real viewer launch / reconciling it with the existing HUD boot** — deferred by
  choice (exhibit-first). The lab enables this exploration later.
- **CRT byte-verbatim copy** — rejected: `background-position` animation, inline `cubic-bezier`, and inline
  color are banned here; the replica is faithful to *feel*, re-expressed for the rules.

## Files to read first

- [`src/styles/components/case-viewer.css`](../../src/styles/components/case-viewer.css) L195–288 — the
  bracket/lock-in/edge block being rewritten.
- [`src/styles/tokens/case-viewer.css`](../../src/styles/tokens/case-viewer.css) — `--cv-bracket-lock: 3px`,
  `--cv-edge-tick: 2px` and friends (unchanged; referenced by the keyframes).
- [`src/components/case/case-viewer.ts`](../../src/components/case/case-viewer.ts) `#edgeCue` (L293-303),
  `#setState` (L384-391) — confirm no JS change is needed (it isn't).
- [`design-assets/references/beta-crt-boot.md`](../../design-assets/references/beta-crt-boot.md) — the CRT
  source of truth (keyframes, timings, phase machine, scanline).
- [`src/pages/dev/[spike].astro`](../../src/pages/dev/[spike].astro) — the dev-gating idiom +
  `caseShellHtml` embed pattern to mirror (a *new minimal* page, not an extension).
- [`docs/design/reasoning/motion.md`](../design/reasoning/motion.md) §5/§6 — the rules the design obeys.

## Reuse

- **`caseShellHtml` + `public/cases/dev-synthetic/manifest.json`** for the Section B embed —
  `dev/[spike].astro:9,15-16`.
- **The dev-gating idiom** (`getStaticPaths() → import.meta.env.DEV ? [...] : []` + `noindex`) —
  `dev/[spike].astro:11-13,23`.
- **Existing tokens** (`--cv-bracket-lock`, `--cv-edge-tick`, `--sx/--sy`, `--color-signal-cyan`,
  `--ease-out`) — the lock-in rewrite references them, defines no new lock-in token.

## Steps

1. **Channel-split the base + engaged rules.** In `case-viewer.css`, change `.cv__brackets i` `transform:
   translate(…)` → `translate: … …`, and the no-preference `transform .2s` transition → `translate .2s
   var(--ease-out)`. Leave the engaged `--cv-lock` flip as-is.
   → **verify:** engage in dev — brackets slide inward to the cyan lock; disengage — they slide back out
   (no stick). Covers the failure mode the rejected WAAP path had (frozen disengage).
2. **Rewrite `cv-lock-in` onto `translate`** (0→100→70→100 beats, keyword per-beat easings preserved),
   final frame == engaged translate.
   → **verify:** engaged lock shows the hit → recoil-to-70% → settle; no snap at animation end (seamless
   hand-off to the held state).
3. **Reduce `cv-edge` to its tick delta on `transform`.**
   → **verify:** at rest, an edge hit nudges the corners inward ~2px from 0 and returns; while engaged, the
   same hit nudges ~2px *beyond* the lock and returns — the tick composes over the lock, not replacing it.
4. **Build the lab page** `src/pages/dev/motion/[view].astro` (dev-gated, noindex) with Section B: real
   `<case-viewer>` embed + the engage/disengage/IM-1/IM-N/re-tap×5 controls wired to the element.
   `Contracts:` lock-in bracket motion is now interruptible-safe (bug-fix behavior).
   → **verify (the jitter goal, enumerated):** on the lab page, (a) hammer engage/disengage rapidly →
   **zero** visible jump; (b) scrub to IM 1 and IM N repeatedly → the edge tick fires cleanly, no stutter
   into/out of the lock; (c) tap-engage *while a disengage is mid-return* → no jump. All three are the
   distinct shapes of the reported jitter; a fix that clears only (a) is insufficient.
5. **Author `crt-boot.css`** (scoped tokens + keyframes, both size variants, `scan` as `translateY`,
   reduced-motion opacity fallback) and Section A of the lab page (POWER ON replay + reference link).
   → **verify (fidelity):** replay side-by-side with `beta-crt-boot.md`'s documented sequence — the line
   dwells then snaps open, overshoots narrow-and-tall at ~80%, settles to the rounded card; switch-off
   snaps shut faster than it opened. Capture a screencap of the on-sequence for the craft-iteration record.
6. **Reduced-motion + build gate.**
   → **verify:** with `prefers-reduced-motion: reduce`, the lock places instantly (no recoil), the edge
   tick is suppressed, and the CRT collapses to an opacity fade. `npm run build` emits nothing under
   `/dev/`; `npm run lint` passes; `npm run dev` serves `/dev/motion/lab/`.

## Success criteria

- **Jitter gone:** the three stress paths in Step 4 (rapid engage/disengage, repeated stack-end hits,
  re-engage-during-return) show no visible jump; the recoil still reads as a recoil.
- **CRT feel faithful:** the replayed switch-on is indistinguishable in timing/snappiness from the beta
  reference, on both a desktop and a narrow viewport.
- **Contained & deletable:** dev-only (`astro build` emits nothing under `/dev/`); CRT assets import only
  into the lab page; lint green; no new global-palette token.

## Open questions

None blocking. Genuinely downstream (surface later if pursued): whether/where CRT-style motion earns a home
on the real site (viewer launch, page transitions, nav) — the exhibit exists to inform that, and it's out
of scope by the exhibit-first decision.

## Implementation deviations

- **2026-07-08 — the channel split alone does not make the lock channel interrupt-safe.** Browser-verified
  (Chrome, `getAnimations()` probe): a `translate` transition never starts while a CSS animation touches the
  property, so a disengage landing inside the 220ms `cv-lock-in` window snaps ~2.7px (no return transition),
  and — cascade-confirmed — the `.is-edge` rule *replaces* the engaged rule's `animation` shorthand, so every
  stack-end tick while engaged replayed `cv-lock-in` from zero (3px snap; the dominant reported jitter).
  User-approved resolution: (1) pure-CSS animation-list fix now — a combined `.is-edge[data-state='engaged']`
  rule lists `cv-edge, cv-lock-in` so the lock-in's name persists and never replays; tuned recoil preserved
  verbatim; residual: state flips <200ms apart can still snap (measured 2.74px worst in a synthetic 90ms
  burst). (2) The lab page additionally hosts a **Prototype B** toggle — translate transition-only + recoil
  as a JS-stamped delta animation on `transform` (mirroring `.is-edge`) — structurally zero-snap, judged by
  eye against the verbatim recoil; promoted only if the feel is indistinguishable.
