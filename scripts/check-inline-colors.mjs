#!/usr/bin/env node
// Guards the "colors come from central tokens, never hard-coded" rule in the
// places stylelint can't see: inline `style={{…}}` objects in .tsx/.jsx and
// `<style>`-less inline literals in .astro. Stylelint covers src/styles/**.css;
// this covers component markup. Flags hex color literals (#abc / #aabbcc /
// #aabbccdd). Exits non-zero if any are found. Advisory by design — the fix is
// always: define/reference a var(--color-…) token in src/styles/tokens/.
//
// Usage: node scripts/check-inline-colors.mjs [file ...]
// With no args, scans the default component globs.

import { readFileSync, readdirSync } from 'node:fs';

const EXTS = ['.tsx', '.jsx', '.astro'];
const HEX = /#[0-9a-fA-F]{3,8}\b/;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walk(path));
    else if (EXTS.some((e) => entry.name.endsWith(e))) out.push(path);
  }
  return out;
}

const args = process.argv.slice(2);
const files = args.length ? args : walk('src');

const violations = [];
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue; // skip unreadable / nonexistent paths (hook may pass a deleted file)
  }
  text.split('\n').forEach((line, i) => {
    // Sole blessed literal: <meta name="theme-color"> — HTML meta can't
    // reference a CSS var. Its value must mirror --color-bg-deepest.
    if (line.includes('theme-color')) return;
    const m = line.match(HEX);
    if (m) violations.push(`${file}:${i + 1}: hard-coded color "${m[0]}" — use a var(--color-…) token`);
  });
}

if (violations.length) {
  console.error('✖ Hard-coded colors found (use central tokens from src/styles/tokens/):\n');
  for (const v of violations) console.error('  ' + v);
  console.error(`\n${violations.length} violation(s). Define or reference a token instead.`);
  process.exit(1);
}
console.log('✓ No hard-coded colors in component markup.');
