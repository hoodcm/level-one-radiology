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
 * rehypeFootnotePopovers — upgrades GFM footnotes (`[^1]`) from a
 * jump-to-the-bottom link into a tap-first Popover card, zero runtime JS.
 * Registered in astro.config.mjs only when `apparatus.footnotePopovers`;
 * flag off → plain GFM output. Three moves:
 *
 * 1. Neutralize the injected heading. GFM emits
 *    `<h2 id="footnote-label" class="sr-only">` inside `<section
 *    class="footnotes">` — a phantom heading that would contaminate the TOC
 *    rail / mobile INDEX (headings collector), the l1-section ordinal
 *    counter, and render visibly (no sr-only utility is generated here).
 *    Replace it with `<p class="footnotes__label" id="footnote-label">`
 *    (the id stays: refs point at it via aria-describedby).
 * 2. Each ref `<sup><a href="#user-content-fn-N">` becomes
 *    `<sup><button popovertarget="fnpop-N">` plus a `<div popover
 *    id="fnpop-N" class="footnote-card">` holding a build-time COPY of note
 *    N's content (pure CSS cannot teleport bottom-of-document content).
 *    Cards are appended to the footnotes section — never inside a <p>, which
 *    the HTML parser would split around a <div>. The button keeps the old
 *    anchor's id, so the plate's backrefs (↩) keep working.
 * 3. The endnote plate stays as the base layer: browsers without Popover get
 *    an inert button and a complete plate — the card is lost, never content.
 *
 * Move 1 always runs — the phantom heading is a defect of raw GFM output on
 * this site regardless of popovers (Astro's heading collector runs after
 * user rehype plugins). Only the popover upgrade (moves 2–3) is gated, via
 * the `popovers` option wired to `apparatus.footnotePopovers`; flag off →
 * plain GFM refs and plate, heading fix retained.
 */
export function rehypeFootnotePopovers({ popovers = true } = {}) {
  return (tree) => {
    let section = null;
    visit(tree, 'element', (node) => {
      if (node.tagName === 'section' && node.properties?.dataFootnotes != null) {
        section = node;
        return SKIP;
      }
    });
    if (!section) return;

    section.children = section.children.map((child) =>
      child.tagName === 'h2' && child.properties?.id === 'footnote-label'
        ? {
            type: 'element',
            tagName: 'p',
            properties: { className: ['footnotes__label'], id: 'footnote-label' },
            children: [{ type: 'text', value: 'Notes' }],
          }
        : child
    );

    if (!popovers) return;

    // note li id ("user-content-fn-N") → its content
    const notes = new Map();
    visit(section, 'element', (li) => {
      const id = li.tagName === 'li' ? li.properties?.id : undefined;
      if (typeof id === 'string' && id.startsWith('user-content-fn-')) notes.set(id, li);
    });

    // Refs → popover buttons. One card per note, even when referenced twice.
    const referenced = new Set();
    visit(tree, 'element', (sup) => {
      if (sup.tagName !== 'sup') return;
      const [a] = sup.children ?? [];
      if (a?.tagName !== 'a' || a.properties?.dataFootnoteRef == null) return;
      const noteId = String(a.properties.href ?? '').slice(1);
      if (!notes.has(noteId)) return;
      sup.children = [
        {
          type: 'element',
          tagName: 'button',
          properties: {
            type: 'button',
            id: a.properties.id,
            popoverTarget: `fnpop-${noteId.slice('user-content-fn-'.length)}`,
            ariaDescribedBy: 'footnote-label',
            className: ['footnote-ref'],
          },
          children: a.children,
        },
      ];
      referenced.add(noteId);
    });

    // Cards: a cleaned copy of the note — backrefs out, ids out (duplicates).
    const cleanCopy = (nodes) => {
      const copy = structuredClone(nodes);
      const strip = (children) =>
        children.filter((n) => {
          if (n.type !== 'element') return true;
          if (n.properties?.dataFootnoteBackref != null) return false;
          delete n.properties?.id;
          n.children = strip(n.children ?? []);
          return true;
        });
      return strip(copy);
    };
    for (const noteId of referenced) {
      section.children.push({
        type: 'element',
        tagName: 'div',
        properties: {
          popover: '',
          id: `fnpop-${noteId.slice('user-content-fn-'.length)}`,
          className: ['footnote-card'],
        },
        children: cleanCopy(notes.get(noteId).children),
      });
    }
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
