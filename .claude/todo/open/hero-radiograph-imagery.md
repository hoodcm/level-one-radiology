---
id: hero-radiograph-imagery
title: Explore radiograph imagery in/near the homepage hero
band: later
first_surfaced: 2026-07-14
last_touched: 2026-07-14
assessed: 2026-07-14
depends_on: [detector-hero-device-pass]
links: [src/pages/index.astro, src/components/shared/DetectorHero.astro, public/cases/]
worktype: decide
---
During the 2026-07-14 hero-enrichment round Michael floated actual radiograph
imagery as a candidate "additional piece" for the mobile hero, then parked it
("maybe, not sure") after the round delivered statement + gold subscribe CTA +
Featured fold-peek without it. Explicitly deferred, not dropped.

Candidate treatments sketched but unprototyped: a faint radiograph emerging
inside the detector fan (on-metaphor: the detector imaging something), or the
Featured lead card carrying a case-image thumbnail. Needs a curated image from
`public/cases/**` (de-identification handled upstream — CLAUDE.md) and a
treatment that supports rather than fights the detector drawing.

Judge only after the recomposed hero passes the on-device gate
(detector-hero-device-pass) — the current composition may already be enough.

Done: a deliberate yes/no on hero imagery; if yes, a chosen treatment
prototyped and judged on screen.
