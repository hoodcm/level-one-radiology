/**
 * grid-tokens.mjs — build-time reader for grid values that live in CSS.
 *
 * The grid is defined once, in src/styles/tokens/spacing.css, and the browser
 * resolves it live off the container. Build-time render paths (an .astro
 * frontmatter drawing its own no-JS fallback) have no computed style to read,
 * so they read the token here rather than restate its number in JS.
 *
 * Node-only — never import this from a client <script>, or the browser bundle
 * picks up node:fs. (case-shell.mjs sets the same build-time-read precedent.)
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SPACING = path.resolve('src/styles/tokens/spacing.css');

// rem → px at the CSS-spec initial root font size. A unit conversion, not a
// design value: nothing in src/styles overrides html { font-size }.
const REM_PX = 16;

/** Every `--grid-margin` declaration in source order — base first, then each
 *  breakpoint override — resolved to px. */
export function gridMargins() {
  const css = readFileSync(SPACING, 'utf8');
  const out = [];
  for (const [, value, unit] of css.matchAll(/--grid-margin:\s*([\d.]+)(rem|px)/g)) {
    out.push(unit === 'rem' ? parseFloat(value) * REM_PX : parseFloat(value));
  }
  if (out.length === 0) throw new Error(`grid-tokens: no --grid-margin in ${SPACING}`);
  return out;
}

/** The widest breakpoint's page margin — what a build-time fallback rendered
 *  at nominal desktop width should use. */
export function gridMarginWide() {
  return gridMargins().at(-1);
}
