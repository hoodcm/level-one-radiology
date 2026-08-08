#!/usr/bin/env node
// Guards two single-source rules that stylelint structurally cannot see.
//
// 1. HARD-CODED COLORS in component markup — inline `style={{…}}` objects in
//    .tsx/.jsx and inline literals in .astro. Stylelint covers src/styles/**.css
//    for this, so the hex check deliberately does NOT walk .css: CSS hex
//    literals stay stylelint's job and must not be double-reported.
//
// 2. SWATCH LEAKAGE — the `--gray-*` swatch layer (src/styles/tokens/colors.css)
//    is the raw ramp, and only ROLE tokens may reference it. A component that
//    reaches past its role to a swatch re-introduces exactly the drift the role
//    layer exists to prevent. stylelint's declaration-strict-value inspects
//    declaration VALUES against allowed types; it cannot express "this custom
//    property name is off-limits outside one file", which is why this lives
//    here. This check DOES walk .css — that is where the consumers are, and the
//    whole reason it exists — plus .mjs/.ts, since generated markup and drawing
//    code can emit styles too.
//
// Exits non-zero on any violation. Fails CLOSED: if a full scan turns up no
// files for either check, that is a broken scan, not a clean tree.
//
// Usage: node scripts/check-inline-colors.mjs [file ...]
// With no args, scans the default component globs.

import { readFileSync, readdirSync, existsSync } from 'node:fs';

const HEX_EXTS = ['.tsx', '.jsx', '.astro'];
const SWATCH_EXTS = ['.css', '.mjs', '.ts', ...HEX_EXTS];
const ALL_EXTS = [...new Set([...HEX_EXTS, ...SWATCH_EXTS])];

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const SWATCH = /--gray-\d+/;
/** The files allowed to name a swatch: the ramp's own definition, and the
 *  role layers that remap onto it (print is a role remap — the reference
 *  model's second-theme mechanism — so it references swatches by design). */
const SWATCH_HOMES = ['src/styles/tokens/colors.css', 'src/styles/tokens/print.css'];
const SWATCH_HOME = SWATCH_HOMES[0]; // named in violation messages

const hasExt = (name, exts) => exts.some((e) => name.endsWith(e));
const isSwatchHome = (path) => {
  const p = path.replace(/\\/g, '/');
  return SWATCH_HOMES.some((home) => p.endsWith(home));
};
// Tests name tokens as DATA — retired-token lists, parser patterns — rather
// than consuming them, so they are not consumers for either rule.
const isTest = (path) => /\.test\./.test(path);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walk(path));
    else if (hasExt(entry.name, ALL_EXTS)) out.push(path);
  }
  return out;
}

const args = process.argv.slice(2);
const fullScan = args.length === 0;
const files = (fullScan ? walk('src') : args).filter((f) => !isTest(f));

const hexFiles = files.filter((f) => hasExt(f, HEX_EXTS));
const swatchFiles = files.filter((f) => hasExt(f, SWATCH_EXTS) && !isSwatchHome(f));

// Fail closed. A check that cannot tell "nothing to enforce" from "nothing
// wrong" launders absence into a pass; on a full scan both sets must be real.
if (fullScan && (hexFiles.length === 0 || swatchFiles.length === 0)) {
  console.error(
    '✖ check-inline-colors scanned no files ' +
      `(markup: ${hexFiles.length}, swatch: ${swatchFiles.length}).\n` +
      '  This is a broken scan, not a clean tree — check EXTS and the walk root.',
  );
  process.exit(1);
}

// Same discipline on the args path, which is the one the PostToolUse hook
// uses. A named path that cannot be read is a typo, a rename, or a stale
// hook payload — never a clean result. (A path that reads fine but is not a
// style file is legitimate: the caller is told, and nothing is claimed.)
if (!fullScan) {
  const unreadable = args.filter((f) => !existsSync(f));
  if (unreadable.length) {
    console.error(
      `✖ check-inline-colors was given ${unreadable.length} path(s) it cannot read:\n` +
        unreadable.map((f) => `  ${f}`).join('\n') +
        '\n  Refusing to report clean on files that were never checked.',
    );
    process.exit(1);
  }
}

const violations = [];

for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue; // skip unreadable / nonexistent paths (hook may pass a deleted file)
  }
  const checkHex = hasExt(file, HEX_EXTS);
  const checkSwatch = hasExt(file, SWATCH_EXTS) && !isSwatchHome(file);

  text.split('\n').forEach((line, i) => {
    if (checkHex) {
      // Sole blessed literal: <meta name="theme-color"> — HTML meta can't
      // reference a CSS var. Its value must mirror --color-bg-deepest.
      if (!line.includes('theme-color')) {
        const m = line.match(HEX);
        if (m) {
          violations.push(
            `${file}:${i + 1}: hard-coded color "${m[0]}" — use a var(--color-…) token`,
          );
        }
      }
    }
    if (checkSwatch) {
      const m = line.match(SWATCH);
      if (m) {
        violations.push(
          `${file}:${i + 1}: swatch "${m[0]}" used outside the swatch/role layer ` +
            `(${SWATCH_HOME} + its role remaps) — reference a role token (--color-…), not the raw ramp`,
        );
      }
    }
  });
}

if (violations.length) {
  console.error('✖ Token violations (values come from src/styles/tokens/, via roles):\n');
  for (const v of violations) console.error('  ' + v);
  console.error(`\n${violations.length} violation(s).`);
  process.exit(1);
}
if (hexFiles.length === 0 && swatchFiles.length === 0) {
  // Args mode only (a full scan with zero files already exited above). Say
  // what happened rather than printing a tick that implies coverage.
  console.log(`· check-inline-colors: no checkable files among ${args.length} path(s).`);
} else {
  console.log(
    `✓ No hard-coded colors in component markup (${hexFiles.length} files); ` +
      `no swatch leakage outside colors.css (${swatchFiles.length} files).`,
  );
}
