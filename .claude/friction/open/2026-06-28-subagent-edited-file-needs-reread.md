---
id: subagent-edited-file-needs-reread
status: open
tags: [pattern-only]
first_seen: 2026-06-28
last_seen: 2026-06-28
recurrence: 1
related: []
---

## Description
When a fan-out of subagents edits files and the main session then tries to `Edit` one of them, the Edit fails with "File has not been read yet" — the main session's read-state guard doesn't credit a subagent's read/write. Hit on `docs/engineering.md` (agent-edited, then Edited from the main session), and again on a friction file `cat`'d via Bash rather than Read.

## Notes
2026-06-28 — After delegating edits to subagents (or inspecting a file with `cat`/Bash), `Read` it in the main session before `Edit`ing. Anticipate this whenever a follow-up main-session edit on an agent-touched file is likely.
