---
id: consolidate-duplicated-style-literals
title: Tokenize the duplicated 0.15s UI-transition duration literal
band: later
first_surfaced: 2026-07-08
last_touched: 2026-07-08
assessed: 2026-07-14
depends_on: []
links: [src/styles/tokens/]
worktype: build
---
A single-source-of-truth straggler surfaced during the site-wide sweep
(project rule: every style value lives in exactly one token, never inline —
CLAUDE.md):

The `0.15s` UI-transition duration literal appears inline in ~22 places
across component CSS (grew, not shrank, in this session's case-viewer polish
pass — chips/✕ buttons picked up more inline `0.15s` hover states). Add a
`--duration-ui` token in `src/styles/tokens/` and reference it everywhere
instead.

Done: no bare `0.15s` transition literal remains outside
`src/styles/tokens/**`.

## Notes
2026-07-08 dropped the second bullet (12px corner-bracket-size duplication):
that literal lived entirely inside the `.hud-frame` block in homepage.css,
which the card-ornament work removed wholesale this session (replaced by
`--orn-*` tokens in `tokens/ornament.css`) — the duplication is gone with the
feature, not a remaining straggler.
2026-07-08 grew again in the case-viewer icon/CRT polish pass (Lucide hover
scale-up, boot-gate chrome fades): now 23 occurrences across
case-viewer.css/homepage.css/prose.css — same straggler, no new work.
