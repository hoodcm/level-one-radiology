// Contract tests for the ::case directive (plan step 7 contracts: directive
// syntax + emitted shell DOM/attribute names). The plugin is exercised on a
// hand-built mdast tree — the same shape remark-directive produces — so no
// markdown parser dependency is needed.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { remarkCaseViewer } from './markdown-plugins.mjs';
import { caseShellHtml } from './case-shell.mjs';

const directive = (attributes, label = 'A caption.') => ({
  type: 'leafDirective',
  name: 'case',
  attributes,
  children: label ? [{ type: 'text', value: label }] : [],
});

const runPlugin = (node) => {
  const tree = { type: 'root', children: [node] };
  const file = { path: 'test.md', data: { astro: { frontmatter: {} } } };
  remarkCaseViewer()(tree, file);
  return { tree, file };
};

describe('::case directive contract', () => {
  it('expands into the static shell and stamps hasCaseViewer', () => {
    const { tree, file } = runPlugin(directive({ id: 'dev-synthetic' }));
    const out = tree.children[0];
    expect(out.type).toBe('html');
    expect(out.value).toContain('<case-viewer data-case="dev-synthetic"');
    expect(out.value).toContain('data-cv-manifest');
    expect(out.value).toContain('"id":"dev-synthetic"');
    expect(out.value).toContain('IM 24/48'); // counter pre-rendered at start
    expect(out.value).toContain('max="48"');
    expect(out.value).toContain('/cases/dev-synthetic/axial/poster.jpg');
    expect(out.value).toContain('data-cv-window="soft"');
    expect(out.value).toContain('data-cv-window="lung"');
    expect(out.value).toContain('A caption.');
    expect(file.data.astro.frontmatter.hasCaseViewer).toBe(true);
  });

  it('leaves other directives alone and stamps nothing', () => {
    const node = { type: 'leafDirective', name: 'video', attributes: {}, children: [] };
    const { tree, file } = runPlugin(node);
    expect(tree.children[0]).toBe(node);
    expect(file.data.astro.frontmatter.hasCaseViewer).toBeUndefined();
  });

  it('fails the build on a missing id', () => {
    expect(() => runPlugin(directive({}))).toThrow(/needs \{id=/);
  });

  it('fails the build on a missing manifest, naming the fix', () => {
    expect(() => runPlugin(directive({ id: 'no-such-case' }))).toThrow(/case:build/);
  });

  it('fails the build when the manifest references a frame missing on disk', () => {
    const dir = path.resolve('public/cases/vitest-hole');
    mkdirSync(path.join(dir, 'axial/soft'), { recursive: true });
    writeFileSync(
      path.join(dir, 'manifest.json'),
      JSON.stringify({
        id: 'vitest-hole',
        title: 'Hole',
        modality: 'CT',
        base: '/cases/vitest-hole/',
        rev: 1,
        series: [
          {
            key: 'axial', label: 'AXIAL', plane: 'axial', frames: 2,
            width: 64, height: 64, start: 1,
            windows: [{ key: 'soft', label: 'SOFT', pattern: 'axial/soft/{nnn}.jpg' }],
            poster: 'axial/poster.jpg',
          },
        ],
      })
    );
    writeFileSync(path.join(dir, 'axial/soft/001.jpg'), 'x'); // 002 missing
    expect(() => runPlugin(directive({ id: 'vitest-hole' }))).toThrow(/002\.jpg.*missing/);
  });
});

describe('shell DOM contract (caseShellHtml)', () => {
  const manifest = {
    id: 'x-1',
    title: 'Title with <script>alert(1)</script>',
    modality: 'MR',
    base: '/cases/x-1/',
    rev: 3,
    series: [
      {
        key: 'sag', label: 'SAG', plane: 'sagittal', frames: 30,
        width: 512, height: 640, start: 7,
        windows: [{ key: 'only', label: 'ONLY', pattern: 'sag/only/{nnn}.jpg' }],
        poster: 'sag/poster.jpg',
      },
    ],
  };

  it('escapes untrusted text and inlines a breakout-safe manifest', () => {
    const html = caseShellHtml(manifest, 'Caption </script> attack');
    expect(html).not.toMatch(/<script>alert/);
    expect(html).not.toContain('</script> attack');
    // The one legitimate script is the JSON manifest, with `<` escaped inside.
    expect(html.match(/<script type="application\/json"/g)).toHaveLength(1);
    expect(html).toContain('\\u003cscript>');
  });

  it('renders geometry, start frame, and single-window shells without chips', () => {
    const html = caseShellHtml(manifest, '');
    expect(html).toContain('aspect-ratio: 512 / 640');
    expect(html).toContain('IM 7/30');
    expect(html).toContain('aria-valuetext="Image 7 of 30"');
    expect(html).not.toContain('data-cv-windows'); // one window → no chips
    expect(html).not.toContain('cv__tabs'); // one series → no tabs
    expect(html).not.toContain('<figcaption'); // empty caption → none
  });
});

afterAll(() => {
  rmSync(path.resolve('public/cases/vitest-hole'), { recursive: true, force: true });
});
