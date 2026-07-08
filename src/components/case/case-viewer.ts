/**
 * case-viewer.ts — the <case-viewer> custom element (light DOM, framework-
 * free). Upgrades the static shell emitted at build time by case-shell.mjs;
 * everything here is progressive enhancement on top of the no-JS poster.
 *
 * Gesture model (plan decisions 2/6/7, state table in the plan):
 *   rest      touch-action:pan-y — page scrolls; horizontal drag scrubs
 *             (10px cumulative axis race); click engages; second pointer
 *             promotes to fullscreen (wired in M4)
 *             Under apparatus.caseTapToActivate the rest drag-scrub is OFF:
 *             the viewer is inert until the engage tap (a TAP TO SCRUB chip
 *             carries the affordance), so scrub-h is unreachable.
 *   scrub-h   1:1 horizontal scrub, pointer captured, cancel = up
 *   engaged   touch-action:none — either axis scrubs (vertical = PACS axis);
 *             exits: ✕ · outside click · Esc · scrolled out of view
 *
 * Memory (decision 5): ImageBitmap FrameStore per series/window, LRU 12,
 * explicit close on evict; background fill is HTTP-cache-warming only, gated
 * on sustained interaction (≥8 distinct frames) and saveData.
 */
import { apparatus } from '../../lib/apparatus';
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

