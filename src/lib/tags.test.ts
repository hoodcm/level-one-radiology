/**
 * Contract tests for the tag taxonomy.
 *
 * The load-bearing fact here is not the chip styling — it is that these names
 * ARE the content schema's enums (src/content.config.ts builds
 * `z.enum(PRIMARY_TAG_NAMES)` from them). Edit a name and every article's
 * frontmatter is revalidated against the new set; drop the export and the
 * whole collection stops validating. So these tests assert the taxonomy
 * against the real corpus rather than against itself.
 *
 * `z.enum()` additionally requires a NON-EMPTY tuple at the type level, which
 * `as const` on the array literal supplies directly.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  PRIMARY_TAG_NAMES,
  CONTENT_TYPE_NAMES,
  contentTypeLabel,
  type PrimaryTag,
  type ContentType,
} from './tags';

// --- Type-level contract, checked by `npm run check` rather than at runtime.
// The names are the schema's enum source, so the derived types must track the
// tuples exactly. If a name is added to the tuple without the corpus being
// updated, the runtime tests below catch it; if the DERIVED TYPE ever drifts
// from the tuple (someone hand-writes a union), these stop compiling.
const _knownTag: PrimaryTag = 'Trauma';
// @ts-expect-error — a tag outside the tuple must not typecheck.
const _unknownTag: PrimaryTag = 'Cardiothoracic';
const _knownType: ContentType = 'educational';
// @ts-expect-error — a content type outside the tuple must not typecheck.
const _unknownType: ContentType = 'listicle';
void _knownTag;
void _unknownTag;
void _knownType;
void _unknownType;

const ARTICLES = join(dirname(fileURLToPath(import.meta.url)), '../content/articles');

/** Frontmatter scalar, read straight from the file — no astro:content needed. */
function frontmatterValue(md: string, key: string): string | null {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md);
  if (!fm) return null;
  const m = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm[1]);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

const articles = readdirSync(ARTICLES)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ file: f, text: readFileSync(join(ARTICLES, f), 'utf8') }));

describe('schema enum sources', () => {
  it('finds a real corpus (fails closed rather than passing vacuously)', () => {
    expect(articles.length).toBeGreaterThan(0);
  });

  // z.enum() demands a non-empty tuple; an empty map would break the whole
  // collection's validation, not just one article.
  it('exposes non-empty name tuples', () => {
    expect(PRIMARY_TAG_NAMES.length).toBeGreaterThan(0);
    expect(CONTENT_TYPE_NAMES.length).toBeGreaterThan(0);
  });

  it('has no duplicate names', () => {
    expect(new Set(PRIMARY_TAG_NAMES).size).toBe(PRIMARY_TAG_NAMES.length);
    expect(new Set(CONTENT_TYPE_NAMES).size).toBe(CONTENT_TYPE_NAMES.length);
  });
});

describe('the corpus validates against the taxonomy', () => {
  it.each(articles.map((a) => a.file))('%s declares a known primaryTag', (file) => {
    const value = frontmatterValue(articles.find((a) => a.file === file)!.text, 'primaryTag');
    expect(value).not.toBeNull();
    expect(PRIMARY_TAG_NAMES).toContain(value);
  });

  it.each(articles.map((a) => a.file))('%s declares a known contentType', (file) => {
    const value = frontmatterValue(articles.find((a) => a.file === file)!.text, 'contentType');
    expect(value).not.toBeNull();
    expect(CONTENT_TYPE_NAMES).toContain(value);
  });
});

describe('contentTypeLabel', () => {
  // The chip is the only place a content type is shown to a reader, and it is
  // uppercase with no punctuation left over from the slug form.
  it.each(CONTENT_TYPE_NAMES)('renders %s as an uppercase chip label', (type) => {
    const label = contentTypeLabel(type as ContentType);
    expect(label).toBe(label.toUpperCase());
    expect(label).not.toMatch(/-/);
    expect(label.trim()).toBe(label);
    expect(label.length).toBeGreaterThan(0);
  });
});
