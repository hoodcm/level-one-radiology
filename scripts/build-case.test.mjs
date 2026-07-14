// Contract tests for the case:build CLI: a prepared case folder (from the
// private prepare-radiology-cases repo — case.json + de-identified images)
// → the public/cases/<id>/ viewer payload. Exercised at the level the
// contract is exposed: a real child-process invocation against tiny
// generated fixtures, cwd inside a temp root so public/cases/ resolves
// there, never in the repo tree.
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const CLI = path.resolve('scripts/build-case.mjs');

const grey = (w, h, seed = 128) =>
  sharp({ create: { width: w, height: h, channels: 3, background: { r: seed, g: seed, b: seed } } });

const run = (root, cliArgs) =>
  execFileSync('node', [CLI, ...cliArgs], {
    encoding: 'utf8',
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

describe('case:build views payload from a prepared case', () => {
  const ID = 'vitest-views';
  let root, prepared, caseDir;

  beforeAll(async () => {
    root = mkdtempSync(path.join(tmpdir(), 'build-views-'));
    prepared = path.join(root, 'prepared', ID);
    caseDir = path.join(root, 'public/cases', ID);
    mkdirSync(prepared, { recursive: true });
    await grey(200, 160).jpeg().toFile(path.join(prepared, '01-ap-test.jpg'));
    // Oversized view: the assembler must downscale to the ≤1200px long edge.
    await grey(1600, 800).jpeg().toFile(path.join(prepared, '02-lat-test.jpg'));
    writeFileSync(
      path.join(prepared, 'case.json'),
      JSON.stringify({
        id: ID,
        title: 'XR TEST CASE',
        modality: 'XR',
        rev: 3,
        start: 1,
        views: [
          { file: '01-ap-test.jpg', label: 'AP TEST', width: 200, height: 160 },
          { file: '02-lat-test.jpg', label: 'LAT TEST', width: 1600, height: 800 },
        ],
        stacks: [],
      })
    );
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('assembles numbered views + thumbs + poster + schema-shaped manifest', () => {
    run(root, ['--id', ID, '--in', prepared]);

    expect(readdirSync(path.join(caseDir, 'views')).sort()).toEqual([
      '001.jpg', '002.jpg', 'thumb-001.jpg', 'thumb-002.jpg',
    ]);
    expect(existsSync(path.join(caseDir, 'poster.jpg'))).toBe(true);

    const m = JSON.parse(readFileSync(path.join(caseDir, 'manifest.json'), 'utf8'));
    expect(m).toMatchObject({
      id: ID,
      title: 'XR TEST CASE',
      modality: 'XR',
      base: `/cases/${ID}/`,
      rev: 1, // site-side rev, independent of the prepared case.json rev
      kind: 'views',
      stage: { width: 1200, height: 600 }, // max envelope AFTER delivery resize
      start: 1,
      poster: 'poster.jpg',
    });
    expect(m.views).toEqual([
      { key: 'v01', label: 'AP TEST', width: 200, height: 160, file: 'views/001.jpg', thumb: 'views/thumb-001.jpg' },
      { key: 'v02', label: 'LAT TEST', width: 1200, height: 600, file: 'views/002.jpg', thumb: 'views/thumb-002.jpg' },
    ]);
  });

  it('rebuilds wholesale but carries the rev forward (cache invalidation)', () => {
    run(root, ['--id', ID, '--in', prepared, '--title', 'RETITLED']);
    const m = JSON.parse(readFileSync(path.join(caseDir, 'manifest.json'), 'utf8'));
    expect(m.rev).toBe(2);
    expect(m.title).toBe('RETITLED'); // flag overrides case.json
  });

  it('requires a prepared case folder, --in/--id, and slug-safe ids', () => {
    expect(() => run(root, ['--id', 'x'])).toThrow(/required/);
    expect(() => run(root, ['--in', prepared, '--id', 'Bad Slug!'])).toThrow(/URL-safe slug/);
    const empty = mkdtempSync(path.join(tmpdir(), 'not-prepared-'));
    expect(() => run(root, ['--id', 'x-y', '--in', empty])).toThrow(/case\.json/);
    rmSync(empty, { recursive: true, force: true });
  });
});

describe('case:build stack payload from a prepared case', () => {
  const ID = 'vitest-stack';
  let root, prepared, caseDir;

  const caseJson = () => ({
    id: ID,
    title: 'CT TEST CASE',
    modality: 'CT',
    rev: 1,
    stacks: [
      { dir: 'stacks/s003-soft', series: 's003', seriesLabel: 'AXIAL', window: 'soft', windowLabel: 'SOFT TISSUE', plane: 'axial', frames: 3, width: 64, height: 48 },
      { dir: 'stacks/s003-bone', series: 's003', seriesLabel: 'AXIAL', window: 'bone', windowLabel: 'BONE', plane: 'axial', frames: 3, width: 64, height: 48 },
    ],
  });

  beforeAll(async () => {
    root = mkdtempSync(path.join(tmpdir(), 'build-stack-'));
    prepared = path.join(root, 'prepared', ID);
    caseDir = path.join(root, 'public/cases', ID);
    for (const win of ['soft', 'bone']) {
      const d = path.join(prepared, 'stacks', `s003-${win}`);
      mkdirSync(d, { recursive: true });
      for (let i = 1; i <= 3; i++) await grey(64, 48, 60 + i).jpeg().toFile(path.join(d, `00${i}.jpg`));
    }
    writeFileSync(path.join(prepared, 'case.json'), JSON.stringify(caseJson()));
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('assembles every series×window with per-series poster and manifest', () => {
    run(root, ['--id', ID, '--in', prepared, '--start', '2']);

    expect(readdirSync(path.join(caseDir, 's003/soft')).sort()).toEqual(['001.jpg', '002.jpg', '003.jpg']);
    expect(readdirSync(path.join(caseDir, 's003/bone')).sort()).toEqual(['001.jpg', '002.jpg', '003.jpg']);
    expect(existsSync(path.join(caseDir, 's003/poster.jpg'))).toBe(true);

    const m = JSON.parse(readFileSync(path.join(caseDir, 'manifest.json'), 'utf8'));
    expect(m).toMatchObject({ id: ID, title: 'CT TEST CASE', modality: 'CT', base: `/cases/${ID}/`, rev: 1 });
    const s = m.series[0];
    expect(s).toMatchObject({ key: 's003', label: 'AXIAL', plane: 'axial', frames: 3, width: 64, height: 48, start: 2, poster: 's003/poster.jpg' });
    expect(s.windows).toEqual([
      { key: 'soft', label: 'SOFT TISSUE', pattern: 's003/soft/{nnn}.jpg' },
      { key: 'bone', label: 'BONE', pattern: 's003/bone/{nnn}.jpg' },
    ]);
  });

  it('rejects a window whose frame count breaks the index-preservation contract', async () => {
    const d = path.join(prepared, 'stacks', 's003-lung');
    mkdirSync(d, { recursive: true });
    await grey(64, 48).jpeg().toFile(path.join(d, '001.jpg'));
    const cj = caseJson();
    cj.stacks.push({ dir: 'stacks/s003-lung', series: 's003', seriesLabel: 'AXIAL', window: 'lung', windowLabel: 'LUNG', plane: 'axial', frames: 1, width: 64, height: 48 });
    writeFileSync(path.join(prepared, 'case.json'), JSON.stringify(cj));
    expect(() => run(root, ['--id', ID, '--in', prepared])).toThrow(/frame count mismatch/);
  });

  it('demands --kind when a prepared case carries both views and stacks', async () => {
    const cj = caseJson();
    cj.views = [{ file: '01-key.jpg', label: 'KEY', width: 64, height: 48 }];
    cj.stacks.pop(); // drop the mismatched lung window again
    await grey(64, 48).jpeg().toFile(path.join(prepared, '01-key.jpg'));
    writeFileSync(path.join(prepared, 'case.json'), JSON.stringify(cj));
    expect(() => run(root, ['--id', ID, '--in', prepared])).toThrow(/pass --kind/);
    // Explicit --kind resolves it.
    run(root, ['--id', ID, '--in', prepared, '--kind', 'views']);
    const m = JSON.parse(readFileSync(path.join(caseDir, 'manifest.json'), 'utf8'));
    expect(m.kind).toBe('views');
  });
});
