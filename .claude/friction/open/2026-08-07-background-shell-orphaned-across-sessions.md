---
id: background-shell-orphaned-across-sessions
status: open
tags: [needs-design]
first_seen: 2026-08-07
last_seen: 2026-08-07
recurrence: 1
related: []
assessed: 2026-08-07
---

## Description

A background dev-server shell launched earlier was reported 'stopped' with no completion record when a later session resumed — the harness noted it may have been stopped by the UI, a Monitor timeout, or agent teardown, or was running when the previous process exited. Required detecting the dead server (an actual request failing) and relaunching manually before work could continue.

## Notes

2026-08-07 — Consider: a background dev-server convenience wrapper that checks liveness (a real HTTP probe, not just task-handle presence) before assuming continuity across a session handoff.
