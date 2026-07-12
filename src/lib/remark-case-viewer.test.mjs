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
    expect(out.value).toContain('Image 24/48'); // counter pre-rendered at start (start 24 == frames width, no pad)
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
    expect(html).toContain('Image  7/30'); // frame 7 space-padded to frames' 2-digit width
    expect(html).toContain('aria-valuetext="Image 7 of 30"');
    expect(html).not.toContain('data-cv-windows'); // one window → no chips
    expect(html).not.toContain('cv__tabs'); // one series → no tabs
    expect(html).not.toContain('<figcaption'); // empty caption → none
  });
});

describe('shell DOM contract — views kind', () => {
  const manifest = {
    id: 'xr-1',
    title: 'XR ANKLE (LEFT)',
    modality: 'XR',
    base: '/cases/xr-1/',
    rev: 2,
    kind: 'views',
    stage: { width: 1200, height: 1187 },
    start: 2,
    poster: 'poster.jpg',
    views: [
      { key: 'v01', label: 'AP ANKLE', width: 687, height: 1200, file: 'views/001.jpg', thumb: 'views/thumb-001.jpg' },
      { key: 'v02', label: 'LAT ANKLE', width: 1200, height: 980, file: 'views/002.jpg', thumb: 'views/thumb-002.jpg' },
    ],
  };

  it('emits the rail radiogroup, per-view buttons, and live meta hooks', () => {
    const html = caseShellHtml(manifest, 'Cap.');
    expect(html).toContain('data-kind="views"');
    expect(html).toContain('data-cv-rail');
    expect(html).toContain('role="radiogroup" aria-label="Views"');
    expect(html).toContain('data-cv-view="v01"');
    expect(html).toContain('data-cv-view="v02"');
    // start=2 → v02 checked, v01 not; label + counter pre-rendered for it.
    expect(html).toContain('aria-checked="false" data-cv-view="v01"');
    expect(html).toContain('aria-checked="true" data-cv-view="v02"');
    expect(html).toContain('<span data-cv-view-label>LAT ANKLE</span>');
    expect(html).toContain('data-cv-counter>2/2</span>');
    expect(html).toContain('aspect-ratio: 1200 / 1187'); // stage envelope, not view dims
    expect(html).toContain('/cases/xr-1/poster.jpg');
    expect(html).toContain('/cases/xr-1/views/thumb-001.jpg');
  });

  it('emits no slider, chips, or tabs — the rail owns selection', () => {
    const html = caseShellHtml(manifest, '');
    expect(html).not.toContain('data-cv-slider');
    expect(html).not.toContain('data-cv-windows');
    expect(html).not.toContain('data-cv-series');
    expect(html).toContain('data-cv-fullscreen'); // fullscreen stays
    expect(html).toContain('data-cv-activate'); // tap-to-boot gate stays
  });

  it('emits a real-<img> fallback per view with alt text, plus the no-JS unhide', () => {
    const html = caseShellHtml(manifest, '');
    expect(html).toContain('class="cv__fallback"');
    expect(html).toContain('alt="AP ANKLE — XR ANKLE (LEFT)"');
    expect(html).toContain('alt="LAT ANKLE — XR ANKLE (LEFT)"');
    expect(html).toContain('src="/cases/xr-1/views/001.jpg"');
    expect(html).toContain('width="687" height="1200"');
    expect(html).toContain('<noscript><style>case-viewer .cv__fallback{display:grid}</style></noscript>');
  });
});

afterAll(() => {
  rmSync(path.resolve('public/cases/vitest-hole'), { recursive: true, force: true });
});
