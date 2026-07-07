---
id: case-viewer-hot-path-perf
title: Case-viewer hot-path perf items deferred from the /simplify pass
band: next
first_surfaced: 2026-07-07
last_touched: 2026-07-07
assessed: 2026-07-07
depends_on: []
links: [src/components/case/case-viewer.ts, src/components/case/fullscreen.ts]
---
Three efficiency/altitude findings from the case-viewer review were judged real
but not mechanically safe to apply before the device-gated verification pass
(they change hot-path behavior that only the iPhone session can validate):

1. Layout-read/write interleaving forces a synchronous reflow per scrub frame —
   `#ppf()`/`fitCanvas` read `clientWidth` right after `#syncReadout` DOM
   writes (case-viewer.ts), and fullscreen `#redraw` reads
   `getBoundingClientRect()` after `#syncFrame` writes. Fix shape: cache stage
   dimensions in the existing ResizeObserver / viewport callbacks and pass them
   through (mind the 0×0 window before the first RO callback).
2. `#setFrame` conflates advance/retarget/repaint; splitting an explicit
   `#repaint()` would let it early-out on unchanged frame. The
   repaint-on-unchanged-frame dependency is pinned by a comment at #setFrame
   for now; do the split only with device profiling in hand.
3. `get #store` re-derives `` `${series.key}/${win.key}` `` + Map.get ~4× per
   pointermove. Negligible in isolation — bundle with the above only if
   profiling shows it matters (a cached field must be invalidated on
   window/series switch).

Done: apply-or-close each with an on-device profiling judgment during (or
after) the device-gated case-viewer pass.
