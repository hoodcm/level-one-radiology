// Contract tests for the case:build CLI (plan step 4 contracts: manifest
// schema shape + CLI flags). Exercised at the level the contract is exposed:
// a real child-process invocation against tiny generated frames.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
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
