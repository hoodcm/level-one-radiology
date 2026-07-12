# Motion Principles

> [← Design system](../README.md)

> The reasoning layer for **animation and transitions** — whether a thing should move, why, and how it
> should feel. Concrete easing/duration values live in [motion.css](../../../src/styles/base/motion.css) and
> [tokens.md](../tokens.md); when a principle here conflicts with a token, **the token wins** — flag it.
> Reduced-motion is the one hard floor and lives in [accessibility.md §5](accessibility.md); this doc never
> overrides it.

This project is **CSS-first**: an IntersectionObserver toggles a class and CSS owns the transition (see
[motion.css](../../../src/styles/base/motion.css)). Reach for JS/spring motion only inside a React island that
genuinely needs interruptible, gesture-driven physics — never as the default.

---

## 0. Two questions before any animation

Answer both *before* writing a keyframe or transition. Most "should I animate this?" cases die here.

**(a) Should this animate at all?** — gate on how often the user sees it.

| Frequency | Decision |
|---|---|
| 100+×/day (keyboard shortcuts, command-palette toggle) | **No animation. Ever.** |
| Tens×/day (hover, list nav) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts, nav open) | Standard animation |
| Rare / first-time (hero entrance, onboarding) | Can add delight |

**Never animate a keyboard-initiated action.** It repeats hundreds of times a day; motion makes it feel
slow and disconnected.

**(b) What is its purpose?** — every animation must answer "why does this move?" Valid answers: spatial
consistency (enters/exits from the same edge it can be dismissed toward), state indication, feedback
(a press the interface acknowledges), or preventing a jarring appear/disappear. "It looks cool" on
something seen often is not a purpose — don't animate it.

---

## 1. Easing comes from a token

- **Default to ease-out** for entrances, exits, and most UI feedback — it starts fast, so it feels
  responsive.
- **Never `ease-in` on UI.** It delays the initial movement — the exact moment the user is watching — so
  a 300ms `ease-in` dropdown *feels* slower than a 300ms `ease-out` one.
- **Use the named tokens, never an inline `cubic-bezier()`** outside `tokens/`/`motion.css`. The built-in
  CSS easings are too weak; the project's curves carry the intent. The curves themselves are defined once
  in [motion.css](../../../src/styles/base/motion.css) — don't restate them here or inline them in components.

| Token | Use for |
|---|---|
| `--ease-out` | Interactive UI feedback — presses, hovers, dropdowns, popovers (the default) |
| `--ease-in-out` | Movement / morphing *on* screen (an element repositioning) |
| `--reveal-ease` | Scroll-into-view reveals — gentler, paired with `--reveal-duration` |

`ease` is acceptable for a bare hover color change; `linear` only for constant motion (marquee, progress).

---

## 2. Duration: stay under 300ms

| Element | Duration |
|---|---|
| Button / press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers, nav open | 200–500ms |
| Scroll reveals, hero entrance | `--reveal-duration` — explanatory, not interactive |

**UI animation stays under 300ms.** A 180ms dropdown feels more responsive than a 400ms one. Perceived
speed *is* speed here: a faster spinner makes a load feel faster at identical load time; an instant
tooltip after the first one opens makes the whole toolbar feel quicker.

---

## 3. Enter and exit

- **Never animate from `scale(0)`.** Nothing in the real world appears from nothing. Start from
  `scale(0.95)` + `opacity: 0` — even a barely-visible initial scale makes the entrance read as natural.
- **Prefer `@starting-style`** for CSS-driven entry over a JS `mounted` flag, where browser support allows.
- **Asymmetric timing.** Slow where the *user* is deciding (a hold-to-confirm), fast where the *system* is
  responding (release snaps back in ~200ms ease-out).
- **Spatial consistency.** A thing enters and exits from the same edge, so a swipe-to-dismiss feels like it
  follows the same path it arrived on.

---

## 4. Pressables and origin-awareness

- **Pressable elements get press feedback:** `:active { transform: scale(0.97); }` (subtle — 0.95–0.98).
  It tells the user the interface heard them. `scale()` carries its children, so content scales with it.
- **Popovers scale from their trigger, not center.** With Base UI, set
  `transform-origin: var(--transform-origin)`. **Modals are the exception** — they aren't anchored to a
  trigger, so they stay `transform-origin: center`.

```css
.button { transition: transform 160ms var(--ease-out); }
.button:active { transform: scale(0.97); }

/* Base UI popover — origin-aware */
.popover { transform-origin: var(--transform-origin); }
```

---

## 5. Performance: animate only transform and opacity

- **`transform` and `opacity` only.** They skip layout and paint and run on the GPU. Animating `width`,
  `height`, `margin`, `padding`, `top`/`left`, or `background-position` triggers layout/paint and drops
  frames. Use `translate`/`scale` instead of geometry, `opacity` instead of `visibility` fades.
- **`transition: all` is banned.** Name the exact properties that change — it documents intent and avoids
  transitioning something expensive by accident.
- **Transitions over keyframes for interruptible UI.** A CSS transition retargets smoothly mid-flight; a
  `@keyframes` animation restarts from zero. Use transitions for anything rapidly re-triggered (toggles,
  stacking toasts); keyframes only for predetermined, one-shot motion (the hero rise).

---

## 6. Reduced motion is the floor

Every animation needs a `prefers-reduced-motion: reduce` path — this is non-negotiable and owned by
[accessibility.md §5](accessibility.md). Reduced motion means *fewer and gentler*, not zero: keep opacity
and color transitions that aid comprehension; drop movement and position changes. No essential information
may be conveyed by motion alone.

---

## 7. Implementation patterns (reference)

Lower-frequency recipes — reach for these when a section calls for it, not by default.

- **Stagger** grouped entrances with a short per-item delay (30–80ms; the project uses `--reveal-stagger`
  via an inline `--reveal-index`). Longer delays feel slow. Stagger is decorative — never block interaction
  on it.
- **Gate hover motion** behind `@media (hover: hover) and (pointer: fine)` so touch devices don't fire it
  on tap.
- **`clip-path: inset(…)`** drives reveals, hold-to-confirm fills, and comparison sliders without extra DOM
  and stays GPU-accelerated.
- **Blur to mask an imperfect crossfade** — a subtle `filter: blur(2px)` during a state swap blends two
  overlapping states into one. Keep blur < 20px (expensive in Safari).
- **Springs / gestures** (momentum dismissal, damping at boundaries, pointer capture) belong only in a
  React island that needs interruptible physics — not in CSS-owned motion.

---

## Quick audit checklist

Before shipping motion:

1. **Animate at all?** — not on a keyboard-initiated or 100×/day action; it has a stated purpose?
2. **Easing** — from a token (`--ease-out` / `--reveal-ease`), never inline `cubic-bezier`, never `ease-in` on UI?
3. **Duration** — UI motion < 300ms; reveals on `--reveal-duration`?
4. **Enter** — from `scale(0.95)` + opacity, never `scale(0)`?
5. **Pressables** — `:active` scale feedback; popovers origin-aware, modals centered?
6. **Properties** — only `transform`/`opacity`; no `transition: all`; no animated geometry?
7. **Interruptible** — transitions (not keyframes) for anything rapidly re-triggered?
8. **Reduced motion** — a `prefers-reduced-motion` path for every animation?
