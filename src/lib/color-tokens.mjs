/**
 * color-tokens.mjs — build-time reader for colour values that live in CSS.
 *
 * Colours are defined once, in src/styles/tokens/colors.css. A few build-time
 * consumers can't reference a CSS var, such as the `theme-color` meta in
 * Layout.astro, so they read the resolved value here rather than restate it.
 *
 * Node-only — never import this from a client <script>, or the browser bundle
 * picks up node:fs. (grid-tokens.mjs sets the same build-time-read precedent.)
 */
import { readFileSync } from 'node:fs';
import { repoFile } from './repo-file.mjs';

const COLORS = repoFile('src/styles/tokens/colors.css');

/** Resolve a custom property to its literal value, following `var(--x)`
 *  chains. `css` defaults to colors.css and is a parameter for tests. */
export function colorToken(name, source = readFileSync(COLORS, 'utf8')) {
  // A declaration inside a comment, such as a retired value kept for reference, never resolves.
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const seen = new Set();
  let current = name;
  for (;;) {
    if (seen.has(current)) throw new Error(`color-tokens: var() cycle at ${current}`);
    seen.add(current);
    const escaped = current.replace(/[-]/g, '\\-');
    const m = css.match(new RegExp(`(?<![\\w-])${escaped}:\\s*([^;]+);`));
    if (!m) throw new Error(`color-tokens: no ${current} in ${COLORS}`);
    const value = m[1].trim();
    const ref = value.match(/^var\((--[\w-]+)\)$/);
    if (!ref) return value;
    current = ref[1];
  }
}
