/**
 * case-viewer.ts — the <case-viewer> custom element (light DOM, framework-
 * free). Upgrades the static shell emitted at build time by case-shell.mjs;
 * everything here is progressive enhancement on top of the no-JS poster.
 *
 * Gesture model (plan decisions 2/6/7, state table in the plan):
 *   rest      touch-action:pan-y — page scrolls; horizontal drag scrubs
 *             (10px cumulative axis race); click engages; second pointer
 *             promotes to fullscreen (wired in M4)
 *   scrub-h   1:1 horizontal scrub, pointer captured, cancel = up
 *   engaged   touch-action:none — either axis scrubs (vertical = PACS axis);
 *             exits: ✕ · outside click · Esc · scrolled out of view
 *
 * Memory (decision 5): ImageBitmap FrameStore per series/window, LRU 12,
 * explicit close on evict; background fill is HTTP-cache-warming only, gated
 * on sustained interaction (≥8 distinct frames) and saveData.
 */
import { FrameStore } from './frame-store';
import { CaseFullscreen } from './fullscreen';
import { clampFrame, clampToFrontier, frameForDrag, pxPerFrame } from './mapping';
import { drawContain, fitCanvas } from './render';

interface WindowSpec {
  key: string;
  label: string;
  pattern: string;
}
interface SeriesSpec {
  key: string;
  label: string;
  plane: string;
  frames: number;
  width: number;
  height: number;
  start: number;
  windows: WindowSpec[];
  poster: string;
}
interface CaseManifest {
  id: string;
  title: string;
  modality: string;
  base: string;
  rev: number;
  series: SeriesSpec[];
}

type State = 'rest' | 'scrub-h' | 'engaged' | 'fullscreen';

const AXIS_RACE_PX = 10;
const EDGE_DEAD_PX = 28;
const FILL_AFTER_DISTINCT = 8;
const WHEEL_STEP_CAP = 3;
const RETRY_MS = [1000, 2000, 4000];

const supportsSaveData = () =>
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

export class CaseViewerElement extends HTMLElement {
  #manifest!: CaseManifest;
  #seriesIdx = 0;
  #windowIdx = 0;
  #frame = 1;
  #dir: 1 | -1 = 1;
  #stores = new Map<string, FrameStore<ImageBitmap>>();
  #state: State = 'rest';

  #stage!: HTMLElement;
  #canvas!: HTMLCanvasElement;
  #counter!: HTMLElement;
  #slider!: HTMLInputElement;
  #closeBtn!: HTMLButtonElement;

  #ro: ResizeObserver | null = null;
  #io: IntersectionObserver | null = null;
  #bootIo: IntersectionObserver | null = null;
  #near = false;
  #hasDrawn = false;
  #distinct = new Set<string>();
  #filled = new Set<string>();
  #retryTimer = 0;
  #retryCount = 0;

  // Pointer tracking
  #active = new Map<number, { x: number; y: number }>();
  #raceX = 0;
  #raceY = 0;
  #lastX = 0;
  #lastY = 0;
  #dragPx = 0;
  #dragStartFrame = 1;
  #tracking = false;
  #scrubId: number | null = null;
  #justScrubbed = false;
  #wheelSteps = 0;
  #wheelArmed = false;

  #abort = new AbortController();

  connectedCallback(): void {
    const json = this.querySelector('[data-cv-manifest]')?.textContent;
    if (!json) return;
    this.#manifest = JSON.parse(json) as CaseManifest;
    this.#stage = this.querySelector('[data-cv-stage]')!;
    this.#canvas = this.querySelector('[data-cv-canvas]')!;
    this.#counter = this.querySelector('[data-cv-counter]')!;
    this.#slider = this.querySelector('[data-cv-slider]')!;
    this.#closeBtn = this.querySelector('[data-cv-close]')!;
    this.#frame = this.series.start;

    this.#bind();
    this.#observe();
    this.dataset.state = this.#state;
  }

