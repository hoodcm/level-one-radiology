# Documentation

The map of this project's docs — start here.

| Doc | What it covers |
|---|---|
| [brand.md](brand.md) | Strategy, audience, keystone metrics, conversion flow, content types, navigation |
| [design/](design/README.md) | The design system — philosophy, tokens, components, and the reasoning layer |
| [engineering.md](engineering.md) | Stack, architecture, performance, publishing workflow, SEO, security |
| [writing.md](writing.md) | Prose voice — the human layer and content organization |

## Conventions

- The **CSS token files** (`src/styles/tokens/*.css`, `src/styles/base/motion.css`) are the single source
  of truth for every concrete value — color, type, spacing, motion. Docs describe and point to them; they
  never restate values (that's how values drift).
- [plans/](plans/) holds active plan and brief documents (dated) awaiting or feeding implementation.
- [archive/](archive/) holds superseded docs (dated). Design-inspiration assets, reference studies
  (including the design-ethos site survey), and prototypes live in `design-assets/` at the repo root,
  not here.

Project-level instructions (stack gotchas, commands, session workflow) live in [CLAUDE.md](../CLAUDE.md).
