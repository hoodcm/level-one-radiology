# Design Philosophy

> [← Design system](README.md) · [Docs](../README.md)

The *why* of the design system — the operating method (how we build and decide) and the aesthetic
(how it looks and feels). Concrete values live in the CSS tokens; this doc points to them and never
restates them. For *which* value to choose when a spec is silent, see [reasoning/](reasoning/); for
the values themselves, see [tokens.md](tokens.md).

These principles are adapted from Fictive Kin's web-systems methodology for a solo-authored
professional publication. They are foundational — change them only with an eye to downstream effects.

---

## Aesthetic vision

A dark-first, imaging-native interface with subtle warmth. The references:

- **X-ray grid lines** — clinical precision
- **Vintage phosphor monitors** — technical heritage, warmth without saturation
- **Mature operating-system density** — Palantir, Cursor IDE

Executed with a warm-gray palette, tech-editorial typography, restrained spacing, and technical
ornament that evokes precision without coldness. The result should feel like a well-designed clinical
application: professional, efficient, comfortable without being sparse.

---

## Operating principles (how we build)

1. **Systems, not sites** — the platform compounds value over time. Design for iteration; content is an
   appreciating asset.
2. **Facts, not feelings** — decisions are driven by conversion data, not pure aesthetics. Beautiful
   design that doesn't convert is failed design.
