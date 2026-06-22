# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Article page template (`src/pages/articles/[slug].astro`) — full editorial reading view; all homepage cards now link through
- `prose.css` long-form reading system: type metrics mirror Anthropic's live article (body 17px, sans headings, 640px reading column, exact paragraph/heading vertical rhythm), expressed in Level One's fonts (Utopia serif body, Lab Grotesque sans titles/headings) and dark palette
- Self-hosted favicon (`public/favicon.svg`, the Level One mark) — also the mobile header logo
- Full-screen mobile nav overlay (icon + hamburger → ✕, Anthropic-style rows, bottom CTA)
- Semantic tokens: nested content widths (`--reading-column`/`--media-column`), radius scale (`--radius-xs/sm/md/lg`), card-padding, section-spacer, gap, reading line-height, inline-link metrics — values flip at shared breakpoints

### Changed
- Header: icon + hamburger on mobile (<768px), wordmark + inline nav on desktop (≥768px); bar height grows 48→56px
- Article type roles parallel Anthropic — sans title + sans deck + serif body
- Warm-white text ramp de-yellowed (`--color-text-ivory` `#F5E6C2` → `#FAF6EE`, etc.); consistent subtle warm bias. Dark surfaces unchanged — site stays dark-first
- Mobile page gutter 24 → 32px (Anthropic-style); homepage card titles → sans; radii / card padding / section spacing now token-driven

### Fixed
- Mobile menu broke when opened while scrolled: the `overflow:hidden` scroll-lock was killing the sticky header (and jumping scroll). Replaced with a full-viewport overlay, no lock
- Removed the `/favicon.ico` 404 (SVG favicon only)

## [0.3.0] - 2026-02-06

### Added
- Homepage with 4 sections: sticky nav, hero with newsletter CTA, featured articles grid, footer
- Header component (48px sticky nav, ARTICLES / ABOUT / SUBSCRIBE)
- Footer component (3-column: navigate, connect, newsletter CTA with registration marks)
- Tag component (Eurostile uppercase, colored indicator dot, signal color variants)
- ArticleCard component (HUD framing, tag chips, hover states, lead variant)
- NewsletterSignup React island (inline + section variants, Buttondown integration)
- shadcn/ui Button and Input components (Base UI primitives, base-lyra style)
- Component CSS: site-header, article-card, tag, HUD frame, featured-grid, newsletter, footer
- 3 placeholder articles: splenic trauma, closed-loop obstruction, ACR AI guidelines
- Self-hosted fonts placed (Utopia Std, Lab Grotesque, Eurostile LT Std — 3.8MB)

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
