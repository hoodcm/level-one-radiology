#!/usr/bin/env node
/**
 * dev-make-synthetic-stack.mjs — throwaway spike fixture generator.
 *
 * Draws a 48-frame synthetic "CT stack" whose scrub direction is visually
 * obvious (big frame number, a circle drifting corner-to-corner, per-frame
 * noise) into public/cases/dev-synthetic/, with two fake windows (soft =
 * as-drawn, lung = inverted) to exercise the window chips, a ~96px poster,
 * and a manifest.json in the case-viewer schema.
 *
 * Usage: node scripts/dev-make-synthetic-stack.mjs [--frames 48]
 * Regenerate freely; the whole output directory is disposable spike fixture.
 */
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SIZE = 1024;
const FRAMES = (() => {
  const i = process.argv.indexOf('--frames');
  return i > -1 ? Number(process.argv[i + 1]) : 48;
})();
const OUT = path.resolve('public/cases/dev-synthetic');
const START = Math.round(FRAMES / 2);

const nnn = (n) => String(n).padStart(3, '0');

function frameSvg(i) {
  // Circle drifts top-left → bottom-right across the stack; a vertical tick
  // sweeps left → right. Both make direction unmistakable at a glance.
  const t = (i - 1) / (FRAMES - 1);
  const cx = 160 + t * (SIZE - 320);
  const cy = 160 + t * (SIZE - 320);
  const tickX = 40 + t * (SIZE - 80);
  return `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${i}" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.18 0"/>
    </filter>
    <radialGradient id="body" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#4a4a4a"/>
      <stop offset="70%" stop-color="#242424"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#050505"/>
  <ellipse cx="${SIZE / 2}" cy="${SIZE / 2}" rx="440" ry="380" fill="url(#body)"/>
  <rect width="100%" height="100%" filter="url(#noise)"/>
  <circle cx="${cx}" cy="${cy}" r="72" fill="#b8b8b8" opacity="0.85"/>
  <rect x="${tickX}" y="24" width="6" height="72" fill="#d8d8d8"/>
  <text x="${SIZE / 2}" y="${SIZE / 2 + 90}" text-anchor="middle"
        font-family="monospace" font-size="240" font-weight="bold"
        fill="#e8e8e8" opacity="0.9">${i}</text>
  <text x="40" y="${SIZE - 40}" font-family="monospace" font-size="40"
        fill="#909090">DEV-SYNTHETIC ${nnn(i)}/${nnn(FRAMES)}</text>
</svg>`;
}

await mkdir(path.join(OUT, 'axial/soft'), { recursive: true });
await mkdir(path.join(OUT, 'axial/lung'), { recursive: true });

for (let i = 1; i <= FRAMES; i++) {
  const base = sharp(Buffer.from(frameSvg(i))).flatten({ background: '#050505' });
  await base
    .clone()
    .jpeg({ quality: 70, mozjpeg: true })
    .toFile(path.join(OUT, `axial/soft/${nnn(i)}.jpg`));
  await base
    .clone()
    .negate()
    .jpeg({ quality: 70, mozjpeg: true })
    .toFile(path.join(OUT, `axial/lung/${nnn(i)}.jpg`));
}

// Poster: blur-up thumb of the start frame (~96px, upscaled by CSS).
await sharp(path.join(OUT, `axial/soft/${nnn(START)}.jpg`))
  .resize(96, 96)
  .jpeg({ quality: 55 })
  .toFile(path.join(OUT, 'axial/poster.jpg'));

// Bump rev per run — the case-aware loader keys cached-render invalidation
// on it (src/lib/case-loader.ts), so regeneration re-renders embeds.
let prevRev = 0;
try {
  prevRev = JSON.parse(await readFile(path.join(OUT, 'manifest.json'), 'utf8')).rev ?? 0;
} catch {}

const manifest = {
  id: 'dev-synthetic',
  title: 'Synthetic test stack',
  modality: 'SYN',
  base: '/cases/dev-synthetic/',
  rev: prevRev + 1,
  series: [
    {
      key: 'axial',
      label: 'AXIAL',
      plane: 'axial',
      frames: FRAMES,
      width: SIZE,
      height: SIZE,
      start: START,
      windows: [
        { key: 'soft', label: 'SOFT TISSUE', pattern: 'axial/soft/{nnn}.jpg' },
        { key: 'lung', label: 'INVERTED', pattern: 'axial/lung/{nnn}.jpg' },
      ],
      poster: 'axial/poster.jpg',
    },
  ],
};
await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`dev-synthetic: ${FRAMES}×2 frames + poster + manifest → ${OUT} (rev ${manifest.rev})`);
