---
id: no-js-playwright-for-headless-verify
status: open
tags: []
first_seen: 2026-07-14
last_seen: 2026-08-08
recurrence: 2
related: []
assessed: 2026-08-07
---

## Description

A Node Playwright screenshot script written in the session scratchpad failed with ERR_MODULE_NOT_FOUND — this repo has no JS Playwright dependency; the same logic had to be rewritten against the globally-installed Python Playwright. Headless visual verification of the site works through Python, not an ad-hoc node script.

## Notes

2026-07-14 — Consider a one-line note in CLAUDE.md (verification/testing) or a reusable scratch helper: reach for Python playwright + the Chrome-for-Testing binary for site screenshots; the chrome-for-testing.md NODE_PATH remedy does not apply here because the project never installs Playwright at all.

2026-08-08 — recurred twice this session - the project has no local playwright dependency, so every render-comparison and computed-style probe has to bring playwright-core into the session scratchpad from scratch before it can drive Chrome for Testing
