---
id: headless-uncapturable-animations
status: open
tags: [needs-design]
first_seen: 2026-06-23
last_seen: 2026-06-23
recurrence: 1
related: [cloudflare-defeats-webfetch-and-headless-cft]
assessed: 2026-07-07
---

## Description
A subset of the design-reference animations can't be captured as GIFs in a headless browser, so their motion sections have prose-only descriptions with no visual. Two causes: (1) **GSAP/JS-driven motion** that the frame-burst slowdown trick can't pace — Anthropic's typed-quote + globe; (2) **elements absent from the headless DOM** — Scrib3's custom trailing cursor (only instantiated on a real fine-pointer), Anthropic's logo marquee and FAQ accordion (`.accordion_trigger` not present at capture time). Future capture sessions should not burn time re-attempting these headlessly.

## Notes
2026-06-23 — Captured 11 GIFs successfully (CSS transitions/keyframes + scroll, via slowdown + frame-burst). The above were attempted and dropped; their text descriptions in the DESIGN docs stand. -> Consider (if visuals for these are ever wanted): screen-record a real (non-headless) browser session and convert to GIF, or capture the cursor/accordion with a real pointer device. Likely a permanent headless limitation for the GSAP ones — will auto-decay in 90d if it never recurs, which is fine.

2026-06-23 — Janitor: `related:` repointed from `headless-capture-cloudflare-challenge` to `cloudflare-defeats-webfetch-and-headless-cft` after that adjacent item was promoted project→global and merged there; the old project-local id no longer exists in this store. No other change — this item carries a deliberate keep-open / 90d-observation-window note and is left open.
