#!/usr/bin/env node
/**
 * build-case.mjs — case-viewer ingestion CLI.
 *
 * STACK kind (default; CT scrub — the original path, untouched):
 *
 *   npm run case:build -- --in <folder> --id <case-id>
 *     [--series axial:AXIAL]        series key + display label   (default axial:AXIAL)
 *     [--window soft:"SOFT TISSUE"] window key + display label   (default soft:"SOFT TISSUE")
 *     [--plane axial]               anatomic plane               (default: series key)
 *     [--start N]                   author-chosen key image      (default 1; series-create only)
 *     [--title "..."] [--modality CT]                            (manifest-level, upserted)
 *     [--stack-key s003]            apply the rotate/crop stored under this
 *                                   key in cases-src/<id>/selection.json
 *                                   stacks[] (the review tool writes it —
 *                                   e.g. a square crop centered over the
 *                                   whole z-axis) to every frame
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
 * VIEWS kind (x-ray/US static views, gated by the case:review tool):
 *
 *   npm run case:build -- --kind views --id <case-id> --in <staging dir>
 *
 * Reads cases-src/<id>/selection.json (the committed, PHI-free human-work
 * record) + staged originals from <staging dir>/originals/. Per included
 * view, in order: rotate → crop (normalized rect on the rotated image) →
 * resize ≤1200px long edge → burn redaction boxes (normalized → output
 * pixels, opaque black — AFTER the resize, so the gate verifies shipped
 * bytes) → draw arrow annotations → JPEG views/{nnn}.jpg + rail thumb
 * views/thumb-{nnn}.jpg; poster from the first view; manifest kind:"views"
 * with the max-envelope `stage`. Box/arrow coordinates are normalized 0–1
 * relative to the post-rotate/crop image (what the review tool displays).
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
const POSTER_QUALITY = 55; // the tiny blur-up poster; one spec for both kinds
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
if (args.kind && args.kind !== 'views') die(`unknown --kind "${args.kind}" (omit for stack, or use "views")`);

// --- views kind --------------------------------------------------------------
const THUMB_EDGE = 120;
/** DICOM modality → the manifest's display modality. */
const DISPLAY_MODALITY = { DX: 'XR', CR: 'XR', DR: 'XR' };

/** Normalized 0–1 rect sanity: present, in range, positive area. */
function checkRect(rect, what) {
  const ok =
    rect &&
    [rect.x, rect.y, rect.w, rect.h].every((v) => typeof v === 'number' && v >= 0 && v <= 1) &&
    rect.w > 0 &&
    rect.h > 0 &&
    rect.x + rect.w <= 1.0001 &&
    rect.y + rect.h <= 1.0001;
  if (!ok) die(`${what}: invalid normalized rect ${JSON.stringify(rect)}`);
}

/** Validate selection.json (schema in the plan + review tool); returns the
 *  included views in display order. Loud on any malformed entry — the
 *  selection is the sole human-work record, so silence is never safe. */
function includedViews(selection, id) {
  if (selection.case !== id)
    die(`selection.json is for case "${selection.case}", not "${id}"`);
  if (!Array.isArray(selection.views) || selection.views.length === 0)
    die('selection.json has no views[]');
  for (const v of selection.views) {
    const at = `selection view "${v.src ?? '?'}"`;
    if (typeof v.src !== 'string' || !v.src) die(`${at}: missing src`);
    // src names one staged original — it must stay a bare basename so a
    // hand- or endpoint-written selection.json can't path-traverse out of
    // staging/originals into arbitrary on-disk images.
    if (v.src !== path.basename(v.src) || v.src.includes('/') || v.src.includes('\\'))
      die(`${at}: src must be a bare filename, not a path`);
    if (typeof v.include !== 'boolean') die(`${at}: missing include`);
    if (typeof v.order !== 'number') die(`${at}: missing order`);
    if (typeof (v.label ?? '') !== 'string') die(`${at}: label must be a string`);
    for (const b of v.boxes ?? []) checkRect(b, `${at} box`);
    const t = v.transform;
    if (t) {
      if (t.rotate !== undefined && typeof t.rotate !== 'number')
        die(`${at}: transform.rotate must be a number (degrees)`);
      if (t.crop !== undefined) checkRect(t.crop, `${at} crop`);
    }
    for (const a of v.arrows ?? []) {
      const nums = [a.x1, a.y1, a.x2, a.y2];
      if (!nums.every((n) => typeof n === 'number' && n >= 0 && n <= 1))
        die(`${at}: invalid normalized arrow ${JSON.stringify(a)}`);
    }
  }
  const included = selection.views
    .filter((v) => v.include)
    .sort((a, b) => a.order - b.order);
  if (included.length === 0) die('selection.json includes no views');
  return included;
}

