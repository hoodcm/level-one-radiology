/**
 * Contract tests for the design-token layer.
 *
 * These assert the *documented* promises in src/styles/tokens/colors.css —
 * the swatch naming rule, the two warmth formulas, and the swatch → role →
 * consumer direction — rather than pinning today's hexes. A hex may change;
 * the ramp it sits on may not.
 *
 * The last test is the gate the build cannot provide: an unresolved
 * `var(--token)` reference makes CSS fall back to nothing, and neither
 * `astro build` nor stylelint (which does not resolve custom-property names)
 * reports it. A deleted or misspelled token is invisible until someone looks
 * at the page.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..');
const COLORS = join(HERE, 'tokens/colors.css');

/**
 * Recursive file listing, repo-relative, filtered by extension.
 * Deliberately hand-rolled rather than using the newer fs glob helper: that
 * one landed in Node 22, and CI pins Node 20 — where importing it throws
 * before a single test in this file runs.
 */
function listFiles(dir, exts, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, exts, base));
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(relative(base, full));
  }
  return out;
}

/** `--name: value;` pairs, in source order. */
function declarations(css) {
  const out = new Map();
  for (const m of css.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g)) {
    out.set(m[1], m[2].trim());
  }
  return out;
}

const colorsCss = readFileSync(COLORS, 'utf8');
const decls = declarations(colorsCss);

const rgb = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

/** Follow `var(--x)` chains to the literal a token bottoms out at. */
function resolve(name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`cyclic token reference at ${name}`);
  seen.add(name);
  const value = decls.get(name);
  if (value === undefined) return null;
  const ref = /^var\(\s*(--[A-Za-z0-9_-]+)\s*\)$/.exec(value);
  return ref ? resolve(ref[1], seen) : value;
}

const swatches = [...decls.keys()].filter((n) => n.startsWith('--gray-'));

describe('swatch layer', () => {
  it('exists', () => {
    expect(swatches.length).toBeGreaterThan(0);
  });

  // The documented naming rule: green is the formula's free variable, so the
  // number in the name IS the green channel. A mis-named swatch is a swatch
  // nobody can reason about.
  it.each(swatches)('%s is named for its green channel', (name) => {
    const channels = rgb(decls.get(name));
    expect(channels).not.toBeNull();
    expect(channels.g).toBe(Number(name.slice('--gray-'.length)));
  });
});

describe('warmth formulas', () => {
  // Surfaces and borders share the +2 spread: R = G+1, B = G-1.
  const SURFACE_ROLES = [
    '--color-bg-deepest',
    '--color-bg-primary',
    '--color-bg-secondary',
    '--color-bg-raised',
    '--color-bg-active',
    '--color-bg-elevated',
    '--color-border-subtle',
    '--color-border-default',
    '--color-border-strong',
  ];

  it.each(SURFACE_ROLES)('%s sits on the +2 surface ramp', (role) => {
    const { r, g, b } = rgb(resolve(role));
    expect(r).toBe(g + 1);
    expect(b).toBe(g - 1);
  });

  // Text carries a deliberately wider bias, and it widens as luminance drops.
  const TEXT_ROLES = [
    '--color-text-primary',
    '--color-text-ivory',
    '--color-text-secondary',
    '--color-text-muted',
    '--color-text-disabled',
  ];

  it.each(TEXT_ROLES)('%s carries the wide warm bias', (role) => {
    const { r, g, b } = rgb(resolve(role));
    expect(r).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(b);
    expect(r - b).toBeGreaterThanOrEqual(10);
    expect(r - b).toBeLessThanOrEqual(20);
  });

  it('text carries a wider bias than any surface', () => {
    const widest = Math.max(
      ...['--color-bg-deepest', '--color-bg-elevated', '--color-border-strong'].map((role) => {
        const { r, b } = rgb(resolve(role));
        return r - b;
      }),
    );
    const narrowest = Math.min(
      ...TEXT_ROLES.map((role) => {
        const { r, b } = rgb(resolve(role));
        return r - b;
      }),
    );
    expect(narrowest).toBeGreaterThan(widest);
  });
});

