/**
 * frame-store.ts — decoded-frame residency for one window of one series.
 * DOM-free: fetch/decode are injected, so the memory contract is unit-tested
 * in node with fake bitmaps (plan decision 5).
 *
 * Contracts:
 *   - LRU cap `capacity` (default 12) resident bitmaps; evictions get an
 *     explicit close() — the only way the memory bound is real in Safari
 *   - decode-ahead around the scrub target, direction-weighted (more frames
 *     ahead of travel than behind), `concurrency` fetches in flight
 *   - a generation token discards stale decode resolutions: a slow frame
 *     resolving after flush()/dispose() is closed, never stored
 *   - frontier(from, dir): furthest contiguously-decoded index from `from`,
 *     the clamp mapping.ts applies so scrub never outruns decode
 *   - prefetch (background fill) warms the HTTP cache only — it never holds
 *     bitmaps, so the residency bound survives a full-stack fill
 */

export interface Closable {
  close(): void;
}

export interface FrameStoreOptions<B extends Closable> {
  /** Frame count; indices are 1-based (IM 1..N, matching the counter). */
  frames: number;
  url: (index: number) => string;
  decode: (url: string, signal: AbortSignal) => Promise<B>;
  /** Cache-warming fetch for background fill; never decoded. */
  prefetch?: (url: string) => Promise<unknown>;
  capacity?: number;
  ahead?: number;
  behind?: number;
  concurrency?: number;
  /** Fired when an index lands (render-when-current-arrives). */
  onDecoded?: (index: number) => void;
}

export class FrameStore<B extends Closable> {
  readonly frames: number;
  #url: (index: number) => string;
  #decode: (url: string, signal: AbortSignal) => Promise<B>;
  #prefetch: ((url: string) => Promise<unknown>) | null;
  #capacity: number;
  #ahead: number;
  #behind: number;
  #concurrency: number;
  #onDecoded: ((index: number) => void) | null;

  /** Insertion order = LRU order (oldest first). */
  #resident = new Map<number, B>();
  #inflight = new Map<number, AbortController>();
  #queue: number[] = [];
  #prefetched = new Set<number>();
  #gen = 0;
  #target = 1;
  #dir: 1 | -1 = 1;
  #disposed = false;

  constructor(opts: FrameStoreOptions<B>) {
    this.frames = opts.frames;
    this.#url = opts.url;
    this.#decode = opts.decode;
    this.#prefetch = opts.prefetch ?? null;
    this.#capacity = opts.capacity ?? 12;
    this.#ahead = opts.ahead ?? 6;
    this.#behind = opts.behind ?? 3;
    this.#concurrency = opts.concurrency ?? 4;
    this.#onDecoded = opts.onDecoded ?? null;
  }

  get size(): number {
    return this.#resident.size;
  }

  has(index: number): boolean {
    return this.#resident.has(index);
  }

  /** Get a resident bitmap, marking it most-recently-used. */
  get(index: number): B | undefined {
    const bmp = this.#resident.get(index);
    if (bmp !== undefined) {
      this.#resident.delete(index);
      this.#resident.set(index, bmp);
    }
    return bmp;
  }

  /** Furthest contiguously-decoded index from `from` (inclusive) in `dir`. */
  frontier(from: number, dir: 1 | -1): number {
    if (!this.#resident.has(from)) return from;
    let i = from;
    while (i + dir >= 1 && i + dir <= this.frames && this.#resident.has(i + dir)) i += dir;
    return i;
  }

  /**
   * Set the scrub target: recompute the direction-weighted wanted window,
   * drop queued indices that fell out of it, abort in-flight decodes that
   * fell out of it, and pump the queue.
   */
  setTarget(index: number, dir: 1 | -1 = this.#dir): void {
    if (this.#disposed) return;
    this.#target = index;
    this.#dir = dir;
    const wanted: number[] = [];
    // Priority order: target, then alternating ahead-weighted neighbors.
    for (let k = 0; k <= Math.max(this.#ahead, this.#behind); k++) {
      const fwd = index + k * dir;
      const back = index - k * dir;
      if (k <= this.#ahead && fwd >= 1 && fwd <= this.frames) wanted.push(fwd);
      if (k > 0 && k <= this.#behind && back >= 1 && back <= this.frames) wanted.push(back);
    }
    const wantedSet = new Set(wanted);
    this.#queue = wanted.filter((i) => !this.#resident.has(i) && !this.#inflight.has(i));
    for (const [i, ctl] of this.#inflight) {
      if (!wantedSet.has(i)) {
        ctl.abort();
        this.#inflight.delete(i);
      }
    }
    this.#pump();
  }

  /** Background fill: warm the HTTP cache for every frame not yet touched. */
  fill(): void {
    if (this.#disposed || !this.#prefetch) return;
    for (let i = 1; i <= this.frames; i++) {
      if (this.#resident.has(i) || this.#inflight.has(i) || this.#prefetched.has(i)) continue;
      this.#prefetched.add(i);
      this.#prefetch(this.#url(i)).catch(() => this.#prefetched.delete(i));
    }
  }

  /** Far out of viewport: close everything except `keep`; stale decodes die. */
  flush(keep: Iterable<number> = []): void {
    const keepSet = new Set(keep);
    this.#gen++;
    this.#queue = [];
    for (const [, ctl] of this.#inflight) ctl.abort();
    this.#inflight.clear();
    for (const [i, bmp] of this.#resident) {
      if (!keepSet.has(i)) {
        bmp.close();
        this.#resident.delete(i);
      }
    }
  }

  dispose(): void {
    this.#disposed = true;
    this.flush();
  }

  #pump(): void {
    while (this.#inflight.size < this.#concurrency && this.#queue.length > 0) {
      const index = this.#queue.shift()!;
      const ctl = new AbortController();
      this.#inflight.set(index, ctl);
      const gen = this.#gen;
      this.#decode(this.#url(index), ctl.signal).then(
        (bmp) => {
          // Stale resolution: the store moved on (flush/dispose), or this index
          // was re-requested with a fresh controller after an abort-but-resolve
          // (#inflight is keyed by index, so identity — not presence — decides).
          if (gen !== this.#gen || this.#disposed || this.#inflight.get(index) !== ctl) {
            bmp.close();
            return;
          }
          this.#inflight.delete(index);
          this.#store(index, bmp);
          this.#onDecoded?.(index);
          this.#pump();
        },
        () => {
          // Aborted or failed: free the slot, but only if this decode still owns
          // it — a re-request may have installed a fresh controller. Retry re-targets.
          if (this.#inflight.get(index) === ctl) this.#inflight.delete(index);
          this.#pump();
        }
      );
    }
  }

  #store(index: number, bmp: B): void {
    this.#resident.delete(index);
    this.#resident.set(index, bmp);
    while (this.#resident.size > this.#capacity) {
      // Evict least-recently-used, but never the current target's bitmap.
      const oldest = this.#resident.keys().next().value as number;
      const victim = oldest === this.#target && this.#resident.size > 1
        ? (() => {
            const it = this.#resident.keys();
            it.next();
            return it.next().value as number;
          })()
        : oldest;
      this.#resident.get(victim)!.close();
      this.#resident.delete(victim);
    }
  }
}