  disconnectedCallback(): void {
    this.#abort.abort();
    this.#io?.disconnect();
    this.#bootIo?.disconnect();
    this.#ro?.disconnect();
    clearTimeout(this.#retryTimer);
    for (const store of this.#stores.values()) store.dispose();
    this.#stores.clear();
  }

  get series(): SeriesSpec {
    return this.#manifest.series[this.#seriesIdx];
  }
  get window_(): WindowSpec {
    return this.series.windows[this.#windowIdx];
  }
  get frame(): number {
    return this.#frame;
  }
  get state(): State {
    return this.#state;
  }

  #emit(name: string, detail: unknown = null): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  }

  // --- store plumbing -------------------------------------------------------
  #storeFor(seriesIdx: number, windowIdx: number): FrameStore<ImageBitmap> {
    const series = this.#manifest.series[seriesIdx];
    const win = series.windows[windowIdx];
    const id = `${series.key}/${win.key}`;
    let store = this.#stores.get(id);
    if (!store) {
      const url = (i: number) =>
        this.#manifest.base + win.pattern.replace('{nnn}', String(i).padStart(3, '0'));
      store = new FrameStore<ImageBitmap>({
        frames: series.frames,
        url,
        decode: async (u, signal) => {
          const res = await fetch(u, { signal });
          if (!res.ok) throw new Error(`${res.status} ${u}`);
          return createImageBitmap(await res.blob());
        },
        prefetch: (u) =>
          fetch(u, { priority: 'low' } as RequestInit).then((r) => r.blob()),
        onDecoded: (index) => this.#onDecoded(index),
      });
      this.#stores.set(id, store);
    }
    return store;
  }
  get #store(): FrameStore<ImageBitmap> {
    return this.#storeFor(this.#seriesIdx, this.#windowIdx);
  }

  #onDecoded(index: number): void {
    this.#emit('cv:decoded', { index });
    if (index === this.#frame) {
      this.#draw();
      this.#stalled(false);
    }
  }

  // --- render ---------------------------------------------------------------
  #draw(): void {
    const bmp = this.#store.get(this.#frame);
    if (!bmp) return;
    fitCanvas(this.#canvas, this.#stage.clientWidth, this.#stage.clientHeight);
    drawContain(this.#canvas, bmp);
    this.#hasDrawn = true;
    this.#maybeReady();
    this.#syncReadout();
  }

  /** is-ready (HUD exit + poster→frame crossfade) needs BOTH a drawn frame
   *  and a played boot — warm can finish long before the reader arrives. */
  #maybeReady(): void {
    if (!this.#hasDrawn || !this.classList.contains('is-booting')) return;
    if (this.classList.contains('is-ready')) return;
    this.classList.add('is-ready');
    if (this.dataset.nudge !== undefined) this.#settleNudge();
  }

  #syncReadout(): void {
    const n = this.series.frames;
    this.#counter.textContent = `IM ${this.#frame}/${n}`;
    this.#slider.value = String(this.#frame);
    this.#slider.setAttribute('aria-valuetext', `Image ${this.#frame} of ${n}`);
    this.#emit('cv:frame', { frame: this.#frame });
  }

  #stalled(on: boolean): void {
    this.classList.toggle('is-stalled', on);
    if (!on) {
      clearTimeout(this.#retryTimer);
      this.#retryCount = 0;
      return;
    }
    this.#armRetry();
  }

  /** Re-target on a capped backoff until the frame lands. A failed retry yields
   *  no onDecoded to re-invoke #stalled, so the timer re-arms itself — passive
   *  recovery, no scrub needed — but only while near, so a flushed off-screen
   *  store is never re-warmed. */
  #armRetry(): void {
    clearTimeout(this.#retryTimer);
    if (!this.#near) return;
    const wait = RETRY_MS[Math.min(this.#retryCount++, RETRY_MS.length - 1)];
    this.#retryTimer = window.setTimeout(() => {
      if (!this.classList.contains('is-stalled')) return;
      this.#store.setTarget(this.#frame, this.#dir);
      this.#armRetry();
    }, wait);
  }

  /** Move to `target` (already meaningfully clamped by the caller's path).
   *  No early-out when the index is unchanged: #switchWindow re-issues
   *  #setFrame(this.#frame) relying on the repaint to show the new window's
   *  bitmap, and setTarget must re-pump a store whose contents were flushed. */
  #setFrame(target: number, viaDrag: boolean): void {
    const clamped = clampFrame(target, this.series.frames);
    if (clamped !== this.#frame) {
      this.#dir = clamped > this.#frame ? 1 : -1;
      this.#frame = clamped;
      this.#distinct.add(`${this.series.key}:${clamped}`);
    }
    this.#store.setTarget(this.#frame, this.#dir);
    if (this.#store.has(this.#frame)) {
      this.#draw();
      this.#stalled(false);
    } else {
      // Hold the last good frame; counter follows only what the screen shows
      // on the drag path (frontier pre-clamp), stall glyph covers the rest.
      this.#stalled(true);
      if (!viaDrag) this.#syncReadout();
    }
    this.#maybeFill();
  }

