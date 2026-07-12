// Contract tests for the case:build CLI (plan step 4 contracts: manifest
// schema shape + CLI flags). Exercised at the level the contract is exposed:
// a real child-process invocation against tiny generated frames.
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  existsSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const CLI = path.resolve('scripts/build-case.mjs');
const CASE_DIR = path.resolve('public/cases/vitest-ingest');
let srcA, srcB, srcShort;

const run = (args) =>
  execFileSync('node', [CLI, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

beforeAll(async () => {
  srcA = mkdtempSync(path.join(tmpdir(), 'case-a-'));
  srcB = mkdtempSync(path.join(tmpdir(), 'case-b-'));
  srcShort = mkdtempSync(path.join(tmpdir(), 'case-c-'));
  const px = (seed) =>
    sharp({ create: { width: 64, height: 48, channels: 3, background: { r: seed, g: seed, b: seed } } });
  for (let i = 0; i < 3; i++) {
    // Deliberately unsorted, mixed-extension names: ingestion renumbers.
    await px(40 + i).jpeg().toFile(path.join(srcA, `IMG_${9 - i}.jpeg`));
    await px(90 + i).png().toFile(path.join(srcB, `scan ${100 + i}.png`));
  }
  await px(10).jpeg().toFile(path.join(srcShort, `only.jpg`));
});

afterAll(() => {
  for (const d of [srcA, srcB, srcShort]) rmSync(d, { recursive: true, force: true });
  rmSync(CASE_DIR, { recursive: true, force: true });
});

describe('case:build CLI contract', () => {
  it('ingests a folder into numbered frames + poster + schema-shaped manifest', () => {
    run(['--in', srcA, '--id', 'vitest-ingest', '--series', 'axial:AXIAL',
      '--window', 'soft:SOFT TISSUE', '--start', '2', '--title', 'T', '--modality', 'CT']);

    expect(readdirSync(path.join(CASE_DIR, 'axial/soft')).sort()).toEqual(
      ['001.jpg', '002.jpg', '003.jpg']);
    expect(existsSync(path.join(CASE_DIR, 'axial/poster.jpg'))).toBe(true);

    const m = JSON.parse(readFileSync(path.join(CASE_DIR, 'manifest.json'), 'utf8'));
    expect(m).toMatchObject({
      id: 'vitest-ingest',
      title: 'T',
      modality: 'CT',
      base: '/cases/vitest-ingest/',
      rev: 1,
    });
    const s = m.series[0];
    expect(s).toMatchObject({ key: 'axial', label: 'AXIAL', plane: 'axial', frames: 3, start: 2 });
    expect(typeof s.width).toBe('number');
    expect(typeof s.height).toBe('number');
    expect(s.poster).toBe('axial/poster.jpg');
    expect(s.windows).toEqual([
      { key: 'soft', label: 'SOFT TISSUE', pattern: 'axial/soft/{nnn}.jpg' },
    ]);
  });

  it('upserts a second window into the same series and bumps rev', () => {
    run(['--in', srcB, '--id', 'vitest-ingest', '--series', 'axial:AXIAL', '--window', 'lung:LUNG']);
    const m = JSON.parse(readFileSync(path.join(CASE_DIR, 'manifest.json'), 'utf8'));
    expect(m.rev).toBe(2);
    expect(m.series).toHaveLength(1);
    expect(m.series[0].windows.map((w) => w.key)).toEqual(['soft', 'lung']);
    expect(m.series[0].start).toBe(2); // untouched by the second run
  });

  it('rejects a window whose frame count breaks the index-preservation contract', () => {
    expect(() =>
      run(['--in', srcShort, '--id', 'vitest-ingest', '--series', 'axial:AXIAL', '--window', 'bone:BONE'])
    ).toThrow(/frame count mismatch/);
  });

  it('requires --in and --id, and slug-safe ids', () => {
    expect(() => run(['--id', 'x'])).toThrow(/required/);
    expect(() => run(['--in', srcA, '--id', 'Bad Slug!'])).toThrow(/URL-safe slug/);
  });
});

describe('case:build --stack-key (stack-wide transform from selection.json)', () => {
  const ID = 'vitest-stack-crop';
  let root, src;

  beforeAll(async () => {
    root = mkdtempSync(path.join(tmpdir(), 'stackcrop-'));
    src = path.join(root, 'frames');
    mkdirSync(src, { recursive: true });
    mkdirSync(path.join(root, 'cases-src', ID), { recursive: true });
    for (let i = 0; i < 3; i++) {
      await sharp({ create: { width: 64, height: 48, channels: 3, background: { r: 80, g: 80, b: 80 } } })
        .png()
        .toFile(path.join(src, `f${i}.png`));
    }
    writeFileSync(
      path.join(root, 'cases-src', ID, 'selection.json'),
      JSON.stringify({
        case: ID,
        views: [],
        stacks: [{ key: 's003', transform: { crop: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } } }],
      })
    );
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('applies the stored crop to every frame (geometry contract intact)', () => {
    execFileSync(
      'node',
      [CLI, '--in', src, '--id', ID, '--series', 'axial:AXIAL', '--stack-key', 's003'],
      { encoding: 'utf8', cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    const m = JSON.parse(
      readFileSync(path.join(root, 'public/cases', ID, 'manifest.json'), 'utf8')
    );
    expect(m.series[0]).toMatchObject({ frames: 3, width: 32, height: 24 });
  });

  it('is inert without --stack-key: same input keeps native geometry', () => {
    execFileSync(
      'node',
      [CLI, '--in', src, '--id', `${ID}-plain`, '--series', 'axial:AXIAL'],
      { encoding: 'utf8', cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    const m = JSON.parse(
      readFileSync(path.join(root, 'public/cases', `${ID}-plain`, 'manifest.json'), 'utf8')
    );
    expect(m.series[0]).toMatchObject({ width: 64, height: 48 });
  });
});

// --- views kind (XR static views via selection.json) ------------------------
// Runs with cwd inside a temp root so cases-src/ and public/cases/ resolve
// there, never in the repo tree.
describe('case:build --kind views contract', () => {
  const ID = 'vitest-views';
  let root, staging, caseDir;

  const runViews = (extra = []) =>
    execFileSync('node', [CLI, '--kind', 'views', '--id', ID, '--in', staging, ...extra], {
      encoding: 'utf8',
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

  const writeSelection = (selection) =>
    writeFileSync(
      path.join(root, 'cases-src', ID, 'selection.json'),
      JSON.stringify(selection, null, 2)
    );

  /** Mean channel value of a normalized region in a written JPEG. */
  async function regionMean(file, rx, ry, rw, rh) {
    const img = sharp(path.join(caseDir, file));
    const { width, height } = await img.metadata();
    const { data } = await img
      .extract({
        left: Math.round(rx * width),
        top: Math.round(ry * height),
        width: Math.max(1, Math.round(rw * width)),
        height: Math.max(1, Math.round(rh * height)),
      })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  const baseSelection = () => ({
    case: ID,
    source: 'synthetic',
    title: 'XR TEST CASE',
    views: [
      // order deliberately reversed vs array position; one excluded
      { src: 'b.png', include: true, order: 2, label: 'LAT TEST', boxes: [] },
      { src: 'excluded.png', include: false, order: 3, label: 'SKIP', boxes: [] },
      {
        src: 'a.png',
        include: true,
        order: 1,
        label: 'AP TEST',
        boxes: [{ x: 0.5, y: 0.5, w: 0.25, h: 0.25 }],
      },
    ],
  });

  beforeAll(async () => {
    root = mkdtempSync(path.join(tmpdir(), 'views-'));
    staging = path.join(root, 'staging');
    caseDir = path.join(root, 'public/cases', ID);
    mkdirSync(path.join(staging, 'originals'), { recursive: true });
    mkdirSync(path.join(root, 'cases-src', ID), { recursive: true });
    const white = (w, h) =>
      sharp({ create: { width: w, height: h, channels: 3, background: { r: 255, g: 255, b: 255 } } });
    await white(200, 160).png().toFile(path.join(staging, 'originals/a.png'));
    await white(100, 50).png().toFile(path.join(staging, 'originals/b.png'));
    await white(40, 40).png().toFile(path.join(staging, 'originals/excluded.png'));
    writeFileSync(
      path.join(staging, 'index.json'),
      JSON.stringify({ study: { modality: 'DX', studyDescription: 'T' }, images: [], stacks: [] })
    );
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('builds included views in order with burned boxes, thumbs, poster, manifest', async () => {
    writeSelection(baseSelection());
    runViews();

    // Order: view 001 = order 1 = a.png (200×160); 002 = b.png (100×50).
    // Excluded view is absent entirely.
    expect(readdirSync(path.join(caseDir, 'views')).sort()).toEqual([
      '001.jpg', '002.jpg', 'thumb-001.jpg', 'thumb-002.jpg',
    ]);

    const m = JSON.parse(readFileSync(path.join(caseDir, 'manifest.json'), 'utf8'));
    expect(m).toMatchObject({
      id: ID,
      title: 'XR TEST CASE',
      modality: 'XR', // mapped from the staging index's DX
      base: `/cases/${ID}/`,
      rev: 1,
      kind: 'views',
      stage: { width: 200, height: 160 }, // max envelope across 200×160, 100×50
      start: 1,
      poster: 'poster.jpg',
    });
    expect(m.views).toEqual([
      { key: 'v01', label: 'AP TEST', width: 200, height: 160, file: 'views/001.jpg', thumb: 'views/thumb-001.jpg' },
      { key: 'v02', label: 'LAT TEST', width: 100, height: 50, file: 'views/002.jpg', thumb: 'views/thumb-002.jpg' },
    ]);
    expect(existsSync(path.join(caseDir, 'poster.jpg'))).toBe(true);

    // Burn lands where the normalized box says: box region opaque black on
    // the white field, region outside untouched.
    expect(await regionMean('views/001.jpg', 0.55, 0.55, 0.15, 0.15)).toBeLessThan(10);
    expect(await regionMean('views/001.jpg', 0.05, 0.05, 0.2, 0.2)).toBeGreaterThan(245);
  });

  it('applies rotate and crop before the resize; draws arrows; bumps rev', async () => {
    const sel = baseSelection();
    // a.png (200×160): rotate 90 → 160×200, then crop the top-left half → 80×100.
    sel.views[2].transform = { rotate: 90, crop: { x: 0, y: 0, w: 0.5, h: 0.5 } };
    sel.views[2].boxes = [];
    // Arrow across the white field of b.png — verify dark outline ink lands.
    sel.views[0].arrows = [{ x1: 0.2, y1: 0.2, x2: 0.8, y2: 0.8 }];
    writeSelection(sel);
    runViews();

    const m = JSON.parse(readFileSync(path.join(caseDir, 'manifest.json'), 'utf8'));
    expect(m.rev).toBe(2);
    expect(m.views[0]).toMatchObject({ width: 80, height: 100 });
    // The arrow's black underlay must darken the shaft midpoint region of an
    // otherwise-white image.
    expect(await regionMean('views/002.jpg', 0.45, 0.45, 0.1, 0.1)).toBeLessThan(245);
  });

  it('rejects a selection for a different case id and an all-excluded selection', () => {
    const wrongId = baseSelection();
    wrongId.case = 'someone-else';
    writeSelection(wrongId);
    expect(() => runViews()).toThrow(/is for case "someone-else"/);

    const none = baseSelection();
    for (const v of none.views) v.include = false;
    writeSelection(none);
    expect(() => runViews()).toThrow(/includes no views/);
  });

  it('rejects malformed normalized rects loudly', () => {
    const bad = baseSelection();
    bad.views[2].boxes = [{ x: 0.9, y: 0.9, w: 0.5, h: 0.5 }]; // overflows 0–1
    writeSelection(bad);
    expect(() => runViews()).toThrow(/invalid normalized rect/);
  });
});
