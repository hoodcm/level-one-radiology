import { describe, expect, it } from 'vitest';
import { FrameStore } from './frame-store';

class FakeBitmap {
  closed = false;
  constructor(readonly url: string) {}
  close() {
    if (this.closed) throw new Error(`double close: ${this.url}`);
    this.closed = true;
  }
}

const tick = () => new Promise((r) => setTimeout(r, 0));

/** Instant decoder: resolves on the next microtask, tracks every bitmap. */
function instantDecoder() {
  const made: FakeBitmap[] = [];
  return {
    made,
    decode: async (url: string) => {
      const b = new FakeBitmap(url);
      made.push(b);
      return b;
    },
  };
}

/** Deferred decoder: resolves only when the test says so. */
function deferredDecoder() {
  const pending = new Map<string, (b: FakeBitmap) => void>();
  const made: FakeBitmap[] = [];
  return {
    pending,
    made,
    decode: (url: string) =>
      new Promise<FakeBitmap>((resolve) => {
        pending.set(url, (b) => {
          made.push(b);
          resolve(b);
        });
      }),
    resolve(url: string) {
      const b = new FakeBitmap(url);
      pending.get(url)!(b);
      pending.delete(url);
      return b;
    },
  };
}

/** Per-call decoder: captures every decode invocation, so two in-flight
 *  decodes of the *same* index can each be delivered independently. */
function perCallDecoder() {
  const calls: { url: string; deliver: (b: FakeBitmap) => void }[] = [];
  return {
    calls,
    decode: (u: string) =>
      new Promise<FakeBitmap>((resolve) => {
        calls.push({ url: u, deliver: resolve });
      }),
  };
}

const url = (i: number) => `frame/${i}`;

describe('FrameStore LRU residency', () => {
  it('never exceeds capacity across a full-stack scrub, and every evicted bitmap is closed', async () => {
    const { made, decode } = instantDecoder();
    const store = new FrameStore<FakeBitmap>({ frames: 48, url, decode, capacity: 12 });
    for (let i = 1; i <= 48; i++) {
      store.setTarget(i, 1);
      await tick();
      expect(store.size).toBeLessThanOrEqual(12);
    }
    const open = made.filter((b) => !b.closed);
    expect(open.length).toBe(store.size);
    expect(open.length).toBeLessThanOrEqual(12);
    // Reverse pass — the direction-weighted window flips, bound still holds.
    for (let i = 48; i >= 1; i--) {
      store.setTarget(i, -1);
      await tick();
      expect(store.size).toBeLessThanOrEqual(12);
    }
    expect(made.filter((b) => !b.closed).length).toBe(store.size);
  });

  it('background fill never holds bitmaps (prefetch is cache-warming only)', async () => {
    const { decode } = instantDecoder();
    const fetched: string[] = [];
    const store = new FrameStore<FakeBitmap>({
      frames: 48,
      url,
      decode,
      capacity: 12,
      prefetch: async (u) => fetched.push(u),
    });
    store.setTarget(24, 1);
    await tick();
    const before = store.size;
    store.fill();
    await tick();
    expect(fetched.length).toBeGreaterThan(0);
    expect(store.size).toBe(before);
  });
});

