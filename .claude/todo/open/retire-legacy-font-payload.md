---
id: retire-legacy-font-payload
title: Retire legacy font payload (Utopia/Eurostile/Lab Grotesque) and re-subset Newsreader
band: next
first_surfaced: 2026-07-08
last_touched: 2026-07-08
depends_on: []
links: [public/fonts/, src/styles/tokens/fonts-ofl.generated.css]
worktype: decide
workstream: fonts
---
Surfaced during the site-wide latency sweep: ~2MB of retired Utopia/Eurostile/
Lab Grotesque woff2 still ships in `public/fonts/` even though the OFL trial
(Newsreader/DM Sans/Michroma/Chivo Mono) is the active face set. The legacy
`@font-face` blocks lack `unicode-range`, so the literal "→" glyph in
"All articles →" triggers a Lab Grotesque download on every article page.
Decide: delete the legacy faces outright (if the OFL trial is staying) or add
`unicode-range` scoping so they never download unless actually needed. Also
re-subset Newsreader — the 132KB preload could roughly halve with a tighter
glyph range.

Related but distinct: `is-fonts-licensing-acquired` (whether the legacy faces
are even licensed) and `metric-compatible-font-fallbacks` (size-adjust
fallback faces for the OFL set) — this item is the payload-weight cleanup,
not licensing or CLS.

Done: legacy font files are either removed or unicode-range-scoped (no
accidental download), and Newsreader ships a tighter subset.