3. **Modules, not pages** — reusable, branded components are the unit of publishing. New content reuses
   existing modules; new modules are rare. (See [The module system](#the-module-system).)
4. **Beginning, not ending** — launch is permission to learn. Ship lean, iterate on data.
5. **One keystone metric** — email subscribers. Maximum two; everything else is diagnostic. The metric
   tree lives in [brand.md](../brand.md).
6. **Minimum viable system** — features earn their place through demonstrated need, not anticipation.

## Aesthetic principles (how it looks)

1. **Dark-first, not dark-only** — radiology is read in dark rooms; the brand is imaging-native. A light
   mode is a possible future, not the default.
2. **The Case Viewer is the hero** — the signature differentiator, where design investment pays off most.
3. **Tight, not cramped** — density through restraint. Trust typography; every gap has a job. The same
   philosophy holds on mobile — don't "loosen up" for small screens.
4. **Warmth through color, type, and spacing** — warmth is systemic, not decorative (see
   [Color, type & spacing](#color-type--spacing) below).
5. **Color means something, or it isn't spent** — one brand color (Level One Gold: links, focus,
   selection, CTAs, and caution), one severity color (red = clinical critical), and one hue family
   split by job (cyan = the case viewer's instrument readouts; teal = editorial apparatus — key
   points, note callouts, statuses). Nothing else carries meaning by hue: taxonomy-as-color is
   retired, and tags are neutral chips. Meanings and values: [tokens.md](tokens.md) →
   `src/styles/tokens/colors.css`.
6. **Mobile-first density** — most traffic is mobile; apply the same tight spacing, 44×44px targets, and
   no hover-dependent interactions.
7. **Technical ornament, earned** — HUD framing, registration marks, dimension lines, structured bylines.
   Restraint in application; ornament is earned, not scattered.

---

## Color, type & spacing

The reasoning behind the system. **Values are not here** — they live in the CSS tokens
([tokens.md](tokens.md) is the map). How to *choose* among them lives in [reasoning/](reasoning/).

**Color — the warmth formula.** Professional dark interfaces achieve warmth by biasing RGB channels off
neutral. Level One biases in two registers, because warm blacks and warm whites need very different
amounts of it.

*Surfaces and borders* carry a **minimal** bias — `R = G + 1`, `B = G − 1` — imperceptible as a tint but
enough to avoid the harshness of pure neutrals on backlit screens (vintage monitor, not candlelight).
Surfaces step in consistent luminance increments (human vision is logarithmic, so small even steps read
smooth), and the swatches are named for their green channel, since green is the formula's free variable.

*Text* carries a deliberately **wider** bias, `R − B ≈ 10–20`, tuned per step rather than derived. A warm
white needs far more separation than a warm black to read warm at all, so the systemic warmth of the site
actually lives in the text ramp, not the surfaces. Peak luminance is held below near-white on purpose:
bright serif text on a near-black ground halates, and lowering the peak costs nothing at 14–16:1.

This is the canonical explanation of the warmth formula — [tokens.md](tokens.md) points here rather than
repeating it, and the resulting hex values live in `src/styles/tokens/colors.css`.

**Definition is the border's job, not the fill's.** A raised surface is lifted one small step off its
ground and given a real hairline, rather than lifted far enough to separate on fill alone. Fills doing
definition work is what made the mid-dark surfaces read muddy; borders are opaque ramp steps so a
hairline holds one weight on every surface instead of inheriting whatever sits beneath it. The one
exception is a border over CT pixels, which has no fixed ground and stays alpha.

**One gold, three weights — brand is not action.** The gold family is a single hue in three forms
with non-overlapping jobs: the saturated **prime** where the *site* speaks (CTA, detector beam, brand
moments), the ivory-lifted **interactive** form where the *reader* acts (links, focus), and the
**soft** wash for large areas (selection, bands). The reader can tell "the site is speaking" from
"I can act here" from "this is highlighted" by weight alone; sharing a weight across two of those
jobs is a defect. (This is the reference system's clay → clay-interactive split, mirrored for a dark
ground: their interactive form darkens under light, ours lifts over dark.)

**Accent restraint — two gold voices above the fold, and no more.** The reference system shows its
accent exactly once above the fold; Level One's ceiling is two, decided deliberately (2026-08): the
one action (the subscribe CTA — gold is the action color) and the one brand signature (the detector
beam). A third gold element above the fold is a defect, not a style choice — new gold goes below the
fold or replaces one of these two.

**Typography — a tech-editorial hybrid.** Three roles: a **display serif** for editorial authority in
headlines, a **humanist body sans** for warm clarity at small sizes, and a **tech UI face** for PACS-like
precision in chrome — plus a **monospace** for metadata. (Current faces — Newsreader / DM Sans / Michroma
/ Chivo Mono — and the scale live in `src/styles/tokens/typography.css`.) Optimized for dark-mode
readability and small-size legibility.

**Spacing — whitespace is hierarchy.** Tight relationships bind related content (title → description,
nav items, tag groups); generous breaks separate sections. Every gap has a purpose; whitespace is a
hierarchy tool, not decoration. The scale and how to apply it: `src/styles/tokens/spacing.css` and
[reasoning/spacing.md](reasoning/spacing.md).

---

## Designated spice zones

Concentrate personality in specific areas rather than spreading it everywhere.

**Where:** masthead/logo · Case Viewer interface · article cards (HUD corners) · CTAs on hover/focus ·
section transitions (dimension lines) · footer (registration marks) · the 404 page (voice opportunity).

**Where not:** body text (clean, readable) · navigation (fast, functional) · references (scholarly
credibility) · forms (frictionless).

---

## The module system

Reusable, branded, editable chunks are the foundation of scalable publishing. Every module must be
**performant**, **AA accessible** (the floor: [reasoning/accessibility.md](reasoning/accessibility.md)),
**responsive** (320px–1440px+, 44×44px targets), and **SEO-optimized** (semantic HTML, heading order,
schema).

**Tiers:**

- **Workhorse** (8–10) — used constantly; high investment. Article header, body text, callout, newsletter
  CTA, index card, etc.
- **High-touch** — custom but reusable; plan for iteration. Comparison slider, timeline.
- **Showstopper** (one) — the signature differentiator: the **Case Viewer**.

**Showstopper discipline.** Do not build a second showstopper until 20+ articles are published, engagement
data on the first is collected, and a clear need is identified. The module specs themselves live in
[components.md](components.md).

---

## How we decide

For any design or content decision, in order:

1. Does it serve the keystone metric (subscriber conversion)?
2. Does it follow the operating + aesthetic principles above?
3. Does it meet the module standards?
4. Does it avoid known problem patterns — CTAs that look like buttons (solid, not ghost), readability over
   ornament, simple nav, mobile-first, no layout shift?

When principles conflict: **keystone metric → facts over feelings → long-term system value → tight over
trend → context.**

---

## Review cadence

The methodology has built-in reflection (this is the canonical statement; [engineering.md](../engineering.md)
points here).

- **Quarterly** — review analytics (subscribers, traffic, top content); update outdated articles; check
  broken links and stale content; plan next quarter.
- **Annually** — full methodology review: do the principles still serve the goals?

---

## Decision checklist

Before shipping a design decision, verify it: maintains tight-not-cramped density · supports the
dark-first context · uses warmth systematically · uses signal colors functionally · works on mobile
without loosening · keeps ornament earned and restrained · respects the type hierarchy · supports
subscriber conversion.
