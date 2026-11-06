# Motion Principles

> [← Design system](../README.md)

How any interface moves, such as whether to animate at all, easing, durations, enter and exit, press feedback, and which properties to animate, is design-tools' `emil-design-eng` lens, `~/.claude/skills/design-tools/lenses/emil-design-eng/lens.md`. This doc holds what the site adds: its tokens and its CSS-first implementation. Concrete easing and duration values live in [motion.css](../../../src/styles/base/motion.css) and [tokens.md](../tokens.md), and when a principle conflicts with a token, the token wins. Reduced motion is the one hard floor and lives in [accessibility.md §5](accessibility.md).

This project is CSS-first: an IntersectionObserver toggles a class and CSS owns the transition, as [motion.css](../../../src/styles/base/motion.css) shows. Reach for JS or spring motion only inside a React island that needs interruptible, gesture-driven physics, never as the default. Springs and gestures, such as momentum dismissal, damping at boundaries, and pointer capture, belong only there.

---

## Easing comes from a token

Use the named tokens, never an inline `cubic-bezier()` outside `tokens/` and `motion.css`. The built-in CSS easings are too weak, and the project's curves carry the intent. The curves are defined once in [motion.css](../../../src/styles/base/motion.css), so don't restate them here or inline them in components.

| Token | Use for |
|---|---|
| `--ease-out` | Interactive UI feedback, such as presses, hovers, dropdowns, and popovers (the default) |
| `--ease-in-out` | Movement or morphing on screen, such as an element repositioning |
| `--reveal-ease` | Scroll-into-view reveals, gentler, paired with `--reveal-duration` |

## Durations

UI motion follows the lens's duration table. Scroll reveals and the hero entrance take `--reveal-duration`, since they explain rather than respond.

## Popovers and modals

Popovers scale from their trigger: with Base UI, set `transform-origin: var(--transform-origin)`. Modals are the exception, since they aren't anchored to a trigger, so they stay `transform-origin: center`.

## Reduced motion is the floor

Every animation needs a `prefers-reduced-motion: reduce` path, owned by [accessibility.md §5](accessibility.md). Reduced motion means fewer and gentler, not zero: keep the opacity and color transitions that aid comprehension, and drop movement and position changes. No essential information may be conveyed by motion alone.

## Stagger

Stagger grouped entrances with a short per-item delay through `--reveal-stagger` and an inline `--reveal-index`. Stagger is decorative, so never block interaction on it.

---

## Quick audit checklist

Before shipping motion, run the lens's checklist, then confirm:

1. **Easing** comes from a token, `--ease-out` or `--reveal-ease`, never an inline `cubic-bezier`.
2. **Reveals** run on `--reveal-duration`.
3. **Reduced motion** has a `prefers-reduced-motion` path for every animation.
