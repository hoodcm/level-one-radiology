# Case Viewer Loading HUD — Prototype

**Source:** [case-viewer-loading-hud.html](case-viewer-loading-hud.html) — self-contained, runnable in any browser.

A proof-of-concept for the Case Viewer showstopper. The loading sequence sets up an x-ray image inside a console-like frame, overlays a HUD reticle (grid + center modules + corner brackets), then clears the HUD after the viewer is ready. Dragging the viewer adjusts contrast and brightness in real time, mimicking PACS window/level.

This is intended as reference for the production Case Viewer component (see [COMPONENT-LIBRARY.md](../COMPONENT-LIBRARY.md) → Showstopper).

---

## The core tricks

### 1. The "infinite pixel" frame

The console frame doesn't use a separate dark layer. Instead, a second copy of the same x-ray image is stretched so that its **top-left pixel** fills the whole background:

```css
.dynamic-bg-layer {
  background-image: url('<same image>');
  background-position: 0% 0%;
  background-size: 20000%;          /* zoom top-left pixel to cover */
  background-repeat: no-repeat;
  image-rendering: pixelated;       /* no blur — solid color */
}
```

When the user drags to adjust window/level, **the same CSS filter is applied to both** the x-ray image and the background layer. The frame always matches the image's current tonality — the "film" behind the exam never looks wrong because it's literally made from the same film.

```js
function updateFilters() {
  const filter = `grayscale(100%) contrast(${c}) brightness(${b})`;
  xray.style.filter = filter;
  bgLayer.style.filter = filter;   // frame matches image, always
}
```

This is the signature move. Keep it.

### 2. Staggered HUD entrance

The HUD is a single SVG overlay with two exit groups (early / late) and five entrance animations. Timings:

| Element | Animation | Duration | Delay | Easing |
|---|---|---|---|---|
| Grid crosshairs | `cut-in` | 100ms | 50ms | `steps(1, jump-end)` |
| Center rect 1 | `slow-flicker` | 400ms | 0ms | `steps(1, jump-start)` |
| Center rect 2 | `slow-flicker` | 400ms | 75ms | `steps(1, jump-start)` |
| Side panels (L/R) | `slow-flicker` | 400ms | 100ms | `steps(1, jump-start)` |
| Corner brackets (4) | `snap-*` | 350ms | 100ms | `cubic-bezier(0.1, 1.5, 0.92, 1.0)` |

The brackets use `cubic-bezier(0.1, 1.5, 0.92, 1.0)` — a curve that **overshoots past 1.0 and settles back**. They slide in diagonally from each corner (±40px, ±40px) with a brief flicker (opacity 1 → 0 → 1) along the way. That flicker is the detail that makes it feel like real targeting-reticle acquisition and not a generic slide-in.

### 3. Image + background fade-in

Both the x-ray and its matched background layer fade in together at 250ms with `cubic-bezier(0.7, 0, 0.84, 0)` over 400ms. The HUD overlays arrive during that same window so the reticle lands on an image that's already showing.

### 4. HUD exit (when viewer is ready)

Two exit groups stagger the dismissal so the HUD doesn't vanish all at once:

```css
.exit-group-early { animation: fade-out 400ms ... 350ms forwards; }   /* grid, center, panels */
.exit-group-late  { animation: fade-out 400ms ... 450ms forwards; }   /* corner brackets */
```

The brackets hold 100ms longer than the interior — the reticle "dismisses" from inside out.

### 5. Drag-to-adjust window/level

Mouse-down on the frame captures the starting position and current filter values. Mousemove recomputes:

```js
currentContrast   = dragStartContrast   + deltaX * -0.002;   /* right = less contrast */
currentBrightness = dragStartBrightness - deltaY *  0.008;   /* down = less brightness */
```

Clamped to `[0, 5]` for contrast and `[0, 3]` for brightness. This is real PACS behavior — you should be able to sit a radiologist down at this and have them feel at home.

---

## Integration plan

### Where it goes

Per the architecture in [COMPONENT-LIBRARY.md](../COMPONENT-LIBRARY.md):

```
src/components/case/
  ├── CaseViewer.jsx             # React island — main viewer + drag logic
  ├── CaseViewerHUD.jsx          # SVG overlay — grid, panels, brackets
  ├── CaseViewerFrame.astro      # Wrapper (Astro) — slot for content
  └── case-viewer.css            # Keyframes + .console-frame + .hud-element classes
```

The loading animation lives inside `CaseViewer.jsx` as a first-paint sequence that plays once per mount. After the exit animations complete, the HUD is `display: none`'d and the drag handlers take over.