/** Same escaping contract as case-shell.mjs's esc() — chip rebuilds inject
 *  manifest strings into innerHTML and must match the build-time shell. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

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
  // Tap-to-boot latch (apparatus.caseTapToBoot): while true the viewer is inert
  // — the boot IO is never wired and the warm/flush tier no-ops — until the
  // ACTIVATE tap clears it and drives the boot directly.
  #pendingBoot = false;
  // Stage CSS size, cached by the ResizeObserver so the per-frame scrub path
  // (#draw/#ppf) never reads clientWidth after #syncReadout's DOM writes —
  // that read forced one synchronous reflow per scrub frame (measured 1:1).
  #stageW = 0;
  #stageH = 0;
  #edgeCued = false;
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
  #wheelAbort: AbortController | null = null;

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

    // Tap-to-activate (apparatus flag): CSS keys the hint chip + pointer
    // cursor on this attribute, so flipping the flag removes both wholesale.
    if (apparatus.caseTapToActivate) this.dataset.cvTap = '';

    // Tap-to-boot: arm the dimmed ACTIVATE overlay; CSS keys the veil + button
    // on data-cv-armed, and #observe/#nearViewport gate all decode+boot work on
    // #pendingBoot so nothing loads until the tap.
    if (apparatus.caseTapToBoot) {
      this.#pendingBoot = true;
      this.dataset.cvArmed = '';
    }

    this.#bind();
    this.#observe();
    this.dataset.state = this.#state;
  }

  disconnectedCallback(): void {
    this.#abort.abort();
    this.#wheelAbort?.abort();
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
  /** Stage CSS size from the RO cache; one live read only in the pre-first-
   *  callback window (a decode can land before the observer's initial fire). */
  #stageSize(): { w: number; h: number } {
    if (this.#stageW === 0) {
      this.#stageW = this.#stage.clientWidth;
      this.#stageH = this.#stage.clientHeight;
    }
    return { w: this.#stageW, h: this.#stageH };
  }

  #draw(): void {
    const bmp = this.#store.get(this.#frame);
    if (!bmp) return;
    const { w, h } = this.#stageSize();
    fitCanvas(this.#canvas, w, h);
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
    // "Image N/M" with N pad-aligned to M's width (space-padded; the counter's
    // white-space:pre + monospace hold the label anchored across digit counts).
    // Same visible/AT contract as case-shell.mjs — cannot import that node module.
    this.#counter.textContent = `Image ${String(this.#frame).padStart(String(n).length, ' ')}/${n}`;
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
    if (viaDrag) this.#edgeCue(clamped);
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

  /** Stack-edge acknowledgment: one inward bracket tick when a drag/wheel
   *  scrub arrives at IM 1 or IM N — the PACS "end of stack" stop, once per
   *  visit. Frontier holds are not edges (decode catch-up is the stall
   *  glyph's job). Authored motion, so reduced-motion suppresses it. */
  #edgeCue(frame: number): void {
    if (frame !== 1 && frame !== this.series.frames) {
      this.#edgeCued = false;
      return;
    }
    if (this.#edgeCued) return;
    this.#edgeCued = true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.classList.add('is-edge');
    setTimeout(() => this.classList.remove('is-edge'), 300);
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
    this.#ro = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1].contentRect;
      this.#stageW = box.width;
      this.#stageH = box.height;
      this.#draw();
    });
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
    // once, then stop watching. Skipped under tap-to-boot: the ACTIVATE tap is
    // the boot trigger there (#activate), not the scroll position.
    if (!this.#pendingBoot) {
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
  }

  /** ACTIVATE tap (tap-to-boot): retire the dimmed overlay and hand off to the
   *  same boot choreography + warm the current frame — the work the boot IO and
   *  near-viewport tiers would have done automatically. */
  #activate(): void {
    if (!this.#pendingBoot) return;
    this.#pendingBoot = false;
    delete this.dataset.cvArmed;
    this.classList.add('is-booting');
    this.#emit('cv:boot');
    this.#maybeReady();
    this.#nearViewport();
  }

  #nearViewport(): void {
    // Inert until the ACTIVATE tap clears the latch (tap-to-boot).
    if (this.#pendingBoot) return;
    this.#near = true;
    this.#store.setTarget(this.#frame, this.#dir);
    if (this.classList.contains('is-stalled')) this.#armRetry();
  }

  #farViewport(): void {
    // Nothing warmed or booted yet under a pending tap-to-boot latch.
    if (this.#pendingBoot) return;
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
    const wasEngaged = this.#state === 'engaged';
    this.#state = next;
    this.dataset.state = next;
    this.#closeBtn.hidden = next !== 'engaged';
    if (next === 'engaged') {
      // First engagement retires the tap-to-activate hint for good. The
      // bracket lock-in choreography is pure CSS, keyed on data-state.
      this.classList.add('has-engaged');
      this.#bindWheel();
    } else if (wasEngaged) {
      this.#wheelAbort?.abort();
      this.#wheelAbort = null;
    }
    this.#emit('cv:state', { state: next });
  }

  /** Desktop wheel scrub, bound only while engaged: a permanently-registered
   *  non-passive wheel listener would make the browser wait on this handler
   *  for every page-scroll wheel event that crosses the stage at rest.
   *  Capped per animation frame; swallowed at stack edges (disengage stays
   *  explicit — wheel never returns the page). */
  #bindWheel(): void {
    this.#wheelAbort = new AbortController();
    this.#stage.addEventListener(
      'wheel',
      (e) => {
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
      { signal: this.#wheelAbort.signal, passive: false }
    );
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
        if (this.#pendingBoot) return; // ACTIVATE is the only live control while armed
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
    // ACTIVATE overlay (tap-to-boot): fires the boot; stopPropagation so the
    // stage click can't also read it as an engage tap.
    this.querySelector('[data-cv-activate]')?.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        this.#activate();
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

    // Slider is the semantic scrubber (VO-adjustable). PageUp/Down = ±5.
    // Armed guard: snap back rather than decode — every control below waits
    // behind the ACTIVATE gate.
    this.#slider.addEventListener(
      'input',
      () => {
        if (this.#pendingBoot) {
          this.#slider.value = String(this.#frame);
          return;
        }
        this.#setFrame(Number(this.#slider.value), false);
      },
      { signal }
    );
    this.#slider.addEventListener(
      'keydown',
      (e) => {
        if (this.#pendingBoot) return;
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
        if (this.#pendingBoot) return;
        const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-cv-window]');
        if (btn) this.#switchWindow(btn.dataset.cvWindow!);
      },
      { signal }
    );
    this.querySelector('[data-cv-series]')?.addEventListener(
      'click',
      (e) => {
        if (this.#pendingBoot) return;
        const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-cv-serie]');
        if (btn) this.#switchSeries(btn.dataset.cvSerie!);
      },
      { signal }
    );

    this.querySelector('[data-cv-fullscreen]')?.addEventListener(
      'click',
      () => {
        if (this.#pendingBoot) return;
        this.#promote('button');
      },
      { signal }
    );

    // role=radio carries the full keyboard contract: roving tabindex (the
    // checked chip is the group's one tab stop) + arrow-key selection.
    this.#radiogroup('[data-cv-windows]', ['cv:window', 'cv:series']);
    this.#radiogroup('[data-cv-series]', ['cv:series']);
  }

  #radiogroup(selector: string, syncOn: string[]): void {
    const root = this.querySelector(selector);
    if (!root) return;
    const { signal } = this.#abort;
    // Queried live — #switchSeries rebuilds the window chips in place.
    const radios = () => [...root.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
    const sync = () =>
      radios().forEach((r) => (r.tabIndex = r.getAttribute('aria-checked') === 'true' ? 0 : -1));
    sync();
    for (const ev of syncOn) this.addEventListener(ev, sync, { signal });
    root.addEventListener(
      'keydown',
      (e) => {
        const ke = e as KeyboardEvent;
        const list = radios();
        const at = list.indexOf(ke.target as HTMLButtonElement);
        if (at === -1) return;
        let to: number;
        if (ke.key === 'ArrowRight' || ke.key === 'ArrowDown') to = (at + 1) % list.length;
        else if (ke.key === 'ArrowLeft' || ke.key === 'ArrowUp') to = (at - 1 + list.length) % list.length;
        else if (ke.key === 'Home') to = 0;
        else if (ke.key === 'End') to = list.length - 1;
        else return;
        ke.preventDefault();
        list[to].focus();
        list[to].click(); // selection follows focus (radio pattern)
      },
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
    return override > 0 ? override : pxPerFrame(this.#stageSize().w, this.series.frames);
  }

  #pointerDown(e: PointerEvent): void {
    // Armed (tap-to-boot): the pointer machinery is offline — no scrub
    // tracking, no two-finger fullscreen promote — until the ACTIVATE tap.
    if (this.#pendingBoot) return;
    // The ✕ lives inside the stage: tracking it would capture the pointer to
    // the stage, retargeting the button's click there — a dead close button.
    if ((e.target as HTMLElement).closest('button')) return;
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
        if (apparatus.caseTapToActivate) {
          // Rest is inert until the engage tap: a real drag is a page
          // gesture (or a stray mouse drag), never a scrub. Eat the click a
          // mouse drag synthesizes on release so it can't read as the tap.
          this.#justScrubbed = true;
          this.#active.delete(e.pointerId);
        } else if (this.#raceX > this.#raceY) {
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

  #rebuildChips(): void {
    const wrap = this.querySelector('[data-cv-windows]');
    if (!wrap) return;
    const windows = this.series.windows;
    wrap.innerHTML =
      windows.length > 1
        ? windows
            .map(
              (w, i) =>
                `<button type="button" role="radio" aria-checked="${i === this.#windowIdx}" data-cv-window="${esc(w.key)}">${esc(w.label)}</button>`
            )
            .join('')
        : '';
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
    // The shell's chips belong to series[0]; each series owns its window
    // list, so switching rebuilds them (delegated listener survives).
    this.#rebuildChips();
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
