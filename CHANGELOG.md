# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.2.0] - 2026-02-06

### Added
- Astro 5 project with React islands and Tailwind v4 (via @tailwindcss/vite)
- shadcn/ui configuration (Base UI primitives, Lyra style)
- CSS design token system: colors, typography, spacing from DESIGN-TOKENS.md
- Base layout (Layout.astro) with SEO meta tags and OG tags
- Minimal dark "coming soon" homepage verifying token pipeline
- Content collection schema for articles (Astro 5 Content Layer API)
- GitHub Pages deployment workflow (.github/workflows/deploy.yml)
- Font directory structure and @font-face declarations (fonts not yet placed)
- robots.txt and CNAME for custom domain

### Changed
- Documentation reorganized from project root into docs/ subdirectory

---

## [0.1.0] - 2026-02-06

### Added
- Initial project setup with context preservation scaffolding
- CLAUDE.md, CONTEXT.md, CHANGELOG.md, TODO.md
- Design system documentation suite (8 documents):
  - BRAND-FOUNDATION.md — Brand identity, positioning, content strategy
  - DESIGN-METHODOLOGY.md — Fictive Kin foundational principles
  - DESIGN-PRINCIPLES.md — Design philosophy, visual identity
  - DESIGN-TOKENS.md — Colors, typography, spacing specifications
  - COMPONENT-LIBRARY.md — Module specs, component CSS
  - TECHNICAL-ARCHITECTURE.md — Stack, performance, workflows
  - WRITING-STYLE.md — Smart Brevity structure, voice guidelines
  - PROJECT-INITIALIZATION.md — Quick-start setup guide
