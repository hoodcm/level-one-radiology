/**
 * Contract tests for the token lint gate.
 *
 * The gate enforces two rules stylelint structurally cannot: no hard-coded
 * colors in component markup, and no `--gray-*` swatch referenced outside
 * colors.css. Both are exit-code contracts consumed by `npm run lint` and CI,
 * so they are exercised through a real process invocation rather than by
 * importing internals.
 *
 * The last test is the one that matters most: a check that cannot distinguish
 * "nothing to enforce" from "nothing wrong" launders absence into a pass. This
 * gate must fail closed when its scan comes back empty.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(REPO, 'scripts/check-inline-colors.mjs');

/** Run the gate; return {code, out}. Never throws on a non-zero exit. */
function run({ args = [], cwd = REPO } = {}) {
  try {
    const out = execFileSync('node', [SCRIPT, ...args], { cwd, encoding: 'utf8', stdio: 'pipe' });
    return { code: 0, out };
  } catch (err) {
    return { code: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

let scratch;
const fixture = (name, contents) => {
  const path = join(scratch, name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
  return path;
};

beforeAll(() => {
  scratch = mkdtempSync(join(tmpdir(), 'l1-lint-gate-'));
});
afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
});

describe('the repository itself', () => {
  // One full-repo scan, asserted twice. A no-arg run spawns a process that
  // walks all of src/ across six extensions — the most expensive thing in this
  // suite — and running it per assertion would also let the two assertions
  // disagree if the tree changed between spawns.
  let full;
  beforeAll(() => {
    full = run();
  });

  it('passes the gate', () => {
    expect(full.out).toMatch(/No hard-coded colors/);
    expect(full.code).toBe(0);
  });

  it('reports non-zero file counts, so a green run means something', () => {
    const counts = [...full.out.matchAll(/\((\d+) files\)/g)].map((m) => Number(m[1]));
    expect(counts.length).toBe(2);
    for (const n of counts) expect(n).toBeGreaterThan(0);
  });
});

describe('swatch leakage', () => {
  // The swatch layer is the raw ramp; only role tokens may reference it. CSS is
  // the dominant consumer surface and the whole reason this check exists
  // outside stylelint, so it must be walked.
  it('fails on a swatch used in a component stylesheet', () => {
    const f = fixture('styles/components/leak.css', '.x { color: var(--gray-26); }\n');
    const { code, out } = run({ args: [f] });
    expect(out).toMatch(/--gray-26/);
    expect(code).toBe(1);
  });

  it('fails on a swatch used in markup', () => {
    const f = fixture('components/Leak.astro', '---\n---\n<div style={`color: var(--gray-26)`} />\n');
    const { code, out } = run({ args: [f] });
    expect(out).toMatch(/--gray-26/);
    expect(code).toBe(1);
  });

  it('fails on a swatch used in a script that emits styles', () => {
    const f = fixture('lib/draw.mjs', "export const ink = 'var(--gray-54)';\n");
    const { code } = run({ args: [f] });
    expect(code).toBe(1);
  });

  it('allows the swatch layer to define its own swatches', () => {
    const { code } = run({ args: [join(REPO, 'src/styles/tokens/colors.css')] });
    expect(code).toBe(0);
  });

  it('allows the print role remap to reference swatches (it is a role layer)', () => {
    const { code } = run({ args: [join(REPO, 'src/styles/tokens/print.css')] });
    expect(code).toBe(0);
  });

  it('accepts a role token in place of a swatch', () => {
    const f = fixture('styles/components/ok.css', '.x { color: var(--color-bg-raised); }\n');
    const { code } = run({ args: [f] });
    expect(code).toBe(0);
  });
});

describe('hard-coded colors', () => {
  it('fails on a hex literal in markup', () => {
    const f = fixture('components/Hex.astro', '---\n---\n<div style="color: #ff0000" />\n');
    const { code, out } = run({ args: [f] });
    expect(out).toMatch(/#ff0000/);
    expect(code).toBe(1);
  });

  // Stylelint owns hex literals in CSS. Reporting them here too would
  // double-report every violation and make the two gates disagree on counts.
  it('leaves hex literals in stylesheets to stylelint', () => {
    const f = fixture('styles/components/hex.css', '.x { color: #ff0000; }\n');
    const { code } = run({ args: [f] });
    expect(code).toBe(0);
  });

  it('blesses the theme-color meta, which cannot reference a var', () => {
    const f = fixture('layouts/Meta.astro', '---\n---\n<meta name="theme-color" content="#0B0A09" />\n');
    const { code } = run({ args: [f] });
    expect(code).toBe(0);
  });
});

describe('fails closed', () => {
  // A gate reading an empty file set must not report success. This is the
  // difference between "nothing to enforce" and "nothing wrong".
  it('errors when a full scan finds no files to check', () => {
    const emptyRepo = join(scratch, 'empty-repo');
    mkdirSync(join(emptyRepo, 'src'), { recursive: true });
    writeFileSync(join(emptyRepo, 'src/README.md'), 'no styles here\n', 'utf8');
    const { code, out } = run({ cwd: emptyRepo });
    expect(out).toMatch(/scanned no files|broken scan/i);
    expect(code).toBe(1);
  });
});
