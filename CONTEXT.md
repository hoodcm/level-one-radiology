# CONTEXT.md

Stable background reference for this project. Read at session start, update rarely.

## What This Project Is

Level One Radiology is the website for leveloneradiology.com — an independent, solo-authored platform for emergency radiology content. It combines the timeliness of trade publications (Radiology Business) with the educational depth of academic journals (RadioGraphics), executed with design sophistication. The primary audience is practicing radiologists and trainees, with secondary reach to radiology-adjacent clinicians.

## Why It Matters

This is owned infrastructure for building a national reputation and thought leadership in emergency radiology. Unlike journal publications or social media, the platform is completely independent — content, design, and editorial decisions are self-determined. The keystone metric is email subscribers, representing a compounding owned audience. The site is designed to be the kind of thing you'd be proud to share with a respected colleague.

## Key Concepts

- **Fictive Kin methodology** — The foundational design philosophy (see DESIGN-METHODOLOGY.md). Eight principles: Systems Not Sites, Facts Not Feelings, Modules Not Pages, Beginning Not Ending, Keystone Metrics, Minimum Viable System, Tight Not Cramped, Bespoke Warmth.
- **Collectors vs Attractors** — Two content types. Collectors are SEO workhorses (educational articles, case analyses). Attractors are timely commentary pieces (LinkedIn fuel, traffic spikes).
- **React islands** — Astro architecture pattern. Most pages are static HTML; React loads only for interactive components (newsletter form, case viewer).
- **HUD framing** — Signature visual treatment: four-corner brackets on key containers, inspired by Palantir and PACS workstations.
- **Smart Brevity** — Writing structure from Axios: headline, lede, why it matters, go deeper. Combined with a human teaching voice.
- **Case Viewer** — The "showstopper module." PACS-like image viewer for clinical cases, embedded within articles. Custom-built, not using shadcn primitives.
- **Surface hierarchy** — Six-level background system from near-black (#0B0A08) to mid-gray (#333230), using warm bias formula (R=G+1, B=G-2).

## Architecture Overview

**Astro static site** with React islands for interactivity. Content authored in Markdown with YAML frontmatter, stored in the git repository. shadcn/ui provides accessible component primitives (Base UI under the hood, Lyra visual style). Tailwind CSS for utility classes, CSS custom properties for design tokens. Deployed to Vercel with automatic deploys on push. Newsletter via Buttondown API, analytics via Plausible.

**MVP scope:** 3-5 articles, working newsletter signup, functional case viewer in at least 1 article, homepage, about page, article index. No search, comments, user accounts, or light mode at launch.

## Related Work / Dependencies

- **Buttondown** — Email newsletter service (API for subscriber management)
- **Plausible** — Privacy-respecting analytics
- **Vercel** — Hosting and deployment platform
- **shadcn/ui** — Component abstraction layer (Base UI primitives, Lyra style)
- **Fonts** — Self-hosted: Utopia Std (display serif), Lab Grotesque (body sans), Eurostile LT Std (UI tech)

---

*Last updated: 2026-02-06*
