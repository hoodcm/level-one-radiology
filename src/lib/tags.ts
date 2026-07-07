/**
 * Single source of truth for the tag taxonomy.
 *
 * Canonical primary tags and content types, each mapped to its signal-color
 * Tag variant. The content schema (src/content.config.ts) derives its enums
 * from these keys, so a typo'd tag fails the build instead of silently
 * rendering the default gray. Adding a tag = one entry here.
 */
export type TagVariant =
  | 'default'
  | 'signal-red'
  | 'signal-cyan'
  | 'signal-violet'
  | 'signal-yellow'
  | 'signal-orange';

export const PRIMARY_TAGS = {
  'Trauma': 'signal-red',
  'Abdomen': 'signal-cyan',
  'Chest': 'signal-orange',
  'Neuro': 'signal-violet',
  'MSK': 'signal-yellow',
  'AI & Policy': 'signal-violet',
} as const satisfies Record<string, TagVariant>;

export const CONTENT_TYPES = {
  'educational': 'signal-cyan',
  'commentary': 'signal-violet',
  'case-analysis': 'signal-orange',
} as const satisfies Record<string, TagVariant>;

export type PrimaryTag = keyof typeof PRIMARY_TAGS;
export type ContentType = keyof typeof CONTENT_TYPES;

export const PRIMARY_TAG_NAMES = Object.keys(PRIMARY_TAGS) as [PrimaryTag, ...PrimaryTag[]];
export const CONTENT_TYPE_NAMES = Object.keys(CONTENT_TYPES) as [ContentType, ...ContentType[]];

export const tagVariant = (tag: PrimaryTag): TagVariant => PRIMARY_TAGS[tag];
export const contentTypeVariant = (type: ContentType): TagVariant => CONTENT_TYPES[type];
export const contentTypeLabel = (type: ContentType): string => type.replace('-', ' ').toUpperCase();