describe('FrameStore generation tokens', () => {
  it('discards a decode that resolves after flush (closed, never stored)', async () => {
    const d = deferredDecoder();
    const store = new FrameStore<FakeBitmap>({ frames: 48, url, decode: d.decode });
    store.setTarget(1, 1);
    expect(d.pending.size).toBeGreaterThan(0);
    store.flush();
    const b = d.resolve('frame/1');
    await tick();
    expect(b.closed).toBe(true);
    expect(store.size).toBe(0);
  });

  it('discards a slow decode whose index left the wanted window (never overwrites newer state)', async () => {
    const d = deferredDecoder();
    const store = new FrameStore<FakeBitmap>({ frames: 48, url, decode: d.decode, ahead: 2, behind: 1, concurrency: 2 });
    store.setTarget(1, 1);
    expect(d.pending.has('frame/1')).toBe(true);
    store.setTarget(40, 1); // frame 1 falls out of the wanted window → aborted
    const b = d.resolve('frame/1'); // resolves anyway (slow network)
    await tick();
    expect(b.closed).toBe(true);
    expect(store.has(1)).toBe(false);
  });

  it('dispose closes everything and refuses further work', async () => {
    const { made, decode } = instantDecoder();
    const store = new FrameStore<FakeBitmap>({ frames: 48, url, decode });
    store.setTarget(5, 1);
    await tick();
    store.dispose();
    expect(store.size).toBe(0);
    expect(made.every((b) => b.closed)).toBe(true);
    store.setTarget(6, 1);
    await tick();
    expect(store.size).toBe(0);
  });
});

describe('FrameStore identity guard', () => {
  it('a stale decode of a re-requested index neither evicts the live controller nor wedges the frame', async () => {
    const d = perCallDecoder();
    // One index in flight at a time: setTarget wants exactly its target.
    const store = new FrameStore<FakeBitmap>({ frames: 48, url, decode: d.decode, ahead: 0, behind: 0, concurrency: 1 });
    store.setTarget(1, 1); // calls[0]: frame/1, controller A
    store.setTarget(2, 1); // A falls out of the window → aborted + dropped from #inflight
    store.setTarget(1, 1); // calls[2]: frame/1 re-requested, controller C (the live one)
    expect(d.calls.map((c) => c.url)).toEqual(['frame/1', 'frame/2', 'frame/1']);

    const stale = new FakeBitmap('frame/1-stale');
    const live = new FakeBitmap('frame/1-live');

    // A (aborted) resolves late: keyed by index it would pass a presence guard,
    // deleting C's slot and storing the stale bitmap. Identity must reject it.
    d.calls[0].deliver(stale);
    await tick();
    expect(stale.closed).toBe(true); // closed, never stored
    expect(store.has(1)).toBe(false); // C still in flight; slot not wedged by the stale bitmap

    // C (the live controller) resolves: it still owns the slot, so it lands.
    d.calls[2].deliver(live);
    await tick();
    expect(live.closed).toBe(false);
    expect(store.get(1)).toBe(live);
  });
});

describe('FrameStore warm', () => {
  it('decodes a single frame outside the target window; repeats and out-of-range are no-ops', async () => {
    const { decode } = instantDecoder();
    const store = new FrameStore<FakeBitmap>({ frames: 48, url, decode, ahead: 0, behind: 0 });
    store.warm(24);
    await tick();
    expect(store.has(24)).toBe(true);
    expect(store.size).toBe(1); // one frame, no window pumped around it
    store.warm(24); // resident → no-op
    store.warm(0);
    store.warm(49);
    await tick();
    expect(store.size).toBe(1);
  });
});

describe('FrameStore decode pipeline', () => {
  it('caps concurrent decodes and pumps as resolutions land', async () => {
    const d = deferredDecoder();
    const store = new FrameStore<FakeBitmap>({ frames: 48, url, decode: d.decode, concurrency: 4, ahead: 6, behind: 3 });
    store.setTarget(20, 1);
    expect(d.pending.size).toBe(4);
    d.resolve('frame/20');
    await tick();
    expect(d.pending.size).toBe(4); // one landed, one more launched
    expect(store.has(20)).toBe(true);
  });

  it('weights the decode-ahead window in the direction of travel', () => {
    const d = deferredDecoder();
    const store = new FrameStore<FakeBitmap>({ frames: 48, url, decode: d.decode, concurrency: 48, ahead: 6, behind: 3 });
    store.setTarget(24, 1);
    const asked = [...d.pending.keys()].map((u) => Number(u.split('/')[1]));
    expect(Math.max(...asked)).toBe(30); // +ahead
    expect(Math.min(...asked)).toBe(21); // -behind
    expect(asked.length).toBe(10);
  });
});
