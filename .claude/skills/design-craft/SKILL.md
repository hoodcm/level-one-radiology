---
name: design-craft
description: Design-quality passes for the site's visual surfaces — polish, critique, audit, layout/spacing judgment, quieter/bolder adjustments, motion, color, copy clarity. Invoke when work needs a craft eye ("this looks sloppy/unrefined/flat", "polish this", "critique the homepage", spacing/rhythm/hierarchy questions) or before shipping a visual change. Advisory by default; edits only on request.
---

# Design Craft

A library of design-judgment passes for this site. Each pass is a focused
playbook in `references/` — load **only** the one the moment calls for, run
it against the live page (dev server + screenshot, never from source alone),
and deliver findings or fixes at the scope the user named.

## House precedence (non-negotiable)

These playbooks supply **judgment**, never values. Where a playbook suggests
generic values or scales, this project's own system wins:

- Every value comes from the tokens (`src/styles/tokens/**`) — the closed
  ramps (leading, tracking, gold, spacing, z) and role tokens. A playbook
  recommendation lands as a token edit or not at all.
- The design system docs (`docs/design/`) own the reasoning; a pass that
  contradicts them surfaces the conflict rather than silently overriding.
- The lint gates and token tests stay green after any applied fix.

## Pass selection

| Moment | Reference |
|---|---|
| Quality floor before any UI work — the reflexes | [references/craft-floor.md](references/craft-floor.md) |
| Spacing, rhythm, hierarchy, breathing room, "looks sloppy/cramped/loose" | [references/layout.md](references/layout.md) |
| Final refinement sweep on a finished surface | [references/polish.md](references/polish.md) |
| Full structured assessment with scored findings ("critique the page") | [references/critique.md](references/critique.md) |
| Deterministic + heuristic defect scan | [references/audit.md](references/audit.md) |
| Element too loud — reduce without losing it | [references/quieter.md](references/quieter.md) |
| Element too timid — commit without adding noise | [references/bolder.md](references/bolder.md) |
| Motion and transitions | [references/animate.md](references/animate.md) |
| Personality/delight moments, earned only | [references/delight.md](references/delight.md) |
| Color application judgment | [references/colorize.md](references/colorize.md) |
| Interface copy reads unclear | [references/clarify.md](references/clarify.md) |
| Surface is overbuilt — remove until it improves | [references/distill.md](references/distill.md) |

## Verification

Every applied pass ends the way this project always verifies visual work:
render the real page (dev server at localhost:4321, headless CfT screenshot
to `~/Downloads/`, at 390 by 844 first and then desktop), measure computed styles where a claim is measurable, and
run `npm run lint` + `npm test` with real exit codes. Judgment calls the
render can't settle go to Michael with the screenshot.

## Provenance

Adapted from the Apache-2.0 licensed design-guidance portions of an
open-source design skill (github.com/pbakaus/impeccable, fetched 2026-08-08);
platform machinery, external tooling, and branding removed, precedence
re-anchored to this project's token system. The playbooks are house files
now — edit them as ours.
