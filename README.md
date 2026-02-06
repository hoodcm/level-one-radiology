# Level One Radiology

*A one-person trade publication with educational depth*

---

## What This Is

Level One Radiology is an independent platform combining the timeliness of Radiology Business with the educational rigor of RadioGraphics, executed with design sophistication and a singular authorial voice.

**What it is:** Owned infrastructure for building national reputation and thought leadership in emergency radiology through substantive, well-designed content.

**What it isn't:** An online CV, a wiki, a case repository, a forum, or a corporate website.

**Core principle:** Complete independenceâ€”a platform where content, design, and editorial decisions are entirely self-determined.

---

## Documentation Structure

This project uses a tiered documentation system organized by discipline and purpose.

### Tier 1: Foundation

Strategic identity and methodologyâ€”the "why" behind everything.

| Document | Purpose |
|----------|---------|
| [BRAND-FOUNDATION.md](docs/BRAND-FOUNDATION.md) | Brand identity, positioning, audience, content strategy |
| [DESIGN-METHODOLOGY.md](docs/DESIGN-METHODOLOGY.md) | Fictive Kin principles (immutable foundation) |

### Tier 2: Design System

Visual and UX specificationsâ€”the "what" of the design.

| Document | Purpose |
|----------|---------|
| [DESIGN-PRINCIPLES.md](docs/DESIGN-PRINCIPLES.md) | Design philosophy, visual identity, core principles |
| [DESIGN-TOKENS.md](docs/DESIGN-TOKENS.md) | Colors, typography, spacing specifications |
| [COMPONENT-LIBRARY.md](docs/COMPONENT-LIBRARY.md) | Module specs, component CSS, design language |

### Tier 3: Implementation

Technical architectureâ€”the "how" of building it.

| Document | Purpose |
|----------|---------|
| [TECHNICAL-ARCHITECTURE.md](docs/TECHNICAL-ARCHITECTURE.md) | Stack, CSS architecture, performance, workflows |
| [PROJECT-INITIALIZATION.md](docs/PROJECT-INITIALIZATION.md) | Quick-start guide, setup commands, code examples |

### Tier 4: Content

Writing and editorial guidelines.

| Document | Purpose |
|----------|---------|
| [WRITING-STYLE.md](docs/WRITING-STYLE.md) | Smart Brevity principles, voice, formatting |

---

## Quick Reference

**Primary keystone metric:** Email subscribers

**Design philosophy:** Tight, not cramped. Dark-first. Bespoke warmth.

**Typography:** Utopia Std (display) Â· Lab Grotesque (body) Â· Eurostile LT Std (UI)

**Color foundation:** Minimal warm bias (R+1, B-2), six-level surface hierarchy

**Component primitives:** Base UI via shadcn/ui (Lyra style)

**Framework:** Astro + React islands

**Methodology:** Built on Fictive Kin's web systems approachâ€”see [DESIGN-METHODOLOGY.md](docs/DESIGN-METHODOLOGY.md)

---

## Navigation Guide

**Starting a new design decision?**
â†’ Check [DESIGN-PRINCIPLES.md](docs/DESIGN-PRINCIPLES.md) for philosophy, then [DESIGN-TOKENS.md](docs/DESIGN-TOKENS.md) for specifications

**Building a component?**
â†’ See [COMPONENT-LIBRARY.md](docs/COMPONENT-LIBRARY.md) for module specs and CSS patterns

**Setting up the project?**
â†’ See [PROJECT-INITIALIZATION.md](docs/PROJECT-INITIALIZATION.md) for step-by-step setup with shadcn/ui and Base UI

**Writing content strategy?**
â†’ See [BRAND-FOUNDATION.md](docs/BRAND-FOUNDATION.md) for content types, cadence, and audience

**Technical implementation questions?**
â†’ See [TECHNICAL-ARCHITECTURE.md](docs/TECHNICAL-ARCHITECTURE.md) for stack and performance targets

**Need to understand the foundational methodology?**
â†’ See [DESIGN-METHODOLOGY.md](docs/DESIGN-METHODOLOGY.md) for Fictive Kin principles

---

## Development

The project is a working Astro 5 application with a fully built homepage.

```bash
npm run dev        # Dev server → localhost:4321
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

**Current state:** Homepage complete with sticky nav, hero + newsletter CTA, featured articles grid, and footer. Self-hosted fonts placed. 7 components built (Header, Footer, ArticleCard, Tag, NewsletterSignup, Button, Input). 3 placeholder articles. Next steps: article page template, article index, About page.

---

## Maintenance

When syncing new insights from conversations:

- **Brand/content decisions** â†’ BRAND-FOUNDATION.md
- **Design philosophy changes** â†’ DESIGN-PRINCIPLES.md
- **New tokens or values** â†’ DESIGN-TOKENS.md
- **New components or modules** â†’ COMPONENT-LIBRARY.md
- **Technical decisions** â†’ TECHNICAL-ARCHITECTURE.md
- **Setup/initialization changes** â†’ PROJECT-INITIALIZATION.md
- **Writing guidelines** â†’ WRITING-STYLE.md
- **Methodology refinements** â†’ DESIGN-METHODOLOGY.md (with careâ€”these are foundational)

---

*Documentation refactored: December 2024*
*Last updated: February 2026*
*Built on Fictive Kin methodology*
