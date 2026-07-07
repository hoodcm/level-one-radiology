---
id: curl-localhost-denied-use-cft
status: resolved
tags: [pattern-only]
first_seen: 2026-06-26
last_seen: 2026-06-26
recurrence: 1
related: []
assessed: 2026-07-07
---

## Description
Verifying live dev-server output during the grid migration, `curl http://localhost:4321/...`
was denied by the sandbox twice (both as a standalone call and chained with `git`). The
working path was to verify visually via the installed Chrome-for-Testing binary + a small
Playwright screenshot script (`shot.py` at 375/700/1200px) and to read the `astro dev` log
for compile status — never curl. Also: chaining `curl && git commit` got the whole compound
command denied, so git checkpoints had to be split out from any curl probe.

## Notes
2026-06-26 — For this Astro site, the reliable visual-verification loop is: launch `npm run dev`
(background, log to scratchpad), edit, then screenshot the route with the CfT binary at three
widths (per the global chrome-for-testing rule) rather than curl-ing the dev server. Low-stakes
workflow note; likely auto-decays once the screenshot loop is habitual.

2026-07-07 — Janitor: closed on inference — the 2026-07-07 session's localhost verification went
entirely through Chrome for Testing per the global rule, with no curl attempts; the screenshot
loop is now habitual. Reversible; a recurrence re-opens.
