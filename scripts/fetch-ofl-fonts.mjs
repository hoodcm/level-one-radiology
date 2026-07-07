#!/usr/bin/env node
// Self-hosts the OFL faces (Newsreader / DM Sans / Michroma / Chivo Mono).
// Fetches Google Fonts' css2 output with a variable-font-capable UA, downloads
// the latin + latin-ext woff2 subsets to public/fonts/ofl/, and rewrites the
// served CSS (with its unicode-range subsetting intact) to local paths in
// src/styles/tokens/fonts-ofl.generated.css. Re-run to refresh; never
// hand-edit the generated file.
//
// Usage: node scripts/fetch-ofl-fonts.mjs

import { mkdirSync, writeFileSync } from 'node:fs';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// Weight/optical ranges match what the site actually uses (see typography.css
// token stacks). Ranges (400..700) yield variable woff2 slices, not one static
// file per weight.
const CSS_URL =
  'https://fonts.googleapis.com/css2' +
  '?family=Chivo+Mono:ital,wght@0,400..700;1,400' +
  '&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400' +
  '&family=Michroma' +
  '&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700' +
  '&display=swap';

const KEEP_SUBSETS = new Set(['latin', 'latin-ext']);
const fontsDir = new URL('../public/fonts/ofl/', import.meta.url);
const cssOut = new URL('../src/styles/tokens/fonts-ofl.generated.css', import.meta.url);

mkdirSync(fontsDir, { recursive: true });

const res = await fetch(CSS_URL, { headers: { 'User-Agent': UA } });
if (!res.ok) throw new Error(`css2 fetch failed: ${res.status}`);
const css = await res.text();

// Google emits "/* subset */\n@font-face {…}" pairs.
const blocks = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face\s*\{[^}]+\})/g)];
if (!blocks.length) throw new Error('no @font-face blocks parsed — css2 format changed?');

const rewritten = [];
let downloaded = 0;
for (const [, subset, block] of blocks) {
  if (!KEEP_SUBSETS.has(subset)) continue;
  const family = block.match(/font-family:\s*'([^']+)'/)[1];
  const style = block.match(/font-style:\s*(\w+)/)[1];
  const url = block.match(/src:\s*url\((https:[^)]+\.woff2)\)/)[1];
  const slug = family.toLowerCase().replace(/\s+/g, '-');
  const name = `${slug}-${style === 'italic' ? 'italic' : 'roman'}-${subset}.woff2`;

  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(new URL(name, fontsDir), buf);
  downloaded++;

  rewritten.push(
    `/* ${family} — ${style} — ${subset} */\n` +
      block.replace(/url\(https:[^)]+\)/, `url("/fonts/ofl/${name}")`)
  );
}

const header = `/* ==============================================
   GENERATED — self-hosted OFL faces (do not hand-edit)
   Produced by scripts/fetch-ofl-fonts.mjs, which downloads the woff2 files
   to public/fonts/ofl/ and rewrites Google's css2 output (unicode-range
   subsetting preserved) to local paths. Re-run the script to refresh.
   ============================================== */\n\n`;

writeFileSync(cssOut, header + rewritten.join('\n\n') + '\n');
console.log(`✓ ${downloaded} woff2 files → public/fonts/ofl/`);
console.log('✓ src/styles/tokens/fonts-ofl.generated.css written');
