/**
 * Custom remark/rehype plugins for the article markdown pipeline.
 * Consumed by astro.config.mjs `markdown.remarkPlugins` / `rehypePlugins`.
 *
 * The design system (src/styles/components/prose.css) owns all appearance;
 * these plugins only emit the class hooks it already defines.
 */
import { visit, SKIP } from 'unist-util-visit';
import { h } from 'hastscript';
import { toString } from 'mdast-util-to-string';
import { caseShellHtml, validateCaseAssets } from './case-shell.mjs';

/**
 * remarkReadingTime — injects `minutesRead` into the rendered frontmatter
 * (read via `remarkPluginFrontmatter` at render time). 200 wpm, floor 1.
 */
export function remarkReadingTime() {
  return (tree, file) => {
    const words = toString(tree).split(/\s+/).filter(Boolean).length;
    file.data.astro.frontmatter.minutesRead = Math.max(1, Math.round(words / 200));
  };
}

/**
 * remarkCallouts — maps directive syntax to the prose callout apparatus, so
 * authors write markdown instead of raw HTML:
 *
 *   :::critical[Do not wait]
 *   Pneumatosis is a late sign…
 *   :::
 *
 * Kinds: note (cyan, default) · caution (yellow) · critical (red).
 * The [label] is optional and becomes the callout's uppercase label line.
 */
const CALLOUT_KINDS = new Set(['note', 'caution', 'critical']);

export function remarkCallouts() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (!CALLOUT_KINDS.has(node.name)) return;

      const [first] = node.children;
      if (first?.data?.directiveLabel) {
        const labelData = first.data;
        labelData.hName = 'p';
        labelData.hProperties = { className: ['callout__label'] };
      }

      const classes = ['callout'];
      if (node.name !== 'note') classes.push(`callout--${node.name}`);
      const data = node.data || (node.data = {});
      data.hName = 'div';
      data.hProperties = h('div', { class: classes.join(' ') }).properties;
    });
  };
}

/**
 * remarkCaseViewer — expands `::case[caption]{id="ct-abd-001"}` into the full
 * static <case-viewer> shell at build time (src/lib/case-shell.mjs), so the
 * article ships zero-CLS, no-runtime-JSON, poster-first HTML. Stamps
 * `hasCaseViewer` into the rendered frontmatter; [slug].astro loads the
 * element script only on articles that need it (the minutesRead mechanism).
 *
 * Build validation — the whole list, by design (it exists so a published
 * stack can never stall on a 404, not to police content):
 *   - manifest missing → build error
 *   - a frame file (or poster) the manifest references missing → build error
 */
export function remarkCaseViewer() {
  return (tree, file) => {
    visit(tree, 'leafDirective', (node, index, parent) => {
      if (node.name !== 'case' || !parent || index == null) return;

      const where = file.path || 'article';
      const id = node.attributes?.id;
      if (!id) throw new Error(`${where}: ::case directive needs {id="<case-id>"}`);

      const manifest = validateCaseAssets(id, where);
      parent.children[index] = { type: 'html', value: caseShellHtml(manifest, toString(node)) };
      file.data.astro.frontmatter.hasCaseViewer = true;
      return SKIP;
    });
  };
}

/**
 * rehypeTableScroll — wraps every markdown table in a `.table-scroll`
 * overflow container. A border-collapse table cannot compress below its
 * min-content width, so on narrow viewports the wrapper scrolls instead of
 * the whole page panning sideways.
 */
export function rehypeTableScroll() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index == null) return;
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'] },
        children: [node],
      };
      return SKIP;
    });
  };
}
