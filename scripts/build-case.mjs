#!/usr/bin/env node
/**
 * build-case.mjs — case-viewer ingestion CLI.
 *
 *   npm run case:build -- --in <folder> --id <case-id>
 *     [--series axial:AXIAL]        series key + display label   (default axial:AXIAL)
 *     [--window soft:"SOFT TISSUE"] window key + display label   (default soft:"SOFT TISSUE")
 *     [--plane axial]               anatomic plane               (default: series key)
 *     [--start N]                   author-chosen key image      (default 1; series-create only)
 *     [--title "..."] [--modality CT]                            (manifest-level, upserted)
 *
 * One run ingests ONE series+window: sorts the input folder's images by
 * filename, resizes to ≤1200px long edge, strips all metadata (sharp default
 * output carries no EXIF/ICC unless asked), renumbers 001..N, regenerates the
 * series poster (~96px, from the start frame of the series' first window),
 * and upserts public/cases/<id>/manifest.json (rev auto-bumped every run).
 * Additional windows for the same series come from additional runs; their
 * frame count and geometry must match the series exactly (a window switch
 * preserves the frame index — that index is the pedagogy).
 *
 * Content-agnostic by design: a folder of cat photos ingests and scrubs
 * identically to a CT series. De-identification happens at export time in the
 * clinical workflow, not here; the metadata strip is free hygiene on top.
 */
import sharp from 'sharp';
import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { nnn } from '../src/lib/case-shell.mjs';

const LONG_EDGE = 1200;
const POSTER_EDGE = 96;
const JPEG_OPTS = { quality: 82, mozjpeg: true };
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

// --- args ---------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    args[argv[i].slice(2)] = argv[i + 1];
    i++;
  }
  return args;
}
const args = parseArgs(process.argv.slice(2));
const die = (msg) => {
  console.error(`case:build error: ${msg}`);
  process.exit(1);
};

if (!args.in || !args.id) die('--in <folder> and --id <case-id> are required');
if (!/^[a-z0-9-]+$/.test(args.id)) die(`--id must be a URL-safe slug, got "${args.id}"`);

const keyLabel = (spec, fallbackKey, fallbackLabel) => {
  if (!spec) return [fallbackKey, fallbackLabel];
  const [key, ...rest] = spec.split(':');
  if (!/^[a-z0-9-]+$/.test(key)) die(`key in "${spec}" must be a URL-safe slug`);
  return [key, rest.join(':') || key.toUpperCase()];
};
const [seriesKey, seriesLabel] = keyLabel(args.series, 'axial', 'AXIAL');
const [windowKey, windowLabel] = keyLabel(args.window, 'soft', 'SOFT TISSUE');
const plane = args.plane || seriesKey;

// --- input frames ---------------------------------------------------------
const inDir = path.resolve(args.in);
const inputs = (await readdir(inDir))
  .filter((f) => EXTS.has(path.extname(f).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
if (inputs.length === 0) die(`no images found in ${inDir}`);

const outDir = path.resolve('public/cases', args.id);
const frameDir = path.join(outDir, seriesKey, windowKey);
await rm(frameDir, { recursive: true, force: true });
await mkdir(frameDir, { recursive: true });

let width = 0;
let height = 0;
for (let i = 0; i < inputs.length; i++) {
  const out = await sharp(path.join(inDir, inputs[i]))
    .rotate() // bake EXIF orientation in, since the tag is stripped
    .resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
    .jpeg(JPEG_OPTS)
    .toFile(path.join(frameDir, `${nnn(i + 1)}.jpg`));
  if (i === 0) {
    width = out.width;
    height = out.height;
  } else if (out.width !== width || out.height !== height) {
    die(
      `frame geometry mismatch: ${inputs[i]} → ${out.width}×${out.height}, ` +
        `expected ${width}×${height} (all frames in a window share geometry)`
    );
  }
}
const frames = inputs.length;

// --- manifest upsert -------------------------------------------------------
const manifestPath = path.join(outDir, 'manifest.json');
let manifest = null;
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {
  manifest = {
    id: args.id,
    title: args.title || args.id,
    modality: args.modality || '',
    base: `/cases/${args.id}/`,
    rev: 0,
    series: [],
  };
}
if (args.title) manifest.title = args.title;
if (args.modality) manifest.modality = args.modality;
manifest.rev += 1;

let series = manifest.series.find((s) => s.key === seriesKey);
if (!series) {
  series = {
    key: seriesKey,
    label: seriesLabel,
    plane,
    frames,
    width,
    height,
    start: Math.min(frames, Math.max(1, Number(args.start) || 1)),
    windows: [],
    poster: `${seriesKey}/poster.jpg`,
  };
  manifest.series.push(series);
} else {
  if (frames !== series.frames)
    die(
      `frame count mismatch: series "${seriesKey}" has ${series.frames} frames, ` +
        `input has ${frames} — windows within a series must align 1:1 ` +
        `(re-ingest every window after changing the frame set)`
    );
  if (width !== series.width || height !== series.height)
    die(
      `geometry mismatch: series "${seriesKey}" is ${series.width}×${series.height}, ` +
        `input is ${width}×${height}`
    );
  series.label = seriesLabel;
  series.plane = plane;
  if (args.start) series.start = Math.min(frames, Math.max(1, Number(args.start)));
}

const window_ = { key: windowKey, label: windowLabel, pattern: `${seriesKey}/${windowKey}/{nnn}.jpg` };
const wIdx = series.windows.findIndex((w) => w.key === windowKey);
if (wIdx === -1) series.windows.push(window_);
else series.windows[wIdx] = window_;

// Poster: from the start frame of the series' FIRST window (the one that
// paints before JS; regenerate whenever that window is the one ingested).
if (series.windows[0].key === windowKey) {
  await sharp(path.join(frameDir, `${nnn(series.start)}.jpg`))
    .resize(POSTER_EDGE, POSTER_EDGE, { fit: 'inside' })
    .jpeg({ quality: 55 })
    .toFile(path.join(outDir, series.poster));
}

// The rev bump in this manifest is what invalidates embedding articles'
// cached renders (src/lib/case-loader.ts keys on it, live in dev).
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(
  `case:build ${args.id} · ${seriesKey}/${windowKey} · ${frames} frames @ ${width}×${height} · rev ${manifest.rev}`
);
