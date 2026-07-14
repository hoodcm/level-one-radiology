#!/usr/bin/env node
/**
 * build-case.mjs — assemble a prepared case into a case-viewer payload.
 *
 *   npm run case:build -- --id <case-id> --in <prepared case dir>
 *     [--kind views|stack]  required only when case.json carries BOTH views
 *                           and stacks (pick which payload to assemble)
 *     [--title "..."] [--modality CT]   override the case.json values
 *     [--start N]           author-chosen key image (stacks; default 1)
 *
 * The input is a prepared case folder from the private
 * prepare-radiology-cases repo (typically ../prepare-radiology-cases/
 * cases/<id>/): already de-identified, redacted, and curated there, with a
 * case.json sidecar describing views and/or stacks. This script only
 * downscales (≤1200px long edge), renumbers, generates thumbs + poster, and
 * writes public/cases/<id>/manifest.json — it never edits pixels beyond the
 * resize, so the pipeline's human redaction gate remains the last authority
 * over image content.
 *
 * VIEWS (case.json views[]): per view in order → JPEG views/{nnn}.jpg + rail
 * thumb views/thumb-{nnn}.jpg; poster from the first view; manifest
 * kind:"views" with the max-envelope `stage`.
 *
 * STACKS (case.json stacks[]): per series×window entry → <series>/<window>/
 * {nnn}.jpg; windows of one series must align 1:1 on frame count and
 * geometry (a window switch preserves the frame index — that index is the
 * pedagogy); poster from the start frame of each series' first window.
 *
 * The output directory is rebuilt wholesale each run; manifest `rev` carries
 * over and bumps (src/lib/case-loader.ts keys cached article renders on it).
 */
import sharp from 'sharp';
import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { nnn } from '../src/lib/case-shell.mjs';

const LONG_EDGE = 1200;
const POSTER_EDGE = 96;
const POSTER_QUALITY = 55; // the tiny blur-up poster; one spec for both kinds
const THUMB_EDGE = 120;
const JPEG_OPTS = { quality: 82, mozjpeg: true };

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

if (!args.in || !args.id) die('--in <prepared case dir> and --id <case-id> are required');
if (!/^[a-z0-9-]+$/.test(args.id)) die(`--id must be a URL-safe slug, got "${args.id}"`);
if (args.kind && args.kind !== 'views' && args.kind !== 'stack')
  die(`unknown --kind "${args.kind}" (views or stack)`);

const inDir = path.resolve(args.in);
let caseJson;
try {
  caseJson = JSON.parse(await readFile(path.join(inDir, 'case.json'), 'utf8'));
} catch (e) {
  die(
    `cannot read ${path.join(inDir, 'case.json')} (${e.message}) — the input must be a ` +
      `prepared case folder (see the private prepare-radiology-cases repo)`
  );
}

const hasViews = (caseJson.views ?? []).length > 0;
const hasStacks = (caseJson.stacks ?? []).length > 0;
if (!hasViews && !hasStacks) die('case.json has neither views[] nor stacks[]');
let kind = args.kind;
if (!kind) {
  if (hasViews && hasStacks)
    die('case.json has both views[] and stacks[] — pass --kind views|stack');
  kind = hasViews ? 'views' : 'stack';
}
if (kind === 'views' && !hasViews) die('--kind views but case.json has no views[]');
if (kind === 'stack' && !hasStacks) die('--kind stack but case.json has no stacks[]');

const title = args.title || caseJson.title || args.id;
const modality = args.modality || caseJson.modality || '';

const outDir = path.resolve('public/cases', args.id);
let prevRev = 0;
try {
  prevRev = JSON.parse(await readFile(path.join(outDir, 'manifest.json'), 'utf8')).rev ?? 0;
} catch {
  /* first build */
}
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const base = {
  id: args.id,
  title,
  modality,
  base: `/cases/${args.id}/`,
  rev: prevRev + 1,
};

/** Downscale one prepared image to the site's delivery spec. */
const deliver = (srcPath) =>
  sharp(srcPath).resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true });

async function poster(fromFile, toFile) {
  await sharp(fromFile)
    .resize(POSTER_EDGE, POSTER_EDGE, { fit: 'inside' })
    .jpeg({ quality: POSTER_QUALITY })
    .toFile(toFile);
}