describe('layer direction', () => {
  // Roles point at swatches; only a role may name a raw value. Surfaces and
  // borders in particular must never carry a literal — that is how a value
  // drifts off the ramp the tests above police.
  const RAMP_ROLES = [...decls.keys()].filter(
    (n) => n.startsWith('--color-bg-') || n.startsWith('--color-border-') || n.startsWith('--color-text-'),
  );

  it.each(RAMP_ROLES)('%s references a swatch rather than a literal', (role) => {
    expect(decls.get(role)).toMatch(/^var\(--gray-\d+\)$/);
  });

  it('every swatch has at least one role consuming it', () => {
    // Roles live in colors.css AND in the print role remap — the light-end
    // swatches exist precisely because print's roles consume them.
    const roleLayers = colorsCss + readFileSync(join(HERE, 'tokens/print.css'), 'utf8');
    const orphans = swatches.filter((s) => !roleLayers.includes(`var(${s})`));
    expect(orphans).toEqual([]);
  });
});

describe('retired tokens', () => {
  const RETIRED = [
    '--color-signal-orange',
    '--color-signal-violet',
    '--color-signal-magenta',
    '--color-border-accent',
    '--color-imaging-black',
    '--color-control-charcoal',
    '--color-console-white',
    '--color-textbook-ivory',
    '--color-level-one-red',
    '--color-sunset-orange',
    '--color-chroma-yellow',
    '--color-scanline-cyan',
    '--color-cosmic-violet',
    '--color-burst-magenta',
  ];

  it.each(RETIRED)('%s is gone from the token layer', (name) => {
    expect(decls.has(name)).toBe(false);
  });
});

