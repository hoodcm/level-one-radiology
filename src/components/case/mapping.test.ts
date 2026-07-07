import { describe, expect, it } from 'vitest';
import {
  PPF_MAX,
  PPF_MIN,
  clampFrame,
  clampToFrontier,
  frameForDrag,
  pxPerFrame,
  scrubTarget,
} from './mapping';

describe('pxPerFrame', () => {
  it('stays inside [PPF_MIN, PPF_MAX] across the realistic input space', () => {
    for (let width = 0; width <= 3200; width += 37) {
      for (let frames = 1; frames <= 240; frames += 7) {
        const v = pxPerFrame(width, frames);
        expect(v).toBeGreaterThanOrEqual(PPF_MIN);
        expect(v).toBeLessThanOrEqual(PPF_MAX);
      }
    }
  });

  it('is width/frames when unclamped', () => {
    expect(pxPerFrame(480, 48)).toBe(10);
  });
});

describe('clampFrame', () => {
  it('integer-snaps into 1..frames for any input', () => {
    for (const f of [-100, 0, 0.4, 1, 23.5, 47.9, 48, 48.5, 1e6, NaN ? 0 : 3.14]) {
      const v = clampFrame(f, 48);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(48);
    }
  });
});

describe('frontier clamp', () => {
  it('never lets the effective position outrun the frontier in the direction of travel', () => {
    for (let target = -10; target <= 100; target += 0.7) {
      for (let frontier = 1; frontier <= 60; frontier += 5) {
        expect(clampToFrontier(target, frontier, 1)).toBeLessThanOrEqual(frontier);
        expect(clampToFrontier(target, frontier, -1)).toBeGreaterThanOrEqual(frontier);
      }
    }
  });

  it('frameForDrag never asserts a frame past the frontier (forward) or the stack', () => {
    const frames = 48;
    for (let start = 1; start <= frames; start += 5) {
      for (let delta = -900; delta <= 900; delta += 41) {
        for (const current of [1, 12, 24, 48]) {
          // Forward frontier from `current`: at most 6 decoded ahead.
          const fwdFrontier = Math.min(frames, current + 6);
          const backFrontier = Math.max(1, current - 3);
          const f = frameForDrag(start, delta, pxPerFrame(390, frames), frames, current, (_, dir) =>
            dir === 1 ? fwdFrontier : backFrontier
          );
          expect(f).toBeGreaterThanOrEqual(1);
          expect(f).toBeLessThanOrEqual(frames);
          expect(Number.isInteger(f)).toBe(true);
          const raw = clampFrame(scrubTarget(start, delta, pxPerFrame(390, frames)), frames);
          if (raw >= current) expect(f).toBeLessThanOrEqual(fwdFrontier);
          else expect(f).toBeGreaterThanOrEqual(backFrontier);
        }
      }
    }
  });

  it('is 1:1 with zero momentum: same delta in, same frame out', () => {
    const ppf = 12;
    expect(frameForDrag(10, 5 * ppf, ppf, 48, 10, () => 48)).toBe(15);
    expect(frameForDrag(15, -5 * ppf, ppf, 48, 15, () => 1)).toBe(10);
    expect(scrubTarget(10, 6, ppf)).toBe(10.5);
  });
});
