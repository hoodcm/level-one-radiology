---
id: build-case-viewer-module
title: Build Case Viewer showstopper module
band: now
first_surfaced: 2026-06-23
last_touched: 2026-07-11
depends_on: []
links: [src/components/case/, docs/design/components.md, docs/archive/plans/2026-07-07-case-viewer-plan.md]
worktype: build
workstream: case-viewer
assessed: 2026-07-11
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
2026-07-08 raised the stakes on Step 3 (on-device gesture-spike judgment): the
polish pass added tap-to-activate (behind `apparatus.caseTapToActivate`), so
Step 3 now must confirm real-finger tap-vs-drag discrimination (not just the
Playwright pointer-event emulation), plus Safari support for the `cv-lock-in`
engaged-bracket keyframe animation (worst-case fallback: a clean move-and-lock
without the impact-recoil, no dead motion).
2026-07-08 independently reconfirmed by a second sweep this session: the
`window-and-level` embed is still the synthetic dev fixture in production —
same open item as step 15 above, no new work.
2026-07-08 further polish raises Steps 3 and 12 again: a second latch
(`apparatus.caseTapToBoot`) now holds the viewer inert/greyed behind an
ACTIVATE button until tapped, so Step 3 must confirm real-finger discrimination
on *both* the activate tap and the tap-to-scrub engage; fullscreen dropped the
native Fullscreen API entirely for an overlay-only CRT switch-on/off
transition, so Step 12 must confirm that choreography on-device (in addition
to the `cv-lock-in` Safari fallback already noted). Icon library switched to
Lucide (inlined via new `src/lib/case-icons.mjs`; `@tabler/icons-react`
dropped) — cosmetic, no new device-gate implication. Implementation still
substantially complete; remaining scope unchanged (steps 3, 12, 13, 15).
2026-07-11 further interaction polish this session (unified button design
system, per-icon hover micro-motion, W/L X-Y pad replacing the numeric TUNE
readout, tap-again-to-release engaged state) plus a new demo article
(`src/content/articles/using-the-case-viewer.md`) — confirmed still embedding
the synthetic `dev-synthetic` case, not a real one, so step 15 is still open.
Remaining scope unchanged (steps 3, 12, 13, 15); all still device-gated,
none autonomous.
2026-07-11 live-iPhone-testing session shipped 4 fixes verified on-device:
scrub now follows the finger 1:1 (decoded-frontier clamp retired on every
path), fullscreen tap-out no longer jumps the inline image (new `sync`
controller hook), contrast chip animates into its locked state on tap, and
the INVERTED window chip no longer stalls (`FrameStore.warm()` sibling
pre-warm). This is real progress on Step 3 (gesture/tap discrimination) and
Step 12 (fullscreen device pass) but neither is fully cleared — confirmed
still `dev-synthetic` in both articles, so Steps 13 (VoiceOver) and 15 (real
case) remain fully open and 3/12 aren't marked done. Remaining scope
unchanged (steps 3, 12, 13, 15).
2026-07-11 Step 15 progress: a first real case is now ingested
(`xr-ankle-foot-trauma`, left ankle trauma) and embedded in a drafted article
(`src/content/articles/xr-ankle-foot-trauma.md`, `draft: true` — not yet
published); the two live demo articles still embed the synthetic
`dev-synthetic` case. Step 15's actual gate — "the embed scrubs ironclad on
real images on the real phone" — is not yet confirmed; still open. Steps 3,
12, 13 unchanged.
