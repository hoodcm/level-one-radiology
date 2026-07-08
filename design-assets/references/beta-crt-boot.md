# Beta-site CRT boot-up overlay — preserved animation source

**What this is.** The carefully-tuned CRT "power-on" overlay from the first attempt at
this site (`github.com/hoodcm/beta-level-one-radiology`, the old beta.leveloneradiology.com).
Tapping a post card launched a full-screen overlay that **switched on like a CRT** — a hairline
horizontal scanline snapped open to a rectangle, the rectangle pinched to a rounded card, content
faded in, and closing ran the sequence in reverse (collapse to a line, cut to black). A yellow-phosphor
scanline texture drifted over everything the whole time.

Kept here as **substrate**: a known-good motion vocabulary to point at when we want another element
(e.g. the case-viewer lock-in, a modal, a page transition) to *feel like* a CRT switching on.
This is a reference, not wired into the current build — values are copied verbatim; nothing imports it.

**Provenance (beta repo):**
- `tailwind.config.ts` → `keyframes` + `animation` (the timings/easings below, verbatim)
- `src/components/CRTPreviewOverlay.tsx` → the phase state machine + scanline overlay markup
- `src/styles/animations.css` → `body.crt-active` scroll-lock

---

## The choreography (why the numbers are what they are)

Four beats, driven by a `phase` state machine (`'rect' → 'card' → 'exit'`):

1. **Switch-on** (`crtRect`, 300ms ease-out). Element starts as a near-zero-height line at full
   width (`scaleY(0.01) scaleX(1)`) and **holds flat for the first 50%** — the "warming up" dwell.
   Then it springs open: full height at 70%, overshoots narrow-and-tall at 80%, settles to the final
   card box (`scaleY(0.75) scaleX(0.7)`, `border-radius: 1rem`). The overshoot at 80% is the whole
   trick — it reads as CRT geometry snapping into place, not a plain scale.
2. **Content in** (`crtContentFadeIn`, 150ms `cubic-bezier(0.8,0,1,1)`). Fires on `onAnimationEnd`
   of the rect. Slides in from `translateX(-10px)` with a hard ease-in curve — content "arrives"
   rather than dissolving.
3. **Scanlines** (`scan`, 1s linear infinite). A 4px-period yellow gradient scrolls its background
   position `0 0 → 0 4px` forever underneath — the persistent phosphor shimmer.
4. **Switch-off** (`crtRectReverse`, 150ms ease-out — half the on-duration, so it snaps shut faster
   than it opened). Card → brief re-widen at 20–30% → collapse back to the `scaleY(0.01)` line →
   cut. Fires on Escape / click-outside; `onAnimationEnd` tears the overlay down.

Mobile variants (`crtRectMobile` / `crtRectReverseMobile`) settle to a larger card
(`scaleY(0.9) scaleX(0.9)`) since a phone has less room to inset. Reverse timing is identical.

**No `prefers-reduced-motion` guard existed in the beta.** If reused, add one (collapse to a plain
opacity fade) — consistent with the current repo's motion discipline (`src/styles/base/motion.css`).

---

## Keyframes — verbatim, as plain CSS

```css
/* ---- Switch-on: line → overshoot → settle to card ---- */
@keyframes crtRect {
  0%, 50% { transform: scaleY(0.01) scaleX(1);   border-radius: 0; }
  70%     { transform: scaleY(0.7)  scaleX(1);   border-radius: 1rem; }
  80%     { transform: scaleY(0.8)  scaleX(0.6); border-radius: 1rem; }
  100%    { transform: scaleY(0.75) scaleX(0.7); border-radius: 1rem; }
}
@keyframes crtRectMobile {
  0%, 50% { transform: scaleY(0.01) scaleX(1);   border-radius: 0; }
  70%     { transform: scaleY(0.7)  scaleX(1);   border-radius: 1rem; }
  80%     { transform: scaleY(0.95) scaleX(0.8); border-radius: 1rem; }
  100%    { transform: scaleY(0.9)  scaleX(0.9); border-radius: 1rem; }
}

/* ---- Switch-off: card → re-widen → collapse to line ---- */
@keyframes crtRectReverse {
  0%       { transform: scaleY(0.75) scaleX(0.7); border-radius: 1rem; }
  20%      { transform: scaleY(0.8)  scaleX(0.6); border-radius: 1rem; }
  30%      { transform: scaleY(0.7)  scaleX(1);   border-radius: 1rem; }
  80%,100% { transform: scaleY(0.01) scaleX(1);   border-radius: 0; }
}
/* crtRectReverseMobile is identical to crtRectReverse (same reverse geometry). */

/* ---- Content arrival ---- */
@keyframes crtContentFadeIn {
  0%   { opacity: 0; transform: translateX(-10px); }
  100% { opacity: 1; transform: translateX(0); }
}

/* ---- Persistent phosphor scanline drift ---- */
@keyframes scan {
  0%   { background-position: 0 0; }
  100% { background-position: 0 4px; }
}

/* ---- Animation bindings (duration · easing · fill) ---- */
/* crtRect               : 300ms ease-out forwards                       */
/* crtRectMobile         : 300ms ease-out forwards                       */
/* crtRectReverse        : 150ms ease-out forwards                       */
/* crtRectReverseMobile  : 150ms ease-out forwards                       */
/* crtContentFadeIn      : 150ms cubic-bezier(0.8, 0, 1, 1) forwards     */
/* scan                  : 1s   linear infinite                          */
```

## Scanline texture (the yellow-phosphor field)

```css
/* Beta used tailwind bg-scanlines + bg-[length:100%_4px] + animate-scan.
   Overlaid full-screen, pointer-events:none, above the rect. */
.crt-scanlines {
  background-image: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 0, 0.08) 0px,
    rgba(255, 255, 0, 0.08) 2px,
    transparent 2px,
    transparent 4px
  );
  background-size: 100% 4px;
  animation: scan 1s linear infinite;
}
```
> If ported here, the yellow `rgba(255,255,0,0.08)` becomes a token
> (`src/styles/tokens/**`) — the current repo bans inline colors.

## Phase machine (from `CRTPreviewOverlay.tsx`, distilled)

```
open  → phase 'rect'  → render .animate-crtRect
        onAnimationEnd → phase 'card' → render content .animate-crtContentFadeIn
close (Esc / click-outside) → phase 'exit' → render .animate-crtRectReverse
        onAnimationEnd → unmount overlay, onClose()
```
Scroll was locked while open: `body.crt-active { overflow:hidden; position:fixed; width:100%; height:100% }`
(plus a `touchmove` guard against pinch-scroll).

---

## Pointing another element at this

The transferable ideas, ranked by how CRT-specific they are:

- **The dwell-then-snap:** hold the collapsed state for the first half of the timeline, then open —
  this is what makes it read as "powering on" rather than "growing."
- **The overshoot beat** (80% narrow-and-tall before settling) — geometry snapping, borrowed weight.
- **Asymmetric on/off** — off runs at half the on-duration; switching off should feel curter.
- **Persistent scanline drift** decoupled from the geometry — the texture lives regardless of state.

For the **case-viewer lock-in** specifically (`src/styles/components/case-viewer.css` `@keyframes cv-lock-in`),
the existing lock already uses an overshoot-and-settle (`0 → 100 → 70 → 100`); the CRT counterpart to
borrow would be the **dwell-then-snap entrance** and the **scanline field over the imaging black**, not
the lock geometry itself.
