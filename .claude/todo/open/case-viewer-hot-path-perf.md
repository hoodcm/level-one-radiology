---
id: case-viewer-hot-path-perf
title: Case-viewer hot-path perf items deferred from the /simplify pass
band: next
first_surfaced: 2026-07-07
last_touched: 2026-07-11
assessed: 2026-07-14
depends_on: []
links: [src/components/case/case-viewer.ts, src/components/case/fullscreen.ts]
workstream: case-viewer
---
Two remaining efficiency/altitude findings from the case-viewer review, judged
real but profiling-gated (they change hot-path behavior that only the iPhone
session can validate):

1. `#setFrame` conflates advance/retarget/repaint; splitting an explicit
   `#repaint()` would let it early-out on unchanged frame. The
   repaint-on-unchanged-frame dependency is pinned by a comment at #setFrame
   for now; do the split only with device profiling in hand.
2. `get #store` re-derives `` `${series.key}/${win.key}` `` + Map.get ~4× per
   pointermove. Negligible in isolation — bundle with the above only if
   profiling shows it matters (a cached field must be invalidated on
   window/series switch).

(The third — layout-read/write interleaving in the scrub path — was applied in
the 2026-07-07 polish pass: stage dimensions are now cached by the inline
ResizeObserver and the fullscreen viewport handler, so the per-move handlers
perform zero layout reads. Note for the device pass: CDP LayoutCount stays
~1/frame either way because the counter-text update schedules a normal
render-phase layout — the win is the removed *synchronous* mid-handler reflow,
which that metric can't isolate.)

Done: apply-or-close each with an on-device profiling judgment during (or
after) the device-gated case-viewer pass.

## Additional runtime-robustness scope (folded in, same workstream)
Surfaced by a parallel session's case-viewer sweep — real bugs/gaps, not
hot-path perf, but same files/workstream so kept as one item rather than a
scatter of siblings:

- ~~Fullscreen slider lacks the inline viewer's stall indicator + frontier
  clamp~~ — MOOT: the decoded-frontier clamp was retired entirely (every
  path) 2026-07-11 on live-iPhone-testing evidence that it made the thumb lag
  the finger; there is no more frontier to fall out of sync with (see
  `build-case-viewer-module` notes + CHANGELOG `[Unreleased]`).
- Prefetch fan-out is uncapped (~40 fetches) mid-scrub; needs a ceiling.
- A queued wheel rAF can land after disengage (stale-state write).
- No `inert` behind the fullscreen overlay; no keyboard zoom/TUNE path.
- No warm-decode-on-engage for first-scrub feel (cold first frame).

Done (this scope): each bug fixed or explicitly closed with a written
rationale.

## Notes
2026-07-08 folded in five case-viewer runtime-robustness findings from a
parallel session's sweep (stall/frontier clamp, prefetch fan-out cap, wheel
rAF race, inert/keyboard gaps, warm-decode-on-engage) — same files/workstream,
kept as one item rather than fragmenting.
2026-07-11 closed one of the five: the inline `<input type=range>` slider
path (`case-viewer.ts` `#slider` `input` handler) is now frontier-clamped,
matching the pointer-drag path. The fullscreen slider's own stall
indicator/frontier clamp — plus the other four bullets (prefetch cap, wheel
rAF race, inert/keyboard, warm-decode) — remain open.
2026-07-11 (later same day, live-iPhone-testing session) reversed the above:
the decoded-frontier clamp is retired on every path (thumb/counter now track
input exactly, canvas catches up). This moots the "fullscreen slider lacks
frontier clamp" bullet outright rather than closing it — struck above. Four
bullets remain open: prefetch fan-out cap, wheel rAF race, inert/keyboard gap,
warm-decode-on-first-scrub (distinct from the new `FrameStore.warm()`
sibling-window pre-warm shipped this session, which serves window-toggle, not
first engage).
