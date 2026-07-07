---
id: build-case-viewer-module
title: Build Case Viewer showstopper module
band: now
first_surfaced: 2026-06-23
last_touched: 2026-07-07
depends_on: []
links: [src/components/case/, docs/design/components.md, docs/archive/plans/2026-07-07-case-viewer-plan.md]
worktype: build
assessed: 2026-07-07
---
Build the Case Viewer — the "showstopper module," a PACS-like image viewer for
clinical cases embedded within articles. Light-DOM custom element
`<case-viewer>` (not a React island — see the archived plan), mobile-first,
built and code-reviewed. Michael: "the mobile-first image viewer is key."

Implementation is substantially complete (mapping/frame-store/case-viewer/
fullscreen modules, boot choreography, TUNE, build-time manifest pipeline,
review hardening, /simplify pass) and is live-embedded in a published article
(`src/content/articles/window-and-level.md`), but that embed is a TEMPORARY
synthetic demo case (`::case{id="dev-synthetic"}`) standing in for the
on-device test surface — swapping it for a real clinical case is step 15
below, not a separate deliverable.

Remaining scope is purely the four **user-gated, device-only** steps from
`docs/archive/plans/2026-07-07-case-viewer-plan.md` (Steps section) — none
are autonomous:
- Step 3 — on-device gesture-spike judgment (Michael's iPhone)
- Step 12 — fullscreen device pass
- Step 13 — VoiceOver full-flow a11y pass
- Step 15 — first real clinical case (replaces the synthetic embed above)

Done: all four device-gated steps pass on Michael's iPhone and the real-case
embed (step 15) is live.

## Notes
2026-07-07 materially advanced (not done): /code-review (10 findings fixed,
715daca), /simplify (16cc949), review hardening recorded in the archived plan
(397408e), viewer embedded live with a synthetic demo case in a published
article (3dad68e). Remaining scope narrowed to the four device-gated steps
(3, 12, 13, 15) — implementation itself is done pending those gates.
