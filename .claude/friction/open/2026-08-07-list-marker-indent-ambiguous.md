---
id: list-marker-indent-ambiguous
status: open
tags: []
first_seen: 2026-08-07
last_seen: 2026-08-07
recurrence: 1
related: []
assessed: 2026-08-07
---

## Description

Fixing callout/key-points bullet indentation took three iterations because 'remove the indent' was ambiguous between list-style:disc-inside (bullet+wrapped-text share one hanging-indent block, which still visually reads as an indent on wrapped lines) vs an explicit ::before bullet in a fixed gutter with text-indent (bullet flush, wrapped lines align to text start) vs the same but wrapped lines returning to the bullet's column. Each looked like 'no indent' from a quick glance but differed under text wrap.

## Notes

2026-08-07 — An AskUserQuestion with rendered previews resolved it on the third round. For future indent/list-marker requests, reach for the preview-comparison card earlier rather than iterating blind.