// --- views kind ------------------------------------------------------------
async function buildViews() {
  const viewsDir = path.join(outDir, 'views');
  await mkdir(viewsDir, { recursive: true });

  const viewsOut = [];
  for (let n = 1; n <= caseJson.views.length; n++) {
    const v = caseJson.views[n - 1];
    const file = `views/${nnn(n)}.jpg`;
    const thumb = `views/thumb-${nnn(n)}.jpg`;
    const out = await deliver(path.join(inDir, v.file))
      .jpeg(JPEG_OPTS)
      .toFile(path.join(outDir, file));
    await sharp(path.join(outDir, file))
      .resize(THUMB_EDGE, THUMB_EDGE, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toFile(path.join(outDir, thumb));
    viewsOut.push({
      key: `v${String(n).padStart(2, '0')}`,
      label: v.label || v.file,
      width: out.width,
      height: out.height,
      file,
      thumb,
    });
  }

  await poster(path.join(outDir, viewsOut[0].file), path.join(outDir, 'poster.jpg'));

  const manifest = {
    ...base,
    kind: 'views',
    stage: {
      width: Math.max(...viewsOut.map((v) => v.width)),
      height: Math.max(...viewsOut.map((v) => v.height)),
    },
    start: Math.min(viewsOut.length, Math.max(1, Number(caseJson.start) || 1)),
    poster: 'poster.jpg',
    views: viewsOut,
  };
  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `case:build ${args.id} · views · ${viewsOut.length} view(s) · stage ` +
      `${manifest.stage.width}×${manifest.stage.height} · rev ${manifest.rev}`
  );
}

// --- stack kind --------------------------------------------------------------
async function buildStacks() {
  const seriesOut = []; // ordered by first appearance in case.json

  for (const entry of caseJson.stacks) {
    const srcDir = path.join(inDir, entry.dir);
    let inputs;
    try {
      inputs = (await readdir(srcDir))
        .filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    } catch (e) {
      die(`cannot read stack dir ${srcDir} (${e.message})`);
    }
    if (inputs.length === 0) die(`no images found in ${srcDir}`);

    const frameDir = path.join(outDir, entry.series, entry.window);
    await mkdir(frameDir, { recursive: true });
    let width = 0;
    let height = 0;
    for (let i = 0; i < inputs.length; i++) {
      const out = await deliver(path.join(srcDir, inputs[i]))
        .jpeg(JPEG_OPTS)
        .toFile(path.join(frameDir, `${nnn(i + 1)}.jpg`));
      if (i === 0) {
        width = out.width;
        height = out.height;
      } else if (out.width !== width || out.height !== height) {
        die(
          `frame geometry mismatch: ${entry.dir}/${inputs[i]} → ${out.width}×${out.height}, ` +
            `expected ${width}×${height} (all frames in a window share geometry)`
        );
      }
    }

    let series = seriesOut.find((s) => s.key === entry.series);
    if (!series) {
      series = {
        key: entry.series,
        label: entry.seriesLabel || entry.series.toUpperCase(),
        plane: entry.plane || entry.series,
        frames: inputs.length,
        width,
        height,
        start: Math.min(inputs.length, Math.max(1, Number(args.start) || 1)),
        windows: [],
        poster: `${entry.series}/poster.jpg`,
      };
      seriesOut.push(series);
    } else if (inputs.length !== series.frames) {
      die(
        `frame count mismatch: series "${entry.series}" has ${series.frames} frames, ` +
          `window "${entry.window}" has ${inputs.length} — windows within a series must ` +
          `align 1:1 (the frame index is the pedagogy)`
      );
    } else if (width !== series.width || height !== series.height) {
      die(
        `geometry mismatch: series "${entry.series}" is ${series.width}×${series.height}, ` +
          `window "${entry.window}" is ${width}×${height}`
      );
    }
    series.windows.push({
      key: entry.window,
      label: entry.windowLabel || entry.window.toUpperCase(),
      pattern: `${entry.series}/${entry.window}/{nnn}.jpg`,
    });
  }

  // Poster per series: the start frame of its first window (the one that
  // paints before JS).
  for (const s of seriesOut) {
    await poster(
      path.join(outDir, s.key, s.windows[0].key, `${nnn(s.start)}.jpg`),
      path.join(outDir, s.poster)
    );
  }

  const manifest = { ...base, series: seriesOut };
  // The rev bump in this manifest is what invalidates embedding articles'
  // cached renders (src/lib/case-loader.ts keys on it, live in dev).
  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const summary = seriesOut
    .map((s) => `${s.key}[${s.windows.map((w) => w.key).join(',')}] ${s.frames} frames @ ${s.width}×${s.height}`)
    .join(' · ');
  console.log(`case:build ${args.id} · ${summary} · rev ${manifest.rev}`);
}

if (kind === 'views') await buildViews();
else await buildStacks();
