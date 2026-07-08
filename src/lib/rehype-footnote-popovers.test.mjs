// Contract tests for the [^n] footnote authoring syntax (article-apparatus
// plan step 9): rehypeFootnotePopovers upgrades GFM footnote output to the
// popover pipeline. The plugin is exercised on a hand-built hast tree — the
// same shape remark-gfm + remark-rehype produce — so no markdown parser
// dependency is needed (the remark-case-viewer.test.mjs pattern).
import { describe, expect, it } from 'vitest';
import { rehypeFootnotePopovers } from './markdown-plugins.mjs';

const el = (tagName, properties = {}, children = []) => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const text = (value) => ({ type: 'text', value });

const ref = (n, refSuffix = '') =>
  el('sup', {}, [
    el(
      'a',
      {
        href: `#user-content-fn-${n}`,
        id: `user-content-fnref-${n}${refSuffix}`,
        dataFootnoteRef: true,
        ariaDescribedBy: 'footnote-label',
      },
      [text(String(n))]
    ),
  ]);

const note = (n) =>
  el('li', { id: `user-content-fn-${n}` }, [
    el('p', {}, [
      text(`Note ${n} text. `),
      el(
        'a',
        {
          href: `#user-content-fnref-${n}`,
          dataFootnoteBackref: true,
          className: ['data-footnote-backref'],
        },
        [text('↩')]
      ),
    ]),
  ]);

const gfmTree = (refs, notes) => ({
  type: 'root',
  children: [
    el('p', {}, [text('A claim.'), ...refs]),
    el('section', { dataFootnotes: true, className: ['footnotes'] }, [
      el('h2', { id: 'footnote-label', className: ['sr-only'] }, [text('Footnotes')]),
      el('ol', {}, notes),
    ]),
  ],
});

const run = (tree) => (rehypeFootnotePopovers()(tree), tree);

const section = (tree) => tree.children.find((c) => c.tagName === 'section');
const cards = (tree) =>
  section(tree).children.filter((c) => c.tagName === 'div' && c.properties?.popover != null);

describe('[^n] footnote popover contract', () => {
  it('neutralizes the injected GFM heading into the label paragraph', () => {
    const tree = run(gfmTree([ref(1)], [note(1)]));
    const s = section(tree);
    expect(s.children.some((c) => c.tagName === 'h2')).toBe(false);
    const label = s.children.find((c) => c.tagName === 'p');
    expect(label.properties.className).toContain('footnotes__label');
    // The id must survive: refs point at it via aria-describedby.
    expect(label.properties.id).toBe('footnote-label');
  });

  it('turns each ref into a popover button that keeps the backref anchor id', () => {
    const tree = run(gfmTree([ref(1)], [note(1)]));
    const sup = tree.children[0].children.find((c) => c.tagName === 'sup');
    const [button] = sup.children;
    expect(button.tagName).toBe('button');
    expect(button.properties.type).toBe('button');
    expect(button.properties.popoverTarget).toBe('fnpop-1');
    expect(button.properties.id).toBe('user-content-fnref-1'); // plate ↩ target
    expect(button.children).toEqual([text('1')]);
  });

  it('appends one card per note with backrefs and inner ids stripped', () => {
    // Note 1 referenced twice — still exactly one card.
    const tree = run(gfmTree([ref(1), ref(1, '-2'), ref(2)], [note(1), note(2)]));
    const emitted = cards(tree);
    expect(emitted.map((c) => c.properties.id).sort()).toEqual(['fnpop-1', 'fnpop-2']);
    for (const card of emitted) {
      expect(card.properties.className).toContain('footnote-card');
      const html = JSON.stringify(card.children);
      expect(html).toContain('Note');
      expect(html).not.toContain('FootnoteBackref');
      expect(html).not.toContain('"id"');
    }
  });

  it('keeps the endnote plate as the base layer (notes + backrefs untouched)', () => {
    const tree = run(gfmTree([ref(1)], [note(1)]));
    const ol = section(tree).children.find((c) => c.tagName === 'ol');
    const li = ol.children[0];
    expect(li.properties.id).toBe('user-content-fn-1');
    const backref = li.children[0].children.find((c) => c.tagName === 'a');
    expect(backref.properties.dataFootnoteBackref).toBe(true);
  });

  it('popovers: false still neutralizes the heading but leaves refs and plate as plain GFM', () => {
    const tree = gfmTree([ref(1)], [note(1)]);
    rehypeFootnotePopovers({ popovers: false })(tree);
    const s = section(tree);
    expect(s.children.some((c) => c.tagName === 'h2')).toBe(false); // fix always on
    expect(cards(tree)).toEqual([]); // no popover upgrade
    const sup = tree.children[0].children.find((c) => c.tagName === 'sup');
    expect(sup.children[0].tagName).toBe('a'); // ref untouched
  });

  it('no-ops on a document without footnotes', () => {
    const tree = { type: 'root', children: [el('p', {}, [text('No notes here.')])] };
    const snapshot = JSON.stringify(tree);
    run(tree);
    expect(JSON.stringify(tree)).toBe(snapshot);
  });
});
