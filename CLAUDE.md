# Level One Radiology

## Overview

Website for leveloneradiology.com — an independent emergency radiology publication combining the timeliness of Radiology Business with the educational rigor of RadioGraphics. Dark-first, content-driven platform with a singular authorial voice.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Framework | Astro + React islands |
| Styling | Tailwind CSS + CSS custom properties |
| Components | shadcn/ui (Base UI primitives, Lyra style) |
| Content | Markdown + YAML frontmatter (git-managed) |
| Hosting | Vercel |
| Newsletter | Buttondown |
| Analytics | Plausible |
| Search | Pagefind (deferred — add at 15+ articles) |

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (localhost:4321) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npx shadcn add [name]` | Add shadcn/ui component |

## Architecture

```
src/
  content/
    articles/           # Markdown files with frontmatter
    config.ts           # Content schema (Zod)
  components/
    layout/             # Header, Footer, Container (.astro)
    article/            # TableOfContents, KeyPoints (.astro), NewsletterCTA (.jsx)
    case/               # CaseViewer (.jsx) — custom, not shadcn
    shared/             # tag, article-card (.astro)
    ui/                 # shadcn/ui auto-generated components
  pages/
    articles/
      [slug].astro      # Article template
      index.astro       # Article listing
    index.astro         # Homepage
  layouts/
    Layout.astro        # Base layout
  styles/
    tokens/             # colors.css, typography.css, spacing.css
    base/               # reset.css, global.css
    components/         # Per-component CSS
    main.css            # Import manifest

public/
  images/articles/      # Images organized by article slug
  fonts/                # Self-hosted: Utopia Std, Lab Grotesque, Eurostile LT Std
```

**Pattern:** Static Astro pages by default. React islands (`client:load`) only for interactive components (newsletter form, case viewer, search).

## Design System Reference

Detailed specifications live in dedicated documents:

| Document | Use When |
|----------|----------|
| [BRAND-FOUNDATION.md](BRAND-FOUNDATION.md) | Content strategy, audience, conversion flow |
| [DESIGN-METHODOLOGY.md](DESIGN-METHODOLOGY.md) | Foundational Fictive Kin principles (modify with care) |
| [DESIGN-PRINCIPLES.md](DESIGN-PRINCIPLES.md) | Design philosophy, aesthetic decisions |
| [DESIGN-TOKENS.md](DESIGN-TOKENS.md) | Exact color/typography/spacing values for CSS |
| [COMPONENT-LIBRARY.md](COMPONENT-LIBRARY.md) | Module specs, component CSS patterns |
| [TECHNICAL-ARCHITECTURE.md](TECHNICAL-ARCHITECTURE.md) | Stack decisions, performance targets, workflows |
| [WRITING-STYLE.md](WRITING-STYLE.md) | Smart Brevity structure, voice, content types |

## Key Design Decisions

- **Dark-first:** `#0B0A08` deepest background, warm bias (R+1, B-2)
- **Typography:** Utopia Std (display) / Lab Grotesque (body) / Eurostile LT Std (UI)
- **Density:** "Tight, not cramped" — 48px nav, 16px body, 11px UI text
- **Signal colors are functional:** Red=CTA/critical, Cyan=links, Yellow=caution, Violet=tech
- **Primary metric:** Email subscribers. Every design choice serves conversion.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `BUTTONDOWN_API_KEY` | Newsletter API |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Analytics domain (leveloneradiology.com) |

## Project Files

| File | Purpose | Update frequency |
|------|---------|------------------|
| `CLAUDE.md` | Project instructions | As needed |
| `CONTEXT.md` | Stable background reference | Rarely |
| `CHANGELOG.md` | Change history | After substantive changes |
| `TODO.md` | Actionable tasks | Frequently |

## Session Startup

At the start of each session:

1. **Check `TODO.md`** for current tasks and open questions
2. **Read `CONTEXT.md`** for background understanding
3. **Scan recent `CHANGELOG.md`** entries for recent changes

## Session Shutdown

At the end of each session:

1. **Update `TODO.md`** — check off completed items, add new tasks discovered
2. **Update `CHANGELOG.md`** — log substantive changes under `[Unreleased]`

## File Responsibilities

| If you... | Update... |
|-----------|-----------|
| Complete a task | `TODO.md` — check it off |
| Add a new task or question | `TODO.md` — add it |
| Make substantive changes | `CHANGELOG.md` — log under [Unreleased] |
| Learn something that changes understanding | `CONTEXT.md` — update reference |
