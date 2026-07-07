# Case Viewer — Requirements & Architecture Brief

*Captured 2026-07-07 from Michael's direction. **Superseded by
[`2026-07-07-case-viewer-plan.md`](2026-07-07-case-viewer-plan.md)** — the
brainstorm ran the same day; the plan carries the locked decisions and design.
Kept as provenance only. Related TODO: `build-case-viewer-module`. Existing
asset: `design-assets/prototypes/case-viewer-loading-hud.html` (loading HUD).*

## Why (context for a fresh session)

The site's showstopper module: scrollable image stacks embedded in articles so
readers scroll through an exam the way radiologists do. Michael's assessment of
the existing web viewers (open DICOM-standard viewers, dicomtube.com,
Radiopaedia): all bad — they glitch, they're difficult to navigate, and they
dissuade the reader from engaging. "Ironclad" and "mobile-first" are the two
words that define success.

## Hard requirements (user-stated)

- **JPEG stacks, not DICOM.** Full DICOM support is explicitly out of scope.
  Frames are pre-exported JPEGs per exam/series.
- **Mobile-first.** The phone experience is the primary one, not an
  adaptation.
- **Ironclad.** No glitches, no jank, no fighting the page. A viewer that
  stutters once loses the reader.
- **Embedded in articles.** Appears inline where the prose makes it relevant;
  looks native to the article's design language (HUD/console chrome — see
  `.figure-meta`, `.hud-frame`, and the loading-HUD prototype).

## The crux: gesture model for inline embeds

This is where every clunky viewer fails, and it needs on-device prototyping
before any component is built. The conflict: PACS-native scrubbing is a
*vertical* drag, but an inline embed lives inside a vertically scrolling page —
naive vertical capture hijacks the page scroll and feels broken; no capture
feels dead.

Candidate models to prototype (one page, three variants, judged on a real
iPhone):

1. **Horizontal drag scrubs inline** (no page-scroll conflict), vertical drag
   passes through to the page; fullscreen mode restores PACS-style vertical
   scrub.
2. **Explicit engage state** — tap (or "engage" affordance) locks the stack;
   while engaged, vertical drag scrubs and page scroll is suppressed; close
   affordance always visible.
3. **Scrub-bar-first** — always-visible slider (thumb + frame ticks) as the
   primary control; drag-on-image is an enhancement, never required.

Non-negotiables regardless of model: an always-available scrub slider
(accessibility + fallback), integer frame snapping with a fixed px-per-frame
ratio (no momentum drift), desktop wheel scrub only after hover/click engage,
arrow-key support, and a mono frame readout (`IM 23/48`) in the console voice.

## Performance requirements (what "ironclad" means technically)

- **Zero layout shift**: aspect-ratio box reserved from server-rendered HTML
  before any image loads.
- **Zero flicker**: render via a single `<canvas>` blit (double-buffered) or a
  persistent `<img>` whose `src` is swapped only after `Image.decode()`
  resolves. Never stack N `<img>` elements with visibility toggles.
- **Decode-ahead pipeline**: adjacent-frames-first priority; scrub never waits
  on network or decode. LRU decode window caps memory for long series.
- **Loading state**: the existing HUD boot prototype (grid flicker + bracket
  snap) is the loading choreography — the wait *is* brand.
- **Reduced motion**: no cine autoplay; scrub is user-driven and exempt.

## Architecture recommendation (brainstorm to confirm)

- **Component form**: lean toward a **framework-free custom element**
  (`<case-viewer>`) over a React island. Rationale: it upgrades in place inside
  markdown-rendered HTML (no MDX migration, no hydration boundary), one script
  serves all instances, and the gesture/decode core is plain pointer-event +
  canvas code anyway. React remains available if state complexity grows
  (window presets, linked series) — decide at brainstorm.
- **Authoring contract** (`Contracts:` the directive + manifest schema):
  - In markdown: a leaf directive, e.g. `::case{id="ct-abd-001"}` →
    remark plugin emits the placeholder element (pipeline already has
    remark-directive).
  - Per case: `public/cases/<id>/manifest.json` — series label, plane,
    window label, caption, frame list, dimensions — plus numbered JPEG frames.
- **Ingestion script**: `scripts/build-case.mjs` — takes a folder of exported
  JPEGs → resizes (cap ~1200px long edge), normalizes quality, numbers frames,
  writes the manifest. Keeps authoring at "drop exports in a folder."
- **Fullscreen**: Fullscreen API where real; iOS Safari fallback is a
  `position: fixed` overlay (iOS limits the API for non-video elements).
- **Chrome**: `.figure-meta` console strip + corner brackets + frame counter;
  the viewer must read as the same instrument as the rest of the site.

## Out of scope (v1)

DICOM parsing · client-side window/level math (windows are pre-baked exports;
a preset *switcher* between pre-baked series is fine) · measurement/annotation
tools · multi-planar linked scrolling (candidate v2) · video/cine export.

## Milestones

1. **Gesture spike** — one throwaway page, three gesture models, real-device
   judgment (user-gated: needs Michael's phone and eyes).
2. **Core element** — decode pipeline + canvas scrub + slider + manifest.
3. **Article embed** — directive wiring, HUD chrome, loading boot.
4. **Fullscreen + polish** — orientation, keyboard, a11y pass.

Verification per milestone: on-device scrub smoothness (the only gate that
matters), zero CLS in Lighthouse, no page-scroll capture outside the engaged
state.