/** rotate → crop (normalized rect on the ROTATED image) for one sharp
 *  pipeline. A crop materializes the rotated buffer first — rotation by a
 *  non-right angle expands the canvas, and the rect maps onto those dims. */
async function applyTransform(img, transform, what) {
  const rotate = transform?.rotate ?? 0;
  if (rotate) img = img.rotate(rotate, { background: '#000000' });
  if (transform?.crop) {
    const buf = await img.png().toBuffer();
    const meta = await sharp(buf).metadata();
    const c = transform.crop;
    const left = Math.round(c.x * meta.width);
    const top = Math.round(c.y * meta.height);
    const width = Math.min(meta.width - left, Math.round(c.w * meta.width));
    const height = Math.min(meta.height - top, Math.round(c.h * meta.height));
    if (width < 1 || height < 1) die(`${what}: crop collapses to nothing`);
    img = sharp(buf).extract({ left, top, width, height });
  }
  return img;
}

/** One SVG overlay at output-pixel scale: opaque-black redaction rects
 *  (floor/ceil expansion — a burn must never undercover its box) plus arrow
 *  annotations (white with a black underlay, legible on any field). */
function overlaySvg(w, h, boxes, arrows) {
  if (boxes.length === 0 && arrows.length === 0) return null;
  const parts = [];
  for (const b of boxes) {
    const x = Math.floor(b.x * w);
    const y = Math.floor(b.y * h);
    parts.push(
      `<rect x="${x}" y="${y}" width="${Math.ceil(b.w * w + (b.x * w - x))}" height="${Math.ceil(b.h * h + (b.y * h - y))}" fill="#000"/>`
    );
  }
  const sw = Math.max(3, Math.round(Math.max(w, h) * 0.004));
  for (const a of arrows) {
    const x1 = a.x1 * w;
    const y1 = a.y1 * h;
    const x2 = a.x2 * w;
    const y2 = a.y2 * h;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const head = sw * 4;
    // Shaft stops short of the tip so the head's point stays sharp.
    const sx2 = x2 - Math.cos(ang) * head * 0.8;
    const sy2 = y2 - Math.sin(ang) * head * 0.8;
    const wing = (side) => {
      const t = ang + Math.PI + side * (Math.PI / 7);
      return `${(x2 + Math.cos(t) * head).toFixed(1)},${(y2 + Math.sin(t) * head).toFixed(1)}`;
    };
    const headPts = `${x2.toFixed(1)},${y2.toFixed(1)} ${wing(1)} ${wing(-1)}`;
    const line = `x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${sx2.toFixed(1)}" y2="${sy2.toFixed(1)}"`;
    parts.push(
      `<g stroke-linecap="round">` +
        `<line ${line} stroke="#000" stroke-width="${sw * 2}"/>` +
        `<polygon points="${headPts}" fill="#000" stroke="#000" stroke-width="${sw}" stroke-linejoin="round"/>` +
        `<line ${line} stroke="#fff" stroke-width="${sw}"/>` +
        `<polygon points="${headPts}" fill="#fff"/>` +
        `</g>`
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${parts.join('')}</svg>`;
}

async function buildViews() {
  const inDir = path.resolve(args.in);
  const selPath = path.resolve('cases-src', args.id, 'selection.json');
  let selection;
  try {
    selection = JSON.parse(await readFile(selPath, 'utf8'));
  } catch (e) {
    die(`cannot read ${selPath} (${e.message})`);
  }
  const included = includedViews(selection, args.id);

  // Display modality from the included views' own staging entries (DX→XR
  // etc.) — the study-level modality can differ in a mixed CT+XR export.
  // --modality overrides.
  let modality = args.modality || '';
  if (!modality) {
    try {
      const idx = JSON.parse(await readFile(path.join(inDir, 'index.json'), 'utf8'));
      const byFile = new Map((idx.images ?? []).map((im) => [im.file, im.modality]));
      const m =
        included.map((v) => byFile.get(`originals/${v.src}`)).find(Boolean) ||
        idx.study?.modality ||
        '';
      modality = DISPLAY_MODALITY[m] ?? m;
    } catch {
      /* staging index optional for hand-built inputs */
    }
  }

  const outDir = path.resolve('public/cases', args.id);
  const viewsDir = path.join(outDir, 'views');
  await rm(viewsDir, { recursive: true, force: true });
  await mkdir(viewsDir, { recursive: true });

  const viewsOut = [];
  for (let n = 1; n <= included.length; n++) {
    const v = included[n - 1];
    const srcPath = path.join(inDir, 'originals', v.src);
    const img = await applyTransform(sharp(srcPath), v.transform, `view "${v.src}"`);
    const resized = await img
      .resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer({ resolveWithObject: true });
    const { width, height } = resized.info;
    const svg = overlaySvg(width, height, v.boxes ?? [], v.arrows ?? []);
    let out = sharp(resized.data);
    if (svg) out = out.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);
    const file = `views/${nnn(n)}.jpg`;
    const thumb = `views/thumb-${nnn(n)}.jpg`;
    await out.jpeg(JPEG_OPTS).toFile(path.join(outDir, file));
    await sharp(path.join(outDir, file))
      .resize(THUMB_EDGE, THUMB_EDGE, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toFile(path.join(outDir, thumb));
    viewsOut.push({
      key: `v${String(n).padStart(2, '0')}`,
      label: v.label || v.src,
      width,
      height,
      file,
      thumb,
    });
  }

  // Poster: the first view, existing ~96px convention.
  await sharp(path.join(outDir, viewsOut[0].file))
    .resize(POSTER_EDGE, POSTER_EDGE, { fit: 'inside' })
    .jpeg({ quality: POSTER_QUALITY })
    .toFile(path.join(outDir, 'poster.jpg'));

  const manifestPath = path.join(outDir, 'manifest.json');
  let prevRev = 0;
  try {
    prevRev = JSON.parse(await readFile(manifestPath, 'utf8')).rev ?? 0;
  } catch {
    /* first build */
  }
  const manifest = {
    id: args.id,
    title: args.title || selection.title || args.id,
    modality,
    base: `/cases/${args.id}/`,
    rev: prevRev + 1,
    kind: 'views',
    stage: {
      width: Math.max(...viewsOut.map((v) => v.width)),
      height: Math.max(...viewsOut.map((v) => v.height)),
    },
    start: Math.min(viewsOut.length, Math.max(1, Number(selection.start) || 1)),
    poster: 'poster.jpg',
    views: viewsOut,
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `case:build ${args.id} · views · ${viewsOut.length} view(s) · stage ` +
      `${manifest.stage.width}×${manifest.stage.height} · rev ${manifest.rev}`
  );
}

if (args.kind === 'views') {
  await buildViews();
  process.exit(0);
}

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

// Stack-wide rotate/crop from the review tool's selection.json (see usage
// note on --stack-key). Same transform on every frame, so the per-window
// geometry contract holds by construction.
let stackTransform = null;
if (args['stack-key']) {
  const selPath = path.resolve('cases-src', args.id, 'selection.json');
  let sel;
  try {
    sel = JSON.parse(await readFile(selPath, 'utf8'));
  } catch (e) {
    die(`--stack-key given but ${selPath} is unreadable (${e.message})`);
  }
  stackTransform =
    (sel.stacks ?? []).find((s) => s.key === args['stack-key'])?.transform ?? null;
  if (stackTransform?.crop) checkRect(stackTransform.crop, `stack "${args['stack-key']}" crop`);
}

let width = 0;
let height = 0;
for (let i = 0; i < inputs.length; i++) {
  const src = sharp(path.join(inDir, inputs[i]))
    .autoOrient(); // bake EXIF orientation in, since the tag is stripped
  const out = await (await applyTransform(src, stackTransform, inputs[i]))
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
    .jpeg({ quality: POSTER_QUALITY })
    .toFile(path.join(outDir, series.poster));
}

// The rev bump in this manifest is what invalidates embedding articles'
// cached renders (src/lib/case-loader.ts keys on it, live in dev).
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(
  `case:build ${args.id} · ${seriesKey}/${windowKey} · ${frames} frames @ ${width}×${height} · rev ${manifest.rev}`
);
