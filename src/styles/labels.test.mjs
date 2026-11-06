// Contract: the site renders no label in capitals. Michael banned uppercase,
// letter-spaced labels and eyebrows, with the Level One wordmark as the one
// exception, so only the wordmark rules may set `text-transform: uppercase`,
// and no component builds a label with `toUpperCase()`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(import.meta.dirname, '..');
const WORDMARK = /^\.(site-logo__wordmark|hero__wordmark)\b/;

function files(dir, exts) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, exts);
    return exts.some((e) => name.endsWith(e)) && !name.includes('.test.') ? [path] : [];
  });
}

// The selector of the rule that holds the declaration at `index`.
function selectorAt(text, index) {
  const open = text.lastIndexOf('{', index);
  const prev = Math.max(text.lastIndexOf('}', open), text.lastIndexOf('\n\n', open));
  return text.slice(prev + 1, open).trim().split('\n').pop().trim();
}

describe('label casing', () => {
  const styles = files(SRC, ['.css', '.astro']);

  it('scans the site stylesheets', () => {
    expect(styles.length).toBeGreaterThan(10);
  });

  it('uppercases only the wordmark', () => {
    const offenders = [];
    for (const file of styles) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/text-transform:\s*uppercase/g)) {
        const selector = selectorAt(text, m.index);
        if (!WORDMARK.test(selector)) offenders.push(`${relative(SRC, file)}: ${selector}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  // Capitalizing a label's first letter is sentence case, so only a
  // whole-string toUpperCase() counts.
  it('builds no label with a whole-string toUpperCase()', () => {
    const offenders = files(SRC, ['.astro', '.ts', '.tsx', '.mjs'])
      .filter((file) => /(?<!charAt\(0\))\.toUpperCase\(\)/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it('carries no caps-tracking token', () => {
    const typography = readFileSync(join(SRC, 'styles/tokens/typography.css'), 'utf8');
    expect(typography).not.toMatch(/--ls-(ui|caps-sans)\s*:/);
  });
});
