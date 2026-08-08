/**
 * Single source of truth for the tag taxonomy.
 *
 * These names ARE the content schema's enums: src/content.config.ts builds
 * `z.enum(PRIMARY_TAG_NAMES)` from them, so a typo'd tag in an article's
 * frontmatter fails the build instead of rendering wrong. `z.enum()` needs a
 * non-empty tuple, which `as const` gives it directly. Adding a tag = one
 * entry here.
 *
 * Taxonomy-as-color is retired: chips carry no per-tag hue. Six hues spent on
 * taxonomy bought a rainbow no reader was decoding, and the palette now spends
 * color only where it means something (brand gold, apparatus teal, severity
 * red). Every chip renders identically in muted text — a topic chip and a
 * content-type chip sitting adjacent look the same, which is accepted: they
 * read as text, and the text is the discriminator.
 */
export const PRIMARY_TAG_NAMES = [
  'Trauma',
  'Abdomen',
  'Chest',
  'Neuro',
  'MSK',
  'AI & Policy',
] as const;

export const CONTENT_TYPE_NAMES = ['educational', 'commentary', 'case-analysis'] as const;

export type PrimaryTag = (typeof PRIMARY_TAG_NAMES)[number];
export type ContentType = (typeof CONTENT_TYPE_NAMES)[number];

export const contentTypeLabel = (type: ContentType): string => type.replace('-', ' ').toUpperCase();
