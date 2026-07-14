---
id: no-js-playwright-for-headless-verify
status: open
tags: []
first_seen: 2026-07-14
last_seen: 2026-07-14
recurrence: 1
related: []
---

## Description

A Node Playwright screenshot script written in the session scratchpad failed with ERR_MODULE_NOT_FOUND — this repo has no JS Playwright dependency; the same logic had to be rewritten against the globally-installed Python Playwright. Headless visual verification of the site works through Python, not an ad-hoc node script.

## Notes

2026-07-14 — Consider a one-line note in CLAUDE.md (verification/testing) or a reusable scratch helper: reach for Python playwright + the Chrome-for-Testing binary for site screenshots; the chrome-for-testing.md NODE_PATH remedy does not apply here because the project never installs Playwright at all.
