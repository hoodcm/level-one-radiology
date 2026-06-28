# Level One Radiology

*A one-person trade publication with educational depth.*

Website for leveloneradiology.com — an independent emergency radiology platform combining the timeliness
of Radiology Business with the educational rigor of RadioGraphics, executed with design sophistication and
a singular authorial voice.

- **What it is:** owned infrastructure for building national reputation and thought leadership in emergency
  radiology through substantive, well-designed content.
- **What it isn't:** an online CV, a wiki, a case repository, a forum, or a corporate website.

## Documentation

All documentation is mapped in **[docs/README.md](docs/README.md)** — start there. The design system has
its own map at **[docs/design/README.md](docs/design/README.md)**. Project instructions (stack, commands,
conventions) live in **[CLAUDE.md](CLAUDE.md)**.

## Quick reference

- **Keystone metric:** email subscribers
- **Design:** tight, not cramped · dark-first · minimal warm bias (R+1, B-2), six-level surface hierarchy
- **Typography:** Newsreader (display) · DM Sans (body) · Michroma (UI/brand) · Chivo Mono (mono)
- **Stack:** Astro + React islands · shadcn/ui over Base UI (Mira) · GitHub Pages

## Development

```bash
npm run dev        # Dev server → localhost:4321
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # Enforce design tokens (CI-gated)
```

**Current state:** homepage and article template built (cards link through to full articles), carrying the
design system — a 6/12/18 grid primitive, OFL webfonts via Google Fonts, scroll/feature animations, and
dark-first editorial typography. Three placeholder articles. Open tasks live in [TODO.md](TODO.md).
