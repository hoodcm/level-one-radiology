---
paths:
  - "src/content/**/*.md"
---

# Writing follows the style guides

Prose for the site, such as article copy, headlines, CTAs, and metadata, is written to the project's voice and brand. Consult the source-of-truth docs before and while writing, never from memory:

- Voice and structure (the human layer + content organization) → `docs/writing.md`
- Prose style → the global `/voice` skill. For educational articles, also load the global `teaching` skill, whose article node and register govern teaching prose
- Strategy, audience, content types, conversion → `docs/brand.md`
- Search-facing copy (titles, meta descriptions, page plans, anything meant to rank) → the voice skill's `google-search-central-seo` lens (offer it; structural/build requirements live in `.claude/rules/seo-structure.md`)

Site copy follows the voice skill's punctuation rules, so it carries no em dash and no semicolon in running prose.