### What needs to change for production

1. **Drop `<script src="https://cdn.tailwindcss.com">`.** The prototype pulls Tailwind from a CDN; the repo uses Tailwind v4 via `@tailwindcss/vite`. No change needed — the prototype doesn't actually use any Tailwind classes, that script tag can just be removed.

2. **Replace the hardcoded image URL** (`http://bones.getthediagnosis.org/images/hand_15_1.png`) with a prop. The Case Viewer receives `src` (or a stack of sources) from the article's frontmatter.

3. **Port inline `<style>` to a CSS module** at `src/styles/components/case-viewer.css`, importing from `src/styles/main.css`.

4. **Convert drag listeners to React.** Use `useRef` for the frame + image + bg elements; use `useState` for contrast/brightness; attach `onMouseDown` on the frame and `mousemove`/`mouseup` on window (add/remove in `useEffect`).

5. **Add touch events.** The current prototype is mouse-only. Mirror `mousedown/move/up` with `touchstart/move/end` for mobile. Single-finger drag = window/level; pinch = zoom (future).

6. **Respect `prefers-reduced-motion`.** All entrance animations should be disabled or collapsed to a single fade:

   ```css
   @media (prefers-reduced-motion: reduce) {
     .xray-image, .dynamic-bg-layer { animation-duration: 150ms; }
     .hud-element, .anim-grid, .exit-group-early, .exit-group-late {
       animation: none !important;
       opacity: 0;     /* HUD skips entirely */
     }
   }
   ```

7. **Reconcile colors with the design tokens.** The prototype uses raw hex (`#050505`, `#1a1a1a`, `#000`, `#333`). Map to tokens:

   | Prototype | Token |
   |---|---|
   | `#050505` (body) | `var(--color-bg-deepest)` — `#0B0A08` |
   | `#000` (frame fallback) | `var(--color-bg-deepest)` |
   | `#1a1a1a` (24px frame border) | `var(--color-bg-raised)` — `#232220` (slightly warmer, matches warmth formula) |
   | `#333` (outer 2px ring) | `var(--color-border-strong)` at alpha |
   | `white` (HUD strokes) | `var(--color-text-ivory)` or plain white — **keep white** since HUD is an overlay on imaging |
   | Stroke drop-shadow | Unchanged — `rgba(255, 255, 255, 0.4)` reads correctly on dark imaging |

8. **Accessibility.** The frame needs `role="application"` with `aria-label="X-ray viewer. Click and drag to adjust contrast and brightness."` and keyboard bindings: arrow keys for W/L, `0` to reset, `Home`/`End` for first/last slice (when stacks land).

9. **Annotations layer.** The current HUD layer is loading-only. The production viewer needs a second always-visible SVG overlay for annotations (Signal Cyan strokes on imaging). Keep them in separate `<svg>` elements so HUD can exit without affecting annotations.

### What stays verbatim

- **Frame dimensions and double-border treatment** (24px `#1a1a1a` border + 2px `#333` ring via `box-shadow` + inset shadow + drop shadow). This is the "console" look.
- **All keyframes** — `fade-in`, `fade-out`, `slow-flicker`, `cut-in`, and the four `snap-*` variants.
- **Animation timings and delays.** They're tuned; don't round them.
- **`image-rendering: pixelated` on the background layer.** Without this the zoomed pixel blurs and the illusion breaks.
- **Sensitivity values for drag** (`SENSITIVITY_X = -0.002`, `SENSITIVITY_Y = 0.008`) — feel right at typical monitor sizes.
- **Clamp ranges** for contrast (`[0, 5]`) and brightness (`[0, 3]`).

### Open questions for future iteration

- **Slice navigation:** the prototype is one image. The production viewer handles stacks (scroll wheel / keyboard / swipe). Does slice navigation show any HUD element (slice number, position indicator)?
- **HUD re-appearance:** after exit, should the HUD come back on focus or hover? Or is it strictly loading-only?
- **Window/level presets:** radiologists have keyboard shortcuts for bone / soft-tissue / lung windows. Add preset buttons? Keep the minimalism?
- **Annotations:** arrows, circles, text labels that toggle on/off. How do they co-exist with the HUD during loading?
- **Two-up comparison:** synchronized scrolling across two stacks. Does each side get its own HUD entrance, or do they share?

---

## Running the prototype locally

```bash
open docs/prototypes/case-viewer-loading-hud.html
```

Click and drag anywhere inside the frame to adjust window/level. Refresh to replay the loading animation.