describe('fluid scale', () => {
  // The editorial scale interpolates over a 320 -> 1280px viewport. Each token
  // is `clamp(MIN, calc(A + B vw), MAX)`, and the contract is that the linear
  // middle term actually MEETS its own endpoints: at 320px it must equal MIN,
  // at 1280px it must equal MAX. Get the intercept or slope slightly wrong and
  // nothing errors — the clamp just quietly plateaus early or jumps at a
  // boundary, which is invisible in a screenshot and invisible to stylelint.
  const VIEWPORT_MIN = 320;
  const VIEWPORT_MAX = 1280;
  const ROOT_FONT_PX = 16;

  const typography = declarations(readFileSync(join(HERE, 'tokens/typography.css'), 'utf8'));
  const spacingCss = readFileSync(join(HERE, 'tokens/spacing.css'), 'utf8');
  const spacing = declarations(spacingCss);
  const all = new Map([...typography, ...spacing]);

  /** rem / px / var(--space-N) -> px. */
  function toPx(value) {
    const v = value.trim();
    const spaceRef = /^var\(\s*(--space-\d+)\s*\)$/.exec(v);
    if (spaceRef) return toPx(spacing.get(spaceRef[1]));
    if (v.endsWith('rem')) return parseFloat(v) * ROOT_FONT_PX;
    if (v.endsWith('px')) return parseFloat(v);
    return NaN;
  }

  /** clamp(min, calc(A + Bvw), max) -> {minPx, maxPx, interceptPx, vw} */
  function parseFluid(value) {
    const m = /^clamp\(\s*(.+?)\s*,\s*calc\(\s*(.+?)\s*\+\s*([\d.]+)vw\s*\)\s*,\s*(.+?)\s*\)$/.exec(value);
    if (!m) return null;
    return {
      minPx: toPx(m[1]),
      interceptPx: toPx(m[2]),
      vw: parseFloat(m[3]),
      maxPx: toPx(m[4]),
    };
  }

  // DISCOVERED, not enumerated: every token in typography.css + spacing.css
  // whose value is an editorial-scale clamp (calc + vw middle term) is on the
  // hook for every check below. A static list here silently exempted the
  // first fluid token added after it was written — fail-open, the exact
  // defect this suite polices. --fz-wordmark-hero is the one legitimate
  // exclusion: its clamp derives from --grid-margin and 100vw (content-fit,
  // not the 320->1280 editorial ramp), so the linear-endpoint contract does
  // not apply — parseFluid() cannot parse it, which is the exclusion filter.
  const FLUID = [...all]
    .filter(([, value]) => parseFluid(value) !== null)
    .map(([name]) => name);

  it('discovers the fluid scale (fails closed on a broken scan)', () => {
    // The editorial ramp is at least this big; a regex drift that stops
    // matching clamp() must fail here, not silently shrink coverage.
    expect(FLUID.length).toBeGreaterThanOrEqual(11);
    expect(FLUID).toContain('--prose-heading-gap');
  });

  // The five tokens this plan introduced; prose.css held them as literals.
  const NEW_TOKENS = [
    '--fz-article-title',
    '--fz-article-deck',
    '--fz-prose-h2',
    '--fz-prose-h3',
  ];

  it.each(NEW_TOKENS)('%s exists as a token', (name) => {
    expect(all.has(name)).toBe(true);
  });

  it.each(FLUID)('%s is a parseable clamp', (name) => {
    expect(parseFluid(all.get(name))).not.toBeNull();
  });

  it.each(FLUID)('%s interpolation meets its own endpoints', (name) => {
    const { minPx, maxPx, interceptPx, vw } = parseFluid(all.get(name));
    const at = (viewport) => interceptPx + (vw / 100) * viewport;
    // Coefficients are written to 4dp, so allow a sub-tenth-px rounding drift.
    expect(at(VIEWPORT_MIN)).toBeCloseTo(minPx, 1);
    expect(at(VIEWPORT_MAX)).toBeCloseTo(maxPx, 1);
    expect(maxPx).toBeGreaterThan(minPx);
  });

  // A @media block that still sets a token :root now clamps WINS above that
  // breakpoint, silently un-fluidizing it in exactly the desktop range the
  // fluid scale exists to serve. This is the regression that motivated
  // retiring the old overrides, so it gets a permanent guard.
  const mediaBlocks = [
    ...readFileSync(join(HERE, 'tokens/typography.css'), 'utf8').matchAll(
      /@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g,
    ),
    ...spacingCss.matchAll(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g),
  ].map((m) => m[0]);

  it('finds media blocks to check (fails closed on a broken scan)', () => {
    expect(mediaBlocks.length).toBeGreaterThan(0);
  });

  it.each(FLUID)('%s is not re-declared inside any @media block', (name) => {
    const offenders = mediaBlocks.filter((block) =>
      new RegExp(`${name}\\s*:`).test(block),
    );
    expect(offenders).toEqual([]);
  });

  // `vw` in paged media resolves against the page box, so a fluid token left
  // unpinned interpolates off the paper size — silently changing what a saved
  // PDF looks like. Print must pin every one of them, at the compact end of
  // the ramp (which is also what print got before the scale went fluid).
  const printCss = readFileSync(join(HERE, 'tokens/print.css'), 'utf8');
  const printDecls = declarations(printCss);

  it.each(FLUID)('%s is pinned for print at its clamp minimum', (name) => {
    const pinned = printDecls.get(name);
    expect(pinned, `${name} is fluid but print.css does not pin it`).toBeDefined();
    expect(toPx(pinned)).toBeCloseTo(parseFluid(all.get(name)).minPx, 1);
  });

  // getPropertyValue returns a custom property UNRESOLVED, so a fluid token
  // reads back as the literal string "clamp(...)" and parseFloat gives NaN.
  it('no script reads a fluid token via getPropertyValue', () => {
    const scripts = listFiles(SRC, ['.astro', '.ts', '.tsx', '.mjs', '.js']).map((p) => join(SRC, p));
    expect(scripts.length).toBeGreaterThan(5);
    const offenders = [];
    for (const file of scripts) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/getPropertyValue\(\s*['"`](--[A-Za-z0-9_-]+)/g)) {
        if (FLUID.includes(m[1])) offenders.push(`${relative(SRC, file)} reads ${m[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('token references resolve', () => {
  // Scoped to the design-token namespaces on purpose: properties outside them
  // (shadcn's --foreground/--secondary, JS-supplied --reveal-index) are
  // supplied by other systems and are not this layer's contract.
  const TOKEN_NS = /^--(gray|color|fz|lh|ls|ff|space|grid|card|section|gap|radius|nav|logo)-/;

  // Test files are not part of the rendered surface, and they name tokens as
  // data (retired-token lists, parser patterns) rather than referencing them.
  const files = listFiles(SRC, ['.css', '.astro', '.ts', '.tsx', '.mjs'])
    .filter((p) => !/\.test\./.test(p))
    .map((p) => join(SRC, p));

  const defined = new Set();
  const referenced = new Map();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    // `--x: var(--x)` is Tailwind v4's `@theme` re-export idiom — a
    // pass-through, not a definition. Counting it as one would let a token
    // whose real :root definition was deleted look defined by its own
    // re-export, which is precisely the dangling reference this test hunts.
    for (const m of text.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]*)/g)) {
      if (m[2].trim() === `var(${m[1]})`) continue;
      defined.add(m[1]);
    }
    for (const m of text.matchAll(/setProperty\(\s*['"](--[A-Za-z0-9_-]+)/g)) defined.add(m[1]);
    for (const m of text.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) {
      if (!referenced.has(m[1])) referenced.set(m[1], new Set());
      referenced.get(m[1]).add(relative(SRC, file));
    }
  }

  it('finds a real corpus to check (fails closed on an empty file list)', () => {
    expect(files.length).toBeGreaterThan(20);
    expect(referenced.size).toBeGreaterThan(50);
  });

  it('no design token is referenced without a definition', () => {
    const dangling = [...referenced]
      .filter(([name]) => TOKEN_NS.test(name) && !defined.has(name))
      .map(([name, where]) => `${name} <- ${[...where].sort().join(', ')}`);
    expect(dangling).toEqual([]);
  });
});

describe('closed ramps: leading, tracking, weight', () => {
  // The rhythm layer's contract is CLOSURE: every line-height, letter-spacing,
  // and font-weight on the site is a ramp rung or a role that resolves to one.
  // The stylelint gate rejects literals at the declaration site; these tests
  // guard the other half — that the ramp itself stays a small, meaningfully
  // spaced set, and that every semantic token still lands on a rung.
  const typographyCss = readFileSync(join(HERE, 'tokens/typography.css'), 'utf8');
  const typo = declarations(typographyCss);

  const rungValues = (prefix) =>
    [...typo].filter(([name]) => new RegExp(`^--${prefix}-\\d+$`).test(name));

  it('the leading ramp is the documented five rungs', () => {
    const rungs = rungValues('lh');
    expect(Object.fromEntries(rungs)).toEqual({
      '--lh-100': '1',
      '--lh-110': '1.1',
      '--lh-120': '1.2',
      '--lh-140': '1.4',
      '--lh-150': '1.5',
    });
  });

  it('every --lh rung name states its value (the ×100 naming rule)', () => {
    for (const [name, value] of rungValues('lh')) {
      expect(Number(name.replace('--lh-', ''))).toBeCloseTo(parseFloat(value) * 100, 5);
    }
  });

  it('rungs are a meaningful step apart — no minuscule-difference pairs', () => {
    const values = rungValues('lh').map(([, v]) => parseFloat(v)).sort((a, b) => a - b);
    for (let i = 1; i < values.length; i++) {
      expect(values[i] - values[i - 1]).toBeGreaterThanOrEqual(0.1 - 1e-9);
    }
  });

  it('every semantic --lh-* token resolves to a rung', () => {
    const rungNames = new Set(rungValues('lh').map(([n]) => n));
    const semantic = [...typo].filter(
      ([name]) => name.startsWith('--lh-') && !rungNames.has(name),
    );
    expect(semantic.length).toBeGreaterThan(0);
    for (const [name, value] of semantic) {
      const ref = /^var\((--lh-\d+)\)$/.exec(value);
      expect(ref, `${name} must reference a rung, got: ${value}`).not.toBeNull();
      expect(rungNames.has(ref[1])).toBe(true);
    }
  });

  it('the tracking set and weight vocabulary exist with their documented values', () => {
    expect(typo.get('--ls-tight')).toBe('-0.01em');
    expect(typo.get('--ls-mono')).toBe('0.04em');
    expect(typo.get('--ls-ui')).toBe('0.06em');
    expect(typo.get('--fw-regular')).toBe('400');
    expect(typo.get('--fw-semibold')).toBe('600');
    expect(typo.get('--fw-bold')).toBe('700');
  });

  // The declaration-site gate, exercised for real: stylelint must REJECT a
  // literal for each governed property. A gate that stops firing (plugin
  // update, config typo) would otherwise let literals silently return.
  it('stylelint rejects rhythm literals in component CSS (fails closed)', () => {
    const { execFileSync } = require('node:child_process');
    const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
    const { tmpdir } = require('node:os');
    const dir = mkdtempSync(join(tmpdir(), 'l1-rhythm-gate-'));
    const probe = join(dir, 'probe.css');
    writeFileSync(
      probe,
      '.p { line-height: 1.4; letter-spacing: 0.04em; font-weight: 600; z-index: 30; }\n',
    );
    let failed = false;
    let out = '';
    try {
      execFileSync('npx', ['stylelint', '--config', join(SRC, '../.stylelintrc.json'), probe], {
        cwd: join(SRC, '..'),
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (err) {
      failed = true;
      out = `${err.stdout ?? ''}${err.stderr ?? ''}`;
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
    expect(failed).toBe(true);
    for (const prop of ['line-height', 'letter-spacing', 'font-weight', 'z-index']) {
      expect(out).toContain(prop);
    }
  });
});