  #maybeFill(): void {
    const id = `${this.series.key}/${this.window_.key}`;
    if (this.#filled.has(id) || supportsSaveData()) return;
    if (this.#distinct.size >= FILL_AFTER_DISTINCT) {
      this.#filled.add(id);
      this.#store.fill();
      this.#emit('cv:fill', { window: id });
    }
  }

  // --- lifecycle (IntersectionObserver tiers) --------------------------------
  #observe(): void {
    this.#ro = new ResizeObserver(() => this.#draw());
    this.#ro.observe(this.#stage);
    // Warm/flush tier: decode starts well before arrival, closes after exit.
    this.#io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) this.#nearViewport();
          else this.#farViewport();
        }
      },
      { rootMargin: '600px 0px' }
    );
    this.#io.observe(this);
    // Boot tier: the choreography is a seen moment — fire at ~half visible,
    // once, then stop watching.
    this.#bootIo = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        this.#bootIo?.disconnect();
        this.#bootIo = null;
        this.classList.add('is-booting');
        this.#emit('cv:boot');
        this.#maybeReady();
      },
      { threshold: 0.5 }
    );
    this.#bootIo.observe(this.#stage);
  }

  #nearViewport(): void {
    this.#near = true;
    this.#store.setTarget(this.#frame, this.#dir);
    if (this.classList.contains('is-stalled')) this.#armRetry();
  }

  #farViewport(): void {
    this.#near = false;
    clearTimeout(this.#retryTimer);
    if (this.#state !== 'rest') this.#setState('rest');
    // Flush every store: the current one keeps the shown frame, all others
    // close fully — the LRU bound is global, not per-visited store.
    const current = this.#store;
    for (const store of this.#stores.values()) {
      store.flush(store === current ? [this.#frame] : []);
    }
  }

  #settleNudge(): void {
    // One-shot, flag-gated (data-nudge), judged by the device spike; authored
    // motion, so reduced-motion suppresses it (scrub itself stays exempt).
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const f0 = this.#frame;
    setTimeout(() => {
      if (this.#frame !== f0 || !this.#store.has(f0 + 1)) return; // reader moved on
      this.#setFrame(f0 + 1, false);
      setTimeout(() => this.#setFrame(f0, false), 180);
    }, 900); // after the HUD exit settles
  }

  // --- state machine ---------------------------------------------------------
  #setState(next: State): void {
    if (this.#state === next) return;
    this.#state = next;
    this.dataset.state = next;
    this.#closeBtn.hidden = next !== 'engaged';
    this.#emit('cv:state', { state: next });
  }

  // --- input wiring -----------------------------------------------------------
  #bind(): void {
    const { signal } = this.#abort;
    const stage = this.#stage;

    stage.addEventListener('pointerdown', (e) => this.#pointerDown(e), { signal });
    stage.addEventListener('pointermove', (e) => this.#pointerMove(e), { signal });
    stage.addEventListener('pointerup', (e) => this.#pointerEnd(e), { signal });
    // pointercancel = pointerup: the frame holds where the scrub was.
    stage.addEventListener('pointercancel', (e) => this.#pointerEnd(e), { signal });

    // Engage on click — browsers suppress click on scroll-stopping taps, so
    // the momentum-stop tap can never accidentally engage. Chrome excluded.
    // A horizontal mouse scrub DOES synthesize a click on its mouseup (mouse
    // clicks aren't distance-gated), so a completed scrub-h eats that click.
    stage.addEventListener(
      'click',
      (e) => {
        if ((e.target as HTMLElement).closest('button, input')) return;
        if (this.#justScrubbed) {
          this.#justScrubbed = false;
          return;
        }
        if (this.#state === 'rest') this.#setState('engaged');
      },
      { signal }
    );
    this.#closeBtn.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        this.#setState('rest');
      },
      { signal }
    );
    document.addEventListener(
      'click',
      (e) => {
        if (this.#state === 'engaged' && !this.contains(e.target as Node)) this.#setState('rest');
      },
      { signal }
    );
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && this.#state === 'engaged') this.#setState('rest');
      },
      { signal }
    );

    // Desktop wheel: engaged only, capped per animation frame, swallowed at
    // stack edges (disengage stays explicit — wheel never returns the page).
    stage.addEventListener(
      'wheel',
      (e) => {
        if (this.#state !== 'engaged') return;
        e.preventDefault();
        const dy = e.deltaY; // read before deltaMode (Firefox order quirk)
        this.#wheelSteps += Math.sign(dy);
        if (this.#wheelArmed) return;
        this.#wheelArmed = true;
        requestAnimationFrame(() => {
          const step = Math.max(-WHEEL_STEP_CAP, Math.min(WHEEL_STEP_CAP, this.#wheelSteps));
          this.#wheelSteps = 0;
          this.#wheelArmed = false;
          if (step === 0) return;
          const dir = Math.sign(step) as 1 | -1;
          const frontier = this.#store.frontier(this.#frame, dir);
          this.#setFrame(clampToFrontier(this.#frame + step, frontier, dir), true);
        });
      },
      { signal, passive: false }
    );

    // Slider is the semantic scrubber (VO-adjustable). PageUp/Down = ±5.
    this.#slider.addEventListener('input', () => this.#setFrame(Number(this.#slider.value), false), { signal });
    this.#slider.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'PageUp' && e.key !== 'PageDown') return;
        e.preventDefault();
        this.#setFrame(this.#frame + (e.key === 'PageUp' ? 5 : -5), false);
      },
      { signal }
    );

    // Window chips: switching preserves the frame index exactly — that index
    // is the pedagogy. Series tabs: switching resets to the series' start.
    this.querySelector('[data-cv-windows]')?.addEventListener(
      'click',
      (e) => {
        const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-cv-window]');
        if (btn) this.#switchWindow(btn.dataset.cvWindow!);
      },
      { signal }
    );
    this.querySelector('[data-cv-series]')?.addEventListener(
      'click',
      (e) => {
        const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-cv-serie]');
        if (btn) this.#switchSeries(btn.dataset.cvSerie!);
      },
      { signal }
    );

    this.querySelector('[data-cv-fullscreen]')?.addEventListener(
      'click',
      () => this.#promote('button'),
      { signal }
    );
  }

  // --- fullscreen promotion (M4) ---------------------------------------------
  #promote(via: 'button' | 'pinch'): void {
    if (this.#state === 'fullscreen') return;
    this.#emit('cv:promote', { via });
    const overlay = new CaseFullscreen({
      title: this.#manifest.title,
      metaText: [this.#manifest.modality, this.series.label, this.window_.label]
        .filter(Boolean)
        .join(' · '),
      frames: this.series.frames,
      frame: this.#frame,
      ppf: this.#ppf(),
      el: this,
      bitmap: (i) => this.#store.get(i),
      target: (i, dir) => this.#store.setTarget(i, dir),
      frontier: (from, dir) => this.#store.frontier(from, dir),
      onClose: (finalFrame) => {
        // Closing returns to rest, never engaged; the slice position carries
        // back so the reader resumes where they left the exam.
        this.#setState('rest');
        this.#setFrame(finalFrame, false);
        this.querySelector<HTMLButtonElement>('[data-cv-fullscreen]')?.focus();
      },
    });
    this.#setState('fullscreen');
    overlay.open();
  }

  #ppf(): number {
    const override = Number(this.dataset.ppf);
    return override > 0 ? override : pxPerFrame(this.#stage.clientWidth, this.series.frames);
  }

  #pointerDown(e: PointerEvent): void {
    // System edge-back-swipes beat touch-action; leave the edges alone.
    if (
      e.pointerType === 'touch' &&
      (e.clientX < EDGE_DEAD_PX || e.clientX > window.innerWidth - EDGE_DEAD_PX)
    )
      return;
    this.#justScrubbed = false;
    // Engaged: a second finger must not hijack the tracked scrub's anchors.
    if (this.#state === 'engaged' && this.#scrubId !== null) return;
    this.#active.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.#active.size === 2 && (this.#state === 'rest' || this.#state === 'scrub-h')) {
      // Second finger on the inline image promotes to fullscreen (decision 7).
      this.#active.clear();
      this.#scrubId = null;
      this.#promote('pinch');
      return;
    }
    this.#raceX = this.#raceY = 0;
    this.#lastX = e.clientX;
    this.#lastY = e.clientY;
    this.#dragPx = 0;
    this.#dragStartFrame = this.#frame;
    this.#tracking = this.#state === 'engaged';
    if (this.#tracking) {
      this.#scrubId = e.pointerId;
      this.#capture(e.pointerId);
    }
  }

  #pointerMove(e: PointerEvent): void {
    if (!this.#active.has(e.pointerId)) return;
    // Only the pointer that owns the scrub drives it; a stray second pointer
    // must not retarget the shared drag anchors.
    if (this.#scrubId !== null && e.pointerId !== this.#scrubId) return;
    const dx = e.clientX - this.#lastX;
    const dy = e.clientY - this.#lastY;
    this.#lastX = e.clientX;
    this.#lastY = e.clientY;

    if (this.#state === 'engaged') {
      this.#dragPx += dx + dy; // either axis; vertical = the PACS axis
      this.#dragScrub();
      return;
    }
    if (!this.#tracking) {
      this.#raceX += Math.abs(dx);
      this.#raceY += Math.abs(dy);
      if (Math.max(this.#raceX, this.#raceY) >= AXIS_RACE_PX) {
        if (this.#raceX > this.#raceY) {
          this.#tracking = true;
          this.#scrubId = e.pointerId;
          this.#setState('scrub-h');
          this.#capture(e.pointerId);
        } else {
          // Vertical win at rest: the compositor is already scrolling.
          this.#active.delete(e.pointerId);
        }
      }
      return;
    }
    this.#dragPx += dx;
    this.#dragScrub();
  }

  #dragScrub(): void {
    this.#setFrame(
      frameForDrag(this.#dragStartFrame, this.#dragPx, this.#ppf(), this.series.frames, this.#frame, (f, d) =>
        this.#store.frontier(f, d)
      ),
      true
    );
  }

  #pointerEnd(e: PointerEvent): void {
    this.#active.delete(e.pointerId);
    if (e.pointerId === this.#scrubId) this.#scrubId = null;
    if (this.#state === 'scrub-h' && this.#active.size === 0) {
      this.#justScrubbed = true; // eat the synthesized click; a scrub isn't an engage
      this.#setState('rest');
    }
    this.#tracking = this.#state === 'engaged' && this.#active.size > 0;
  }

  #capture(id: number): void {
    // Synthetic pointer events (emulation/tests) have no active pointer.
    try {
      this.#stage.setPointerCapture(id);
    } catch {
      /* noop */
    }
  }

  // --- window / series switching ----------------------------------------------
  #switchWindow(key: string): void {
    const idx = this.series.windows.findIndex((w) => w.key === key);
    if (idx === -1 || idx === this.#windowIdx) return;
    // Free the outgoing window's bitmaps — the LRU bound is global, so a store
    // we leave must not keep its 12 resident (revisit-safe: flush, not dispose).
    this.#store.flush();
    this.#windowIdx = idx;
    this.querySelector('[data-cv-window-label]')!.textContent = this.window_.label;
    this.querySelectorAll<HTMLElement>('[data-cv-window]').forEach((b) =>
      b.setAttribute('aria-checked', String(b.dataset.cvWindow === key))
    );
    // Same frame index, new window's store — the index is preserved exactly.
    this.#setFrame(this.#frame, false);
    this.#emit('cv:window', { window: key });
  }

  #switchSeries(key: string): void {
    const idx = this.#manifest.series.findIndex((s) => s.key === key);
    if (idx === -1 || idx === this.#seriesIdx) return;
    // Free every window store of the outgoing series — global LRU bound.
    const leaving = `${this.series.key}/`;
    for (const [id, store] of this.#stores) {
      if (id.startsWith(leaving)) store.flush();
    }
    this.#seriesIdx = idx;
    this.#windowIdx = 0;
    const s = this.series;
    this.querySelector('[data-cv-series-label]')!.textContent = s.label;
    this.querySelector('[data-cv-window-label]')!.textContent = this.window_.label;
    this.querySelectorAll<HTMLElement>('[data-cv-serie]').forEach((b) =>
      b.setAttribute('aria-checked', String(b.dataset.cvSerie === key))
    );
    this.#stage.style.aspectRatio = `${s.width} / ${s.height}`;
    this.#slider.max = String(s.frames);
    this.#frame = 0; // force redraw bookkeeping through #setFrame
    this.#setFrame(s.start, false);
    this.#emit('cv:series', { series: key });
  }
}

if (!customElements.get('case-viewer')) {
  customElements.define('case-viewer', CaseViewerElement);
}
